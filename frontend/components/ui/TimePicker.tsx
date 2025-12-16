import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput } from 'react-native';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface TimePickerProps {
  value: string; // Format: "MM:SS" or "HH:MM:SS" or "MM:SS:MS" or "MM:SS:MS:US"
  onChange: (time: string) => void;
  isDark: boolean;
  accentColor?: string;
  precision?: 'milliseconds' | 'microseconds'; // Precision level
}

export default function TimePicker({ value, onChange, isDark, accentColor, precision = 'milliseconds' }: TimePickerProps) {
  const colors = useColors(isDark);
  const useMicroseconds = precision === 'microseconds';
  
  // Parse time string to minutes, seconds, milliseconds, microseconds
  // Supports formats: MM:SS, MM:SS:mmm, MM:SS:mmm:uuu
  const parseTime = (timeStr: string): { minutes: number; seconds: number; milliseconds: number; microseconds: number } => {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      // MM:SS format
      return { 
        minutes: parseInt(parts[0], 10) || 0, 
        seconds: parseInt(parts[1], 10) || 0, 
        milliseconds: 0, 
        microseconds: 0 
      };
    } else if (parts.length === 3) {
      // MM:SS:mmm format (minutes:seconds:milliseconds)
      return { 
        minutes: parseInt(parts[0], 10) || 0, 
        seconds: parseInt(parts[1], 10) || 0, 
        milliseconds: parseInt(parts[2], 10) || 0,
        microseconds: 0
      };
    } else if (parts.length === 4) {
      // MM:SS:mmm:uuu format
      return { 
        minutes: parseInt(parts[0], 10) || 0, 
        seconds: parseInt(parts[1], 10) || 0, 
        milliseconds: parseInt(parts[2], 10) || 0,
        microseconds: parseInt(parts[3], 10) || 0
      };
    }
    return { minutes: 0, seconds: 0, milliseconds: 0, microseconds: 0 };
  };

  // Format time as MM:SS:MS or MM:SS:MS:US
  const formatTime = (m: number, s: number, ms: number, us: number = 0): string => {
    if (useMicroseconds) {
      return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}:${us.toString().padStart(3, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}:${ms.toString().padStart(3, '0')}`;
  };

  const { minutes, seconds, milliseconds, microseconds } = parseTime(value);
  const [localMinutes, setLocalMinutes] = useState<string>(minutes === 0 ? '' : minutes.toString());
  const [localSeconds, setLocalSeconds] = useState<string>(seconds === 0 ? '' : seconds.toString());
  const [localMilliseconds, setLocalMilliseconds] = useState<string>(milliseconds === 0 ? '' : milliseconds.toString());
  const [localMicroseconds, setLocalMicroseconds] = useState<string>(microseconds === 0 ? '' : microseconds.toString());

  // Track if component is being actively edited to avoid overwriting blanks (use ref for synchronous check)
  const isEditingRef = useRef<boolean>(false);
  const lastFormattedValueRef = useRef<string>(value);
  
  // Sync local state with value prop (but not when user is actively editing)
  useEffect(() => {
    // Only sync if value changed from outside (not from our own onChange)
    if (!isEditingRef.current && value !== lastFormattedValueRef.current) {
      const parsed = parseTime(value);
      // Show values as blank if they're 0, otherwise show the number
      setLocalMinutes(parsed.minutes === 0 ? '' : parsed.minutes.toString());
      setLocalSeconds(parsed.seconds === 0 ? '' : parsed.seconds.toString());
      setLocalMilliseconds(parsed.milliseconds === 0 ? '' : parsed.milliseconds.toString());
      setLocalMicroseconds(parsed.microseconds === 0 ? '' : parsed.microseconds.toString());
      lastFormattedValueRef.current = value;
    }
  }, [value]);

  // Validation functions
  const isValidMinutes = (text: string): boolean => {
    if (text === '') return true;
    const num = parseInt(text);
    return !isNaN(num) && num >= 0;
  };

  const isValidSeconds = (text: string): boolean => {
    if (text === '') return true;
    const num = parseInt(text);
    return !isNaN(num) && num >= 0 && num <= 59;
  };

  const isValidMilliseconds = (text: string): boolean => {
    if (text === '') return true;
    const num = parseInt(text);
    return !isNaN(num) && num >= 0 && num <= 999;
  };

  const isValidMicroseconds = (text: string): boolean => {
    if (text === '') return true;
    const num = parseInt(text);
    return !isNaN(num) && num >= 0 && num <= 999;
  };

  // Helper to get numeric value or 0 if blank
  const getNumericValue = (text: string): number => {
    if (text === '') return 0;
    const num = parseInt(text);
    return isNaN(num) ? 0 : num;
  };

  // Handle individual field changes - allow free input and preserve blanks
  const handleMinutesChange = (text: string) => {
    // Allow only digits and empty string
    if (text !== '' && !/^\d+$/.test(text)) {
      return;
    }
    isEditingRef.current = true;
    setLocalMinutes(text);
    // Format with blanks treated as 0 for onChange, but preserve blank in display
    const m = getNumericValue(text);
    const s = getNumericValue(localSeconds);
    const ms = getNumericValue(localMilliseconds);
    const us = getNumericValue(localMicroseconds);
    const formatted = formatTime(m, s, ms, us);
    lastFormattedValueRef.current = formatted;
    onChange(formatted);
  };

  const handleSecondsChange = (text: string) => {
    // Allow only digits and empty string
    if (text !== '' && !/^\d+$/.test(text)) {
      return;
    }
    isEditingRef.current = true;
    setLocalSeconds(text);
    const m = getNumericValue(localMinutes);
    const s = getNumericValue(text);
    const ms = getNumericValue(localMilliseconds);
    const us = getNumericValue(localMicroseconds);
    const formatted = formatTime(m, s, ms, us);
    lastFormattedValueRef.current = formatted;
    onChange(formatted);
  };

  const handleMillisecondsChange = (text: string) => {
    // Allow only digits and empty string
    if (text !== '' && !/^\d+$/.test(text)) {
      return;
    }
    isEditingRef.current = true;
    setLocalMilliseconds(text);
    const m = getNumericValue(localMinutes);
    const s = getNumericValue(localSeconds);
    const ms = getNumericValue(text);
    const us = getNumericValue(localMicroseconds);
    const formatted = formatTime(m, s, ms, us);
    lastFormattedValueRef.current = formatted;
    onChange(formatted);
  };

  const handleMicrosecondsChange = (text: string) => {
    // Allow only digits and empty string
    if (text !== '' && !/^\d+$/.test(text)) {
      return;
    }
    isEditingRef.current = true;
    setLocalMicroseconds(text);
    const m = getNumericValue(localMinutes);
    const s = getNumericValue(localSeconds);
    const ms = getNumericValue(localMilliseconds);
    const us = getNumericValue(text);
    const formatted = formatTime(m, s, ms, us);
    lastFormattedValueRef.current = formatted;
    onChange(formatted);
  };

  // Handle focus to set editing state
  const handleFocus = () => {
    isEditingRef.current = true;
  };

  // Handle blur to reset editing state
  const handleBlur = () => {
    isEditingRef.current = false;
  };

  // Text input version for all platforms
  return (
    <View style={{ paddingVertical: 10 }}>
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: 8,
      }}>
        {/* Minutes Input */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: 11,
            fontFamily: getFontFamily('medium'),
            color: colors['text-secondary'],
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>
            Minutes
          </Text>
          <TextInput
            value={localMinutes}
            onChangeText={handleMinutesChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder=""
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: !isValidMinutes(localMinutes) 
                ? colors['border-danger'] 
                : (accentColor ? accentColor + '40' : colors['border-default']),
              borderRadius: 8,
              padding: 12,
              color: colors['text-primary'],
              fontFamily: getFontFamily('regular'),
              backgroundColor: colors['bg-secondary'],
              fontSize: 18,
              textAlign: 'center',
              width: '100%',
            }}
          />
          {!isValidMinutes(localMinutes) && (
            <Text style={{
              fontSize: 10,
              fontFamily: getFontFamily('regular'),
              color: colors['text-danger'],
              marginTop: 4,
            }}>
              Invalid
            </Text>
          )}
        </View>

        {/* Separator */}
        <View style={{ alignItems: 'center', paddingTop: 30 }}>
          <Text style={{
            fontSize: 24,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            :
          </Text>
        </View>

        {/* Seconds Input */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: 11,
            fontFamily: getFontFamily('medium'),
            color: colors['text-secondary'],
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>
            Seconds
          </Text>
          <TextInput
            value={localSeconds}
            onChangeText={handleSecondsChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder=""
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: !isValidSeconds(localSeconds) 
                ? colors['border-danger'] 
                : (accentColor ? accentColor + '40' : colors['border-default']),
              borderRadius: 8,
              padding: 12,
              color: colors['text-primary'],
              fontFamily: getFontFamily('regular'),
              backgroundColor: colors['bg-secondary'],
              fontSize: 18,
              textAlign: 'center',
              width: '100%',
            }}
          />
          {!isValidSeconds(localSeconds) && (
            <Text style={{
              fontSize: 10,
              fontFamily: getFontFamily('regular'),
              color: colors['text-danger'],
              marginTop: 4,
            }}>
              Invalid (0-59)
            </Text>
          )}
        </View>

        {/* Separator */}
        <View style={{ alignItems: 'center', paddingTop: 30 }}>
          <Text style={{
            fontSize: 24,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            :
          </Text>
        </View>

        {/* Milliseconds Input */}
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={{
            fontSize: 11,
            fontFamily: getFontFamily('medium'),
            color: colors['text-secondary'],
            marginBottom: 6,
            textTransform: 'uppercase',
          }}>
            MS
          </Text>
          <TextInput
            value={localMilliseconds}
            onChangeText={handleMillisecondsChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder=""
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: !isValidMilliseconds(localMilliseconds) 
                ? colors['border-danger'] 
                : (accentColor ? accentColor + '40' : colors['border-default']),
              borderRadius: 8,
              padding: 12,
              color: colors['text-primary'],
              fontFamily: getFontFamily('regular'),
              backgroundColor: colors['bg-secondary'],
              fontSize: 18,
              textAlign: 'center',
              width: '100%',
            }}
          />
          {!isValidMilliseconds(localMilliseconds) && (
            <Text style={{
              fontSize: 10,
              fontFamily: getFontFamily('regular'),
              color: colors['text-danger'],
              marginTop: 4,
            }}>
              Invalid (0-999)
            </Text>
          )}
        </View>

        {useMicroseconds && (
          <>
            {/* Separator */}
            <View style={{ alignItems: 'center', paddingTop: 30 }}>
              <Text style={{
                fontSize: 24,
                fontFamily: getFontFamily('bold'),
                color: colors['text-primary'],
              }}>
                :
              </Text>
            </View>

            {/* Microseconds Input */}
            <View style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{
                fontSize: 11,
                fontFamily: getFontFamily('medium'),
                color: colors['text-secondary'],
                marginBottom: 6,
                textTransform: 'uppercase',
              }}>
                US
              </Text>
              <TextInput
                value={localMicroseconds}
                onChangeText={handleMicrosecondsChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder=""
                placeholderTextColor={colors['text-secondary']}
                keyboardType="numeric"
                style={{
                  borderWidth: 1,
                  borderColor: !isValidMicroseconds(localMicroseconds) 
                    ? colors['border-danger'] 
                    : (accentColor ? accentColor + '40' : colors['border-default']),
                  borderRadius: 8,
                  padding: 12,
                  color: colors['text-primary'],
                  fontFamily: getFontFamily('regular'),
                  backgroundColor: colors['bg-secondary'],
                  fontSize: 18,
                  textAlign: 'center',
                  width: '100%',
                }}
              />
              {!isValidMicroseconds(localMicroseconds) && (
                <Text style={{
                  fontSize: 10,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-danger'],
                  marginTop: 4,
                }}>
                  Invalid (0-999)
                </Text>
              )}
            </View>
          </>
        )}
      </View>
    </View>
  );
}
