import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { useTheme } from '@/stores/themeStore';
import { useColors } from '@/utils/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  count?: number;
}

const Skeleton = ({ 
  width = '100%', 
  height = 20, 
  borderRadius = 8,
  style,
  variant = 'rectangular',
  count = 1
}: SkeletonProps) => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [shimmerAnim]);

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const getVariantStyle = () => {
    switch (variant) {
      case 'circular':
        return { borderRadius: height / 2, width: height, height };
      case 'text':
        return { height: 16, borderRadius: 4 };
      case 'card':
        return { borderRadius: 12, height: 120 };
      default:
        return { borderRadius, height };
    }
  };

  const baseStyle = [
    {
      width,
      backgroundColor: colors['bg-secondary'],
      overflow: 'hidden',
    },
    getVariantStyle(),
    style,
  ];

  if (count > 1) {
    return (
      <View>
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            key={index}
            width={width}
            height={height}
            borderRadius={borderRadius}
            variant={variant}
            style={[style, index < count - 1 && { marginBottom: 8 }]}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={baseStyle}>
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.3)',
            opacity: shimmerOpacity,
          },
        ]}
      />
    </View>
  );
};

// Flexible skeleton container that can be configured via props
interface SkeletonContainerProps {
  count?: number;
  layout?: 'card' | 'list' | 'metric' | 'participant' | 'tournament' | 'event';
  style?: any;
}

export const SkeletonContainer = ({ 
  count = 3, 
  layout = 'card',
  style 
}: SkeletonContainerProps) => {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  const getLayoutConfig = () => {
    switch (layout) {
      case 'card':
        return {
          containerStyle: {
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            backgroundColor: colors['bg-card'],
            borderWidth: 1,
            borderColor: colors['border-default'],
          },
          children: (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Skeleton variant="circular" width={36} height={36} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton width="60%" height={16} style={{ marginBottom: 6 }} />
                  <Skeleton width="40%" height={12} />
                </View>
              </View>
              <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
              <Skeleton width="80%" height={12} />
            </>
          ),
        };
      
      case 'list':
        return {
          containerStyle: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingVertical: 12,
            paddingHorizontal: 16,
            marginBottom: 8,
            backgroundColor: colors['bg-card'],
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors['border-default'],
          },
          children: (
            <>
              <Skeleton variant="circular" width={40} height={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="70%" height={16} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={12} />
              </View>
            </>
          ),
        };
      
      case 'metric':
        return {
          containerStyle: {
            borderRadius: 12,
            padding: 14,
            marginBottom: 8,
            backgroundColor: colors['bg-card'],
            borderWidth: 1,
            borderColor: colors['border-default'],
          },
          children: (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Skeleton variant="circular" width={20} height={20} />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Skeleton width="40%" height={14} style={{ marginBottom: 4 }} />
                    <Skeleton width="30%" height={11} />
                  </View>
                </View>
                <Skeleton variant="circular" width={18} height={18} />
              </View>
              <View style={{ marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors['border-default'] }}>
                <Skeleton width="60%" height={12} style={{ marginBottom: 6 }} />
                <Skeleton width="50%" height={12} />
              </View>
            </>
          ),
        };
      
      case 'participant':
        return {
          containerStyle: {
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            backgroundColor: colors['bg-card'],
            borderWidth: 1,
            borderColor: colors['border-default'],
            flexDirection: 'row',
            alignItems: 'center',
          },
          children: (
            <>
              <Skeleton variant="circular" width={40} height={40} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Skeleton width="50%" height={15} style={{ marginBottom: 6 }} />
                <Skeleton width="30%" height={12} />
              </View>
            </>
          ),
        };
      
      case 'tournament':
        return {
          containerStyle: {
            backgroundColor: colors['bg-card'],
            borderRadius: 16,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors['border-default'],
          },
          children: (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Skeleton width="60%" height={18} style={{ marginBottom: 6 }} />
                  <Skeleton width="40%" height={14} />
                </View>
              </View>
              <Skeleton width="100%" height={12} style={{ marginBottom: 6 }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Skeleton width="30%" height={12} />
                <Skeleton width="25%" height={12} />
              </View>
            </>
          ),
        };
      
      case 'event':
        return {
          containerStyle: {
            backgroundColor: colors['bg-card'],
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors['border-default'],
          },
          children: (
            <>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Skeleton width="70%" height={18} style={{ marginBottom: 8 }} />
                  <Skeleton width="50%" height={14} />
                </View>
                <Skeleton variant="circular" width={32} height={32} />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                <Skeleton width="25%" height={24} borderRadius={12} />
                <Skeleton width="25%" height={24} borderRadius={12} />
              </View>
            </>
          ),
        };
      
      default:
        return {
          containerStyle: {
            borderRadius: 12,
            padding: 14,
            marginBottom: 12,
            backgroundColor: colors['bg-card'],
            borderWidth: 1,
            borderColor: colors['border-default'],
          },
          children: (
            <>
              <Skeleton width="100%" height={16} style={{ marginBottom: 8 }} />
              <Skeleton width="80%" height={12} />
            </>
          ),
        };
    }
  };

  const config = getLayoutConfig();

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <View
          key={index}
          style={[config.containerStyle, style, index < count - 1 && { marginBottom: layout === 'list' ? 8 : 12 }]}
        >
          {config.children}
        </View>
      ))}
    </>
  );
};

// Keep old exports for backward compatibility (deprecated - use SkeletonContainer instead)
export const SkeletonCard = ({ count = 3 }: { count?: number }) => (
  <SkeletonContainer count={count} layout="card" />
);

export const SkeletonList = ({ count = 5 }: { count?: number }) => (
  <SkeletonContainer count={count} layout="list" />
);

export const SkeletonMetricItem = ({ count = 3 }: { count?: number }) => (
  <SkeletonContainer count={count} layout="metric" />
);

export const SkeletonParticipantCard = ({ count = 4 }: { count?: number }) => (
  <SkeletonContainer count={count} layout="participant" />
);

export const SkeletonTournamentCard = ({ count = 3 }: { count?: number }) => (
  <SkeletonContainer count={count} layout="tournament" />
);

export const SkeletonEventCard = ({ count = 3 }: { count?: number }) => (
  <SkeletonContainer count={count} layout="event" />
);

export default Skeleton;
