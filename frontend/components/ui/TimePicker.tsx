import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface TimePickerProps {
  value: string; // Format: "MM:SS" or "HH:MM:SS"
  onChange: (time: string) => void;
  isDark: boolean;
  accentColor?: string;
}

export default function TimePicker({ value, onChange, isDark, accentColor }: TimePickerProps) {
  const colors = useColors(isDark);
  
  // Parse time string to hours, minutes, seconds
  const parseTime = (timeStr: string): { hours: number; minutes: number; seconds: number } => {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      return { hours: 0, minutes: parts[0] || 0, seconds: parts[1] || 0 };
    } else if (parts.length === 3) {
      return { hours: parts[0] || 0, minutes: parts[1] || 0, seconds: parts[2] || 0 };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const { hours, minutes, seconds } = parseTime(value);
  const [localHours, setLocalHours] = useState(hours);
  const [localMinutes, setLocalMinutes] = useState(minutes);
  const [localSeconds, setLocalSeconds] = useState(seconds);
  
  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  // Sync local state with value prop
  useEffect(() => {
    const parsed = parseTime(value);
    setLocalHours(parsed.hours);
    setLocalMinutes(parsed.minutes);
    setLocalSeconds(parsed.seconds);
  }, [value]);

  const formatTime = (h: number, m: number, s: number): string => {
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleValueChange = (type: 'hours' | 'minutes' | 'seconds', newValue: number) => {
    let newHours = localHours;
    let newMinutes = localMinutes;
    let newSeconds = localSeconds;

    if (type === 'hours') {
      newHours = Math.max(0, Math.min(23, newValue));
      setLocalHours(newHours);
    } else if (type === 'minutes') {
      newMinutes = Math.max(0, Math.min(59, newValue));
      setLocalMinutes(newMinutes);
    } else if (type === 'seconds') {
      newSeconds = Math.max(0, Math.min(59, newValue));
      setLocalSeconds(newSeconds);
    }

    onChange(formatTime(newHours, newMinutes, newSeconds));
  };

  // Scroll to selected values
  useEffect(() => {
    const ITEM_HEIGHT = 50;
    if (hoursScrollRef.current) {
      hoursScrollRef.current.scrollTo({
        y: localHours * ITEM_HEIGHT,
        animated: false,
      });
    }
    if (minutesScrollRef.current) {
      minutesScrollRef.current.scrollTo({
        y: localMinutes * ITEM_HEIGHT,
        animated: false,
      });
    }
    if (secondsScrollRef.current) {
      secondsScrollRef.current.scrollTo({
        y: localSeconds * ITEM_HEIGHT,
        animated: false,
      });
    }
  }, [localHours, localMinutes, localSeconds]);

  const renderNumberSelector = (
    label: string,
    value: number,
    max: number,
    onChange: (val: number) => void,
    scrollRef: React.RefObject<ScrollView>
  ) => {
    const numbers = Array.from({ length: max + 1 }, (_, i) => i);
    const ITEM_HEIGHT = 50;

    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{
          fontSize: 11,
          fontFamily: getFontFamily('medium'),
          color: colors['text-secondary'],
          marginBottom: 10,
          textTransform: 'uppercase',
          letterSpacing: 0.5,
        }}>
          {label}
        </Text>
        <View style={{
          height: 150,
          width: 70,
          borderRadius: 14,
          backgroundColor: colors['bg-card'],
          borderWidth: 1.5,
          borderColor: accentColor ? accentColor + '20' : colors['border-default'],
          overflow: 'hidden',
        }}>
          {/* Center indicator line */}
          <View style={{
            position: 'absolute',
            top: (150 - ITEM_HEIGHT) / 2,
            left: 0,
            right: 0,
            height: ITEM_HEIGHT,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderColor: accentColor ? accentColor + '30' : colors['border-default'],
            zIndex: 1,
            pointerEvents: 'none',
          }} />
          
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={{ 
              alignItems: 'center', 
              paddingVertical: (150 - ITEM_HEIGHT) / 2,
            }}
            showsVerticalScrollIndicator={false}
            snapToInterval={ITEM_HEIGHT}
            decelerationRate="fast"
            onMomentumScrollEnd={(e) => {
              const offsetY = e.nativeEvent.contentOffset.y;
              const index = Math.round(offsetY / ITEM_HEIGHT);
              const newValue = Math.max(0, Math.min(max, index));
              if (newValue !== value) {
                onChange(newValue);
              }
            }}
            scrollEventThrottle={16}
          >
            {numbers.map((num) => (
              <View
                key={num}
                style={{
                  height: ITEM_HEIGHT,
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{
                  fontSize: num === value ? 24 : 18,
                  fontFamily: num === value ? getFontFamily('bold') : getFontFamily('regular'),
                  color: num === value
                    ? (accentColor || colors['bg-primary'])
                    : colors['text-secondary'],
                }}>
                  {num.toString().padStart(2, '0')}
                </Text>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      paddingVertical: 20,
    }}>
      {renderNumberSelector('Hours', localHours, 23, (val) => handleValueChange('hours', val), hoursScrollRef)}
      
      <View style={{ alignItems: 'center', paddingTop: 30 }}>
        <Text style={{
          fontSize: 28,
          fontFamily: getFontFamily('bold'),
          color: colors['text-primary'],
        }}>
          :
        </Text>
      </View>

      {renderNumberSelector('Minutes', localMinutes, 59, (val) => handleValueChange('minutes', val), minutesScrollRef)}
      
      <View style={{ alignItems: 'center', paddingTop: 30 }}>
        <Text style={{
          fontSize: 28,
          fontFamily: getFontFamily('bold'),
          color: colors['text-primary'],
        }}>
          :
        </Text>
      </View>

      {renderNumberSelector('Seconds', localSeconds, 59, (val) => handleValueChange('seconds', val), secondsScrollRef)}
    </View>
  );
}
