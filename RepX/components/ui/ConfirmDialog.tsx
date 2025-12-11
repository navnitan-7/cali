import React from 'react';
import { View, Text, Modal, Pressable } from 'react-native';
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
}: ConfirmDialogProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          paddingHorizontal: 20,
        }}
        onPress={onCancel}
      >
        <Pressable
          style={{
            width: '100%',
            maxWidth: 400,
            borderRadius: 20,
            backgroundColor: colors['bg-card'],
            padding: 24,
            borderWidth: 1,
            borderColor: colors['border-default'],
            shadowColor: colors['bg-primary'],
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 16,
            elevation: 12,
          }}
          onPress={(e) => e.stopPropagation()}
        >
          <Text
            style={{
              fontSize: 20,
              fontFamily: getFontFamily('bold'),
              color: colors['text-primary'],
              marginBottom: 12,
            }}
          >
            {title}
          </Text>
          <Text
            style={{
              fontSize: 15,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
              marginBottom: 24,
              lineHeight: 22,
            }}
          >
            {message}
          </Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button
              title={cancelText}
              onPress={onCancel}
              variant="outline"
              style={{ flex: 1 }}
            />
            <Button
              title={confirmText}
              onPress={onConfirm}
              variant={variant === 'danger' ? 'danger' : 'primary'}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

