import React, { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '../../utils/colors';
import { getFontFamily } from '../../utils/fonts';
import {
  View,
  Text,
  TouchableOpacity,
  Platform,
  Animated,
  Dimensions,
  StyleSheet,
  PanResponder,
  LayoutChangeEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../stores/themeStore';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function TabLayout() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();

  // shimmer animation (very subtle)
  const shimmer = useRef(new Animated.Value(-1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 2200,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmer]);

  const shimmerTranslate = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH * 0.5],
  });

  // swipe handlers
  const swipeHandlers = useRef<{
    handleSwipeLeft?: () => void;
    handleSwipeRight?: () => void;
  }>({});

  const panResponderRef = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return (
          Math.abs(gestureState.dx) > 12 &&
          Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
        );
      },
      onPanResponderRelease: (_, gestureState) => {
        const dx = gestureState.dx;
        if (dx < -30 && swipeHandlers.current.handleSwipeLeft) {
          swipeHandlers.current.handleSwipeLeft();
        } else if (dx > 30 && swipeHandlers.current.handleSwipeRight) {
          swipeHandlers.current.handleSwipeRight();
        }
      },
    })
  ).current;

  // Liquid Glass bubble animation
  const bubbleX = useRef(new Animated.Value(0)).current;
  const bubbleScale = useRef(new Animated.Value(0)).current;
  const bubbleExpandScale = useRef(new Animated.Value(1)).current; // For press expansion
  const bubbleDragX = useRef(new Animated.Value(0)).current; // For drag following
  const tabWidthRef = useRef<number>(0);
  const previousIndexRef = useRef<number>(0);
  const tabScalesRef = useRef<Map<string, Animated.Value>>(new Map());
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const currentTabIndexRef = useRef(0);

  const animateBubbleToIndex = (index: number) => {
    if (!tabWidthRef.current) return;
    const targetX = index * tabWidthRef.current + tabWidthRef.current / 2;
    currentTabIndexRef.current = index;

    Animated.parallel([
      Animated.spring(bubbleX, {
        toValue: targetX,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }),
      Animated.spring(bubbleScale, {
        toValue: 1,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }),
      Animated.spring(bubbleDragX, {
        toValue: 0,
        useNativeDriver: true,
        damping: 18,
        stiffness: 180,
      }),
    ]).start();
  };

  const expandBubble = () => {
    Animated.spring(bubbleExpandScale, {
      toValue: 1.15, // Expand by 15%
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const shrinkBubble = () => {
    Animated.spring(bubbleExpandScale, {
      toValue: 1,
      useNativeDriver: true,
      damping: 15,
      stiffness: 200,
    }).start();
  };

  const hideBubble = () => {
    Animated.spring(bubbleScale, {
      toValue: 0,
      useNativeDriver: true,
      damping: 20,
      stiffness: 260,
    }).start();
  };

  return (
    <Tabs
      initialRouteName="events"
      backBehavior="initialRoute"
      screenOptions={{
        tabBarActiveTintColor: colors.white,
        tabBarInactiveTintColor:
          colors['text-secondary'] || 'rgba(255,255,255,0.6)',
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: insets.bottom + 8,
          left: 16,
          right: 16,
          height: 64,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerStyle: {
          backgroundColor: 'transparent',
        },
        headerTintColor: colors['text-primary'] || '#fff',
        tabBarLabelStyle: {
          fontWeight: '600',
          fontFamily: getFontFamily('semibold'),
          fontSize: 12,
          marginTop: 4,
        },
        tabBarButton: (props) => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            {props.children}
          </View>
        ),
      }}
      tabBar={(props) => {
        // update bubble whenever active tab changes
        if (props.state.index !== previousIndexRef.current) {
          previousIndexRef.current = props.state.index;
          animateBubbleToIndex(props.state.index);
        }

        swipeHandlers.current.handleSwipeLeft = () => {
          const idx = props.state.index;
          const next = Math.min(props.state.routes.length - 1, idx + 1);
          if (next !== idx) props.navigation.navigate(props.state.routes[next].name);
        };
        swipeHandlers.current.handleSwipeRight = () => {
          const idx = props.state.index;
          const prev = Math.max(0, idx - 1);
          if (prev !== idx) props.navigation.navigate(props.state.routes[prev].name);
        };

        const tabBarWidth = SCREEN_WIDTH * 0.5; // Reduced width for 2 tabs
        const tabWidth = tabBarWidth / props.state.routes.length;

        const onTabsLayout = (e: LayoutChangeEvent) => {
          const width = e.nativeEvent.layout.width;
          tabWidthRef.current = width / props.state.routes.length;
          // initialise bubble in correct place
          animateBubbleToIndex(props.state.index);
        };
        
        return (
          <View
            {...panResponderRef.panHandlers}
            style={[
              styles.outerWrap,
              {
                bottom: insets.bottom + 16,
                width: tabBarWidth,
                alignSelf: 'center',
                height: 70,
              },
            ]}
          >
            {/* Liquid Glass base bar */}
            <BlurView
              intensity={Platform.OS === 'ios' ? 100 : 85}
              tint={isDark ? 'dark' : 'light'}
              style={styles.innerGlass}
            >
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  backgroundColor: isDark
                    ? 'rgba(28, 28, 30, 0.8)'
                    : 'rgba(255, 255, 255, 0.85)',
                  borderRadius: 42,
                }}
              />

              <LinearGradient
                colors={
                  isDark
                    ? [
                        'rgba(255, 255, 255, 0.08)',
                        'rgba(255, 255, 255, 0.04)',
                        'rgba(255, 255, 255, 0.02)',
                        'rgba(255, 255, 255, 0.04)',
                        'rgba(255, 255, 255, 0.08)',
                      ]
                    : [
                        'rgba(255, 255, 255, 0.3)',
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 255, 255, 0.1)',
                        'rgba(255, 255, 255, 0.2)',
                        'rgba(255, 255, 255, 0.3)',
                      ]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />

              {/* shimmer */}
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.shimmer,
                  {
                    transform: [{ translateX: shimmerTranslate }, { rotate: '18deg' }],
                    opacity: isDark ? 0.04 : 0.08,
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? [
                          'transparent',
                          'rgba(255, 255, 255, 0.2)',
                          'rgba(255, 255, 255, 0.1)',
                          'transparent',
                        ]
                      : [
                          'transparent',
                          'rgba(255, 255, 255, 0.4)',
                          'rgba(255, 255, 255, 0.2)',
                          'transparent',
                        ]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  locations={[0, 0.3, 0.7, 1]}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>

              {/* base border */}
              <View
                style={{
                  ...StyleSheet.absoluteFillObject,
                  borderRadius: 42,
                  borderWidth: 1,
                  borderColor: isDark
                    ? 'rgba(255, 255, 255, 0.15)'
                    : 'rgba(0, 0, 0, 0.08)',
                }}
              />

              {/* Moving rounded "zoom" bubble */}
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: (tabWidthRef.current || tabWidth) - 16, // Horizontal padding: 8px each side
                  height: 62, // Vertical padding: 4px top and bottom
                  borderRadius: 31,
                  bottom: 4, // 4px from bottom
                  transform: [
                    { 
                      translateX: Animated.add(
                        Animated.subtract(
                          bubbleX, 
                          ((tabWidthRef.current || tabWidth) - 16) / 2
                        ),
                        bubbleDragX
                      ) 
                    },
                    { scale: Animated.multiply(bubbleScale, bubbleExpandScale) },
                  ],
                  overflow: 'hidden',
                }}
              >
                <BlurView
                  intensity={120}
                  tint={isDark ? 'dark' : 'light'}
                  style={StyleSheet.absoluteFill}
                />
                <LinearGradient
                  colors={[
                    hexToRgba(colors['bg-primary'], 0.45),
                    hexToRgba(colors['bg-primary'], 0.05),
                    'rgba(255,255,255,0.01)',
                  ]}
                  start={{ x: 0.2, y: 0 }}
                  end={{ x: 0.8, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <View
                  style={{
                    ...StyleSheet.absoluteFillObject,
                    borderRadius: 31,
                    borderWidth: 1.3,
                    borderColor: isDark
                      ? 'rgba(255,255,255,0.55)'
                      : 'rgba(0,0,0,0.25)',
                  }}
                />
              </Animated.View>

              {/* Tabs */}
              <View
                style={{
                  flexDirection: 'row',
                  paddingHorizontal: 8,
                  paddingVertical: 8,
                  height: '100%',
                  borderRadius: 42,
                  alignItems: 'center',
                }}
                onLayout={onTabsLayout}
              >
                {props.state.routes.map((route, index) => {
                  const { options } = props.descriptors[route.key];
                  const isFocused = props.state.index === index;

                  const label =
                    options.tabBarLabel !== undefined
                      ? options.tabBarLabel
                      : options.title !== undefined && options.title !== ''
                      ? options.title
                      : route.name;

                  const onPress = () => {
                    const event = props.navigation.emit({
                      type: 'tabPress',
                      target: route.key,
                      canPreventDefault: true,
                    });
                    if (!isFocused && !event.defaultPrevented) {
                      props.navigation.navigate(route.name);
                    }
                  };

                  const iconName =
                    route.name === 'events'
                      ? isFocused
                        ? 'trophy'
                        : 'trophy-outline'
                      : isFocused
                      ? 'person'
                      : 'person-outline';

                  // Get or create scale animation for this tab
                  if (!tabScalesRef.current.has(route.key)) {
                    tabScalesRef.current.set(route.key, new Animated.Value(1));
                  }
                  const scale = tabScalesRef.current.get(route.key)!;

                  const onPressIn = () => {
                    Animated.spring(scale, {
                      toValue: 0.94,
                      useNativeDriver: true,
                    }).start();
                    expandBubble();
                    if (!isDraggingRef.current) {
                      animateBubbleToIndex(index);
                    }
                  };
                  
                  const onPressOut = () => {
                    Animated.spring(scale, {
                      toValue: 1,
                      friction: 6,
                      useNativeDriver: true,
                    }).start();
                    shrinkBubble();
                    isDraggingRef.current = false;
                    // Reset drag position
                    Animated.spring(bubbleDragX, {
                      toValue: 0,
                      useNativeDriver: true,
                      damping: 18,
                      stiffness: 180,
                    }).start();
                  };

                  // Create pan responder for drag tracking (without useRef to avoid hook error)
                  const tabPanResponder = PanResponder.create({
                    onStartShouldSetPanResponder: () => true,
                    onMoveShouldSetPanResponder: (_, gestureState) => {
                      return Math.abs(gestureState.dx) > 5;
                    },
                    onPanResponderGrant: () => {
                      if (tabWidthRef.current) {
                        dragStartXRef.current = currentTabIndexRef.current * tabWidthRef.current + tabWidthRef.current / 2;
                      }
                      isDraggingRef.current = true;
                      onPressIn();
                    },
                    onPanResponderMove: (_, gestureState) => {
                      if (isDraggingRef.current && tabWidthRef.current) {
                        const currentTabCenter = currentTabIndexRef.current * tabWidthRef.current + tabWidthRef.current / 2;
                        const dragOffset = gestureState.dx;
                        const newX = currentTabCenter + dragOffset;
                        
                        // Clamp to tab bar bounds
                        const minX = tabWidthRef.current / 2;
                        const maxX = (props.state.routes.length - 1) * tabWidthRef.current + tabWidthRef.current / 2;
                        const clampedX = Math.max(minX, Math.min(maxX, newX));
                        
                        bubbleDragX.setValue(clampedX - currentTabCenter);
                        
                        // Check if dragged to another tab
                        const targetIndex = Math.round((clampedX - tabWidthRef.current / 2) / tabWidthRef.current);
                        if (targetIndex >= 0 && targetIndex < props.state.routes.length && targetIndex !== currentTabIndexRef.current) {
                          // Expand more when dragging to another tab
                          Animated.spring(bubbleExpandScale, {
                            toValue: 1.25,
                            useNativeDriver: true,
                            damping: 15,
                            stiffness: 200,
                          }).start();
                        } else {
                          // Normal expansion
                          Animated.spring(bubbleExpandScale, {
                            toValue: 1.15,
                            useNativeDriver: true,
                            damping: 15,
                            stiffness: 200,
                          }).start();
                        }
                      }
                    },
                    onPanResponderRelease: (_, gestureState) => {
                      if (isDraggingRef.current && tabWidthRef.current) {
                        const dragDistance = Math.abs(gestureState.dx);
                        const currentTabCenter = currentTabIndexRef.current * tabWidthRef.current + tabWidthRef.current / 2;
                        const finalX = currentTabCenter + gestureState.dx;
                        const targetIndex = Math.round((finalX - tabWidthRef.current / 2) / tabWidthRef.current);
                        
                        // If dragged far enough (more than 30% of tab width), navigate
                        if (dragDistance > tabWidthRef.current * 0.3 && 
                            targetIndex >= 0 && 
                            targetIndex < props.state.routes.length && 
                            targetIndex !== currentTabIndexRef.current) {
                          props.navigation.navigate(props.state.routes[targetIndex].name);
                          animateBubbleToIndex(targetIndex);
                        } else if (dragDistance < 10) {
                          // Quick tap - navigate to this tab
                          onPress();
                          animateBubbleToIndex(index);
                        } else {
                          // Snap back to current tab
                          animateBubbleToIndex(currentTabIndexRef.current);
                        }
                      } else {
                        // Quick tap without drag
                        onPress();
                      }
                      onPressOut();
                    },
                  });

                  return (
                    <Animated.View
                      key={route.key}
                      style={{ flex: 1, marginHorizontal: 4, transform: [{ scale }] }}
                    >
                      <View
                        {...tabPanResponder.panHandlers}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        style={[
                          styles.tabButton,
                          {
                            backgroundColor: 'transparent',
                          },
                        ]}
                      >
                        <Ionicons
                          name={iconName as any}
                          size={24}
                          color={
                            isFocused
                              ? colors['bg-primary'] || '#00C389'
                              : isDark
                              ? 'rgba(255, 255, 255, 0.5)'
                              : 'rgba(0, 0, 0, 0.5)'
                          }
                        />
                        {label && (
                          <Text
                            style={{
                              fontSize: 11,
                              fontFamily: getFontFamily('semibold'),
                              fontWeight: '600',
                              color:
                                isFocused
                                  ? colors['bg-primary'] || '#00C389'
                                  : isDark
                                  ? 'rgba(255, 255, 255, 0.5)'
                                  : 'rgba(0, 0, 0, 0.5)',
                              marginTop: 4,
                            }}
                          >
                            {label as string}
                          </Text>
                        )}
                      </View>
                    </Animated.View>
                  );
                })}
              </View>
            </BlurView>
          </View>
        );
      }}
    >
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'trophy' : 'trophy-outline'} size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
          headerShown: false,
        }}
      />
    </Tabs>
  );
}

/** small helper to convert hex to rgba with fallback for named colors */
function hexToRgba(hex: string | undefined, alpha: number) {
  if (!hex) return `rgba(0,195,140,${alpha})`;
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  const fullHex = hex.replace(shorthandRegex, function (_, r, g, b) {
    return r + r + g + g + b + b;
  });
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex);
  if (!match) return `rgba(0,195,140,${alpha})`;
  const r = parseInt(match[1], 16);
  const g = parseInt(match[2], 16);
  const b = parseInt(match[3], 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  outerWrap: {
    position: 'absolute',
    borderRadius: 45,
    overflow: 'visible',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 20,
  },
  innerGlass: {
    flex: 1,
    borderRadius: 42,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  shimmer: {
    position: 'absolute',
    left: -SCREEN_WIDTH * 0.5,
    top: -20,
    width: SCREEN_WIDTH * 0.45,
    height: 120,
    borderRadius: 60,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
    minHeight: 60,
  },
});
