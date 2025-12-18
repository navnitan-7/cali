import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';
import { Ionicons } from '@expo/vector-icons';

type ToastVariant = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  visible: boolean;
  message: string;
  onHide: () => void;
  isDark: boolean;
  variant?: ToastVariant;
  duration?: number;
}

const variantConfig: Record<ToastVariant, { icon: keyof typeof Ionicons.glyphMap; colorKey: string; fallbackColor: string }> = {
  success: { icon: 'checkmark-circle', colorKey: 'text-success', fallbackColor: '#10B981' },
  error: { icon: 'close-circle', colorKey: 'text-danger', fallbackColor: '#EF4444' },
  warning: { icon: 'warning', colorKey: 'text-warning', fallbackColor: '#F59E0B' },
  info: { icon: 'information-circle', colorKey: 'text-secondary', fallbackColor: '#3B82F6' },
};

export default function Toast({ visible, message, onHide, isDark, variant = 'success', duration = 3000 }: ToastProps) {
  const colors = useColors(isDark);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const config = variantConfig[variant];

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          onHide();
        });
      }, duration);

      return () => clearTimeout(timer);
    } else {
      slideAnim.setValue(-100);
    }
  }, [visible, slideAnim, onHide, duration]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: colors['bg-card'],
          borderColor: colors['border-default'],
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name={config.icon} size={20} color={(colors as any)[config.colorKey] || config.fallbackColor} />
        <Text style={[styles.message, { color: colors['text-primary'], flex: 1 }]}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    fontSize: 14,
    fontFamily: getFontFamily('medium'),
    marginLeft: 8,
  },
});

