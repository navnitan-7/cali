import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface TabSwitchProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  style?: 'underline' | 'rounded' | 'scrollable';
}

export default function TabSwitch({ tabs, activeTab, onTabChange, style = 'underline' }: TabSwitchProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  if (style === 'scrollable') {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 8,
          alignItems: 'center' 
        }}
      >
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 12,
              marginHorizontal: 4,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab 
                ? (isDark ? colors['text-primary'] : colors['text-primary'])
                : 'transparent'
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontFamily: getFontFamily(activeTab === tab ? 'semibold' : 'medium'),
              fontSize: 16,
              color: activeTab === tab
                ? colors['text-primary']
                : colors['text-secondary']
            }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  }

  if (style === 'rounded') {
    return (
      <View className={`flex-row mx-4 mb-6 p-1 rounded-full ${
        isDark ? 'bg-gray-800' : 'bg-gray-100'
      }`}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            className={`flex-1 py-3 px-4 rounded-full ${
              activeTab === tab
                ? (isDark ? 'bg-white' : 'bg-white shadow-sm')
                : 'bg-transparent'
            }`}
          >
            <Text style={{
              textAlign: 'center',
              fontFamily: getFontFamily('medium'),
              fontWeight: '500',
              fontSize: 14,
              color: activeTab === tab
                ? (isDark ? colors['text-secondary'] : colors['text-primary'])
                : colors['text-secondary']
            }}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  }

  return (
    <View className="flex-row border-b border-gray-200 mx-4 mb-4">
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={tab}
          onPress={() => onTabChange(tab)}
          className={`flex-1 py-3 border-b-2 ${
            activeTab === tab 
              ? (isDark ? 'border-white' : 'border-gray-900') 
              : 'border-transparent'
          }`}
        >
          <Text style={{
            textAlign: 'center',
            fontFamily: getFontFamily('semibold'),
            fontWeight: '600',
            fontSize: 16,
            color: activeTab === tab
              ? colors['text-primary']
              : colors['text-secondary']
          }}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
} 