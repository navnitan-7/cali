import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';
import Button from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'default';
  loading?: boolean;
}

export default function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'default',
  loading = false,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={loading ? undefined : onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          paddingHorizontal: 20,
        }}
        onPress={loading ? undefined : onCancel}
      >
        <Pressable
          style={{
            width: '100%',
            maxWidth: 340,
            borderRadius: 16,
            backgroundColor: colors['bg-card'],
            padding: 20,
            borderWidth: 1,
            borderColor: variant === 'danger' ? colors['text-danger'] + '20' : colors['border-default'],
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Danger Icon for Delete Actions */}
          {variant === 'danger' && (
            <View style={{
              alignItems: 'center',
              marginBottom: 12,
            }}>
              <View style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: colors['text-danger'] + '10',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name="trash-outline" size={24} color={colors['text-danger']} />
              </View>
            </View>
          )}

          <Text
            style={{
              fontSize: 18,
              fontFamily: getFontFamily('semibold'),
              color: variant === 'danger' ? colors['text-danger'] : colors['text-primary'],
              marginBottom: 8,
              textAlign: 'center',
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 14,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
              marginBottom: 20,
              lineHeight: 20,
              textAlign: 'center',
            }}
          >
            {message}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              style={{ flex: 1 }}
              disabled={loading}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              style={{ flex: 1 }}
              loading={loading}
              disabled={loading}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

