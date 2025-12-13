import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../stores/themeStore';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';

interface LeaderboardCardProps {
  rank: number;
  name: string;
  division: string;
  weight: number;
  value: string;
  isTopThree?: boolean;
}

const RANK_COLORS = [
  { bg: '#FFD700', glow: '#FFD700' }, // Gold
  { bg: '#C0C0C0', glow: '#C0C0C0' }, // Silver
  { bg: '#CD7F32', glow: '#CD7F32' }, // Bronze
];

export default function LeaderboardCard({
  rank,
  name,
  division,
  weight,
  value,
  isTopThree = false,
}: LeaderboardCardProps) {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  const rankColor = isTopThree && rank <= 3 ? RANK_COLORS[rank - 1] : null;

  const styles = StyleSheet.create({
    card: {
      borderRadius: isTopThree ? 20 : 16,
      padding: isTopThree ? 20 : 16,
      marginBottom: 16,
      borderWidth: isTopThree ? 2 : 1,
      borderColor: rankColor?.bg || colors['border-default'],
      backgroundColor: colors['bg-card'] + 'E6',
      shadowColor: rankColor?.glow || 'transparent',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isTopThree ? 0.3 : 0,
      shadowRadius: isTopThree ? 16 : 0,
      elevation: isTopThree ? 8 : 4,
    },
    rankBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
  });

  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={[
          styles.rankBadge,
          {
            backgroundColor: rankColor
              ? rankColor.bg + '30'
              : colors['bg-secondary'],
            borderWidth: rankColor ? 2 : 1,
            borderColor: rankColor?.bg || colors['border-default'],
          }
        ]}>
          <Text style={{
            fontSize: isTopThree ? 18 : 14,
            fontFamily: getFontFamily('bold'),
            color: rankColor?.bg || colors['text-primary'],
          }}>
            {rank}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: isTopThree ? 20 : 16,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            {name}
          </Text>
          <Text style={{
            fontSize: 14,
            fontFamily: getFontFamily('regular'),
            color: colors['text-secondary'],
            marginTop: 4,
          }}>
            {division} • {weight} kg
          </Text>
        </View>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{
            fontSize: isTopThree ? 24 : 16,
            fontFamily: getFontFamily('bold'),
            color: rankColor?.bg || colors['text-primary'],
          }}>
            {value}
          </Text>
        </View>
      </View>
    </View>
  );
}
