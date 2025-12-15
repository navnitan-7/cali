import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import DebugInfo from '../components/DebugInfo';
import { useColors } from '../utils/colors';
import { useTheme } from '../stores/themeStore';

export default function DebugScreen() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <DebugInfo />
    </SafeAreaView>
  );
}

