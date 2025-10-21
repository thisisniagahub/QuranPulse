/**
 * Performance Utilities
 * React.memo, lazy loading, and optimization helpers
 */

import React, { ComponentType, lazy, Suspense } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

// Loading component for lazy loading
const LoadingComponent = () => (
  <View style={{ 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  }}>
    <ActivityIndicator size="large" color="#10B981" />
    <Text style={{ 
      marginTop: 10, 
      color: '#9CA3AF',
      fontSize: 14 
    }}>
      Loading...
    </Text>
  </View>
);

// Higher-order component for lazy loading with error boundary
export function withLazyLoading<T extends object>(
  importFunc: () => Promise<{ default: ComponentType<T> }>,
  fallback?: ComponentType
) {
  const LazyComponent = lazy(importFunc);
  
  return function LazyWrapper(props: T) {
    return (
      <Suspense fallback={fallback ? <fallback /> : <LoadingComponent />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
}

// Memo wrapper with custom comparison
export function withMemo<T extends object>(
  Component: ComponentType<T>,
  areEqual?: (prevProps: T, nextProps: T) => boolean
) {
  return React.memo(Component, areEqual);
}

// Shallow comparison for props
export function shallowEqual<T extends object>(prevProps: T, nextProps: T): boolean {
  const prevKeys = Object.keys(prevProps);
  const nextKeys = Object.keys(nextProps);
  
  if (prevKeys.length !== nextKeys.length) {
    return false;
  }
  
  for (const key of prevKeys) {
    if (prevProps[key as keyof T] !== nextProps[key as keyof T]) {
      return false;
    }
  }
  
  return true;
}

// Deep comparison for props (use with caution)
export function deepEqual<T extends object>(prevProps: T, nextProps: T): boolean {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}

// Debounce hook for performance
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Throttle hook for performance
export function useThrottle<T>(value: T, delay: number): T {
  const [throttledValue, setThrottledValue] = React.useState<T>(value);
  const lastExecuted = React.useRef<number>(Date.now());

  React.useEffect(() => {
    if (Date.now() >= lastExecuted.current + delay) {
      lastExecuted.current = Date.now();
      setThrottledValue(value);
    } else {
      const timer = setTimeout(() => {
        lastExecuted.current = Date.now();
        setThrottledValue(value);
      }, delay - (Date.now() - lastExecuted.current));

      return () => clearTimeout(timer);
    }
  }, [value, delay]);

  return throttledValue;
}

// Virtual scrolling hook
export function useVirtualScrolling<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number,
  overscan: number = 5
) {
  const [scrollTop, setScrollTop] = React.useState(0);
  
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );
  
  const visibleItems = items.slice(startIndex, endIndex + 1);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;
  
  return {
    visibleItems,
    totalHeight,
    offsetY,
    setScrollTop,
  };
}

// Image optimization hook
export function useImageOptimization(uri: string, options: {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}) {
  const [optimizedUri, setOptimizedUri] = React.useState(uri);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!uri) return;

    setIsLoading(true);
    setError(null);

    // In a real app, you would optimize the image here
    // For now, we'll just use the original URI
    setOptimizedUri(uri);
    setIsLoading(false);
  }, [uri, options.width, options.height, options.quality, options.format]);

  return {
    uri: optimizedUri,
    isLoading,
    error,
  };
}

// Bundle size optimization
export const LazyComponents = {
  // Lazy load heavy components
  QuranReader: withLazyLoading(() => import('../components/quran/QuranReader')),
  PrayerTimes: withLazyLoading(() => import('../components/prayer/PrayerTimes')),
  SocialFeed: withLazyLoading(() => import('../components/social/SocialFeed')),
  ChallengeDetails: withLazyLoading(() => import('../components/challenges/ChallengeDetails')),
  GroupDetails: withLazyLoading(() => import('../components/groups/GroupDetails')),
  ProfileSettings: withLazyLoading(() => import('../components/profile/ProfileSettings')),
  AudioPlayer: withLazyLoading(() => import('../components/audio/AudioPlayer')),
  MengajiSession: withLazyLoading(() => import('../components/mengaji/MengajiSession')),
  IqraLesson: withLazyLoading(() => import('../components/iqra/IqraLesson')),
  SearchResults: withLazyLoading(() => import('../components/search/SearchResults')),
};

