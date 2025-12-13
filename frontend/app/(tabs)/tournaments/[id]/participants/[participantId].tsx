import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../../../stores/themeStore';
import { useColors } from '../../../../../utils/colors';
import { getFontFamily } from '../../../../../utils/fonts';
import { useTournamentStore } from '../../../../../stores/tournamentStore';
import Button from '../../../../../components/ui/Button';
import ConfirmDialog from '../../../../../components/ui/ConfirmDialog';
import { divisionOptions } from '../../../../../schemas/eventModal';

export default function ParticipantDetailScreen() {
  const { id: tournamentId, participantId } = useLocalSearchParams<{ id: string; participantId: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getTournament, getParticipant, updateParticipant, deleteParticipant } = useTournamentStore();
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  const participant = tournamentId && participantId ? getParticipant(tournamentId, participantId) : undefined;

  const [name, setName] = useState(participant?.name || '');
  const [weight, setWeight] = useState(participant?.weight?.toString() || '');
  const [division, setDivision] = useState(participant?.division || '');
  const [isSaving, setIsSaving] = useState(false);

  if (!tournament || !participant) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Participant not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      setIsSaving(true);
      await updateParticipant(tournamentId!, participantId!, {
      name: name.trim(),
      weight: weight ? parseFloat(weight) : undefined,
      division: division || undefined,
    });
    router.back();
    } catch (error) {
      console.error('Error updating participant:', error);
      Alert.alert('Error', 'Failed to update participant. Please try again.');
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    deleteParticipant(tournamentId!, participantId!);
    router.back();
  };

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 12,
        }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors['icon-primary']} />
          </TouchableOpacity>
          <Text style={{
            fontSize: 18,
            fontFamily: getFontFamily('bold'),
            color: colors['text-primary'],
          }}>
            Participant Details
          </Text>
          <TouchableOpacity onPress={() => setDeleteConfirmVisible(true)}>
            <Ionicons name="trash-outline" size={24} color={colors['text-danger']} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        >
          {/* Name - Required */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-secondary'],
              marginBottom: 8,
            }}>
              Name <Text style={{ color: colors['text-danger'] }}>*</Text>
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors['text-primary'],
                fontFamily: getFontFamily('regular'),
                backgroundColor: colors['bg-secondary'],
              }}
              value={name}
              onChangeText={setName}
              placeholder="Enter participant name"
              placeholderTextColor={colors['text-secondary']}
            />
          </View>

          {/* Weight */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-secondary'],
              marginBottom: 8,
            }}>
              Weight (kg)
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 10,
                color: colors['text-primary'],
                fontFamily: getFontFamily('regular'),
                backgroundColor: colors['bg-secondary'],
              }}
              value={weight}
              onChangeText={setWeight}
              placeholder="Enter weight in kg"
              placeholderTextColor={colors['text-secondary']}
              keyboardType="numeric"
            />
          </View>

          {/* Division */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-secondary'],
              marginBottom: 8,
            }}>
              Division
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {divisionOptions.map((div) => (
                <TouchableOpacity
                  key={div}
                  onPress={() => setDivision(division === div ? '' : div)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 10,
                    borderRadius: 20,
                    borderWidth: 1.5,
                    borderColor: division === div ? colors['bg-primary'] : colors['border-default'],
                    backgroundColor: division === div ? colors['bg-primary'] + '20' : colors['bg-secondary'],
                  }}
                >
                  <Text style={{
                    fontSize: 14,
                    fontFamily: getFontFamily('medium'),
                    color: division === div ? colors['bg-primary'] : colors['text-primary'],
                  }}>
                    {div}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <Button
            title="Save Changes"
            onPress={handleSave}
            variant="primary"
            fullWidth
            style={{ marginTop: 12, marginBottom: 20 }}
            disabled={!name.trim() || isSaving}
            loading={isSaving}
          />
        </ScrollView>

        <ConfirmDialog
          visible={deleteConfirmVisible}
          title="Delete Participant"
          message="Are you sure you want to delete this participant? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmVisible(false)}
        />
      </View>
    </SafeAreaView>
  );
}

