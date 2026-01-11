import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0dcaf0',
        tabBarInactiveTintColor: '#6B7280',
        tabBarStyle: {
          backgroundColor: '#1F2937',
          borderTopColor: '#374151',
          height: Platform.OS === 'ios' ? 88 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Utama',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="quran"
        options={{
          title: 'Al-Quran',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="almathurat"
        options={{
          title: 'Al-Ma\'thurat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="leaf" size={size} color={color} />
          ),
        }}
      />
      
      {/* USTAZ AI - Central Prominent Button */}
      <Tabs.Screen
        name="ustaz-ai"
        options={{
          title: 'Ustaz AI',
          tabBarIcon: ({ color, focused }) => (
            <View style={styles.ustazButton}>
              <View style={[
                styles.ustazIconContainer,
                focused && styles.ustazIconContainerActive
              ]}>
                <Ionicons 
                  name="school" 
                  size={28} 
                  color={focused ? '#FFFFFF' : '#0dcaf0'} 
                />
              </View>
            </View>
          ),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
        }}
      />

      <Tabs.Screen
        name="prayer"
        options={{
          title: 'Solat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'Sosial',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          href: null, // Hide from tab bar, accessible from social
        }}
      />
      
      {/* Hidden tab - Hadith moved to More */}
      <Tabs.Screen
        name="hadith"
        options={{
          href: null, // Hide from tab bar, accessible from More
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  ustazButton: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
  },
  ustazIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1F2937',
    borderWidth: 3,
    borderColor: '#0dcaf0',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0dcaf0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ustazIconContainerActive: {
    backgroundColor: '#0dcaf0',
    shadowOpacity: 0.5,
    shadowRadius: 12,
  },
});
