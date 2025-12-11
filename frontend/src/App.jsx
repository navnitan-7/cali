import { useState } from 'react';
import { Users, Calendar, Trophy, Dumbbell } from 'lucide-react';
import ParticipantsTab from './components/ParticipantsTab';
import EventsTab from './components/EventsTab';

function App() {
  const [activeTab, setActiveTab] = useState('participants');

  const tabs = [
    { id: 'participants', label: 'Participants', icon: Users },
    { id: 'events', label: 'Events', icon: Calendar },
  ];

  return (
    <div className="min-h-screen text-pearl">
      {/* Header */}
      <header className="glass-card sticky top-0 z-50 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ember to-flame flex items-center justify-center animate-pulse-glow">
                <Dumbbell className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-display text-gradient">CALI</h1>
                <p className="text-xs text-ghost">Competition Manager</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="text-sm text-ghost">Calisthenics Championships</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-gradient-to-r from-ember to-flame text-white shadow-lg shadow-ember/30'
                    : 'glass-card text-ghost hover:text-pearl hover:border-ember/30'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'participants' && <ParticipantsTab />}
        {activeTab === 'events' && <EventsTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center text-ghost text-sm">
          <p>Built for athletes, by athletes 💪</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
