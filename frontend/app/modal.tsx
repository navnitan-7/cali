import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useIsDark } from '../stores/themeStore';
import { useColors } from '../utils/colors';
import { getFontFamily } from '../utils/fonts';

export default function Modal() {
  const isDark = useIsDark();
  const colors = useColors(isDark);

  return (
    <SafeAreaView className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <View className="flex-1 items-center justify-center px-8">
        <Text style={{
          fontSize: 32,
          fontFamily: getFontFamily('bold'),
          fontWeight: 'bold',
          marginBottom: 16,
          color: colors['text-primary']
        }}>
          Modal Screen
        </Text>
        <Text style={{
          textAlign: 'center',
          marginBottom: 32,
          fontSize: 16,
          fontFamily: getFontFamily('regular'),
          color: colors['text-secondary']
        }}>
          This is a modal presentation. You can navigate here from any tab.
        </Text>
        <TouchableOpacity 
          onPress={() => router.back()}
          className={`px-6 py-3 rounded-lg ${isDark ? 'bg-indigo-600' : 'bg-indigo-500'}`}
        >
          <Text style={{
            color: 'white',
            fontFamily: getFontFamily('semibold'),
            fontWeight: '600'
          }}>
            Close Modal
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
} 