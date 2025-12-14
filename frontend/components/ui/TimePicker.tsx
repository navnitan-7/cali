import React, { useState, useEffect } from 'react';
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
  const parseTime = (timeStr: string): { minutes: number; seconds: number; milliseconds: number; microseconds: number } => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      // MM:SS format
      return { minutes: parts[0] || 0, seconds: parts[1] || 0, milliseconds: 0, microseconds: 0 };
    } else if (parts.length === 3) {
      // Check if third part is hours (0-23) or milliseconds (0-999)
      if (parts[0] < 24 && parts[1] < 60 && parts[2] < 60) {
        // HH:MM:SS format - convert to MM:SS:MS
        const totalSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        return { 
          minutes: Math.floor(totalSeconds / 60), 
          seconds: totalSeconds % 60, 
          milliseconds: 0,
          microseconds: 0
        };
      } else {
        // MM:SS:MS format
        return { 
          minutes: parts[0] || 0, 
          seconds: parts[1] || 0, 
          milliseconds: parts[2] || 0,
          microseconds: 0
        };
      }
    } else if (parts.length === 4) {
      // MM:SS:MS:US format
      return { 
        minutes: parts[0] || 0, 
        seconds: parts[1] || 0, 
        milliseconds: parts[2] || 0,
        microseconds: parts[3] || 0
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
  const [localMinutes, setLocalMinutes] = useState(minutes);
  const [localSeconds, setLocalSeconds] = useState(seconds);
  const [localMilliseconds, setLocalMilliseconds] = useState(milliseconds);
  const [localMicroseconds, setLocalMicroseconds] = useState(microseconds);

  // Sync local state with value prop
  useEffect(() => {
    const parsed = parseTime(value);
    setLocalMinutes(parsed.minutes);
    setLocalSeconds(parsed.seconds);
    setLocalMilliseconds(parsed.milliseconds);
    setLocalMicroseconds(parsed.microseconds);
  }, [value]);

  // Handle individual field changes
  const handleMinutesChange = (text: string) => {
    // Allow empty string for better UX
    if (text === '') {
      setLocalMinutes(0);
      onChange(formatTime(0, localSeconds, localMilliseconds, localMicroseconds));
      return;
    }
    const num = Math.max(0, Math.min(999, parseInt(text) || 0));
    setLocalMinutes(num);
    const formatted = formatTime(num, localSeconds, localMilliseconds, localMicroseconds);
    onChange(formatted);
  };

  const handleSecondsChange = (text: string) => {
    if (text === '') {
      setLocalSeconds(0);
      onChange(formatTime(localMinutes, 0, localMilliseconds, localMicroseconds));
      return;
    }
    const num = Math.max(0, Math.min(59, parseInt(text) || 0));
    setLocalSeconds(num);
    const formatted = formatTime(localMinutes, num, localMilliseconds, localMicroseconds);
    onChange(formatted);
  };

  const handleMillisecondsChange = (text: string) => {
    if (text === '') {
      setLocalMilliseconds(0);
      onChange(formatTime(localMinutes, localSeconds, 0, localMicroseconds));
      return;
    }
    const num = Math.max(0, Math.min(999, parseInt(text) || 0));
    setLocalMilliseconds(num);
    const formatted = formatTime(localMinutes, localSeconds, num, localMicroseconds);
    onChange(formatted);
  };

  const handleMicrosecondsChange = (text: string) => {
    if (text === '') {
      setLocalMicroseconds(0);
      onChange(formatTime(localMinutes, localSeconds, localMilliseconds, 0));
      return;
    }
    const num = Math.max(0, Math.min(999, parseInt(text) || 0));
    setLocalMicroseconds(num);
    const formatted = formatTime(localMinutes, localSeconds, localMilliseconds, num);
    onChange(formatted);
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
            value={localMinutes.toString()}
            onChangeText={handleMinutesChange}
            placeholder="0"
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
            maxLength={3}
            style={{
              borderWidth: 1,
              borderColor: accentColor ? accentColor + '40' : colors['border-default'],
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
          <Text style={{
            fontSize: 10,
            fontFamily: getFontFamily('regular'),
            color: colors['text-muted'],
            marginTop: 4,
          }}>
            0-999
          </Text>
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
            value={localSeconds.toString()}
            onChangeText={handleSecondsChange}
            placeholder="0"
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
            maxLength={2}
            style={{
              borderWidth: 1,
              borderColor: accentColor ? accentColor + '40' : colors['border-default'],
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
          <Text style={{
            fontSize: 10,
            fontFamily: getFontFamily('regular'),
            color: colors['text-muted'],
            marginTop: 4,
          }}>
            0-59
          </Text>
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
            value={localMilliseconds.toString()}
            onChangeText={handleMillisecondsChange}
            placeholder="0"
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
            maxLength={3}
            style={{
              borderWidth: 1,
              borderColor: accentColor ? accentColor + '40' : colors['border-default'],
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
          <Text style={{
            fontSize: 10,
            fontFamily: getFontFamily('regular'),
            color: colors['text-muted'],
            marginTop: 4,
          }}>
            0-999
          </Text>
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
                value={localMicroseconds.toString()}
                onChangeText={handleMicrosecondsChange}
                placeholder="0"
                placeholderTextColor={colors['text-secondary']}
                keyboardType="numeric"
                maxLength={3}
                style={{
                  borderWidth: 1,
                  borderColor: accentColor ? accentColor + '40' : colors['border-default'],
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
              <Text style={{
                fontSize: 10,
                fontFamily: getFontFamily('regular'),
                color: colors['text-muted'],
                marginTop: 4,
              }}>
                0-999
              </Text>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
