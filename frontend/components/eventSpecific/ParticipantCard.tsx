import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';
import Button from '../ui/Button';

interface ParticipantCardProps {
  id: string;
  name: string;
  weight: number;
  division: string;
  rank: number;
  onPress?: () => void;
  onAddVideo?: () => void;
  onAddMetric?: () => void;
}

export default function ParticipantCard({
  id,
  name,
  weight,
  division,
  rank,
  onPress,
  onAddVideo,
  onAddMetric,
}: ParticipantCardProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  const styles = StyleSheet.create({
    card: {
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors['border-default'],
      backgroundColor: colors['bg-card'] + 'E6',
    },
  });

  const CardContent = () => (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <View style={{
          width: 48,
          height: 48,
          borderRadius: 24,
          backgroundColor: colors['bg-primary'] + '30',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
        }}>
          <Ionicons name="person" size={24} color={colors['bg-primary']} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            {name}
          </Text>
          <Text style={{
            fontSize: 13,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginTop: 2,
          }}>
            {division} • {weight} kg
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('semibold'),
            color: colors['bg-primary'],
          }}>
            Rank #{rank}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Button
            title="Add Video"
            onPress={onAddVideo || (() => {})}
            variant="outline"
            size="small"
            fullWidth
          />
        </View>
        <View style={{ flex: 1 }}>
          <Button
            title="Add Metric"
            onPress={onAddMetric || (() => {})}
            variant="outline"
            size="small"
            fullWidth
          />
        </View>
      </View>
    </View>
  );

  if (onPress) {
    // On web, use a View with onClick to avoid touch event conflicts with scrolling
    if (Platform.OS === 'web') {
      return (
        <View
          style={{ cursor: 'pointer' } as any}
          // @ts-ignore - web-specific onClick prop
          onClick={onPress}
        >
          <CardContent />
        </View>
      );
    }

    // On native, use TouchableOpacity with delayPressIn for scroll-friendly behavior
    return (
      <TouchableOpacity 
        onPress={onPress} 
        activeOpacity={0.7} 
        delayPressIn={100}
      >
        <CardContent />
      </TouchableOpacity>
    );
  }

  return <CardContent />;
}
