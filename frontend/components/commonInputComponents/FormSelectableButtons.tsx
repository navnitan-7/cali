import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

type OptionType = string | {
  value: string;
  label: string;
  icon?: string;
  color?: string;
};

interface FormSelectableButtonsProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  options: readonly OptionType[] | OptionType[];
  error?: string;
  isDark: boolean;
  required?: boolean;
}

export function FormSelectableButtons<T extends FieldValues>({
  control,
  name,
  label,
  options,
  error,
  isDark,
  required = false,
}: FormSelectableButtonsProps<T>) {
  const colors = useColors(isDark);

  const getOptionValue = (option: OptionType): string => {
    return typeof option === 'string' ? option : option.value;
  };

  const getOptionLabel = (option: OptionType): string => {
    return typeof option === 'string' ? option : option.label;
  };

  const getOptionIcon = (option: OptionType): string | undefined => {
    return typeof option === 'string' ? undefined : option.icon;
  };

  const getOptionColor = (option: OptionType): string | undefined => {
    return typeof option === 'string' ? undefined : option.color;
  };

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
        render={({ field: { onChange, value } }) => (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {options.map((option) => {
              const optionValue = getOptionValue(option);
              const optionLabel = getOptionLabel(option);
              const optionIcon = getOptionIcon(option);
              const optionColor = getOptionColor(option);
              const isSelected = value === optionValue;
              
              return (
                <TouchableOpacity
                  key={optionValue}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderRadius: 20,
                    backgroundColor: isSelected 
                      ? (optionColor ? `${optionColor}15` : colors['bg-primary']) 
                      : colors['bg-secondary'],
                    borderWidth: 2,
                    borderColor: isSelected 
                      ? (optionColor || colors['bg-primary']) 
                      : colors['border-default'],
                    marginRight: 8,
                    marginBottom: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                  onPress={() => onChange(optionValue)}
                >
                  {optionIcon && (
                    <Ionicons 
                      name={optionIcon as any} 
                      size={18} 
                      color={isSelected ? (optionColor || colors['text-primary']) : colors['text-secondary']}
                      style={{ marginRight: 8 }}
                    />
                  )}
                  <Text style={{
                    fontSize: 14,
                    fontFamily: isSelected ? getFontFamily('semibold') : getFontFamily('regular'),
                    color: isSelected 
                      ? (optionColor || colors['text-primary']) 
                      : colors['text-primary'],
                    fontWeight: isSelected ? '600' : '400'
                  }}>
                    {optionLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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