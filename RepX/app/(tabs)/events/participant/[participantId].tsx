import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, Pressable, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../../../../stores/themeStore';
import { useColors } from '../../../../utils/colors';
import { getFontFamily } from '../../../../utils/fonts';
import { getCategoryGradient, getCategoryGlow } from '../../../../utils/categoryHelpers';
import { useEventStore } from '../../../../stores/eventStore';
import Button from '../../../../components/ui/Button';
import ConfirmDialog from '../../../../components/ui/ConfirmDialog';
import TimePicker from '../../../../components/ui/TimePicker';
import Toast from '../../../../components/ui/Toast';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 240;

export default function ParticipantDetailScreen() {
  const { eventId, participantId } = useLocalSearchParams<{ eventId: string; participantId: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getEvent, updateParticipant, deleteParticipant } = useEventStore();

  const event = eventId ? getEvent(eventId) : undefined;
  const participant = event?.participants.find((p) => p.id === participantId);

  const [name, setName] = useState(participant?.name || '');
  const [weight, setWeight] = useState(participant?.weight?.toString() || '');
  const [division, setDivision] = useState(participant?.division || '');
  const [reps, setReps] = useState(participant?.reps?.toString() || '');
  const [time, setTime] = useState(participant?.time || '');
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const scrollViewRef = useRef<ScrollView>(null);

  if (!event || !participant) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Participant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    updateParticipant(eventId!, participantId, {
      name: name.trim(),
      weight: weight ? parseFloat(weight) : undefined,
      division: division || undefined,
      reps: reps ? parseInt(reps, 10) : undefined,
      time: time || undefined,
    });

    // Show toast notification
    setToastVisible(true);
    
    // Navigate back after a short delay to allow toast to be visible
    setTimeout(() => {
      router.back();
    }, 1500);
  };

  const handleDeleteVideo = (videoIndex: number) => {
    const updatedVideos = participant.videos?.filter((_, i) => i !== videoIndex) || [];
    updateParticipant(eventId!, participantId, { videos: updatedVideos });
  };

  const handleDeleteAttachment = (attachmentIndex: number) => {
    const updatedAttachments = participant.attachments?.filter((_, i) => i !== attachmentIndex) || [];
    updateParticipant(eventId!, participantId, { attachments: updatedAttachments });
  };

  const handleUploadVideo = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload videos');
        return;
      }

      // Pick video
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const videoUri = result.assets[0].uri;
        const videoName = result.assets[0].fileName || `video_${Date.now()}.mp4`;
        
        // Add video to participant
        const currentVideos = participant.videos || [];
        updateParticipant(eventId!, participantId, {
          videos: [...currentVideos, { uri: videoUri, name: videoName }],
        });
        
        Alert.alert('Success', 'Video uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video');
    }
  };

  const handleUploadDocument = async () => {
    try {
      // Pick document
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets[0]) {
        const docUri = result.assets[0].uri;
        const docName = result.assets[0].name || `document_${Date.now()}`;
        
        // Add attachment to participant
        const currentAttachments = participant.attachments || [];
        updateParticipant(eventId!, participantId, {
          attachments: [...currentAttachments, { uri: docUri, name: docName }],
        });
        
        Alert.alert('Success', 'Document uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      Alert.alert('Error', 'Failed to upload document');
    }
  };

  const handleDeleteParticipant = () => {
    if (eventId && participantId) {
      deleteParticipant(eventId, participantId);
      setDeleteConfirmVisible(false);
      router.back();
    }
  };

  const styles = StyleSheet.create({
    card: {
      borderRadius: 20,
      padding: 20,
      marginBottom: 16,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    label: {
      fontSize: 13,
      fontFamily: getFontFamily('semibold'),
      color: colors['text-secondary'],
      marginBottom: 8,
      marginTop: 16,
    },
    input: {
      borderWidth: 1,
      borderColor: colors['border-default'],
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      color: colors['text-primary'],
      fontFamily: getFontFamily('regular'),
      fontSize: 16,
      backgroundColor: colors['bg-secondary'],
    },
    attachmentItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors['border-default'],
    },
  });

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
      useNativeDriver: false,
    }
  );

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <Toast
        visible={toastVisible}
        message="Changes saved successfully!"
        onHide={() => setToastVisible(false)}
        isDark={isDark}
      />
      <View style={{ flex: 1 }}>
        {/* Sticky Header - Back and Menu */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: Math.max(insets.top - 50, 15),
          paddingBottom: 12,
          zIndex: 20,
          backgroundColor: 'transparent',
        }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 60}
              tint={isDark ? 'dark' : 'light'}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 22,
              }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setMenuVisible(true)}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              overflow: 'hidden',
            }}
          >
            <BlurView
              intensity={Platform.OS === 'ios' ? 80 : 60}
              tint={isDark ? 'dark' : 'light'}
              style={{
                flex: 1,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: 22,
              }}
            >
              <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
            </BlurView>
          </TouchableOpacity>
        </View>

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

        {/* Action Menu Modal */}
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <Pressable
            style={{
              flex: 1,
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              paddingTop: 60,
              paddingRight: 16,
            }}
            onPress={() => setMenuVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: colors['bg-card'],
                borderRadius: 16,
                paddingVertical: 8,
                minWidth: 180,
                borderWidth: 1,
                borderColor: colors['border-default'],
                shadowColor: colors['bg-primary'],
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 16,
                elevation: 12,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  setDeleteConfirmVisible(true);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors['text-danger']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-danger'],
                  marginLeft: 12,
                }}>
                  Delete Participant
                </Text>
              </TouchableOpacity>
            </Pressable>
          </Pressable>
        </Modal>

        <ConfirmDialog
          visible={deleteConfirmVisible}
          title="Delete Participant"
          message="Are you sure you want to delete this participant? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDeleteParticipant}
          onCancel={() => setDeleteConfirmVisible(false)}
        />

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {/* Premium Hero Section */}
          <View style={{ height: HERO_HEIGHT, marginBottom: 20, position: 'relative' }}>
            <LinearGradient
              colors={getCategoryGradient(event?.category || 'Other', isDark) as any}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            
            <BlurView
              intensity={isDark ? 20 : 15}
              tint={isDark ? 'dark' : 'light'}
              style={[StyleSheet.absoluteFill, { opacity: 0.3 }]}
            />

            <View style={{ 
              flex: 1, 
              paddingTop: insets.top + 60, 
              paddingHorizontal: 20, 
              paddingBottom: 20,
              justifyContent: 'space-between',
            }}>
              {/* Participant Avatar & Info */}
              <View style={{ alignSelf: 'flex-start' }}>
                <View style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderWidth: 3,
                  borderColor: 'rgba(255, 255, 255, 0.4)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: getCategoryGlow(event?.category || 'Other'),
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.8,
                  shadowRadius: 16,
                  elevation: 8,
                }}>
                  <Ionicons name="person" size={40} color="#FFFFFF" />
                </View>
              </View>

              {/* Participant Name & Meta */}
              <View>
                <Text style={{
                  fontSize: 36,
                  fontFamily: getFontFamily('bold'),
                  fontWeight: '800',
                  color: '#FFFFFF',
                  letterSpacing: -1,
                  lineHeight: 42,
                  marginBottom: 12,
                  textShadowColor: 'rgba(0, 0, 0, 0.5)',
                  textShadowOffset: { width: 0, height: 2 },
                  textShadowRadius: 8,
                }} numberOfLines={1}>
                  {participant.name}
                </Text>
                
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                  {participant.division && (
                    <View style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 12,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderWidth: 1,
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    }}>
                      <Text style={{
                        fontSize: 13,
                        fontFamily: getFontFamily('semibold'),
                        color: '#FFFFFF',
                      }}>
                        {participant.division}
                      </Text>
                    </View>
                  )}
                  {participant.weight && (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Ionicons name="barbell" size={16} color="rgba(255, 255, 255, 0.9)" />
                      <Text style={{
                        fontSize: 14,
                        fontFamily: getFontFamily('medium'),
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginLeft: 6,
                        textShadowColor: 'rgba(0, 0, 0, 0.3)',
                        textShadowOffset: { width: 0, height: 1 },
                        textShadowRadius: 4,
                      }}>
                        {participant.weight} kg
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Content Section */}
          <View style={{ paddingHorizontal: 16 }}>

          {/* Name */}
          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name"
            placeholderTextColor={colors['text-secondary']}
          />

          {/* Weight */}
          <Text style={styles.label}>Weight (kg)</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            placeholder="Enter weight"
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
          />

          {/* Division */}
          <Text style={styles.label}>Division</Text>
          <TextInput
            style={styles.input}
            value={division}
            onChangeText={setDivision}
            placeholder="Enter division"
            placeholderTextColor={colors['text-secondary']}
          />

          {/* Reps */}
          <Text style={styles.label}>Reps</Text>
          <TextInput
            style={styles.input}
            value={reps}
            onChangeText={setReps}
            placeholder="Enter reps"
            placeholderTextColor={colors['text-secondary']}
            keyboardType="numeric"
          />

          {/* Time */}
          <Text style={styles.label}>Time</Text>
          <TouchableOpacity
            style={styles.input}
            onPress={() => setShowTimePicker(true)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{
                fontSize: 16,
                fontFamily: getFontFamily('regular'),
                color: time ? colors['text-primary'] : colors['text-secondary'],
              }}>
                {time || 'Tap to select time (HH:MM:SS)'}
              </Text>
              <Ionicons name="time-outline" size={20} color={colors['text-secondary']} />
            </View>
          </TouchableOpacity>
          
          <TimePicker
            visible={showTimePicker}
            time={time}
            onTimeSelect={(selectedTime) => {
              setTime(selectedTime);
            }}
            onClose={() => setShowTimePicker(false)}
            isDark={isDark}
          />

          {/* Videos */}
          <Text style={styles.label}>Videos</Text>
          <View style={styles.card}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 60 : 40}
              tint={isDark ? 'dark' : 'light'}
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.7)',
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 20,
              }}
            />
            <View style={{ position: 'relative', zIndex: 1 }}>
            {participant.videos && participant.videos.length > 0 ? (
              participant.videos.map((video, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="videocam" size={20} color={colors['bg-primary']} />
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('regular'),
                      color: colors['text-primary'],
                      marginLeft: 12,
                      flex: 1,
                    }} numberOfLines={1}>
                      {video.name || `Video ${index + 1}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteVideo(index)}>
                    <Ionicons name="trash-outline" size={20} color={colors['text-danger']} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                fontStyle: 'italic',
              }}>
                No videos added
              </Text>
            )}
            <Button
              title="Upload Video"
              onPress={handleUploadVideo}
              variant="outline"
              size="small"
              style={{ marginTop: 12 }}
            />
            </View>
          </View>

          {/* Attachments */}
          <Text style={styles.label}>Attachments</Text>
          <View style={styles.card}>
            <BlurView
              intensity={Platform.OS === 'ios' ? 60 : 40}
              tint={isDark ? 'dark' : 'light'}
              style={{
                ...StyleSheet.absoluteFillObject,
                backgroundColor: isDark 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(255, 255, 255, 0.7)',
                borderWidth: 1,
                borderColor: isDark 
                  ? 'rgba(255, 255, 255, 0.08)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 20,
              }}
            />
            <View style={{ position: 'relative', zIndex: 1 }}>
            {participant.attachments && participant.attachments.length > 0 ? (
              participant.attachments.map((attachment, index) => (
                <View key={index} style={styles.attachmentItem}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="document" size={20} color={colors['bg-primary']} />
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('regular'),
                      color: colors['text-primary'],
                      marginLeft: 12,
                      flex: 1,
                    }} numberOfLines={1}>
                      {attachment.name || `Attachment ${index + 1}`}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteAttachment(index)}>
                    <Ionicons name="trash-outline" size={20} color={colors['text-danger']} />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={{
                fontSize: 14,
                fontFamily: getFontFamily('regular'),
                color: colors['text-secondary'],
                fontStyle: 'italic',
              }}>
                No attachments
              </Text>
            )}
            <Button
              title="Upload Document"
              onPress={handleUploadDocument}
              variant="outline"
              size="small"
              style={{ marginTop: 12 }}
            />
            </View>
          </View>

          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            fullWidth
            style={{ marginTop: 24, marginBottom: 20 }}
          />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
