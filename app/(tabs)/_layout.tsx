import { Tabs } from 'expo-router';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].text,
        tabBarIcon: ({ color, size }) => {
          const iconName =
            route.name === 'index'
              ? 'today-outline'
              : route.name === 'routine'
              ? 'repeat-outline'
              : route.name === 'pomodoro'
              ? 'timer-outline'
              : 'settings-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}>
      <Tabs.Screen name="index" options={{ title: 'Hoje' }} />
      <Tabs.Screen name="routine" options={{ title: 'Rotina' }} />
      <Tabs.Screen name="pomodoro" options={{ title: 'Foco' }} />
      <Tabs.Screen name="settings" options={{ title: 'Configurações' }} />
    </Tabs>
  );
}
