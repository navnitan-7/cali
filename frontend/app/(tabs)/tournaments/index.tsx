import React, { useMemo, useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../stores/themeStore';
import { router } from 'expo-router';
import FloatingActionButton from '../../../components/ui/FloatingActionButton';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import { useTournamentStore } from '../../../stores/tournamentStore';
import { useEventStore } from '../../../stores/eventStore';
import { getTournamentAccent, getTournamentAccentDark } from '../../../utils/tournamentAccent';

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Minimal Tournament Card - Splitwise style with subtle accent
function TournamentCard({ 
  tournament, 
  isDark, 
  colors, 
  onPress 
}: {
  tournament: any;
  isDark: boolean;
  colors: any;
  onPress: () => void;
}) {
  // Get tournament accent color
  const accent = useMemo(() => {
    const baseAccent = getTournamentAccent(tournament.name, tournament.description);
    return isDark ? getTournamentAccentDark(baseAccent) : baseAccent;
  }, [tournament, isDark]);

  // Helper to get accent with opacity
  const getAccentWithOpacity = (opacity: number) => {
    if (!accent) return '';
    const hexOpacity = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return accent.primary + hexOpacity;
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: colors['bg-card'],
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors['border-default'],
        borderLeftWidth: accent ? 3 : 1,
        borderLeftColor: accent ? accent.primary : colors['border-default'],
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Subtle accent background */}
      {accent && (
        <View style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 60,
          height: 60,
          borderRadius: 30,
          backgroundColor: getAccentWithOpacity(0.04),
          transform: [{ translateX: 20 }, { translateY: -20 }],
        }} />
      )}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
        <View style={{ flex: 1 }}>
          <Text style={{
            fontSize: 16,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-primary'],
            marginBottom: 6,
          }} numberOfLines={1}>
            {tournament.name}
          </Text>
          
          <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="calendar-outline" size={14} color={colors['text-secondary']} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginLeft: 4,
              }}>
                {formatDate(tournament.date)}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="people-outline" size={14} color={colors['text-secondary']} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginLeft: 4,
              }}>
                {tournament.participants?.length || 0}
              </Text>
            </View>
            
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="trophy-outline" size={14} color={colors['text-secondary']} />
              <Text style={{
                fontSize: 13,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                marginLeft: 4,
              }}>
                {tournament.events?.length || 0}
              </Text>
            </View>
          </View>
        </View>
        
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color={accent ? getAccentWithOpacity(0.6) : colors['text-muted']} 
          style={{ marginLeft: 12 }} 
        />
      </View>
    </TouchableOpacity>
  );
}

export default function TournamentsScreen() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { tournaments } = useTournamentStore();
  const { syncEventsFromBackend } = useEventStore();
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Sync events from backend when component mounts
  useEffect(() => {
    console.log('[TournamentsScreen] Syncing events from backend...');
    syncEventsFromBackend().catch(error => {
      console.error('[TournamentsScreen] Failed to sync events:', error);
    });
  }, []);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const scrollY = contentOffset.y;
    const contentHeight = contentSize.height;
    const scrollViewHeight = layoutMeasurement.height;
    
    // Show top fade when scrolled down
    setShowTopFade(scrollY > 20);
    
    // Show bottom fade when not at bottom
    const isNearBottom = scrollY + scrollViewHeight >= contentHeight - 50;
    setShowBottomFade(!isNearBottom && contentHeight > scrollViewHeight);
  };

  const handleContentSizeChange = (contentWidth: number, contentHeight: number) => {
    // Content size changed - scroll event will update fade states
  };

  const handleLayout = () => {
    // Layout changed - scroll event will update fade states
  };

  // Initial check for scrollable content
  useEffect(() => {
    if (tournaments.length > 3) {
      // If there are many tournaments, likely scrollable - show bottom fade initially
      setTimeout(() => {
        setShowBottomFade(true);
      }, 300);
    }
  }, [tournaments.length]);

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Top Fade Gradient */}
        {showTopFade && (
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 60,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <LinearGradient
              colors={[
                colors['bg-surface'],
                colors['bg-surface'] + 'E6',
                colors['bg-surface'] + '00',
              ]}
              style={{ flex: 1 }}
            />
          </View>
        )}

        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          showsVerticalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onContentSizeChange={handleContentSizeChange}
          onLayout={handleLayout}
        >
          {/* Minimal Header */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}>
            <Text style={{
              fontSize: 24,
              fontFamily: getFontFamily('bold'),
              color: colors['text-primary'],
              marginBottom: 4,
            }}>
              Tournaments
            </Text>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
            }}>
              {tournaments.length} {tournaments.length === 1 ? 'tournament' : 'tournaments'}
            </Text>
          </View>

          {/* Tournaments List */}
          <View style={{ paddingHorizontal: 16 }}>
            {tournaments.length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingBottom: 40 }}>
                <Ionicons name="trophy-outline" size={40} color={colors['text-muted']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginTop: 12,
                }}>
                  No tournaments yet
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-muted'],
                  marginTop: 4,
                }}>
                  Create your first tournament
                </Text>
              </View>
            ) : (
              tournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  isDark={isDark}
                  colors={colors}
                  onPress={() => router.push(`/(tabs)/tournaments/${tournament.id}` as any)}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Bottom Fade Gradient - Above Tab Bar */}
        {showBottomFade && (
          <View
            style={{
              position: 'absolute',
              bottom: insets.bottom - 40, // Above tab bar (tab bar height 70px + 16px spacing)
              left: 0,
              right: 0,
              height: 60,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <LinearGradient
              colors={[
                colors['bg-surface'] + '00',
                colors['bg-surface'] + 'CC',
                colors['bg-surface'],
              ]}
              style={{ flex: 1 }}
            />
          </View>
        )}

        <FloatingActionButton
          onPress={() => router.push('/(tabs)/tournaments/create' as any)}
          icon="add"
        />
      </View>
    </SafeAreaView>
  );
}
