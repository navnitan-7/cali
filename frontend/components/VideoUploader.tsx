import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/styles/theme';

interface VideoUploaderProps {
  attemptId: number;
  onUpload: (attemptId: number, file: FormData) => Promise<void>;
}

export const VideoUploader: React.FC<VideoUploaderProps> = ({ attemptId, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handlePickVideos = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Permission to access media library is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        setIsUploading(true);

        for (const asset of result.assets) {
          const formData = new FormData();
          
          // @ts-ignore - FormData accepts objects with uri, type, and name
          formData.append('file', {
            uri: asset.uri,
            type: 'video/mp4',
            name: `video-${Date.now()}.mp4`,
          });

          await onUpload(attemptId, formData);
        }

        setIsUploading(false);
        Alert.alert('Success', `${result.assets.length} video(s) uploaded successfully`);
      }
    } catch (error) {
      setIsUploading(false);
      Alert.alert('Error', 'Failed to upload videos');
      console.error('Upload error:', error);
    }
  };

  return (
    <View style={styles.container}>
      {isUploading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
          <Text style={styles.loadingText}>Uploading videos...</Text>
        </View>
      ) : (
        <TouchableOpacity
          style={styles.button}
          onPress={handlePickVideos}
        >
          <Text style={styles.buttonText}>Upload Videos</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.background,
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.fontSize.base,
    color: theme.colors.text,
  },
});

