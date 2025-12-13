import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useIsDark } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'noBorder' | 'glassy';
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
  variant = 'glassy',
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
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      overflow: 'hidden',
    };

    // Size styles
    switch (size) {
      case 'small':
        baseStyle.paddingHorizontal = 12;
        baseStyle.paddingVertical = 8;
        break;
      case 'large':
        baseStyle.paddingHorizontal = 20;
        baseStyle.paddingVertical = 16;
        break;
      default: // medium
        baseStyle.paddingHorizontal = 16;
        baseStyle.paddingVertical = 12;
    }

    if (fullWidth) {
      baseStyle.width = '100%';
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        // Primary uses solid background with primary color
        baseStyle.backgroundColor = colors['bg-primary'];
        baseStyle.shadowColor = colors['bg-primary'];
        baseStyle.shadowOffset = { width: 0, height: 2 };
        baseStyle.shadowOpacity = 0.2;
        baseStyle.shadowRadius = 4;
        baseStyle.elevation = 3;
        break;
      case 'glassy':
      case 'secondary':
        baseStyle.backgroundColor = 'transparent';
        break;
      case 'outline':
        baseStyle.backgroundColor = 'transparent';
        baseStyle.borderWidth = 1.5;
        baseStyle.borderColor = colors['border-default'];
        break;
      case 'danger':
        // Danger uses solid red background
        baseStyle.backgroundColor = colors['text-danger'];
        baseStyle.shadowColor = colors['text-danger'];
        baseStyle.shadowOffset = { width: 0, height: 2 };
        baseStyle.shadowOpacity = 0.2;
        baseStyle.shadowRadius = 4;
        baseStyle.elevation = 3;
        break;
      case 'noBorder':
        baseStyle.backgroundColor = 'transparent';
        break;
    }

    if (disabled) {
      baseStyle.opacity = 0.5;
    }

    return [baseStyle, ...(style ? [style] : [])];
  };

  const getTextStyle = (): TextStyle[] => {
    const baseTextStyle: TextStyle = {
      fontFamily: getFontFamily('medium'),
    };

    switch (size) {
      case 'small':
        baseTextStyle.fontSize = 13;
        break;
      case 'large':
        baseTextStyle.fontSize = 16;
        break;
      default: // medium
        baseTextStyle.fontSize = 14;
    }

    // Text colors based on variant
    switch (variant) {
      case 'primary':
        // Primary button text uses opposite of primary color for contrast
        baseTextStyle.color = isDark ? '#000' : '#FFF';
        baseTextStyle.fontFamily = getFontFamily('semibold');
        break;
      case 'glassy':
        baseTextStyle.color = colors['text-primary'];
        break;
      case 'danger':
        // Danger button text uses white for contrast on red background
        baseTextStyle.color = '#FFF';
        baseTextStyle.fontFamily = getFontFamily('semibold');
        break;
      case 'secondary':
      case 'outline':
      case 'noBorder':
        baseTextStyle.color = colors['text-primary'];
        break;
    }

    return [baseTextStyle, ...(textStyle ? [textStyle] : [])];
  };

  const getBlurStyle = (): ViewStyle | null => {
    // Primary and danger variants don't use blur - they have solid backgrounds
    if (variant === 'primary' || variant === 'danger') {
      return null;
    }
    
    const isGlassy = variant === 'glassy' || variant === 'secondary';
    
    if (!isGlassy) {
      return null; // No blur for outline/noBorder
    }

    return {
      flex: 1,
      width: '100%',
      height: '100%',
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      flexDirection: 'row' as const,
      backgroundColor: isDark
        ? 'rgba(255, 255, 255, 0.08)'
        : 'rgba(255, 255, 255, 0.6)',
      borderWidth: 0,
    };
  };

  const buttonStyle = getButtonStyle();
  const textStyleObj = getTextStyle();
  const blurStyle = getBlurStyle();

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {blurStyle ? (
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={blurStyle}
    >
      {loading && (
        <ActivityIndicator
          size="small"
              color={textStyleObj[0]?.color || colors['text-primary']}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={textStyleObj}>{title}</Text>
        </BlurView>
      ) : (
        <>
          {loading && (
            <ActivityIndicator
              size="small"
              color={textStyleObj[0]?.color || colors['text-primary']}
          style={{ marginRight: 8 }}
        />
      )}
          <Text style={textStyleObj}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
} 
