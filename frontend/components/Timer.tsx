import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '@/styles/theme';

interface TimerProps {
  onSave: (durationMs: number) => void;
}

export const Timer: React.FC<TimerProps> = ({ onSave }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedMs((prev) => prev + 10);
      }, 10);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  const formatTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const centiseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsedMs(0);
  };

  const handleSave = () => {
    onSave(elapsedMs);
    handleReset();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.timerDisplay}>{formatTime(elapsedMs)}</Text>
      
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={handleStartPause}
        >
          <Text style={styles.buttonText}>{isRunning ? 'Pause' : 'Start'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={handleReset}
        >
          <Text style={styles.buttonTextSecondary}>Reset</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.button, styles.buttonSuccess, styles.saveButton]}
        onPress={handleSave}
        disabled={elapsedMs === 0}
      >
        <Text style={styles.buttonText}>Save Attempt</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.md,
    ...theme.shadow.md,
  },
  timerDisplay: {
    fontSize: 64,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xl,
    fontVariant: ['tabular-nums'],
    letterSpacing: -2,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.md,
    width: '100%',
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    minWidth: 120,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    ...theme.shadow.sm,
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary,
  },
  buttonSecondary: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  buttonSuccess: {
    backgroundColor: theme.colors.success,
  },
  buttonText: {
    color: theme.colors.surface,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  buttonTextSecondary: {
    color: theme.colors.text,
    fontSize: theme.fontSize.base,
    fontWeight: theme.fontWeight.semibold,
  },
  saveButton: {
    width: '100%',
  },
});

