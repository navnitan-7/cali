import React, { useCallback } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/utils/colors';
import { getFontFamily } from '@/utils/fonts';
import { ActivityMetric } from '@/services/activityService';
import { FIELD_LABELS, FIELD_ICONS } from '@/constants/activityFields';
import { getTournamentAccent } from '@/utils/tournamentAccent';

interface MetricItemProps {
  metric: ActivityMetric | null;
  attemptId: number;
  hasData: boolean;
  accent: ReturnType<typeof getTournamentAccent> | null;
  isDark: boolean;
  onEdit: (metric: ActivityMetric) => void;
  onAdd: (attemptId: number) => void;
}

// Helper to format time from milliseconds
const formatTime = (milliseconds: number): string => {
  const totalMs = Math.floor(milliseconds);
  const minutes = Math.floor(totalMs / 60000);
  const seconds = Math.floor((totalMs % 60000) / 1000);
  const ms = totalMs % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`;
};

const MetricItem = React.memo(({ 
  metric, 
  attemptId,
  hasData,
  accent,
  isDark,
  onEdit,
  onAdd
}: MetricItemProps) => {
  const colors = useColors(isDark);
  const accentColor = accent?.primary || colors['bg-primary'];

  const getFieldIcon = (field: string) => FIELD_ICONS[field] || 'ellipse-outline';

  const handlePress = useCallback(() => {
    if (hasData && metric) {
      onEdit(metric);
    } else {
      onAdd(attemptId);
    }
  }, [hasData, metric, onEdit, onAdd, attemptId]);

  const renderField = (field: string, value: any) => {
    if (value === undefined || value === null || value === '') return null;

    let displayValue: string;
    if (field === 'time' && typeof value === 'number') {
      displayValue = formatTime(value);
    } else if (field === 'weight') {
      displayValue = `${value} kg`;
    } else if (field === 'is_success') {
      return (
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: value ? accentColor : colors['text-danger'],
            marginRight: 6,
          }} />
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('medium'),
            color: colors['text-secondary'],
          }}>
            {value ? 'Success' : 'Failed'}
          </Text>
        </View>
      );
    } else {
      displayValue = String(value);
    }

    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
        <Ionicons 
          name={getFieldIcon(field) as any} 
          size={14} 
          color={colors['text-muted']} 
          style={{ marginRight: 8, width: 16 }}
        />
        <Text style={{
          fontSize: 12,
          fontFamily: getFontFamily('regular'),
          color: colors['text-secondary'],
          flex: 1,
        }}>
          {FIELD_LABELS[field] || field}: <Text style={{ color: colors['text-primary'] }}>{displayValue}</Text>
        </Text>
      </View>
    );
  };

  const cardStyle = {
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    backgroundColor: colors['bg-card'],
    borderWidth: 1,
    borderColor: colors['border-default'],
  };

  // Card content - shared between web and native
  const cardContent = (
    <>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
          <Ionicons 
            name="medal-outline" 
            size={20} 
            color={accentColor} 
            style={{ marginRight: 10 }}
          />
          <View style={{ flex: 1 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('semibold'),
              color: colors['text-primary'],
            }}>
              Attempt {attemptId}
            </Text>
            {hasData && metric && metric.is_success !== undefined && (
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: metric.is_success ? accentColor : colors['text-danger'],
                  marginRight: 6,
                }} />
                <Text style={{
                  fontSize: 11,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-secondary'],
                }}>
                  {metric.is_success ? 'Success' : 'Failed'}
                </Text>
              </View>
            )}
          </View>
        </View>
        <Ionicons 
          name={hasData && metric ? "create-outline" : "add-outline"} 
          size={18} 
          color={colors['text-secondary']} 
        />
      </View>
      
      {hasData && metric && (
        <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors['border-default'] }}>
          {metric.time !== undefined && metric.time !== null && renderField('time', metric.time)}
          {metric.weight !== undefined && metric.weight !== null && renderField('weight', metric.weight)}
          {metric.type_of_activity && renderField('type_of_activity', metric.type_of_activity)}
          {metric.is_success !== undefined && renderField('is_success', metric.is_success)}
        </View>
      )}
      
      {!hasData && (
        <View style={{ marginTop: 8 }}>
          <Text style={{
            fontSize: 12,
            fontFamily: getFontFamily('regular'),
            color: colors['text-muted'],
            fontStyle: 'italic',
          }}>
            Tap to add metric
          </Text>
        </View>
      )}
    </>
  );

  // On web, use a View with onClick to avoid touch event conflicts with scrolling
  if (Platform.OS === 'web') {
    return (
      <View
        style={{
          ...cardStyle,
          cursor: 'pointer',
        } as any}
        // @ts-ignore - web-specific onClick prop
        onClick={handlePress}
      >
        {cardContent}
      </View>
    );
  }

  // On native, use TouchableOpacity with delayPressIn for scroll-friendly behavior
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      delayPressIn={100}
      style={cardStyle}
      onPress={handlePress}
    >
      {cardContent}
    </TouchableOpacity>
  );
});

MetricItem.displayName = 'MetricItem';

export default MetricItem;
