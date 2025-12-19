import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../../stores/themeStore';
import { useColors } from '../../../utils/colors';
import { getFontFamily } from '../../../utils/fonts';
import { useTournamentStore } from '../../../stores/tournamentStore';
import DateSelector from '../../../components/ui/DateSelector';
import Button from '../../../components/ui/Button';

export default function CreateTournamentScreen() {
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { addTournament } = useTournamentStore();
  
  const [name, setName] = useState('');
  // Format today's date in local timezone to avoid timezone offset issues
  const getTodayLocal = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const [date, setDate] = useState(getTodayLocal());
  const [description, setDescription] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleCreate = () => {
    if (!name.trim()) {
      return;
    }

    const tournamentId = addTournament({
      name: name.trim(),
      date,
      description: description.trim() || undefined,
      status: new Date(date) > new Date() ? 'upcoming' : 'active',
    });

    router.replace(`/(tabs)/tournaments/${tournamentId}` as any);
  };

  const canSave = name.trim().length > 0;

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
            Create Tournament
          </Text>
          
          <Button
            title="Save"
            onPress={handleCreate}
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
                onDateSelect={(dateStr) => {
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
