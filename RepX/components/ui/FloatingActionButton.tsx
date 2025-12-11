import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useIsDark } from '../../stores/themeStore';
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
      style={[
        {
          position: 'absolute',
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors['bg-primary'],
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 12,
          shadowColor: colors['bg-primary'],
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 16,
          zIndex: 20,
          ...defaultStyle,
        },
        customStyle
      ]}
    >
      <Ionicons 
        name={icon} 
        size={28}
        color={colors.white} 
      />
    </TouchableOpacity>
  );
} 