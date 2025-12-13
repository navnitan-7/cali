import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { theme } from '@/styles/theme';

interface VideoRecorderProps {
  onVideoRecorded: (uri: string) => void;
}

export const VideoRecorder: React.FC<VideoRecorderProps> = ({ onVideoRecorded }) => {
  // On web, we hide the camera recording UI
  if (Platform.OS === 'web') {
    return (
      <View style={styles.webContainer}>
        <Text style={styles.webText}>
          Video recording is not available on web. Please use the video uploader instead.
        </Text>
      </View>
    );
  }

  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>Camera permission is required</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleStartRecording = async () => {
    if (!cameraRef.current) return;

    try {
      setIsRecording(true);
      const video = await cameraRef.current.recordAsync();
      if (video?.uri) {
        onVideoRecorded(video.uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to record video');
      console.error('Recording error:', error);
    } finally {
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        mode="video"
      />
      
      <View style={styles.controls}>
        {!isRecording ? (
          <TouchableOpacity
            style={[styles.button, styles.recordButton]}
            onPress={handleStartRecording}
          >
            <Text style={styles.buttonText}>Start Recording</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.stopButton]}
            onPress={handleStopRecording}
          >
            <Text style={styles.buttonText}>Stop Recording</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.backgroundAlt,
    minHeight: 300,
  },
  camera: {
    width: '100%',
    height: 300,
  },
  controls: {
    padding: theme.spacing.md,
  },
  button: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  recordButton: {
    backgroundColor: theme.colors.failure,
  },
  stopButton: {
    backgroundColor: theme.colors.text,
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  permissionContainer: {
    padding: theme.spacing.xl,
    alignItems: 'center',
    gap: theme.spacing.lg,
  },
  permissionText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
    textAlign: 'center',
  },
  webContainer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.backgroundAlt,
    alignItems: 'center',
  },
  webText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

