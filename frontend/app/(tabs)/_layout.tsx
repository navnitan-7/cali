import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { theme } from '@/styles/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopWidth: 0,
          height: Platform.OS === 'web' ? 70 : 85,
          paddingBottom: Platform.OS === 'web' ? 12 : 25,
          paddingTop: 12,
          paddingHorizontal: 20,
          ...theme.shadow.lg,
          elevation: 20,
        },
        tabBarLabelStyle: {
          fontSize: 13,
          fontWeight: theme.fontWeight.semibold,
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        headerShown: false,
        tabBarItemStyle: {
          paddingVertical: 4,
          gap: 4,
        },
        tabBarShowLabel: true,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.colors.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.borderLight,
          },
          headerTitleStyle: {
            fontSize: theme.fontSize.xl,
            fontWeight: theme.fontWeight.bold,
            color: theme.colors.text,
          },
          headerShadowVisible: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="dashboard" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="events" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="participants"
        options={{
          title: 'Participants',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="participants" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

// Simple tab bar icon component
function TabBarIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  const size = focused ? 26 : 24;
  const weight = focused ? '700' : '400';
  
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundColor: focused ? `${color}15` : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.2s ease',
      }}
    >
      <span style={{ fontSize: 18, color, fontWeight: weight }}>
        {name === 'dashboard' ? '📊' : name === 'events' ? '🏆' : '👥'}
      </span>
    </div>
  );
}

