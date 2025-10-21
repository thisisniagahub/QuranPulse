/**
 * Loading Context
 * Global loading state management
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
  canCancel?: boolean;
  onCancel?: () => void;
}

interface LoadingContextType {
  loadingStates: Map<string, LoadingState>;
  setLoading: (key: string, state: Partial<LoadingState>) => void;
  clearLoading: (key: string) => void;
  clearAllLoading: () => void;
  isLoading: (key: string) => boolean;
  getLoadingState: (key: string) => LoadingState | undefined;
  getGlobalLoading: () => LoadingState;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export function LoadingProvider({ children }: LoadingProviderProps) {
  const [loadingStates, setLoadingStates] = useState<Map<string, LoadingState>>(new Map());

  const setLoading = useCallback((key: string, state: Partial<LoadingState>) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(key) || { isLoading: false };
      newMap.set(key, { ...currentState, ...state });
      return newMap;
    });
  }, []);

  const clearLoading = useCallback((key: string) => {
    setLoadingStates(prev => {
      const newMap = new Map(prev);
      newMap.delete(key);
      return newMap;
    });
  }, []);

  const clearAllLoading = useCallback(() => {
    setLoadingStates(new Map());
  }, []);

  const isLoading = useCallback((key: string) => {
    return loadingStates.get(key)?.isLoading || false;
  }, [loadingStates]);

  const getLoadingState = useCallback((key: string) => {
    return loadingStates.get(key);
  }, [loadingStates]);

  const getGlobalLoading = useCallback(() => {
    const activeLoadings = Array.from(loadingStates.values()).filter(state => state.isLoading);
    
    if (activeLoadings.length === 0) {
      return { isLoading: false };
    }

    if (activeLoadings.length === 1) {
      return activeLoadings[0];
    }

    // Multiple loading states - show combined message
    return {
      isLoading: true,
      message: `${activeLoadings.length} operations in progress...`,
      progress: activeLoadings.reduce((sum, state) => sum + (state.progress || 0), 0) / activeLoadings.length,
    };
  }, [loadingStates]);

  const value: LoadingContextType = {
    loadingStates,
    setLoading,
    clearLoading,
    clearAllLoading,
    isLoading,
    getLoadingState,
    getGlobalLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}

// Hook for specific loading operations
export function useLoadingOperation(key: string) {
  const { setLoading, clearLoading, isLoading, getLoadingState } = useLoading();

  const startLoading = useCallback((message?: string, progress?: number, canCancel?: boolean, onCancel?: () => void) => {
    setLoading(key, {
      isLoading: true,
      message,
      progress,
      canCancel,
      onCancel,
    });
  }, [key, setLoading]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoading(key, {
      isLoading: true,
      progress,
      message,
    });
  }, [key, setLoading]);

  const stopLoading = useCallback(() => {
    clearLoading(key);
  }, [key, clearLoading]);

  const loadingState = getLoadingState(key);

  return {
    isLoading: isLoading(key),
    loadingState,
    startLoading,
    updateProgress,
    stopLoading,
  };
}

// Hook for async operations with loading
export function useAsyncOperation<T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  key: string,
  options: {
    message?: string;
    canCancel?: boolean;
    onSuccess?: (result: R) => void;
    onError?: (error: any) => void;
  } = {}
) {
  const { startLoading, stopLoading } = useLoadingOperation(key);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    try {
      startLoading(options.message, 0, options.canCancel);
      const result = await operation(...args);
      options.onSuccess?.(result);
      return result;
    } catch (error) {
      options.onError?.(error);
      return null;
    } finally {
      stopLoading();
    }
  }, [operation, key, startLoading, stopLoading, options]);

  return execute;
}

// Loading indicator component
export function LoadingIndicator({ 
  visible, 
  message, 
  progress, 
  canCancel, 
  onCancel 
}: {
  visible: boolean;
  message?: string;
  progress?: number;
  canCancel?: boolean;
  onCancel?: () => void;
}) {
  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '8px',
        minWidth: '200px',
        textAlign: 'center',
      }}>
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #3498db',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto',
          }} />
        </div>
        
        {message && (
          <div style={{ marginBottom: '10px', fontSize: '14px' }}>
            {message}
          </div>
        )}
        
        {progress !== undefined && (
          <div style={{ marginBottom: '10px' }}>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#f3f3f3',
              borderRadius: '2px',
              overflow: 'hidden',
            }}>
              <div style={{
                width: `${progress * 100}%`,
                height: '100%',
                backgroundColor: '#3498db',
                transition: 'width 0.3s ease',
              }} />
            </div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {Math.round(progress * 100)}%
            </div>
          </div>
        )}
        
        {canCancel && onCancel && (
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#e74c3c',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

// Global loading overlay
export function GlobalLoadingOverlay() {
  const { getGlobalLoading } = useLoading();
  const globalLoading = getGlobalLoading();

  return (
    <LoadingIndicator
      visible={globalLoading.isLoading}
      message={globalLoading.message}
      progress={globalLoading.progress}
      canCancel={globalLoading.canCancel}
      onCancel={globalLoading.onCancel}
    />
  );
}