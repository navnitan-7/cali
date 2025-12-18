import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Modal, Pressable, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useTheme } from '../../../../../stores/themeStore';
import { useColors } from '../../../../../utils/colors';
import { getFontFamily } from '../../../../../utils/fonts';
import { useTournamentStore } from '../../../../../stores/tournamentStore';
import { eventService } from '../../../../../services';
import { divisionOptions } from '../../../../../schemas/eventModal';
import Button from '../../../../../components/ui/Button';
import ConfirmDialog from '../../../../../components/ui/ConfirmDialog';
import Toast from '../../../../../components/ui/Toast';

export default function ParticipantDetailScreen() {
  const { id: tournamentId, participantId } = useLocalSearchParams<{ id: string; participantId: string }>();
  const theme = useTheme();
  const isDark = theme === 'dark';
  const colors = useColors(isDark);
  const insets = useSafeAreaInsets();
  const { getTournament, getParticipant, updateParticipant, deleteParticipant } = useTournamentStore();
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const tournament = tournamentId ? getTournament(tournamentId) : undefined;
  const participant = tournamentId && participantId ? getParticipant(tournamentId, participantId) : undefined;

  const [name, setName] = useState(participant?.name || '');
  const [age, setAge] = useState(participant?.age?.toString() || '');
  const [gender, setGender] = useState(participant?.gender || participant?.division || '');
  const [weight, setWeight] = useState(participant?.weight?.toString() || '');
  const [phone, setPhone] = useState(participant?.phone || '');
  const [country, setCountry] = useState(participant?.country || '');
  const [state, setState] = useState(participant?.state || '');
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);

  // Fetch current participant events on mount
  useEffect(() => {
    const fetchParticipantEvents = async () => {
      if (!participantId) return;
      
      try {
        setIsLoadingEvents(true);
        const events = await eventService.getEventsByParticipant(parseInt(participantId));
        const eventIds = events.map(e => e.id.toString());
        setSelectedEvents(eventIds);
      } catch (error) {
        console.error('Error fetching participant events:', error);
      } finally {
        setIsLoadingEvents(false);
      }
    };

    if (participant) {
      fetchParticipantEvents();
    }
  }, [participantId, participant]);

  // Reset form when entering edit mode
  useEffect(() => {
    if (isEditMode && participant) {
      setName(participant.name || '');
      setAge(participant.age?.toString() || '');
      setGender(participant.gender || participant.division || '');
      setWeight(participant.weight?.toString() || '');
      setPhone(participant.phone || '');
      setCountry(participant.country || '');
      setState(participant.state || '');
      // Fetch events again when entering edit mode
      const fetchParticipantEvents = async () => {
        if (!participantId) return;
        try {
          setIsLoadingEvents(true);
          const events = await eventService.getEventsByParticipant(parseInt(participantId));
          const eventIds = events.map(e => e.id.toString());
          setSelectedEvents(eventIds);
        } catch (error) {
          console.error('Error fetching participant events:', error);
        } finally {
          setIsLoadingEvents(false);
        }
      };
      fetchParticipantEvents();
    }
  }, [isEditMode, participant, participantId]);

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

    if (selectedEvents.length === 0) {
      Alert.alert('Error', 'Please select at least one event');
      return;
    }

    try {
      setIsSaving(true);
      await updateParticipant(tournamentId!, participantId!, {
        name: name.trim(),
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        weight: weight ? parseFloat(weight) : undefined,
        phone: phone.trim() || undefined,
        country: country.trim() || undefined,
        state: state.trim() || undefined,
        eventIds: selectedEvents,
      });
      setIsEditMode(false);
      setIsSaving(false);
    } catch (error) {
      console.error('Error updating participant:', error);
      Alert.alert('Error', 'Failed to update participant. Please try again.');
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setName(participant.name || '');
    setAge(participant.age?.toString() || '');
    setGender(participant.gender || participant.division || '');
    setWeight(participant.weight?.toString() || '');
    setPhone(participant.phone || '');
    setCountry(participant.country || '');
    setState(participant.state || '');
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteParticipant(tournamentId!, participantId!);
      setDeleteConfirmVisible(false);
      router.back();
    } catch (error: any) {
      console.error('Error deleting participant:', error);
      setDeleteConfirmVisible(false);
      // Extract error message from backend response
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to delete participant. Please try again.';
      setToastMessage(errorMessage);
      setToastVisible(true);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEdit = () => {
    setMenuVisible(false);
    setIsEditMode(true);
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
          {!isEditMode ? (
            <TouchableOpacity onPress={() => setMenuVisible(true)}>
              <Ionicons name="ellipsis-horizontal" size={24} color={colors['icon-primary']} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleCancel}>
              <Text style={{
                fontSize: 16,
                fontFamily: getFontFamily('medium'),
                color: colors['text-primary'],
              }}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: insets.bottom + 100 }}
        >
          {isEditMode ? (
            <>
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

              {/* Age */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Age
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
                  value={age}
                  onChangeText={setAge}
                  placeholder="Enter age"
                  placeholderTextColor={colors['text-secondary']}
                  keyboardType="numeric"
                />
              </View>

              {/* Gender */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Gender
                </Text>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {divisionOptions.map((div) => {
                    const isSelected = gender === div;
                    return (
                      <TouchableOpacity
                        key={div}
                        onPress={() => setGender(isSelected ? '' : div)}
                        style={{
                          paddingHorizontal: 16,
                          paddingVertical: 10,
                          borderRadius: 20,
                          borderWidth: 1.5,
                          borderColor: isSelected ? colors['bg-primary'] : colors['border-default'],
                          backgroundColor: isSelected ? colors['bg-primary'] + '20' : colors['bg-secondary'],
                        }}
                      >
                        <Text style={{
                          fontSize: 14,
                          fontFamily: getFontFamily('medium'),
                          color: isSelected ? colors['bg-primary'] : colors['text-primary'],
                        }}>
                          {div}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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

              {/* Phone */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Phone
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
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor={colors['text-secondary']}
                  keyboardType="phone-pad"
                />
              </View>

              {/* Country */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Country
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
                  value={country}
                  onChangeText={setCountry}
                  placeholder="Enter country"
                  placeholderTextColor={colors['text-secondary']}
                />
              </View>

              {/* State */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  State
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
                  value={state}
                  onChangeText={setState}
                  placeholder="Enter state"
                  placeholderTextColor={colors['text-secondary']}
                />
              </View>

              {/* Events - Required */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Events <Text style={{ color: colors['text-danger'] }}>*</Text>
                </Text>
                {isLoadingEvents ? (
                  <View style={{
                    padding: 16,
                    borderRadius: 10,
                    backgroundColor: colors['bg-card'],
                    borderWidth: 1.5,
                    borderColor: colors['border-default'],
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('regular'),
                      color: colors['text-secondary'],
                      fontStyle: 'italic',
                    }}>
                      Loading events...
                    </Text>
                  </View>
                ) : tournament.events.length === 0 ? (
                  <View style={{
                    padding: 16,
                    borderRadius: 10,
                    backgroundColor: colors['bg-card'],
                    borderWidth: 1.5,
                    borderColor: colors['border-default'],
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('regular'),
                      color: colors['text-secondary'],
                      fontStyle: 'italic',
                    }}>
                      No events available. Please create events first.
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {tournament.events.map((event) => {
                      const isSelected = selectedEvents.includes(event.id);
                      return (
                        <TouchableOpacity
                          key={event.id}
                          onPress={() => {
                            if (isSelected) {
                              setSelectedEvents(selectedEvents.filter(id => id !== event.id));
                            } else {
                              setSelectedEvents([...selectedEvents, event.id]);
                            }
                          }}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: isSelected ? colors['bg-primary'] : colors['border-default'],
                            backgroundColor: isSelected ? colors['bg-primary'] + '20' : colors['bg-secondary'],
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            fontFamily: getFontFamily('medium'),
                            color: isSelected ? colors['bg-primary'] : colors['text-primary'],
                          }}>
                            {event.name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>

              <Button
                title="Save Changes"
                onPress={handleSave}
                variant="primary"
                fullWidth
                style={{ marginTop: 12, marginBottom: 20 }}
                disabled={!name.trim() || selectedEvents.length === 0 || isSaving}
                loading={isSaving}
              />
            </>
          ) : (
            <>
              {/* Name - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Name
                </Text>
                <View style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors['bg-secondary'],
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-primary'],
                  }}>
                    {participant.name}
                  </Text>
                </View>
              </View>

              {/* Age - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Age
                </Text>
                <View style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors['bg-secondary'],
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-primary'],
                  }}>
                    {participant.age ? `${participant.age} years` : 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Gender - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Gender
                </Text>
                <View style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors['bg-secondary'],
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-primary'],
                  }}>
                    {participant.gender || participant.division || 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Weight - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Weight (kg)
                </Text>
                <View style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors['bg-secondary'],
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-primary'],
                  }}>
                    {participant.weight ? `${participant.weight} kg` : 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Phone - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Phone
                </Text>
                <View style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors['bg-secondary'],
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-primary'],
                  }}>
                    {participant.phone || 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Country - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Country
                </Text>
                <View style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors['bg-secondary'],
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-primary'],
                  }}>
                    {participant.country || 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* State - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  State
                </Text>
                <View style={{
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  backgroundColor: colors['bg-secondary'],
                }}>
                  <Text style={{
                    fontSize: 16,
                    fontFamily: getFontFamily('regular'),
                    color: colors['text-primary'],
                  }}>
                    {participant.state || 'Not specified'}
                  </Text>
                </View>
              </View>

              {/* Events - Read Only */}
              <View style={{ marginBottom: 24 }}>
                <Text style={{
                  fontSize: 14,
                  fontFamily: getFontFamily('medium'),
                  color: colors['text-secondary'],
                  marginBottom: 8,
                }}>
                  Events
                </Text>
                {isLoadingEvents ? (
                  <View style={{
                    padding: 16,
                    borderRadius: 10,
                    backgroundColor: colors['bg-card'],
                    borderWidth: 1.5,
                    borderColor: colors['border-default'],
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('regular'),
                      color: colors['text-secondary'],
                      fontStyle: 'italic',
                    }}>
                      Loading events...
                    </Text>
                  </View>
                ) : selectedEvents.length === 0 ? (
                  <View style={{
                    padding: 16,
                    borderRadius: 10,
                    backgroundColor: colors['bg-card'],
                    borderWidth: 1.5,
                    borderColor: colors['border-default'],
                  }}>
                    <Text style={{
                      fontSize: 14,
                      fontFamily: getFontFamily('regular'),
                      color: colors['text-secondary'],
                      fontStyle: 'italic',
                    }}>
                      No events assigned
                    </Text>
                  </View>
                ) : (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                    {tournament.events
                      .filter(event => selectedEvents.includes(event.id))
                      .map((event) => (
                        <View
                          key={event.id}
                          style={{
                            paddingHorizontal: 16,
                            paddingVertical: 10,
                            borderRadius: 20,
                            borderWidth: 1.5,
                            borderColor: colors['border-default'],
                            backgroundColor: colors['bg-secondary'],
                          }}
                        >
                          <Text style={{
                            fontSize: 14,
                            fontFamily: getFontFamily('medium'),
                            color: colors['text-primary'],
                          }}>
                            {event.name}
                          </Text>
                        </View>
                      ))}
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

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
              justifyContent: 'flex-end',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            }}
            onPress={() => setMenuVisible(false)}
          >
            <Pressable
              style={{
                backgroundColor: colors['bg-card'],
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                paddingTop: 8,
                paddingBottom: insets.bottom + 8,
              }}
              onPress={(e) => e.stopPropagation()}
            >
              <TouchableOpacity
                onPress={handleEdit}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Ionicons name="create-outline" size={20} color={colors['text-primary']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('regular'),
                  color: colors['text-primary'],
                  marginLeft: 12,
                }}>
                  Edit Participant
                </Text>
              </TouchableOpacity>
              <View style={{
                height: 1,
                backgroundColor: colors['border-default'],
                marginHorizontal: 16,
                marginVertical: 4,
              }} />
              <TouchableOpacity
                onPress={() => {
                  setMenuVisible(false);
                  setDeleteConfirmVisible(true);
                }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                }}
              >
                <Ionicons name="trash-outline" size={20} color={colors['text-danger']} />
                <Text style={{
                  fontSize: 16,
                  fontFamily: getFontFamily('regular'),
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
          onConfirm={handleDelete}
          onCancel={() => setDeleteConfirmVisible(false)}
          loading={isDeleting}
        />

        <Toast
          visible={toastVisible}
          message={toastMessage}
          onHide={() => setToastVisible(false)}
          isDark={isDark}
          variant="error"
          duration={4000}
        />
      </View>
    </SafeAreaView>
  );
}
