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
  accentColor?: string; // Tournament accent color
  counts?: (number | undefined)[]; // Optional counts for each tab
}

export default function TabSwitch({ tabs, activeTab, onTabChange, style = 'underline', accentColor, counts }: TabSwitchProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  
  // Mix primary blue with accent color for underline (70% blue, 30% accent)
  const getActiveColor = () => {
    if (!accentColor) return colors['bg-primary'];
    // Create a gradient effect by mixing colors
    return accentColor; // Use accent for underline, but keep primary blue for main actions
  };

  // Splitwise-style minimal tabs
  if (style === 'scrollable') {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ 
          paddingHorizontal: 16,
          paddingBottom: 8,
        }}
      >
        {tabs.map((tab, index) => {
          const count = counts?.[index];
          return (
            <TouchableOpacity
              key={tab}
              onPress={() => onTabChange(tab)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginRight: 8,
                borderBottomWidth: 2,
                borderBottomColor: activeTab === tab 
                  ? getActiveColor()
                  : 'transparent',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={{
              fontFamily: getFontFamily(activeTab === tab ? 'semibold' : 'regular'),
              fontSize: 15,
              color: activeTab === tab
                ? colors['text-primary']
                : colors['text-secondary']
            }}>
              {tab}
            </Text>
              {count !== undefined && count !== null && (
                <View style={{
                  minWidth: 20,
                  height: 20,
                  borderRadius: 10,
                  backgroundColor: activeTab === tab
                    ? (accentColor || colors['bg-primary']) + (isDark ? '25' : '20')
                    : colors['bg-secondary'],
                  paddingHorizontal: 6,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginLeft: 6,
                }}>
                  <Text style={{
                    fontSize: 11,
                    fontFamily: getFontFamily('medium'),
                    color: activeTab === tab
                      ? (accentColor || colors['bg-primary'])
                      : colors['text-secondary'],
                  }}>
                    {String(count)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    );
  }

  // Default underline style - Splitwise minimal
  return (
    <View style={{
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors['border-default'],
      paddingHorizontal: 16,
      marginBottom: 16,
    }}>
      {tabs.map((tab, index) => {
        const count = counts?.[index];
        return (
          <TouchableOpacity
            key={tab}
            onPress={() => onTabChange(tab)}
            style={{
              flex: 1,
              paddingVertical: 12,
              borderBottomWidth: 2,
              borderBottomColor: activeTab === tab 
                ? getActiveColor()
                : 'transparent',
              marginBottom: -1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{
              textAlign: 'center',
              fontFamily: getFontFamily(activeTab === tab ? 'semibold' : 'regular'),
              fontSize: 15,
              color: activeTab === tab
                ? colors['text-primary']
                : colors['text-secondary']
            }}>
              {tab}
            </Text>
            {count !== undefined && count !== null && (
              <View style={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                backgroundColor: activeTab === tab
                  ? (accentColor || colors['bg-primary']) + (isDark ? '25' : '20')
                  : colors['bg-secondary'],
                paddingHorizontal: 6,
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: 6,
              }}>
                <Text style={{
                  fontSize: 11,
                  fontFamily: getFontFamily('medium'),
                  color: activeTab === tab
                    ? (accentColor || colors['bg-primary'])
                    : colors['text-secondary'],
                }}>
                  {String(count)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
