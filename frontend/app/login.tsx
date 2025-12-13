import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../stores/themeStore';
import { useColors } from '../utils/colors';
import { getFontFamily } from '../utils/fonts';
import { useAuthStore } from '../stores/authStore';
import { useEventTypesStore } from '../stores/eventTypesStore';
import Button from '../components/ui/Button';

export default function LoginScreen() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const { login, isLoading: authLoading, error } = useAuthStore();
  const { fetchEventTypes } = useEventTypesStore();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }
    
    const success = await login(username.trim(), password);
    
    if (success) {
      // Fetch and cache event types after successful login
      fetchEventTypes().catch((error) => {
        console.error('Error fetching event types after login:', error);
      });
      router.replace('/(tabs)/tournaments');
    } else {
      Alert.alert('Login Failed', error || 'Invalid username or password');
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 48,
    },
    logoIcon: {
      width: 80,
      height: 80,
      borderRadius: 20,
      backgroundColor: colors['bg-primary'] + '30',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: colors['bg-primary'],
    },
    title: {
      fontSize: 32,
      fontFamily: getFontFamily('bold'),
      color: colors['text-primary'],
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      fontFamily: getFontFamily('regular'),
      color: colors['text-secondary'],
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontFamily: getFontFamily('medium'),
      color: colors['text-secondary'],
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors['border-default'],
      borderRadius: 12,
      backgroundColor: colors['bg-secondary'],
      paddingHorizontal: 16,
    },
    input: {
      flex: 1,
      paddingVertical: 14,
      color: colors['text-primary'],
      fontFamily: getFontFamily('regular'),
      fontSize: 16,
    },
    passwordToggle: {
      padding: 4,
    },
    credentialsHint: {
      marginTop: 24,
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors['bg-card'] + 'E6',
      borderWidth: 1,
      borderColor: colors['border-default'],
    },
    hintText: {
      fontSize: 12,
      fontFamily: getFontFamily('regular'),
      color: colors['text-secondary'],
      textAlign: 'center',
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoIcon}>
              <Ionicons name="trophy" size={40} color={colors['bg-primary']} />
            </View>
            <Text style={styles.title}>RepX</Text>
            <Text style={styles.subtitle}>Fitness Competition Management</Text>
          </View>

          {/* Login Form */}
          <View>
            {/* Username */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="person-outline" size={20} color={colors['text-secondary']} style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Enter username"
                  placeholderTextColor={colors['text-secondary']}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={20} color={colors['text-secondary']} style={{ marginRight: 12 }} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter password"
                  placeholderTextColor={colors['text-secondary']}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors['text-secondary']}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Login Button */}
            <Button
              title="Login"
              onPress={handleLogin}
              variant="primary"
              size="large"
              fullWidth
              disabled={authLoading}
              loading={authLoading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

