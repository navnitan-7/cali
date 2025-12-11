import React, { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface FormTextInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  isDark: boolean;
  required?: boolean;
  multiline?: boolean;
  onSubmitEditing?: () => void;
}

function FormTextInputComponent<T extends FieldValues>({
  control,
  name,
  label,
  error,
  isDark,
  required = false,
  multiline = false,
  onSubmitEditing,
  ...props
}: FormTextInputProps<T>, ref: React.Ref<TextInput>) {
  const colors = useColors(isDark);

  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ 
        fontSize: 14, 
        fontWeight: '500', 
        fontFamily: getFontFamily('medium'),
        color: colors['text-secondary'], 
        marginBottom: 8 
      }}>
        {label} {required && <Text style={{ color: colors['text-danger'], fontFamily: getFontFamily('medium') }}>*</Text>}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            ref={ref}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: error ? colors['border-danger'] : colors['border-default'],
              paddingVertical: 12,
              fontSize: 16,
              fontFamily: getFontFamily('regular'),
              color: colors['text-primary'],
              minHeight: multiline ? 60 : undefined,
              textAlignVertical: multiline ? 'top' : 'center',
            }}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            onSubmitEditing={onSubmitEditing}
            placeholderTextColor={colors['text-secondary']}
            multiline={multiline}
            returnKeyType={multiline ? 'default' : 'next'}
            blurOnSubmit={false}
            {...props}
          />
        )}
      />
      {error && (
        <Text style={{ 
          fontSize: 12, 
          fontFamily: getFontFamily('regular'),
          color: colors['text-danger'], 
          marginTop: 4 
        }}>
          {error}
        </Text>
      )}
    </View>
  );
}

export const FormTextInput = forwardRef(FormTextInputComponent) as <T extends FieldValues>(
  props: FormTextInputProps<T> & { ref?: React.Ref<TextInput> }
) => React.ReactElement; 