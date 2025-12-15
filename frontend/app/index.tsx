import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIsDark } from '../stores/themeStore';
import { useColors } from '../utils/colors';
import { getFontFamily } from '../utils/fonts';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../stores/authStore';
import { useEventTypesStore } from '../stores/eventTypesStore';

export default function SplashScreen() {
  const isDark = useIsDark();
  const colors = useColors(isDark);
  const { checkAuth } = useAuthStore();
  const { fetchEventTypes } = useEventTypesStore();

  useEffect(() => {
    const initializeApp = async () => {
      // Check authentication
      await checkAuth();
      
      // Get the updated auth state after checkAuth completes
      const authState = useAuthStore.getState();
      
      // Fetch and cache event types (only if authenticated)
      // Don't await - let it fetch in background
      if (authState.isAuthenticated) {
        fetchEventTypes().catch((error) => {
          console.error('Error fetching event types on startup:', error);
        });
      }
      
      // Navigate based on auth state after check completes
      setTimeout(() => {
        if (authState.isAuthenticated) {
          router.replace('/(tabs)/tournaments');
        } else {
          router.replace('/login');
        }
      }, 1000);
    };

    initializeApp();
  }, []);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-1 items-center justify-center px-8">
        {/* App Logo/Icon */}
        <View style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 32,
          backgroundColor: colors['bg-primary'] + '30',
          borderWidth: 2,
          borderColor: colors['bg-primary'],
        }}>
          <Ionicons name="trophy" size={48} color={colors['bg-primary']} />
        </View>

        {/* App Name */}
        <Text style={{
          fontSize: 48,
          fontFamily: getFontFamily('bold'),
          fontWeight: '800',
          marginBottom: 16,
          color: colors['text-primary'],
          letterSpacing: -1,
        }}>
          RepX
        </Text>

        {/* Tagline */}
        <Text style={{
          fontSize: 18,
          fontFamily: getFontFamily('regular'),
          textAlign: 'center',
          marginBottom: 48,
          color: colors['text-secondary']
        }}>
          Fitness Competition Management
        </Text>



        {/* Loading Indicator */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors['bg-primary'],
          }} />
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors['bg-primary'],
          }} />
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: colors['bg-primary'],
          }} />
        </View>

        {/* Version */}
        <Text style={{
          position: 'absolute',
          bottom: 32,
          fontSize: 14,
          fontFamily: getFontFamily('regular'),
          color: colors['text-muted']
        }}>
          Version 1.0.0
        </Text>
      </View>
    </SafeAreaView>
  );
} 