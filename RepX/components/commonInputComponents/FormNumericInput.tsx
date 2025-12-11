import React, { forwardRef } from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle, TextStyle } from 'react-native';
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface FormNumericInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  isDark: boolean;
  required?: boolean;
  currency?: boolean;
  currencySymbol?: string;
  currencyCode?: string;
  onSubmitEditing?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
}

function FormNumericInputComponent<T extends FieldValues>({
  control,
  name,
  label,
  error,
  isDark,
  required = false,
  currency = false,
  currencySymbol = '₹',
  currencyCode = 'INR',
  onSubmitEditing,
  containerStyle,
  inputStyle,
  style, // This will be applied to the TextInput
  ...props
}: FormNumericInputProps<T>, ref: React.Ref<TextInput>) {
  const colors = useColors(isDark);

  const defaultInputStyle: TextStyle = {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: error ? colors['border-danger'] : colors['border-default'],
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: getFontFamily('regular'),
    color: colors['text-primary']
  };

  return (
    <View style={[{ marginBottom: 24 }, containerStyle]}>
      {label ? (
        <Text style={{ 
          fontSize: 14, 
          fontWeight: '500', 
          fontFamily: getFontFamily('medium'),
          color: colors['text-secondary'], 
          marginBottom: 8 
        }}>
          {label} {required && <Text style={{ color: colors['text-danger'], fontFamily: getFontFamily('medium') }}>*</Text>}
        </Text>
      ) : null}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => {
          const [displayValue, setDisplayValue] = React.useState(value?.toString() || '');
          
          React.useEffect(() => {
            setDisplayValue(value?.toString() || '');
          }, [value]);

          return (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              {currency && (
                <Text style={{ 
                  fontSize: 16, 
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-primary'], 
                  marginRight: 8 
                }}>
                  {currencySymbol}
                </Text>
              )}
              <TextInput
                ref={ref}
                style={[defaultInputStyle, inputStyle, style]}
                value={displayValue}
                onChangeText={(text) => {
                  // Allow empty string, numbers, single decimal point, and decimal numbers
                  if (text === '' || /^\d*\.?\d*$/.test(text)) {
                    setDisplayValue(text);
                    
                    // Convert to number for the form
                    if (text === '' || text === '.') {
                      onChange(0);
                    } else {
                      const numericValue = parseFloat(text);
                      if (!isNaN(numericValue)) {
                        onChange(numericValue);
                      }
                    }
                  }
                }}
                onBlur={() => {
                  // Clean up trailing decimal on blur
                  let cleanValue = displayValue;
                  if (cleanValue.endsWith('.')) {
                    cleanValue = cleanValue.slice(0, -1);
                    setDisplayValue(cleanValue);
                    onChange(parseFloat(cleanValue) || 0);
                  }
                  onBlur();
                }}
                onSubmitEditing={onSubmitEditing}
                placeholderTextColor={colors['text-secondary']}
                keyboardType="decimal-pad"
                returnKeyType={props.returnKeyType || "next"}
                blurOnSubmit={false}
                {...props}
              />
              {currency && (
                <Text style={{ 
                  fontSize: 14, 
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'], 
                  marginLeft: 8 
                }}>
                  {currencyCode}
                </Text>
              )}
            </View>
          );
        }}
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

export const FormNumericInput = forwardRef(FormNumericInputComponent) as <T extends FieldValues>(
  props: FormNumericInputProps<T> & { ref?: React.Ref<TextInput> }
) => React.ReactElement; 