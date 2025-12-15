import React from 'react';
import { TouchableOpacity, ViewStyle, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../utils/colors';
import { useTheme } from '../../stores/themeStore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
  disabled?: boolean;
  position?: 'top' | 'bottom';
}

export default function FloatingActionButton({ 
  onPress, 
  icon = 'add', 
  style: customStyle,
  disabled = false,
  position = 'bottom'
}: FloatingActionButtonProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();

  const defaultStyle = position === 'top' 
    ? {
        top: insets.top + 16,
        bottom: undefined,
      }
    : {
        bottom: insets.bottom + 100,
        top: undefined,
      };

  return (
    <TouchableOpacity 
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        {
          position: 'absolute',
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          overflow: 'hidden',
          zIndex: 20,
          ...defaultStyle,
        },
        customStyle
      ]}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors['bg-primary'],
          shadowColor: colors['bg-primary'],
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 6,
        }}
      >
        <Ionicons 
          name={icon} 
          size={24}
          color={isDark ? '#000' : '#FFF'} 
        />
      </View>
    </TouchableOpacity>
  );
}
