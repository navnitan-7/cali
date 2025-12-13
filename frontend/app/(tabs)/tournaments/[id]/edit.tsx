import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../../stores/themeStore';
import { useColors } from '../../../../utils/colors';
import { getFontFamily } from '../../../../utils/fonts';
import { useTournamentStore } from '../../../../stores/tournamentStore';
import DateSelector from '../../../../components/ui/DateSelector';
import Button from '../../../../components/ui/Button';

export default function EditTournamentScreen() {
  const { id: tournamentId } = useLocalSearchParams<{ id: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getTournament, updateTournament } = useTournamentStore();
  
  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (tournament) {
      setName(tournament.name);
      setDate(tournament.date);
      setDescription(tournament.description || '');
    }
  }, [tournament]);

  const handleSave = () => {
    if (!tournamentId || !name.trim()) {
      return;
    }

    updateTournament(tournamentId, {
      name: name.trim(),
      date,
      description: description.trim() || undefined,
      status: new Date(date) > new Date() ? 'upcoming' : 'active',
    });

    router.back();
  };

  const canSave = name.trim().length > 0;

  if (!tournament) {
    return (
      <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors['text-primary'] }}>Tournament not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors['bg-surface'] }}>
      <View style={{ flex: 1 }}>
        {/* Top Navigation Bar with Save/Cancel */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors['border-default'],
        }}>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{
              width: 32,
              height: 32,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Ionicons name="close" size={24} color={colors['text-primary']} />
          </TouchableOpacity>
          
          <Text style={{
            fontSize: 17,
            fontFamily: getFontFamily('semibold'),
            color: colors['text-primary'],
          }}>
            Edit Tournament
          </Text>
          
          <Button
            title="Save"
            onPress={handleSave}
            variant="primary"
            size="small"
            disabled={!canSave}
            style={{ minWidth: 60 }}
          />
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: insets.bottom + 40 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-secondary'],
              marginBottom: 8,
            }}>
              Tournament Name <Text style={{ color: colors['text-danger'] }}>*</Text>
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                color: colors['text-primary'],
                fontFamily: getFontFamily('regular'),
                fontSize: 16,
                backgroundColor: colors['bg-card'],
              }}
              value={name}
              onChangeText={setName}
              placeholder="Enter tournament name"
              placeholderTextColor={colors['text-secondary']}
              autoFocus
            />
          </View>

          {/* Date */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-secondary'],
              marginBottom: 8,
            }}>
              Date <Text style={{ color: colors['text-danger'] }}>*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(true);
              }}
              style={{
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                backgroundColor: colors['bg-card'],
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Text style={{
                color: date ? colors['text-primary'] : colors['text-secondary'],
                fontFamily: getFontFamily('regular'),
                fontSize: 16,
              }}>
                {date ? new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Select date'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors['text-secondary']} />
            </TouchableOpacity>
            <DateSelector
              visible={showDatePicker}
              date={new Date(date)}
              onDateChange={(selectedDate) => {
                const dateStr = selectedDate.toISOString().split('T')[0];
                setDate(dateStr);
                setShowDatePicker(false);
              }}
              onClose={() => setShowDatePicker(false)}
            />
          </View>

          {/* Description */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{
              fontSize: 14,
              fontFamily: getFontFamily('medium'),
              color: colors['text-secondary'],
              marginBottom: 8,
            }}>
              Description
            </Text>
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: colors['border-default'],
                borderRadius: 10,
                paddingHorizontal: 12,
                paddingVertical: 12,
                color: colors['text-primary'],
                fontFamily: getFontFamily('regular'),
                fontSize: 16,
                backgroundColor: colors['bg-card'],
                minHeight: 100,
                textAlignVertical: 'top',
              }}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description (optional)"
              placeholderTextColor={colors['text-secondary']}
              multiline
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

