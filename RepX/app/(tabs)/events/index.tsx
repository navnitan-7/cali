import React, { useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '../../../stores/themeStore';
import { router } from 'expo-router';
import FloatingActionButton from '../../../components/ui/FloatingActionButton';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import { useEventStore } from '../../../stores/eventStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_HEIGHT = 240;

import { getCategoryGradient, getCategoryGlow } from '../../../utils/categoryHelpers';

// Category-based background image (using gradient as placeholder - can be replaced with actual images)
const getCategoryBackground = (category: string) => {
  // For now, we'll use solid colors with patterns
  // In production, you'd use actual images: require('../../assets/categories/endurance.jpg')
  return null; // Will use gradient instead
};

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Premium Event Card Component
function EventCard({ 
  event, 
  cardGradient, 
  categoryGlow, 
  isDark, 
  colors, 
  onPress 
}: {
  event: any;
  cardGradient: string[];
  categoryGlow: string;
  isDark: boolean;
  colors: any;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const cardStyles = StyleSheet.create({
    premiumCard: {
      height: CARD_HEIGHT,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: colors['bg-card'],
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 20,
      elevation: 12,
    },
    blurOverlay: {
      ...StyleSheet.absoluteFillObject,
      opacity: 0.3,
    },
    cardContent: {
      flex: 1,
      padding: 20,
      justifyContent: 'space-between',
    },
    topSection: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
    },
    categoryTag: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 12,
      elevation: 4,
    },
    categoryText: {
      fontSize: 11,
      fontFamily: getFontFamily('semibold'),
      fontWeight: '700',
      color: '#FFFFFF',
      letterSpacing: 0.5,
      textTransform: 'uppercase',
    },
    bottomSection: {
      marginTop: 'auto',
    },
    eventName: {
      fontSize: 28,
      fontFamily: getFontFamily('bold'),
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.5,
      lineHeight: 34,
      marginBottom: 12,
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 0, height: 2 },
      textShadowRadius: 8,
    },
    metaContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 16,
    },
    metaText: {
      fontSize: 13,
      fontFamily: getFontFamily('medium'),
      color: 'rgba(255, 255, 255, 0.9)',
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 0, height: 1 },
      textShadowRadius: 4,
    },
    chevronContainer: {
      position: 'absolute',
      bottom: 20,
      right: 20,
    },
    chevronBackground: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
      alignItems: 'center',
      justifyContent: 'center',
      backdropFilter: 'blur(10px)',
    },
  });

  return (
    <Animated.View
      style={{
        transform: [{ scale: scaleAnim }],
        marginBottom: 20,
      }}
    >
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={cardStyles.premiumCard}>
          {/* Background with gradient overlay */}
          <LinearGradient
            colors={cardGradient as any}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          
          {/* Glassy blur overlay */}
          <BlurView
            intensity={isDark ? 20 : 15}
            tint={isDark ? 'dark' : 'light'}
            style={cardStyles.blurOverlay}
          />

          {/* Content Container */}
          <View style={cardStyles.cardContent}>
            {/* Top Section - Category Tag */}
            <View style={cardStyles.topSection}>
              <View style={[cardStyles.categoryTag, { shadowColor: categoryGlow }]}>
                <Text style={cardStyles.categoryText}>{event.category || 'Event'}</Text>
              </View>
            </View>

            {/* Bottom Section - Event Info */}
            <View style={cardStyles.bottomSection}>
              {/* Event Name */}
              <Text style={cardStyles.eventName} numberOfLines={2}>
                {event.name}
              </Text>

              {/* Meta Details */}
              <View style={cardStyles.metaContainer}>
                <View style={[cardStyles.metaItem, { marginRight: 16 }]}>
                  <Ionicons 
                    name="calendar" 
                    size={14} 
                    color="rgba(255, 255, 255, 0.9)" 
                  />
                  <Text style={[cardStyles.metaText, { marginLeft: 6 }]}>{formatDate(event.date)}</Text>
                </View>
                
                <View style={cardStyles.metaItem}>
                  <Ionicons 
                    name="people" 
                    size={14} 
                    color="rgba(255, 255, 255, 0.9)" 
                  />
                  <Text style={[cardStyles.metaText, { marginLeft: 6 }]}>
                    {event.participantCount || 0} {event.participantCount === 1 ? 'participant' : 'participants'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Chevron Indicator */}
            <View style={cardStyles.chevronContainer}>
              <View style={cardStyles.chevronBackground}>
                <Ionicons 
                  name="chevron-forward" 
                  size={18} 
                  color="rgba(255, 255, 255, 0.9)" 
                />
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function EventsScreen() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { events } = useEventStore();
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);


  // Animated opacity for top gradient
  const topOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  // Animated opacity for bottom gradient
  const bottomOpacity = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { 
      useNativeDriver: false, // Must be false for opacity animations
      listener: (event: any) => {
        // Optional: can add additional logic here if needed
      }
    }
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Top Gradient Overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 120,
            opacity: topOpacity,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <LinearGradient
            colors={isDark 
              ? ['rgba(0, 0, 0, 0.95)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0)']
              : ['rgba(0, 0, 0, 0.4)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0)']
            }
            locations={[0, 0.5, 1]}
            style={{
              flex: 1,
            }}
          />
        </Animated.View>

        {/* Bottom Gradient Overlay */}
        <Animated.View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 100,
            opacity: bottomOpacity,
            zIndex: 10,
            pointerEvents: 'none',
          }}
        >
          <LinearGradient
            colors={isDark
              ? ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.95)']
              : ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.2)', 'rgba(0, 0, 0, 0.4)']
            }
            locations={[0, 0.5, 1]}
            style={{
              flex: 1,
            }}
          />
        </Animated.View>

        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Header - Now scrollable */}
          <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 }}>
            <Text style={{
              fontSize: 28,
              fontFamily: getFontFamily('bold'),
              fontWeight: '800',
              color: colors['text-primary'],
              letterSpacing: -0.5,
            }}>
              Events
            </Text>
            <Text style={{
              fontSize: 13,
              fontFamily: getFontFamily('regular'),
              color: colors['text-secondary'],
              marginTop: 2,
            }}>
              Manage your fitness competitions
            </Text>
          </View>

          {/* Events List */}
          <View style={{ paddingHorizontal: 16 }}>
            {events.length === 0 ? (
              <View style={{ alignItems: 'center', justifyContent: 'center', paddingTop: 80, paddingBottom: 40 }}>
                <Ionicons name="trophy-outline" size={64} color={colors['text-muted']} />
                <Text style={{
                  fontSize: 18,
                  fontFamily: getFontFamily('semibold'),
                  color: colors['text-secondary'],
                  marginTop: 16,
                }}>
                  No events yet
                </Text>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-muted'],
                  marginTop: 8,
                }}>
                  Create your first event to get started
                </Text>
              </View>
            ) : (
              events.map((event, index) => {
                const cardGradient = getCategoryGradient(event.category || 'Other', isDark);
                const categoryGlow = getCategoryGlow(event.category || 'Other');

                return (
                  <EventCard
                    key={event.id}
                    event={event}
                    cardGradient={cardGradient}
                    categoryGlow={categoryGlow}
                    isDark={isDark}
                    colors={colors}
                    onPress={() => router.push(`/(tabs)/events/${event.id}` as any)}
                  />
                );
              })
            )}
          </View>
        </ScrollView>

        <FloatingActionButton
          onPress={() => router.push('/(tabs)/events/create' as any)}
          icon="add"
        />
      </View>
    </SafeAreaView>
  );
}
