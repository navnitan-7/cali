import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface SummaryCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  valueColor?: 'default' | 'positive' | 'negative' | 'primary';
  variant?: 'default' | 'summary' | 'clickable';
  onPress?: () => void;
  subDetails?: Array<{
    label: string;
    value: string | number;
    color?: 'positive' | 'negative' | 'default';
  }>;
  trend?: {
    value: string;
    type: 'up' | 'down' | 'neutral';
  };
}

interface CardGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
}

export function SummaryCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  iconColor,
  valueColor = 'default',
  variant = 'default',
  onPress,
  subDetails,
  trend 
}: SummaryCardProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const themeColors = useColors(isDark);
  const defaultIconColor = iconColor || themeColors['icon-brand'];

  const getValueColor = () => {
    switch (valueColor) {
      case 'positive':
        return themeColors['text-success'];
      case 'negative':
        return themeColors['text-danger'];
      case 'primary':
        return themeColors['text-brand'];
      default:
        return themeColors['text-primary'];
    }
  };

  const getSubDetailColor = (color?: 'positive' | 'negative' | 'default') => {
    switch (color) {
      case 'positive':
        return themeColors['text-success'];
      case 'negative':
        return themeColors['text-danger'];
      default:
        return themeColors['text-primary'];
    }
  };

  const getTrendColor = () => {
    switch (trend?.type) {
      case 'up':
        return themeColors['text-success'];
      case 'down':
        return themeColors['text-danger'];
      default:
        return themeColors['text-muted'];
    }
  };

  const getTrendIcon = () => {
    switch (trend?.type) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'remove';
    }
  };

  const CardContent = () => (
    <View style={{
      flex: 1,
      borderRadius: 20,
      padding: 24,
      borderWidth: 1,
      borderColor: themeColors['border-default'],
      backgroundColor: isDark 
        ? themeColors['bg-card'] + 'E6' // Glassmorphism with opacity
        : themeColors['bg-card'] + 'E6',
      // Glassmorphism shadow
      shadowColor: themeColors['bg-primary'],
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 4,
    }}>
      
      {/* Clickable Variant Layout */}
      {variant === 'clickable' ? (
        <>
          {/* Icon */}
          {icon && (
            <View className="items-center mb-4">
              <View className={`w-14 h-14 rounded-2xl items-center justify-center ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <Ionicons name={icon} size={28} color={defaultIconColor} />
              </View>
            </View>
          )}
          
          {/* Title and Subtitle */}
          <View className="items-center mb-4">
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              fontWeight: '500',
              marginBottom: 4,
              color: isDark ? themeColors['text-secondary'] : themeColors['text-secondary']
            }}>
              {title}
            </Text>
            {subtitle && (
              <Text style={{
                fontSize: 12,
                fontFamily: getFontFamily('regular'),
                color: themeColors['text-muted']
              }}>
                {subtitle}
              </Text>
            )}
          </View>
          
          {/* Value */}
          <View className="items-center">
            <Text style={{
              fontSize: 16,
              fontFamily: getFontFamily('semibold'),
              fontWeight: '600',
              color: getValueColor()
            }}>
              {value}
            </Text>
          </View>
        </>
      ) : (
        <>
          {/* Header Row - Icon, Title, Value */}
          <View className="flex-row items-center justify-between mb-3">
            {/* Left side - Icon and Title */}
            <View className="flex-row items-center flex-1">
              {icon && (
                <View className={`w-10 h-10 rounded-xl items-center justify-center border border-gray-200 mr-3 ${
                  isDark ? 'bg-gray-700' : 'bg-gray-50'
                }`}>
                  <Ionicons name={icon} size={22} color={defaultIconColor} />
                </View>
              )}
              <View className="flex-1">
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  fontWeight: '500',
                  color: themeColors['text-secondary']
                }}>
                  {title}
                </Text>
                {subtitle && (
                  <Text style={{
                    fontSize: 12,
                    fontFamily: getFontFamily('regular'),
                    marginTop: 2,
                    color: themeColors['text-muted']
                  }}>
                    {subtitle}
                  </Text>
                )}
              </View>
            </View>

            {/* Right side - Value */}
            <Text style={{
              fontSize: 18,
              fontFamily: getFontFamily('semibold'),
              fontWeight: '600',
              color: getValueColor()
            }}>
              {value}
            </Text>
          </View>

          {/* Sub Details for Summary Variant */}
          {variant === 'summary' && subDetails && (
            <View className="space-y-2 pt-3 border-t border-gray-200 dark:border-gray-200">
              {subDetails.map((detail, index) => (
                <View key={index} className="flex-row justify-between items-center">
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('regular'),
                    color: themeColors['text-secondary']
                  }}>
                    {detail.label}
                  </Text>
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    fontWeight: '500',
                    color: getSubDetailColor(detail.color)
                  }}>
                    {detail.value}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Trend - only for default variant */}
          {variant === 'default' && trend && (
            <View className="flex-row items-center justify-end mt-2">
              <Ionicons 
                name={getTrendIcon() as keyof typeof Ionicons.glyphMap} 
                size={14} 
                color={getTrendColor()} 
              />
              <Text style={{
                fontSize: 12,
                fontFamily: getFontFamily('medium'),
                fontWeight: '500',
                marginLeft: 4,
                color: getTrendColor()
              }}>
                {trend.value}
              </Text>
            </View>
          )}
        </>
      )}
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}

export function CardGrid({ children, columns = 2 }: CardGridProps) {
  const gridColumns = columns === 3 ? 'grid-cols-3' : 'grid-cols-2';
  
  return (
    <View className={`grid ${gridColumns} gap-4`}>
      {children}
    </View>
  );
}

export default function Card() {
  return null; // This is just a placeholder/container component
} 