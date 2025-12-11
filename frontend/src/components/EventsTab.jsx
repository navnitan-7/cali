    import { useState, useEffect } from 'react';
import {
  Calendar, Plus, Search, Users, Clock, Dumbbell,
  ChevronRight, X, ArrowLeft, Activity, Edit3,
  CheckCircle, XCircle, Loader2, Timer, Weight, Save, Zap
} from 'lucide-react';
import { eventsApi, participantsApi, activityApi } from '../api';

const ACTIVITY_TYPES = ['PULL_UP', 'DIPS', 'SQUAT', 'MUSCLE_UP', 'PUSH_UP'];

const TYPE_COLORS = {
  'ENDURANCE': 'from-azure to-violet',
  'STREET_LIFTING': 'from-ember to-flame',
  'MAX_HOLDS': 'from-mint to-azure',
  'MAX_REPS': 'from-gold to-flame'
};

const TYPE_ICONS = {
  'ENDURANCE': Timer,
  'STREET_LIFTING': Weight,
  'MAX_HOLDS': Clock,
  'MAX_REPS': Zap
};

export default function EventsTab() {
  const [events, setEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventsRes, participantsRes, eventTypesRes] = await Promise.all([
        eventsApi.getAll(),
        participantsApi.getAll(),
        eventsApi.getEventTypes()
      ]);
      setEvents(eventsRes.data);
      setParticipants(participantsRes.data);
      console.log('=== EVENT TYPES FROM API ===');
      console.log('Raw response:', eventTypesRes);
      console.log('Event types data:', eventTypesRes.data);
      console.log('Event types structure:', JSON.stringify(eventTypesRes.data, null, 2));
      setEventTypes(eventTypesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(e =>
    e.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.type?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-ember animate-spin" />
      </div>
    );
  }

  if (selectedEvent) {
    return (
      <EventDetail
        event={selectedEvent}
        participants={participants}
        onBack={() => setSelectedEvent(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold font-display text-pearl">Events</h2>
          <p className="text-ghost mt-1">{events.length} competition events</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-ember to-flame rounded-xl text-white font-medium hover-lift"
        >
          <Plus className="w-5 h-5" />
          Create Event
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ghost" />
        <input
          type="text"
          placeholder="Search events by name or type..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 glass-card rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
        />
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEvents.map((event, index) => {
          const TypeIcon = TYPE_ICONS[event.type] || Calendar;
          const colorClass = TYPE_COLORS[event.type] || 'from-azure to-violet';
          
          return (
            <div
              key={event.id}
              onClick={() => setSelectedEvent(event)}
              className={`glass-card rounded-2xl p-6 hover-lift cursor-pointer group animate-fade-in-up stagger-${(index % 5) + 1}`}
              style={{ opacity: 0 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                    <TypeIcon className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-pearl group-hover:text-ember transition-colors">
                      {event.name}
                    </h3>
                    <span className={`inline-block mt-1 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white`}>
                      {event.type}
                    </span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-ghost group-hover:text-ember group-hover:translate-x-1 transition-all" />
              </div>

              <p className="mt-4 text-ghost text-sm line-clamp-2">
                {event.description || 'No description provided'}
              </p>

              <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-sm text-ghost">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-azure" />
                  View Participants
                </span>
                <span className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-mint" />
                  Track Activity
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-slate mx-auto mb-4" />
          <p className="text-ghost text-lg">No events found</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateEventModal
          eventTypes={eventTypes}
          onClose={() => setShowCreateModal(false)}
          onCreated={() => {
            setShowCreateModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

function EventDetail({ event, participants, onBack }) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);

  const TypeIcon = TYPE_ICONS[event.type] || Calendar;
  const colorClass = TYPE_COLORS[event.type] || 'from-azure to-violet';

  const fetchParticipantActivities = async (participant) => {
    setLoadingActivities(true);
    try {
      const res = await activityApi.getMetrics(event.id, participant.id);
      setActivities(res.data || []);
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      setActivities([]);
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleSelectParticipant = async (participant) => {
    setSelectedParticipant(participant);
    await fetchParticipantActivities(participant);
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back Button */}
      <button
        onClick={selectedParticipant ? () => {
          setSelectedParticipant(null);
          setActivities([]);
        } : onBack}
        className="flex items-center gap-2 text-ghost hover:text-ember transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        {selectedParticipant ? 'Back to Participants' : 'Back to Events'}
      </button>

      {/* Event Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
            <TypeIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold font-display text-pearl">{event.name}</h2>
            <p className="text-ghost mt-1">{event.description}</p>
            <span className={`inline-block mt-2 text-xs px-3 py-1 rounded-full bg-gradient-to-r ${colorClass} text-white`}>
              {event.type}
            </span>
          </div>
        </div>
      </div>

      {selectedParticipant ? (
        /* Participant Activity View */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-azure to-violet flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-pearl">{selectedParticipant.name}</h3>
                <p className="text-sm text-ghost">Activity in this event</p>
              </div>
            </div>
            <button
              onClick={() => setShowActivityModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-mint to-azure rounded-lg text-white font-medium hover-lift"
            >
              <Plus className="w-4 h-4" />
              Add Activity
            </button>
          </div>

          {loadingActivities ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-ember animate-spin" />
            </div>
          ) : activities.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Activity className="w-12 h-12 text-slate mx-auto mb-4" />
              <p className="text-ghost">No activities recorded for this participant</p>
              <button
                onClick={() => setShowActivityModal(true)}
                className="mt-4 px-4 py-2 text-ember hover:text-flame transition-colors"
              >
                Record first activity →
              </button>
            </div>
          ) : (
            <div className="glass-card rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-ghost border-b border-white/10 bg-graphite/30">
                    <th className="text-left py-4 px-4">Attempt</th>
                    {activities[0]?.time !== undefined && <th className="text-left py-4 px-4">Time</th>}
                    {activities[0]?.weight !== undefined && <th className="text-left py-4 px-4">Weight</th>}
                    {activities[0]?.type_of_activity !== undefined && <th className="text-left py-4 px-4">Activity Type</th>}
                    {activities[0]?.is_success !== undefined && <th className="text-left py-4 px-4">Status</th>}
                    <th className="text-left py-4 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((activity, idx) => (
                    <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-4 px-4 text-pearl font-medium">#{activity.attempt_id}</td>
                      {activity.time !== undefined && (
                        <td className="py-4 px-4 text-ghost">
                          <span className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gold" />
                            {activity.time}s
                          </span>
                        </td>
                      )}
                      {activity.weight !== undefined && (
                        <td className="py-4 px-4 text-ghost">{activity.weight} kg</td>
                      )}
                      {activity.type_of_activity !== undefined && (
                        <td className="py-4 px-4">
                          <span className="px-2 py-1 rounded-full bg-violet/20 text-violet text-xs">
                            {activity.type_of_activity}
                          </span>
                        </td>
                      )}
                      {activity.is_success !== undefined && (
                        <td className="py-4 px-4">
                          {activity.is_success ? (
                            <span className="flex items-center gap-1 text-mint">
                              <CheckCircle className="w-5 h-5" />
                              Success
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-ember">
                              <XCircle className="w-5 h-5" />
                              Failed
                            </span>
                          )}
                        </td>
                      )}
                      <td className="py-4 px-4">
                        <button
                          onClick={() => {
                            setEditingActivity(activity);
                            setShowActivityModal(true);
                          }}
                          className="p-2 hover:bg-ember/20 rounded-lg text-ghost hover:text-ember transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Participants List */
        <div>
          <h3 className="text-xl font-bold font-display text-pearl mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-azure" />
            Participants
          </h3>
          
          {participants.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center">
              <Users className="w-12 h-12 text-slate mx-auto mb-4" />
              <p className="text-ghost">No participants registered</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map((participant, index) => (
                <div
                  key={participant.id}
                  onClick={() => handleSelectParticipant(participant)}
                  className={`glass-card rounded-xl p-4 hover-lift cursor-pointer group animate-fade-in-up stagger-${(index % 5) + 1}`}
                  style={{ opacity: 0 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-azure to-violet flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-pearl group-hover:text-ember transition-colors">
                          {participant.name}
                        </h4>
                        <p className="text-xs text-ghost">{participant.gender} • {participant.weight}kg</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-ghost group-hover:text-ember group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <ActivityModal
          event={event}
          participant={selectedParticipant}
          existingActivity={editingActivity}
          activities={activities}
          onClose={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
          }}
          onSaved={() => {
            setShowActivityModal(false);
            setEditingActivity(null);
            fetchParticipantActivities(selectedParticipant);
          }}
        />
      )}
    </div>
  );
}

function ActivityModal({ event, participant, existingActivity, activities, onClose, onSaved }) {
  const [formData, setFormData] = useState({
    attempt_id: existingActivity?.attempt_id || (activities.length + 1),
    weight: existingActivity?.weight || '',
    type_of_activity: existingActivity?.type_of_activity || 'PULL_UP',
    reps: existingActivity?.reps || '',
    time: existingActivity?.time || '',
    is_success: existingActivity?.is_success ?? true,
    is_deleted: existingActivity?.is_deleted ?? false
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await activityApi.add({
        event_id: event.id,
        participant_id: participant.id,
        attempt_id: parseInt(formData.attempt_id),
        weight: formData.weight ? parseFloat(formData.weight) : null,
        type_of_activity: formData.type_of_activity,
        reps: formData.reps ? parseInt(formData.reps) : null,
        time: formData.time ? parseFloat(formData.time) : null,
        is_success: formData.is_success,
        is_deleted: formData.is_deleted
      });
      onSaved();
    } catch (error) {
      console.error('Failed to save activity:', error);
      alert('Failed to save activity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl w-full max-w-md animate-fade-in-up">
        <div className="border-b border-white/10 p-5 flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-pearl">
            {existingActivity ? 'Edit Activity' : 'Add Activity'}
          </h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-ghost" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 rounded-lg bg-azure/10 border border-azure/20">
            <p className="text-sm text-azure">
              Recording for <span className="font-semibold">{participant.name}</span> in{' '}
              <span className="font-semibold">{event.name}</span>
            </p>
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Attempt #</label>
            <input
              type="number"
              required
              value={formData.attempt_id}
              onChange={(e) => setFormData(prev => ({ ...prev, attempt_id: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
              placeholder="1"
            />
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Activity Type</label>
            <select
              value={formData.type_of_activity}
              onChange={(e) => setFormData(prev => ({ ...prev, type_of_activity: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl focus:outline-none focus:ring-2 focus:ring-ember/50"
            >
              {ACTIVITY_TYPES.map(type => (
                <option key={type} value={type}>{type.replace('_', ' ')}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ghost mb-2">Time (seconds)</label>
              <input
                type="number"
                step="0.1"
                value={formData.time}
                onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
                placeholder="60.5"
              />
            </div>
            <div>
              <label className="block text-sm text-ghost mb-2">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
                placeholder="20"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Reps</label>
            <input
              type="number"
              value={formData.reps}
              onChange={(e) => setFormData(prev => ({ ...prev, reps: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
              placeholder="10"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_success}
                onChange={(e) => setFormData(prev => ({ ...prev, is_success: e.target.checked }))}
                className="w-5 h-5 rounded accent-mint"
              />
              <span className="text-pearl">Successful attempt</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-ember to-flame rounded-xl text-white font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {existingActivity ? 'Update Activity' : 'Save Activity'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

function CreateEventModal({ eventTypes, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    event_type: ''
  });
  const [submitting, setSubmitting] = useState(false);

  // Set default event type when eventTypes are loaded
  useEffect(() => {
    console.log('=== EVENT TYPES IN MODAL ===');
    console.log('eventTypes:', eventTypes);
    console.log('eventTypes length:', eventTypes.length);
    console.log('formData.event_type:', formData.event_type);
    if (eventTypes.length > 0 && !formData.event_type) {
      console.log('Setting default event_type to:', eventTypes[0].id);
      setFormData(prev => ({ ...prev, event_type: eventTypes[0].id }));
    }
  }, [eventTypes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('=== FORM SUBMIT ===');
    console.log('formData:', formData);
    console.log('formData.event_type:', formData.event_type);
    console.log('typeof formData.event_type:', typeof formData.event_type);
    
    if (formData.event_type === '' || formData.event_type === null || formData.event_type === undefined) {
      alert('Please select an event type');
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        name: formData.name,
        description: formData.description || '',
        event_type: Number(formData.event_type)
      };
      console.log('=== PAYLOAD BEFORE API CALL ===');
      console.log('payload:', payload);
      console.log('payload stringified:', JSON.stringify(payload));
      console.log('payload.event_type:', payload.event_type);
      console.log('typeof payload.event_type:', typeof payload.event_type);
      
      await eventsApi.create(payload);
      onCreated();
    } catch (error) {
      console.error('=== ERROR ===');
      console.error('Full error:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      const errorMessage = error.response?.data?.detail || 'Failed to create event';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl w-full max-w-md animate-fade-in-up">
        <div className="border-b border-white/10 p-5 flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-pearl">Create Event</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-ghost" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-ghost mb-2">Event Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
              placeholder="Front Lever Hold"
            />
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50 resize-none h-24"
              placeholder="Hold position for maximum time..."
            />
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Event Type</label>
            <div className="grid grid-cols-2 gap-2">
              {eventTypes.map(eventType => {
                const typeName = eventType.name;
                const colorClass = TYPE_COLORS[typeName] || 'from-azure to-violet';
                return (
                  <button
                    key={eventType.id}
                    type="button"
                    onClick={() => {
                      console.log('=== EVENT TYPE BUTTON CLICKED ===');
                      console.log('Selected eventType:', eventType);
                      console.log('Setting event_type to:', eventType.id);
                      setFormData(prev => ({ ...prev, event_type: eventType.id }));
                    }}
                    className={`px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      String(formData.event_type) === String(eventType.id)
                        ? `bg-gradient-to-r ${colorClass} text-white shadow-lg`
                        : 'bg-graphite/50 text-ghost hover:text-pearl'
                    }`}
                  >
                    {typeName.replace('_', ' ')}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-gradient-to-r from-ember to-flame rounded-xl text-white font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Event
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