// Performance monitoring
export class PerformanceMonitor {
  private static measurements: Map<string, number[]> = new Map();

  static startTiming(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.measurements.has(label)) {
        this.measurements.set(label, []);
      }
      
      this.measurements.get(label)!.push(duration);
      
      if (__DEV__) {
        console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
      }
    };
  }

  static getAverageTime(label: string): number {
    const times = this.measurements.get(label);
    if (!times || times.length === 0) return 0;
    
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  static getMeasurements(): Record<string, { average: number; count: number; times: number[] }> {
    const result: Record<string, { average: number; count: number; times: number[] }> = {};
    
    for (const [label, times] of this.measurements.entries()) {
      result[label] = {
        average: this.getAverageTime(label),
        count: times.length,
        times: [...times],
      };
    }
    
    return result;
  }

  static clearMeasurements(): void {
    this.measurements.clear();
  }
}

// Memory usage monitoring
export function useMemoryUsage() {
  const [memoryInfo, setMemoryInfo] = React.useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  React.useEffect(() => {
    const updateMemoryInfo = () => {
      if (performance.memory) {
        const used = performance.memory.usedJSHeapSize;
        const total = performance.memory.totalJSHeapSize;
        const percentage = (used / total) * 100;
        
        setMemoryInfo({ used, total, percentage });
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, 5000);

    return () => clearInterval(interval);
  }, []);

  return memoryInfo;
}

// Component render count monitoring
export function useRenderCount(componentName: string) {
  const renderCount = React.useRef(0);
  
  React.useEffect(() => {
    renderCount.current += 1;
    
    if (__DEV__) {
      console.log(`🔄 ${componentName} rendered ${renderCount.current} times`);
    }
  });

  return renderCount.current;
}

// Optimized list item component
export const OptimizedListItem = React.memo<{
  item: any;
  index: number;
  onPress: (item: any) => void;
  renderItem: (item: any, index: number) => React.ReactNode;
}>(({ item, index, onPress, renderItem }) => {
  const handlePress = React.useCallback(() => {
    onPress(item);
  }, [item, onPress]);

  return (
    <View onTouchEnd={handlePress}>
      {renderItem(item, index)}
    </View>
  );
}, shallowEqual);

// Optimized flat list props
export const optimizedFlatListProps = {
  removeClippedSubviews: true,
  maxToRenderPerBatch: 10,
  updateCellsBatchingPeriod: 50,
  initialNumToRender: 10,
  windowSize: 10,
  getItemLayout: (data: any, index: number) => ({
    length: 80, // Adjust based on your item height
    offset: 80 * index,
    index,
  }),
};

// Image preloading
export function useImagePreloader(urls: string[]) {
  const [loadedImages, setLoadedImages] = React.useState<Set<string>>(new Set());
  const [loadingImages, setLoadingImages] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    const preloadImages = async () => {
      for (const url of urls) {
        if (loadedImages.has(url) || loadingImages.has(url)) continue;
        
        setLoadingImages(prev => new Set(prev).add(url));
        
        try {
          // Preload image
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
          
          setLoadedImages(prev => new Set(prev).add(url));
        } catch (error) {
          console.warn(`Failed to preload image: ${url}`, error);
        } finally {
          setLoadingImages(prev => {
            const newSet = new Set(prev);
            newSet.delete(url);
            return newSet;
          });
        }
      }
    };

    preloadImages();
  }, [urls, loadedImages, loadingImages]);

  return {
    loadedImages: Array.from(loadedImages),
    loadingImages: Array.from(loadingImages),
    isLoaded: (url: string) => loadedImages.has(url),
    isLoading: (url: string) => loadingImages.has(url),
  };
}