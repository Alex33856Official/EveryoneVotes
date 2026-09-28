import React, { useState, useEffect } from 'react';
import { Poll, UserProfile } from './types';
import { dataService, isLiveBackend } from './services/dataService';
import { sounds } from './services/soundService';
import { Header } from './components/Header';
import { PollModal } from './components/PollModal';
import { SuggestionModal } from './components/SuggestionModal';
import { ProfileModal } from './components/ProfileModal';
import { CheckCircle2, ChevronRight, BarChart3, HelpCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [profile, setProfile] = useState<UserProfile>(dataService.getProfile());
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'VOTING' | 'CLOSED'>('ALL');
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    dataService.getPolls().then(setPolls);
  }, []);

  const handleVoteSubmit = async (pollId: string, choice: 'A' | 'B', prediction: 'A' | 'B') => {
    const updated = await dataService.castVote(pollId, choice, prediction);
    setPolls((prev) => prev.map((p) => (p.id === pollId ? updated : p)));
    setProfile(dataService.getProfile());
    setSelectedPoll(updated);
  };

  const filteredPolls = polls.filter((p) => {
    if (filter === 'VOTING') return p.status === 'voting';
    if (filter === 'CLOSED') return p.status === 'closed';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* Top Header */}
      <Header
        profile={profile}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenSuggest={() => setIsSuggestOpen(true)}
        isBackendLive={isLiveBackend}
      />

      {/* Main Channel Area */}
      <main className="max-w-6xl mx-auto w-full px-6 py-8 flex-1">
        {/* Banner Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">
              Active Broadcasts
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Cast your vote and test your intuition against the world!
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex bg-slate-200/80 p-1 rounded-full border border-slate-300">
            {(['ALL', 'VOTING', 'CLOSED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  sounds.playSelect();
                  setFilter(tab);
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                  filter === tab
                    ? 'bg-white text-wii-blue shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All Polls' : tab === 'VOTING' ? 'Open' : 'Results'}
              </button>
            ))}
          </div>
        </div>

        {/* Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPolls.map((poll) => {
            const hasVoted = Boolean(poll.userVote);
            return (
              <div
                key={poll.id}
                onClick={() => {
                  sounds.playSelect();
                  setSelectedPoll(poll);
                }}
                onMouseEnter={() => sounds.playHover()}
                className="wii-tile rounded-3xl p-6 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Channel Top Badge */}
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    {poll.category}
                  </span>
                  <div className="flex items-center gap-2">
                    {hasVoted && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Voted
                      </span>
                    )}
                    <span className="text-xs font-semibold text-slate-400">{poll.expiresAt}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-black text-slate-800 group-hover:text-wii-blue transition-colors mb-6 leading-snug">
                  {poll.title}
                </h3>

                {/* Choice Preview Cards */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-slate-100/90 rounded-2xl p-3 text-center border border-slate-200 font-extrabold text-sm text-slate-700">
                    {poll.optionA.text}
                  </div>
                  <div className="bg-slate-100/90 rounded-2xl p-3 text-center border border-slate-200 font-extrabold text-sm text-slate-700">
                    {poll.optionB.text}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="flex justify-between items-center pt-2 border-t border-slate-200/60 text-xs font-bold text-slate-500">
                  <span>{poll.totalVotes.toLocaleString()} votes cast</span>
                  <span className="text-wii-blue flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    {hasVoted ? 'View Results' : 'Vote Now'}{' '}
                    <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Wii Bottom Navigation Bar */}
      <footer className="w-full bg-white/70 border-t-2 border-slate-200/80 py-4 px-6 mt-8 flex justify-center items-center gap-6">
        <button
          onClick={() => {
            sounds.playSelect();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="wii-btn px-8 py-2.5 rounded-full font-black text-xs text-slate-700 uppercase tracking-wider"
        >
          Wii Menu
        </button>
      </footer>

      {/* Modals */}
      {selectedPoll && (
        <PollModal
          poll={selectedPoll}
          onClose={() => setSelectedPoll(null)}
          onVoteSubmit={handleVoteSubmit}
        />
      )}

      {isSuggestOpen && <SuggestionModal onClose={() => setIsSuggestOpen(false)} />}

      {isProfileOpen && (
        <ProfileModal
          profile={profile}
          onClose={() => setIsProfileOpen(false)}
          onProfileUpdated={(updated) => setProfile(updated)}
        />
      )}
    </div>
  );
};