import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, Switch, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { useTheme, useToggleTheme } from '../../../stores/themeStore';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../stores/authStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { logout, user } = useAuthStore();
  const toggleTheme = useToggleTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    profileContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 32,
      paddingTop: 8,
    },
    avatarContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors['bg-primary'] + '15',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: colors['bg-primary'] + '40',
      marginRight: 16,
    },
    infoContainer: {
      flex: 1,
      justifyContent: 'center',
    },
    nameText: {
      fontSize: 24,
      fontFamily: getFontFamily('bold'),
      color: colors['text-primary'],
      marginBottom: 6,
    },
    emailText: {
      fontSize: 15,
      fontFamily: getFontFamily('regular'),
      color: colors['text-secondary'],
    },
  });

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <ScrollView 
        style={{ flex: 1, paddingHorizontal: 16, paddingTop: 16 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={28} color={colors['bg-primary']} />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>
              {user?.name || 'Event Organizer'}
            </Text>
            
            <Text style={styles.emailText}>
              {user?.name ? `${user.name}@repx.com` : 'organizer@repx.com'}
            </Text>
          </View>
        </View>

        {/* Theme Switcher - Above Logout */}
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          style={{
            marginTop: 24,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 14,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: colors['bg-card'],
            borderWidth: 1,
            borderColor: colors['border-default'],
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <Ionicons 
              name={isDark ? 'moon' : 'sunny'} 
              size={22} 
              color={colors['text-primary']} 
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                fontSize: 15,
                fontFamily: getFontFamily('semibold'),
                color: colors['text-primary'],
                marginBottom: 2,
              }}>
                {isDark ? 'Dark Mode' : 'Light Mode'}
              </Text>
              <Text style={{
                fontSize: 12,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
              }}>
                {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
              </Text>
            </View>
          </View>
          
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: colors['border-default'],
              true: colors['bg-primary'] + '40',
            }}
            thumbColor={isDark ? colors['bg-primary'] : colors['bg-secondary']}
            ios_backgroundColor={colors['border-default']}
          />
        </TouchableOpacity>

        {/* Logout Button - Cool Glassy Style */}
        <TouchableOpacity
          onPress={handleLogout}
          activeOpacity={0.7}
          style={{
            marginTop: 0,
            marginBottom: 24,
            borderRadius: 12,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: isDark
              ? 'rgba(255, 255, 255, 0.1)'
              : 'rgba(0, 0, 0, 0.1)',
          }}
        >
          <BlurView
            intensity={Platform.OS === 'ios' ? 60 : 40}
            tint={isDark ? 'dark' : 'light'}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              paddingHorizontal: 20,
              backgroundColor: isDark
                ? 'rgba(231, 76, 60, 0.1)'
                : 'rgba(231, 76, 60, 0.08)',
            }}
          >
            <Ionicons 
              name="log-out-outline" 
              size={20} 
              color={colors['text-danger']} 
              style={{ marginRight: 8 }}
            />
            <Text style={{
              fontSize: 16,
              fontFamily: getFontFamily('semibold'),
              color: colors['text-danger'],
            }}>
              Logout
            </Text>
          </BlurView>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
