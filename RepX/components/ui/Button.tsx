import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, View } from 'react-native';
import { useIsDark } from '../../stores/themeStore';
import { useColors, colorPalette } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'noBorder';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const isDark = useIsDark();
  const colors = useColors(isDark);

  const getButtonStyle = (): ViewStyle[] => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = 16;
        baseStyle.paddingVertical = 8;
        break;
      case 'large':
        baseStyle.paddingHorizontal = 24;
        baseStyle.paddingVertical = 16;
        break;
      default: // medium
        baseStyle.paddingHorizontal = 20;
        baseStyle.paddingVertical = 12;
    }

    // Width style
    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseStyle.backgroundColor = colors['bg-primary'];
        // Add glow effect for neon aesthetic
        baseStyle.shadowColor = colors['bg-primary'];
        baseStyle.shadowOffset = { width: 0, height: 0 };
        baseStyle.shadowOpacity = 0.6;
        baseStyle.shadowRadius = 12;
        baseStyle.elevation = 8;
        break;
      case 'secondary':
        baseStyle.backgroundColor = colors['bg-secondary'];
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1.5;
        baseStyle.borderColor = colors['border-primary'];
        // Glow for outline variant
        baseStyle.shadowColor = colors['bg-primary'];
        baseStyle.shadowOffset = { width: 0, height: 0 };
        baseStyle.shadowOpacity = 0.3;
        baseStyle.shadowRadius = 8;
        break;
      case 'danger':
        baseStyle.backgroundColor = colors['bg-danger'];
        baseStyle.shadowColor = colors['bg-danger'];
        baseStyle.shadowOffset = { width: 0, height: 0 };
        baseStyle.shadowOpacity = 0.6;
        baseStyle.shadowRadius = 12;
        break;
      case 'noBorder':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    // Disabled style
    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return [baseStyle, ...(style ? [style] : [])];
  };

  const getTextStyle = (): TextStyle[] => {
    const baseTextStyle: TextStyle = {
      fontWeight: '600',
      fontFamily: getFontFamily('semibold'),
    };

    // Size styles
    switch (size) {
      case 'small':
        baseTextStyle.fontSize = 14;
        break;
      case 'large':
        baseTextStyle.fontSize = 18;
        break;
      default: // medium
        baseTextStyle.fontSize = 16;
    }

    // Color based on variant
    switch (variant) {
      case 'primary':
      case 'danger':
        baseTextStyle.color = colors.white;
        break;
      case 'secondary':
        baseTextStyle.color = colors.white;
        break;
      case 'outline':
      case 'noBorder':
        baseTextStyle.color = colors['text-primary'];
        break;
    }

    return [baseTextStyle, ...(textStyle ? [textStyle] : [])];
  };

  return (
    <TouchableOpacity
      style={getButtonStyle()}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' ? colors['text-primary'] : colors.white}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
} 