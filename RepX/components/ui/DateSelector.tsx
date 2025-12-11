import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface DateSelectorProps {
  date: Date;
  onDateChange: (days: number) => void;
  onDateSelect?: (date: Date) => void;
}

export default function DateSelector({ date, onDateChange, onDateSelect }: DateSelectorProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(date);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const generateCalendarDays = () => {
    const currentMonth = tempSelectedDate.getMonth();
    const currentYear = tempSelectedDate.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Sunday-start

    const days = [];
    const today = new Date();

    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);

      const isCurrentMonth = currentDate.getMonth() === currentMonth;
      const isSelected = currentDate.toDateString() === tempSelectedDate.toDateString();
      const isToday = currentDate.toDateString() === today.toDateString();

      days.push({
        date: currentDate,
        day: currentDate.getDate(),
        isCurrentMonth,
        isSelected,
        isToday,
      });
    }

    return days;
  };

  const handleDateSelect = (selectedDate: Date) => {
    setTempSelectedDate(selectedDate);
    // Automatically close modal and update date when selected
    setShowDatePicker(false);
    if (onDateSelect) onDateSelect(selectedDate);
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(tempSelectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setTempSelectedDate(newDate);
  };

  return (
    <>
      {/* Date Header */}
      <View className="flex-row items-center justify-center py-3 px-4">
        <TouchableOpacity onPress={() => onDateChange(-1)} className="p-2">
          <Ionicons name="chevron-back" size={24} color={colors['icon-primary']} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} className="flex-1 items-center mx-4">
          <Text style={{
            fontSize: 18,
            fontFamily: getFontFamily('semibold'),
            fontWeight: '600',
            color: colors['text-primary']
          }}>
            {formatDate(date)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => onDateChange(1)} className="p-2">
          <Ionicons name="chevron-forward" size={24} color={colors['icon-primary']} />
        </TouchableOpacity>
      </View>

      {/* Modal */}
      <Modal animationType="slide" transparent visible={showDatePicker}>
        <Pressable 
          className="flex-1 justify-center items-center bg-black/50 px-4"
          onPress={() => setShowDatePicker(false)}
        >
          <Pressable 
            className={`w-full max-w-sm rounded-2xl p-8 shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}
            onPress={(e) => e.stopPropagation()}
          >

            {/* Month Header */}
            <View className="flex-row items-center justify-between mb-8">
              <TouchableOpacity onPress={() => navigateMonth(-1)} className="p-3 -ml-3">
                <Ionicons name="chevron-back" size={22} color={colors['icon-muted']} />
              </TouchableOpacity>
              <Text style={{
                fontSize: 20,
                fontFamily: getFontFamily('semibold'),
                fontWeight: '600',
                color: colors['text-primary']
              }}>
                {tempSelectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity onPress={() => navigateMonth(1)} className="p-3 -mr-3">
                <Ionicons name="chevron-forward" size={22} color={colors['icon-muted']} />
              </TouchableOpacity>
            </View>

            {/* Day Labels */}
            <View className="flex-row mb-6">
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <View key={day} className="flex-1 items-center py-2">
                  <Text style={{
                    fontSize: 12,
                    fontFamily: getFontFamily('medium'),
                    fontWeight: '500',
                    letterSpacing: 0.5,
                    color: colors['text-secondary']
                  }}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View className="flex-row flex-wrap gap-y-2">
              {generateCalendarDays().map((dayObj, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => dayObj.isCurrentMonth && handleDateSelect(dayObj.date)}
                  className={`items-center justify-center rounded-full aspect-square`}
                  style={{
                    flexBasis: '14.28%',
                    maxWidth: '14.28%',
                    height: 48,
                    backgroundColor: dayObj.isSelected
                      ? colors['bg-primary']
                      : 'transparent',
                  }}
                  disabled={!dayObj.isCurrentMonth}
                >
                  <Text style={{
                    fontSize: 16,
                    fontFamily: dayObj.isSelected ? getFontFamily('semibold') : getFontFamily('medium'),
                    fontWeight: dayObj.isSelected ? '600' : '500',
                    color: dayObj.isSelected
                      ? colors.white
                      : dayObj.isToday && dayObj.isCurrentMonth
                      ? colors['text-brand']
                      : dayObj.isCurrentMonth
                      ? colors['text-primary']
                      : colors['text-muted']
                  }}>
                    {dayObj.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
