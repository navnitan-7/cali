import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Modal, Pressable, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface TimePickerProps {
  visible: boolean;
  time?: string; // Format: "HH:MM:SS" or "MM:SS"
  onTimeSelect: (time: string) => void; // Returns time in "HH:MM:SS" format
  onClose: () => void;
  isDark: boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({ visible, time, onTimeSelect, onClose, isDark }) => {
  const colors = useColors(isDark);
  
  // Parse time string to hours, minutes, seconds
  const parseTime = (timeStr?: string): { hours: number; minutes: number; seconds: number } => {
    if (!timeStr) return { hours: 0, minutes: 0, seconds: 0 };
    
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 2) {
      // MM:SS format
      return { hours: 0, minutes: parts[0] || 0, seconds: parts[1] || 0 };
    } else if (parts.length === 3) {
      // HH:MM:SS format
      return { hours: parts[0] || 0, minutes: parts[1] || 0, seconds: parts[2] || 0 };
    }
    return { hours: 0, minutes: 0, seconds: 0 };
  };

  const initialTime = parseTime(time);
  const [hours, setHours] = useState(initialTime.hours);
  const [minutes, setMinutes] = useState(initialTime.minutes);
  const [seconds, setSeconds] = useState(initialTime.seconds);

  // Update state when time prop changes
  useEffect(() => {
    const parsed = parseTime(time);
    setHours(parsed.hours);
    setMinutes(parsed.minutes);
    setSeconds(parsed.seconds);
  }, [time]);

  // Generate array of numbers for picker
  const generateNumbers = (max: number): number[] => {
    return Array.from({ length: max + 1 }, (_, i) => i);
  };

  const hoursList = generateNumbers(23);
  const minutesList = generateNumbers(59);
  const secondsList = generateNumbers(59);

  const handleConfirm = () => {
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    onTimeSelect(timeString);
    onClose();
  };

  const handleReset = () => {
    setHours(0);
    setMinutes(0);
    setSeconds(0);
  };

  const hoursScrollRef = useRef<ScrollView>(null);
  const minutesScrollRef = useRef<ScrollView>(null);
  const secondsScrollRef = useRef<ScrollView>(null);

  // Scroll to selected values when modal opens
  useEffect(() => {
    if (visible) {
      const itemHeight = 50;
      setTimeout(() => {
        const hoursIndex = hoursList.indexOf(hours);
        const minutesIndex = minutesList.indexOf(minutes);
        const secondsIndex = secondsList.indexOf(seconds);
        
        if (hoursScrollRef.current && hoursIndex >= 0) {
          hoursScrollRef.current.scrollTo({ y: hoursIndex * itemHeight, animated: false });
        }
        if (minutesScrollRef.current && minutesIndex >= 0) {
          minutesScrollRef.current.scrollTo({ y: minutesIndex * itemHeight, animated: false });
        }
        if (secondsScrollRef.current && secondsIndex >= 0) {
          secondsScrollRef.current.scrollTo({ y: secondsIndex * itemHeight, animated: false });
        }
      }, 100);
    }
  }, [visible, hours, minutes, seconds]);

  const renderPicker = (
    values: number[],
    selectedValue: number,
    onValueChange: (value: number) => void,
    label: string,
    scrollRef: React.RefObject<ScrollView | null>
  ) => {
    const itemHeight = 50;
    const visibleItems = 3;
    const containerHeight = itemHeight * visibleItems;

    return (
      <View style={{ flex: 1, alignItems: 'center' }}>
        <Text style={{
          fontSize: 12,
          fontFamily: getFontFamily('semibold'),
          color: colors['text-secondary'],
          marginBottom: 8,
          textTransform: 'uppercase',
        }}>
          {label}
        </Text>
        <View style={{ height: containerHeight, overflow: 'hidden', position: 'relative' }}>
          {/* Selection indicator overlay */}
          <View
            style={{
              position: 'absolute',
              top: itemHeight,
              left: 0,
              right: 0,
              height: itemHeight,
              borderTopWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors['bg-primary'] + '40',
              backgroundColor: colors['bg-primary'] + '10',
              zIndex: 1,
              pointerEvents: 'none',
            }}
          />
          <ScrollView
            ref={scrollRef}
            showsVerticalScrollIndicator={false}
            snapToInterval={itemHeight}
            decelerationRate="fast"
            contentContainerStyle={{
              paddingVertical: itemHeight,
            }}
            onMomentumScrollEnd={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const index = Math.round(offsetY / itemHeight);
              const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
              onValueChange(values[clampedIndex]);
            }}
            onScrollEndDrag={(event) => {
              const offsetY = event.nativeEvent.contentOffset.y;
              const index = Math.round(offsetY / itemHeight);
              const clampedIndex = Math.max(0, Math.min(index, values.length - 1));
              onValueChange(values[clampedIndex]);
            }}
          >
            {values.map((value) => {
              const isSelected = value === selectedValue;
              return (
                <TouchableOpacity
                  key={value}
                  onPress={() => {
                    onValueChange(value);
                    const index = values.indexOf(value);
                    if (scrollRef.current && index >= 0) {
                      scrollRef.current.scrollTo({ y: index * itemHeight, animated: true });
                    }
                  }}
                  style={{
                    height: itemHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 2,
                  }}
                >
                  <Text style={{
                    fontSize: isSelected ? 24 : 18,
                    fontFamily: getFontFamily(isSelected ? 'bold' : 'regular'),
                    color: isSelected ? colors['bg-primary'] : colors['text-secondary'],
                    opacity: isSelected ? 1 : 0.5,
                  }}>
                    {String(value).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
        onPress={onClose}
      >
        <Pressable
          style={{
            backgroundColor: colors['bg-card'],
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 20,
            paddingBottom: 40,
            borderWidth: 1,
            borderColor: colors['border-default'],
          }}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors['border-default'],
          }}>
            <TouchableOpacity onPress={handleReset}>
              <Text style={{
                fontSize: 16,
                fontFamily: getFontFamily('medium'),
                color: colors['text-secondary'],
              }}>
                Reset
              </Text>
            </TouchableOpacity>
            <Text style={{
              fontSize: 18,
              fontFamily: getFontFamily('bold'),
              color: colors['text-primary'],
            }}>
              Select Time
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors['text-primary']} />
            </TouchableOpacity>
          </View>

          {/* Time Display */}
          <View style={{
            alignItems: 'center',
            paddingVertical: 24,
            borderBottomWidth: 1,
            borderBottomColor: colors['border-default'],
          }}>
            <Text style={{
              fontSize: 36,
              fontFamily: getFontFamily('bold'),
              color: colors['bg-primary'],
              letterSpacing: 2,
            }}>
              {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </Text>
            <Text style={{
              fontSize: 12,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
              marginTop: 4,
            }}>
              Hours : Minutes : Seconds
            </Text>
          </View>

          {/* Pickers */}
          <View style={{
            flexDirection: 'row',
            paddingHorizontal: 20,
            paddingTop: 20,
            height: 200,
          }}>
            {renderPicker(hoursList, hours, setHours, 'Hours', hoursScrollRef)}
            <View style={{
              width: 1,
              backgroundColor: colors['border-default'],
              marginHorizontal: 8,
            }} />
            {renderPicker(minutesList, minutes, setMinutes, 'Minutes', minutesScrollRef)}
            <View style={{
              width: 1,
              backgroundColor: colors['border-default'],
              marginHorizontal: 8,
            }} />
            {renderPicker(secondsList, seconds, setSeconds, 'Seconds', secondsScrollRef)}
          </View>

          {/* Confirm Button */}
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <TouchableOpacity
              onPress={handleConfirm}
              style={{
                backgroundColor: colors['bg-primary'],
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{
                fontSize: 16,
                fontFamily: getFontFamily('bold'),
                color: colors['text-primary'],
              }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default TimePicker;

