import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface FormToggleSwitchProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  options: readonly [string, string] | [string, string];
  isDark: boolean;
}

export function FormToggleSwitch<T extends FieldValues>({
  control,
  name,
  options,
  isDark,
}: FormToggleSwitchProps<T>) {
  const colors = useColors(isDark);
  const [option1, option2] = options;

  return (
    <View style={{ marginBottom: 24 }}>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => (
          <View style={{ 
            flexDirection: 'row', 
            backgroundColor: colors['bg-secondary'], 
            borderRadius: 25, 
            padding: 4,
            alignSelf: 'center'
          }}>
            <TouchableOpacity
              style={{
                paddingHorizontal: 24,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: value === option1 ? colors['bg-surface'] : 'transparent',
                shadowColor: value === option1 ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: value === option1 ? 2 : 0,
              }}
              onPress={() => onChange(option1)}
            >
              <Text style={{ 
                fontSize: 14, 
                fontFamily: value === option1 ? getFontFamily('semibold') : getFontFamily('regular'),
                fontWeight: value === option1 ? '600' : '400',
                color: value === option1 ? colors['text-primary'] : colors['text-secondary']
              }}>
                {option1}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                paddingHorizontal: 24,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: value === option2 ? colors['bg-surface'] : 'transparent',
                shadowColor: value === option2 ? '#000' : 'transparent',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: value === option2 ? 2 : 0,
              }}
              onPress={() => onChange(option2)}
            >
              <Text style={{ 
                fontSize: 14, 
                fontFamily: value === option2 ? getFontFamily('semibold') : getFontFamily('regular'),
                fontWeight: value === option2 ? '600' : '400',
                color: value === option2 ? colors['text-primary'] : colors['text-secondary']
              }}>
                {option2}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
} 