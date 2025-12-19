import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface DateSelectorProps {
  date: Date;
  onDateChange?: (days: number) => void;
  onDateSelect?: (dateString: string) => void; // Changed to return formatted date string (YYYY-MM-DD)
  visible?: boolean;
  onClose?: () => void;
}

// Helper function to format date in local timezone (YYYY-MM-DD)
const formatDateLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function DateSelector({ date, onDateChange, onDateSelect, visible, onClose }: DateSelectorProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempSelectedDate, setTempSelectedDate] = useState(date);
  
  // Use visible prop if provided, otherwise use internal state
  const isModalVisible = visible !== undefined ? visible : showDatePicker;
  
  // Update tempSelectedDate when date prop changes
  React.useEffect(() => {
    setTempSelectedDate(date);
  }, [date]);

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
    // Format date in local timezone before passing to callback
    const formattedDate = formatDateLocal(selectedDate);
    
    // Automatically close modal and update date when selected
    if (visible !== undefined && onClose) {
      // Modal mode - use onClose
      onClose();
    } else {
      // Standalone mode - use internal state
      setShowDatePicker(false);
    }
    
    // Pass formatted date string (YYYY-MM-DD) instead of Date object
    if (onDateSelect) onDateSelect(formattedDate);
  };
  
  const handleClose = () => {
    if (visible !== undefined && onClose) {
      onClose();
    } else {
      setShowDatePicker(false);
    }
  };

  const navigateMonth = (direction: number) => {
    const newDate = new Date(tempSelectedDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setTempSelectedDate(newDate);
  };

  // If visible prop is provided, this is modal mode - only show modal
  // Otherwise, show both header and modal (standalone mode)
  const isModalMode = visible !== undefined;

  const styles = StyleSheet.create({
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    headerButton: {
      padding: 8,
    },
    headerDateButton: {
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 16,
    },
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      paddingHorizontal: 16,
    },
    modalContent: {
      width: '100%',
      maxWidth: 384,
      borderRadius: 20,
      padding: 28,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 12,
    },
    monthHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    monthNavButton: {
      padding: 12,
      marginHorizontal: -12,
      borderRadius: 8,
    },
    monthText: {
      fontSize: 20,
      fontFamily: getFontFamily('semibold'),
      fontWeight: '600',
      color: colors['text-primary'],
    },
    dayLabelsContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    dayLabel: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    dayLabelText: {
      fontSize: 11,
      fontFamily: getFontFamily('medium'),
      fontWeight: '600',
      letterSpacing: 0.5,
      color: isDark ? '#888888' : colors['text-secondary'],
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayButton: {
      flexBasis: '14.28%',
      maxWidth: '14.28%',
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 24,
    },
    dayButtonSelected: {
      backgroundColor: isDark ? '#ffffff' : colors['bg-primary'],
    },
    dayButtonToday: {
      backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
    },
    dayText: {
      fontSize: 15,
      fontFamily: getFontFamily('medium'),
      fontWeight: '500',
    },
    dayTextSelected: {
      fontFamily: getFontFamily('semibold'),
      fontWeight: '600',
      color: isDark ? '#000000' : '#ffffff',
    },
    dayTextCurrentMonth: {
      color: colors['text-primary'],
    },
    dayTextOtherMonth: {
      color: isDark ? '#333333' : colors['text-muted'],
    },
    dayTextToday: {
      color: colors['bg-primary'],
      fontWeight: '600',
    },
  });
  
  return (
    <>
      {/* Date Header - only show in standalone mode */}
      {!isModalMode && (
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => onDateChange && onDateChange(-1)} style={styles.headerButton}>
            <Ionicons name="chevron-back" size={24} color={colors['icon-primary']} />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.headerDateButton}>
            <Text style={{
              fontSize: 18,
              fontFamily: getFontFamily('semibold'),
              fontWeight: '600',
              color: colors['text-primary']
            }}>
              {formatDate(date)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => onDateChange && onDateChange(1)} style={styles.headerButton}>
            <Ionicons name="chevron-forward" size={24} color={colors['icon-primary']} />
          </TouchableOpacity>
        </View>
      )}

      {/* Modal */}
      <Modal animationType="fade" transparent visible={isModalVisible}>
        <Pressable 
          style={styles.modalOverlay}
          onPress={handleClose}
        >
          <Pressable 
            style={styles.modalContent}
            onPress={(e) => e.stopPropagation()}
          >
            {/* Month Header */}
            <View style={styles.monthHeader}>
              <TouchableOpacity 
                onPress={() => navigateMonth(-1)} 
                style={styles.monthNavButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-back" size={22} color={isDark ? '#ffffff' : colors['icon-muted']} />
              </TouchableOpacity>
              <Text style={styles.monthText}>
                {tempSelectedDate.toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
              <TouchableOpacity 
                onPress={() => navigateMonth(1)} 
                style={styles.monthNavButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="chevron-forward" size={22} color={isDark ? '#ffffff' : colors['icon-muted']} />
              </TouchableOpacity>
            </View>

            {/* Day Labels */}
            <View style={styles.dayLabelsContainer}>
              {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <View key={day} style={styles.dayLabel}>
                  <Text style={styles.dayLabelText}>
                    {day}
                  </Text>
                </View>
              ))}
            </View>

            {/* Calendar Grid */}
            <View style={styles.calendarGrid}>
              {generateCalendarDays().map((dayObj, index) => {
                const isSelected = dayObj.isSelected;
                const isToday = dayObj.isToday && dayObj.isCurrentMonth && !isSelected;
                
                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => dayObj.isCurrentMonth && handleDateSelect(dayObj.date)}
                    style={[
                      styles.dayButton,
                      isSelected && styles.dayButtonSelected,
                      isToday && styles.dayButtonToday,
                    ]}
                    disabled={!dayObj.isCurrentMonth}
                  >
                    <Text style={[
                      styles.dayText,
                      isSelected && styles.dayTextSelected,
                      !isSelected && dayObj.isCurrentMonth && styles.dayTextCurrentMonth,
                      !isSelected && !dayObj.isCurrentMonth && styles.dayTextOtherMonth,
                      isToday && styles.dayTextToday,
                    ]}>
                      {dayObj.day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
