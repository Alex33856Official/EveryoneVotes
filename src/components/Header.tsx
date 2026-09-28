import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, User, Sparkles } from 'lucide-react';
import { sounds } from '../services/soundService';
import { UserProfile } from '../types';

interface HeaderProps {
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenSuggest: () => void;
  isBackendLive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  onOpenProfile,
  onOpenSuggest,
  isBackendLive,
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(sounds.isMuted);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setDate(now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleSound = () => {
    const state = sounds.toggleMute();
    setIsMuted(state);
    if (!state) sounds.playSelect();
  };

  const intuitionPercent =
    profile.totalPredictionsCount > 0
      ? Math.round((profile.correctPredictions / profile.totalPredictionsCount) * 100)
      : 50;

  return (
    <header className="w-full bg-white/85 backdrop-blur-md border-b-2 border-slate-200/90 px-6 py-3 sticky top-0 z-40 shadow-sm flex items-center justify-between">
      {/* Left: Wii Channel Logo & Status */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-wii-blue to-wii-cyan flex items-center justify-center shadow-md shadow-wii-blue/30 text-white font-extrabold text-xl tracking-tighter">
          V
        </div>
        <div>
          <h1 className="font-extrabold text-lg text-slate-800 tracking-tight leading-none">
            Everyone Votes Channel
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-slate-500">{date}</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300"></span>
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full ${
                isBackendLive
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {isBackendLive ? 'Back4App Live' : 'Demo Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Middle: Wii Clock */}
      <div className="hidden md:flex flex-col items-center">
        <span className="text-2xl font-black text-slate-700 tracking-wider font-mono">
          {time}
        </span>
      </div>

      {/* Right: Actions, Sound Toggle & Profile */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            sounds.playSelect();
            onOpenSuggest();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="wii-btn px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1.5"
          title="Suggest a Question"
        >
          <Sparkles className="w-3.5 h-3.5 text-wii-blue" />
          <span className="hidden sm:inline">Suggest</span>
        </button>

        <button
          onClick={handleToggleSound}
          className="wii-btn p-2 rounded-full text-slate-600 hover:text-wii-blue"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Profile Chip */}
        <button
          onClick={() => {
            sounds.playSelect();
            onOpenProfile();
          }}
          onMouseEnter={() => sounds.playHover()}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 px-3 py-1.5 rounded-full border border-slate-300 transition-all text-left"
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-inner"
            style={{ backgroundColor: profile.color }}
          >
            <User className="w-4 h-4" />
          </div>
          <div className="hidden sm:block text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              {profile.nickname}
              {profile.isRegistered && (
                <span
                  className="w-2 h-2 rounded-full bg-emerald-500 inline-block ring-2 ring-emerald-200"
                  title="Back4App Account Active"
                />
              )}
            </div>
            <div className="text-[10px] text-slate-500">
              Intuition: <span className="font-bold text-wii-blue">{intuitionPercent}%</span>
            </div>
          </div>
        </button>
      </div>
    </header>
  );
};