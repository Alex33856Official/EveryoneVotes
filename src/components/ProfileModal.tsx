import React, { useState, useEffect } from 'react';
import { UserProfile, UserVoteRecord } from '../types';
import { dataService } from '../services/dataService';
import { sounds } from '../services/soundService';
import {
  X,
  User,
  History,
  Trophy,
  CheckCircle2,
  AlertCircle,
  LogIn,
  UserPlus,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface ProfileModalProps {
  profile: UserProfile;
  onClose: () => void;
  onProfileUpdated: (updated: UserProfile) => void;
}

const COLOR_OPTIONS = [
  { name: 'Wii Blue', value: '#1ea4ec' },
  { name: 'Sky Cyan', value: '#0ea5e9' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber Gold', value: '#f59e0b' },
  { name: 'Coral Rose', value: '#f43f5e' },
  { name: 'Wii Purple', value: '#8b5cf6' },
];

export const ProfileModal: React.FC<ProfileModalProps> = ({
  profile,
  onClose,
  onProfileUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'HISTORY'>('PROFILE');
  const [votes, setVotes] = useState<UserVoteRecord[]>([]);
  const [loadingVotes, setLoadingVotes] = useState(false);

  // Auth Form State
  const [isSignUp, setIsSignUp] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState(profile.nickname);
  const [selectedColor, setSelectedColor] = useState(profile.color);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeTab === 'HISTORY') {
      setLoadingVotes(true);
      dataService.getUserVotes().then((data) => {
        setVotes(data);
        setLoadingVotes(false);
      });
    }
  }, [activeTab]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsSubmitting(true);
    sounds.playSelect();

    try {
      let updated: UserProfile;
      if (isSignUp) {
        updated = await dataService.signUp(username, password, nickname, selectedColor);
      } else {
        updated = await dataService.logIn(username, password);
      }
      sounds.playVoteConfirm();
      onProfileUpdated(updated);
    } catch (err: unknown) {
      sounds.playBack();
      const message = err instanceof Error ? err.message : 'Authentication failed';
      setAuthError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogOut = async () => {
    sounds.playBack();
    const guest = await dataService.logOut();
    onProfileUpdated(guest);
  };

  const intuitionPercent =
    profile.totalPredictionsCount > 0
      ? Math.round((profile.correctPredictions / profile.totalPredictionsCount) * 100)
      : 50;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-4 border-wii-blue/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-wii-blue to-wii-cyan px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center text-white border-2 border-white/60 shadow-md font-bold"
              style={{ backgroundColor: profile.color }}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black leading-tight">{profile.nickname}'s Mii Room</h3>
              <p className="text-xs text-white/80">
                {profile.isRegistered
                  ? `Connected as @${profile.username}`
                  : 'Playing as Guest (Local)'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sounds.playBack();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-black/15 hover:bg-black/25 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50/80 px-6 pt-3 gap-2">
          <button
            onClick={() => {
              sounds.playSelect();
              setActiveTab('PROFILE');
            }}
            className={`px-5 py-2.5 rounded-t-2xl font-black text-xs flex items-center gap-2 transition-all ${
              activeTab === 'PROFILE'
                ? 'bg-white text-wii-blue border-t-2 border-x-2 border-slate-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" /> Profile & Account
          </button>

          <button
            onClick={() => {
              sounds.playSelect();
              setActiveTab('HISTORY');
            }}
            className={`px-5 py-2.5 rounded-t-2xl font-black text-xs flex items-center gap-2 transition-all ${
              activeTab === 'HISTORY'
                ? 'bg-white text-wii-blue border-t-2 border-x-2 border-slate-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-4 h-4" /> Past Votes & Predictions
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'PROFILE' && (
            <div className="space-y-6">
              {/* Intuition Stats Box */}
              <div className="bg-gradient-to-br from-slate-50 to-blue-50/40 p-5 rounded-2xl border-2 border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl font-black shadow-inner"
                    style={{ backgroundColor: profile.color }}
                  >
                    {profile.nickname.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-800">{profile.nickname}</h4>
                    <p className="text-xs text-slate-500 font-semibold">
                      Predictions:{' '}
                      <span className="font-bold text-slate-700">
                        {profile.correctPredictions} / {profile.totalPredictionsCount} Correct
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-white px-5 py-2.5 rounded-2xl border border-slate-200 text-center shadow-sm">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Intuition Score
                  </div>
                  <div className="text-2xl font-black text-wii-blue flex items-center justify-center gap-1">
                    <Trophy className="w-5 h-5 text-amber-500" /> {intuitionPercent}%
                  </div>
                </div>
              </div>

              {/* Account Section */}
              {profile.isRegistered ? (
                <div className="bg-emerald-50/80 border-2 border-emerald-200 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-black text-sm">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      Back4App Account Synchronized
                    </div>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      @{profile.username}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-700 leading-relaxed mb-4">
                    Your votes, intuition accuracy, and poll predictions are saved to your Back4App
                    database and sync across any device you log into.
                  </p>
                  <button
                    onClick={handleLogOut}
                    className="wii-btn px-4 py-2 rounded-xl text-xs font-bold text-rose-600 border-rose-200 hover:border-rose-400 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Log Out (Switch to Guest)
                  </button>
                </div>
              ) : (
                <div className="bg-white border-2 border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-wii-blue" />
                        {isSignUp ? 'Create Back4App Mii Account' : 'Sign in to Back4App'}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Save your intuition score and vote history to the cloud.
                      </p>
                    </div>
                    <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playSelect();
                          setIsSignUp(true);
                          setAuthError(null);
                        }}
                        className={`px-3 py-1 rounded-full transition-all ${
                          isSignUp ? 'bg-white text-wii-blue shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Sign Up
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          sounds.playSelect();
                          setIsSignUp(false);
                          setAuthError(null);
                        }}
                        className={`px-3 py-1 rounded-full transition-all ${
                          !isSignUp ? 'bg-white text-wii-blue shadow-sm' : 'text-slate-500'
                        }`}
                      >
                        Log In
                      </button>
                    </div>
                  </div>

                  {authError && (
                    <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      {authError}
                    </div>
                  )}

                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g. nintendo_fan"
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-wii-blue focus:outline-none text-sm font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                        Password
                      </label>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-wii-blue focus:outline-none text-sm font-semibold"
                      />
                    </div>

                    {isSignUp && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                            Mii Nickname
                          </label>
                          <input
                            type="text"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            placeholder="Player 1"
                            className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-wii-blue focus:outline-none text-sm font-semibold"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                            Favorite Mii Color
                          </label>
                          <div className="flex gap-2 pt-1">
                            {COLOR_OPTIONS.map((col) => (
                              <button
                                key={col.value}
                                type="button"
                                onClick={() => setSelectedColor(col.value)}
                                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                                  selectedColor === col.value
                                    ? 'scale-110 border-slate-800 shadow-md'
                                    : 'border-white hover:scale-105'
                                }`}
                                style={{ backgroundColor: col.value }}
                                title={col.name}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full wii-btn py-3 rounded-2xl text-wii-blue font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                    >
                      {isSubmitting ? (
                        'Connecting to Back4App...'
                      ) : isSignUp ? (
                        <>
                          <UserPlus className="w-4 h-4" /> Create Account & Sync
                        </>
                      ) : (
                        <>
                          <LogIn className="w-4 h-4" /> Log In
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="space-y-4">
              {loadingVotes ? (
                <div className="py-12 text-center text-slate-400 font-bold text-sm">
                  Loading your broadcast votes...
                </div>
              ) : votes.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="text-4xl mb-3">🗳️</div>
                  <h4 className="text-base font-bold text-slate-700">No Votes Cast Yet</h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Select any active channel on the broadcast grid, cast your vote, and test your
                    intuition!
                  </p>
                </div>
              ) : (
                votes.map((v) => (
                  <div
                    key={v.id}
                    className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-wii-blue/60 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {v.category || 'Poll'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-semibold">{v.date}</span>
                      </div>
                      <h5 className="font-extrabold text-sm text-slate-800">{v.pollTitle}</h5>
                      <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                        <span>
                          Voted:{' '}
                          <strong className="text-slate-700">{v.selectedOptionText}</strong>
                        </span>
                        <span>
                          Predicted Majority:{' '}
                          <strong className="text-purple-700">{v.predictedOptionText}</strong>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      {v.isPredictionCorrect ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Intuition
                          Correct
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-full flex items-center gap-1.5 whitespace-nowrap">
                          <Trophy className="w-3.5 h-3.5 text-slate-400" /> Public Upset
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};