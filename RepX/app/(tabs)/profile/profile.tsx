import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../stores/themeStore';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import Button from '../../../components/ui/Button';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../../../stores/authStore';

export default function ProfileScreen() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { logout, username } = useAuthStore();

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
      shadowColor: colors['bg-primary'],
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 3,
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
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Info */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={28} color={colors['bg-primary']} />
          </View>
          
          <View style={styles.infoContainer}>
            <Text style={styles.nameText}>
              {username || 'Event Organizer'}
            </Text>
            
            <Text style={styles.emailText}>
              {username ? `${username}@repx.com` : 'organizer@repx.com'}
            </Text>
          </View>
        </View>

        {/* Logout Button */}
        <Button
          title="Logout"
          onPress={handleLogout}
          variant="danger"
          fullWidth
          size="large"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

