import { useState, useEffect } from 'react';
import { 
  Users, Plus, Search, User, Phone, MapPin, Weight, 
  Calendar, ChevronRight, X, ArrowLeft, Activity,
  CheckCircle, XCircle, Clock, Dumbbell, Loader2
} from 'lucide-react';
import { participantsApi, eventsApi, activityApi } from '../api';

const ACTIVITY_TYPES = ['PULL_UP', 'DIPS', 'SQUAT', 'MUSCLE_UP', 'PUSH_UP'];

export default function ParticipantsTab() {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [participantActivities, setParticipantActivities] = useState({});
  const [loadingActivities, setLoadingActivities] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [participantsRes, eventsRes] = await Promise.all([
        participantsApi.getAll(),
        eventsApi.getAll()
      ]);
      setParticipants(participantsRes.data);
      setEvents(eventsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParticipantActivities = async (participant) => {
    setLoadingActivities(true);
    const activities = {};
    
    for (const event of events) {
      try {
        const res = await activityApi.getMetrics(event.id, participant.id);
        if (res.data && res.data.length > 0) {
          activities[event.id] = res.data;
        }
      } catch (error) {
        console.error(`Failed to fetch activities for event ${event.id}:`, error);
      }
    }
    
    setParticipantActivities(activities);
    setLoadingActivities(false);
  };

  const handleSelectParticipant = async (participant) => {
    setSelectedParticipant(participant);
    await fetchParticipantActivities(participant);
  };

  const filteredParticipants = participants.filter(p =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.state?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getEventById = (id) => events.find(e => e.id === id);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-ember animate-spin" />
      </div>
    );
  }

  if (selectedParticipant) {
    return (
      <ParticipantDetail
        participant={selectedParticipant}
        events={events}
        activities={participantActivities}
        loadingActivities={loadingActivities}
        onBack={() => {
          setSelectedParticipant(null);
          setParticipantActivities({});
        }}
        getEventById={getEventById}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-bold font-display text-pearl">Participants</h2>
          <p className="text-ghost mt-1">{participants.length} registered athletes</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-ember to-flame rounded-xl text-white font-medium hover-lift"
        >
          <Plus className="w-5 h-5" />
          Add Participant
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ghost" />
        <input
          type="text"
          placeholder="Search by name, country, or state..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 glass-card rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
        />
      </div>

      {/* Participants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParticipants.map((participant, index) => (
          <div
            key={participant.id}
            onClick={() => handleSelectParticipant(participant)}
            className={`glass-card rounded-2xl p-5 hover-lift cursor-pointer group animate-fade-in-up stagger-${(index % 5) + 1}`}
            style={{ opacity: 0 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-azure to-violet flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-pearl group-hover:text-ember transition-colors">
                    {participant.name}
                  </h3>
                  <p className="text-sm text-ghost">{participant.gender} • {participant.age} yrs</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-ghost group-hover:text-ember group-hover:translate-x-1 transition-all" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-ghost">
                <Weight className="w-4 h-4 text-mint" />
                <span>{participant.weight} kg</span>
              </div>
              <div className="flex items-center gap-2 text-ghost">
                <Phone className="w-4 h-4 text-azure" />
                <span className="truncate">{participant.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-ghost col-span-2">
                <MapPin className="w-4 h-4 text-flame" />
                <span>{participant.state}, {participant.country}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredParticipants.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-slate mx-auto mb-4" />
          <p className="text-ghost text-lg">No participants found</p>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <CreateParticipantModal
          events={events}
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

function ParticipantDetail({ participant, events, activities, loadingActivities, onBack, getEventById }) {
  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-ghost hover:text-ember transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Participants
      </button>

      {/* Profile Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-azure to-violet flex items-center justify-center">
            <User className="w-10 h-10 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold font-display text-pearl">{participant.name}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-ghost">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ember" />
                {participant.age} years old
              </span>
              <span className="flex items-center gap-2">
                <Weight className="w-4 h-4 text-mint" />
                {participant.weight} kg
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-flame" />
                {participant.state}, {participant.country}
              </span>
              <span className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-azure" />
                {participant.phone}
              </span>
            </div>
          </div>
          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-ember/20 to-flame/20 border border-ember/30">
            <span className="text-ember font-medium">{participant.gender}</span>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <div>
        <h3 className="text-xl font-bold font-display text-pearl mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6 text-ember" />
          Activity History
        </h3>

        {loadingActivities ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-ember animate-spin" />
          </div>
        ) : Object.keys(activities).length === 0 ? (
          <div className="glass-card rounded-2xl p-8 text-center">
            <Dumbbell className="w-12 h-12 text-slate mx-auto mb-4" />
            <p className="text-ghost">No activities recorded yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.entries(activities).map(([eventId, eventActivities]) => {
              const event = getEventById(parseInt(eventId));
              return (
                <div key={eventId} className="glass-card rounded-2xl p-5">
                  <h4 className="font-semibold text-pearl mb-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-azure" />
                    {event?.name || `Event #${eventId}`}
                    <span className="text-xs px-2 py-1 rounded-full bg-azure/20 text-azure">
                      {event?.type}
                    </span>
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-ghost border-b border-white/10">
                          <th className="text-left py-2 px-3">Attempt</th>
                          {eventActivities[0]?.time !== undefined && <th className="text-left py-2 px-3">Time</th>}
                          {eventActivities[0]?.weight !== undefined && <th className="text-left py-2 px-3">Weight</th>}
                          {eventActivities[0]?.type_of_activity !== undefined && <th className="text-left py-2 px-3">Activity</th>}
                          {eventActivities[0]?.is_success !== undefined && <th className="text-left py-2 px-3">Status</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {eventActivities.map((activity, idx) => (
                          <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-3 px-3 text-pearl">#{activity.attempt_id}</td>
                            {activity.time !== undefined && (
                              <td className="py-3 px-3 text-ghost flex items-center gap-1">
                                <Clock className="w-4 h-4 text-gold" />
                                {activity.time}s
                              </td>
                            )}
                            {activity.weight !== undefined && (
                              <td className="py-3 px-3 text-ghost">{activity.weight} kg</td>
                            )}
                            {activity.type_of_activity !== undefined && (
                              <td className="py-3 px-3">
                                <span className="px-2 py-1 rounded-full bg-violet/20 text-violet text-xs">
                                  {activity.type_of_activity}
                                </span>
                              </td>
                            )}
                            {activity.is_success !== undefined && (
                              <td className="py-3 px-3">
                                {activity.is_success ? (
                                  <CheckCircle className="w-5 h-5 text-mint" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-ember" />
                                )}
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CreateParticipantModal({ events, onClose, onCreated }) {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    weight: '',
    phone: '',
    country: '',
    state: '',
    event_id: []
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await participantsApi.create({
        ...formData,
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight)
      });
      onCreated();
    } catch (error) {
      console.error('Failed to create participant:', error);
      alert('Failed to create participant');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleEvent = (eventId) => {
    setFormData(prev => ({
      ...prev,
      event_id: prev.event_id.includes(eventId)
        ? prev.event_id.filter(id => id !== eventId)
        : [...prev.event_id, eventId]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-card rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up">
        <div className="sticky top-0 glass-card border-b border-white/10 p-5 flex items-center justify-between">
          <h3 className="text-xl font-bold font-display text-pearl">Add Participant</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-ghost" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm text-ghost mb-2">Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
              placeholder="Athlete name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ghost mb-2">Age</label>
              <input
                type="number"
                required
                value={formData.age}
                onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
                placeholder="25"
              />
            </div>
            <div>
              <label className="block text-sm text-ghost mb-2">Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
                className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl focus:outline-none focus:ring-2 focus:ring-ember/50"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Weight (kg)</label>
            <input
              type="number"
              step="0.1"
              required
              value={formData.weight}
              onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
              placeholder="70.5"
            />
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
              placeholder="+1 234 567 890"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-ghost mb-2">Country</label>
              <input
                type="text"
                required
                value={formData.country}
                onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
                placeholder="India"
              />
            </div>
            <div>
              <label className="block text-sm text-ghost mb-2">State</label>
              <input
                type="text"
                required
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                className="w-full px-4 py-3 bg-graphite/50 rounded-xl text-pearl placeholder-ghost focus:outline-none focus:ring-2 focus:ring-ember/50"
                placeholder="Maharashtra"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-ghost mb-2">Events</label>
            <div className="flex flex-wrap gap-2">
              {events.map(event => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => toggleEvent(event.id)}
                  className={`px-3 py-2 rounded-lg text-sm transition-all ${
                    formData.event_id.includes(event.id)
                      ? 'bg-ember text-white'
                      : 'bg-graphite/50 text-ghost hover:text-pearl'
                  }`}
                >
                  {event.name}
                </button>
              ))}
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
                Create Participant
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

