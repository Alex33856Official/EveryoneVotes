import React, { useState } from 'react';
import { Poll } from '../types';
import { sounds } from '../services/soundService';
import { CheckCircle2, ChevronRight, X, ArrowLeft, Trophy } from 'lucide-react';

interface PollModalProps {
  poll: Poll;
  onClose: () => void;
  onVoteSubmit: (pollId: string, vote: 'A' | 'B', prediction: 'A' | 'B') => Promise<void>;
}

export const PollModal: React.FC<PollModalProps> = ({ poll, onClose, onVoteSubmit }) => {
  const isAlreadyVoted = Boolean(poll.userVote && poll.userPrediction);
  const [step, setStep] = useState<'VOTE' | 'PREDICT' | 'RESULTS'>(
    isAlreadyVoted ? 'RESULTS' : 'VOTE'
  );
  const [selectedVote, setSelectedVote] = useState<'A' | 'B' | null>(poll.userVote || null);
  const [selectedPrediction, setSelectedPrediction] = useState<'A' | 'B' | null>(
    poll.userPrediction || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalVotes = Math.max(poll.totalVotes, 1);
  const percentA = Math.round((poll.optionA.votes / totalVotes) * 100);
  const percentB = 100 - percentA;

  const totalPredictions = Math.max(poll.optionA.predictions + poll.optionB.predictions, 1);
  const predPercentA = Math.round((poll.optionA.predictions / totalPredictions) * 100);
  const predPercentB = 100 - predPercentA;

  const handleNextToPredict = () => {
    if (!selectedVote) return;
    sounds.playSelect();
    setStep('PREDICT');
  };

  const handleFinish = async () => {
    if (!selectedVote || !selectedPrediction) return;
    setIsSubmitting(true);
    sounds.playVoteConfirm();
    await onVoteSubmit(poll.id, selectedVote, selectedPrediction);
    setIsSubmitting(false);
    setStep('RESULTS');
  };

  const userPredictionCorrect =
    (selectedPrediction === 'A' && percentA >= percentB) ||
    (selectedPrediction === 'B' && percentB >= percentA);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl border-4 border-wii-blue/40 shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* Header Bar */}
        <div className="bg-gradient-to-r from-wii-blue to-wii-cyan px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="bg-white/20 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {poll.category} Poll
            </span>
            <span className="text-white/80 text-xs">{poll.expiresAt}</span>
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

        {/* Content Body */}
        <div className="p-6 md:p-8 flex-1 flex flex-col">
          <h2 className="text-2xl font-black text-slate-800 text-center mb-6 leading-tight">
            {poll.title}
          </h2>

          {/* STEP 1: CAST YOUR VOTE */}
          {step === 'VOTE' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-center mb-6">
                <span className="inline-block bg-sky-100 text-wii-blue font-extrabold text-sm px-4 py-1 rounded-full">
                  Step 1: Choose Your Vote
                </span>
                <p className="text-sm text-slate-500 mt-2">Which option do you personally prefer?</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Option A */}
                <button
                  onClick={() => {
                    sounds.playSelect();
                    setSelectedVote('A');
                  }}
                  onMouseEnter={() => sounds.playHover()}
                  className={`p-6 rounded-2xl border-4 transition-all text-center flex flex-col items-center justify-center min-h-[140px] ${
                    selectedVote === 'A'
                      ? 'border-wii-blue bg-blue-50/70 shadow-wii-glow scale-[1.02]'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl font-black text-slate-800 mb-1">{poll.optionA.text}</span>
                  {selectedVote === 'A' && (
                    <span className="text-xs font-bold text-wii-blue flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-4 h-4" /> Selected
                    </span>
                  )}
                </button>

                {/* Option B */}
                <button
                  onClick={() => {
                    sounds.playSelect();
                    setSelectedVote('B');
                  }}
                  onMouseEnter={() => sounds.playHover()}
                  className={`p-6 rounded-2xl border-4 transition-all text-center flex flex-col items-center justify-center min-h-[140px] ${
                    selectedVote === 'B'
                      ? 'border-amber-400 bg-amber-50/70 shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl font-black text-slate-800 mb-1">{poll.optionB.text}</span>
                  {selectedVote === 'B' && (
                    <span className="text-xs font-bold text-amber-600 flex items-center gap-1 mt-2">
                      <CheckCircle2 className="w-4 h-4" /> Selected
                    </span>
                  )}
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  disabled={!selectedVote}
                  onClick={handleNextToPredict}
                  onMouseEnter={() => selectedVote && sounds.playHover()}
                  className="wii-btn px-6 py-3 rounded-full text-slate-800 font-extrabold text-sm flex items-center gap-2 disabled:opacity-40 disabled:hover:scale-100"
                >
                  Next: Predict Majority <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PREDICT PUBLIC MAJORITY */}
          {step === 'PREDICT' && (
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-center mb-6">
                <span className="inline-block bg-purple-100 text-purple-700 font-extrabold text-sm px-4 py-1 rounded-full">
                  Step 2: Predict the Majority
                </span>
                <p className="text-sm text-slate-500 mt-2">
                  Which choice do you think the <strong>rest of the world</strong> picked?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                {/* Predict A */}
                <button
                  onClick={() => {
                    sounds.playSelect();
                    setSelectedPrediction('A');
                  }}
                  onMouseEnter={() => sounds.playHover()}
                  className={`p-6 rounded-2xl border-4 transition-all text-center flex flex-col items-center justify-center min-h-[140px] ${
                    selectedPrediction === 'A'
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl font-black text-slate-800 mb-1">{poll.optionA.text}</span>
                  <span className="text-xs text-slate-500">I predict Option A will win</span>
                </button>

                {/* Predict B */}
                <button
                  onClick={() => {
                    sounds.playSelect();
                    setSelectedPrediction('B');
                  }}
                  onMouseEnter={() => sounds.playHover()}
                  className={`p-6 rounded-2xl border-4 transition-all text-center flex flex-col items-center justify-center min-h-[140px] ${
                    selectedPrediction === 'B'
                      ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]'
                      : 'border-slate-200 bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xl font-black text-slate-800 mb-1">{poll.optionB.text}</span>
                  <span className="text-xs text-slate-500">I predict Option B will win</span>
                </button>
              </div>

              <div className="flex justify-between items-center">
                <button
                  onClick={() => {
                    sounds.playBack();
                    setStep('VOTE');
                  }}
                  className="wii-btn px-4 py-2 rounded-full text-slate-600 font-bold text-xs flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <button
                  disabled={!selectedPrediction || isSubmitting}
                  onClick={handleFinish}
                  className="wii-btn px-6 py-3 rounded-full text-wii-blue border-wii-blue/60 font-black text-sm flex items-center gap-2 disabled:opacity-40"
                >
                  {isSubmitting ? 'Casting Vote...' : 'Confirm & View Results'}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS SCREEN */}
          {step === 'RESULTS' && (
            <div className="flex-1 flex flex-col justify-between">
              {/* Intuition Feedback Banner */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                      userPredictionCorrect ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  >
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-800">
                      {userPredictionCorrect ? 'Intuition Spot On!' : 'A Public Upset!'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      You voted for{' '}
                      <strong>{selectedVote === 'A' ? poll.optionA.text : poll.optionB.text}</strong>{' '}
                      and predicted{' '}
                      <strong>
                        {selectedPrediction === 'A' ? poll.optionA.text : poll.optionB.text}
                      </strong>{' '}
                      would win.
                    </p>
                  </div>
                </div>
              </div>

              {/* Real-time Vote Breakdown Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-black uppercase text-slate-500 mb-2">
                  <span className="text-wii-blue">{poll.optionA.text} ({percentA}%)</span>
                  <span className="text-amber-500">{poll.optionB.text} ({percentB}%)</span>
                </div>

                <div className="h-8 w-full bg-slate-200 rounded-full overflow-hidden flex p-1 gap-1 shadow-inner border border-slate-300">
                  <div
                    className="h-full bg-gradient-to-r from-wii-blue to-sky-400 rounded-full transition-all duration-1000 ease-out flex items-center justify-center text-white font-extrabold text-xs"
                    style={{ width: `${percentA}%` }}
                  >
                    {percentA >= 15 && `${percentA}%`}
                  </div>
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-center text-white font-extrabold text-xs"
                    style={{ width: `${percentB}%` }}
                  >
                    {percentB >= 15 && `${percentB}%`}
                  </div>
                </div>
                <div className="text-center text-xs font-semibold text-slate-400 mt-2">
                  Total Votes Cast: {poll.totalVotes.toLocaleString()}
                </div>
              </div>

              {/* Public Prediction Distribution */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 mb-6">
                <h5 className="text-xs font-black uppercase tracking-wider text-purple-700 mb-2 text-center">
                  What Everyone Predicted
                </h5>
                <div className="flex justify-around text-center text-xs font-bold text-slate-700">
                  <div>
                    <div className="text-base font-black text-purple-800">{predPercentA}%</div>
                    <div>Predicted {poll.optionA.text}</div>
                  </div>
                  <div className="w-px bg-purple-200"></div>
                  <div>
                    <div className="text-base font-black text-purple-800">{predPercentB}%</div>
                    <div>Predicted {poll.optionB.text}</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => {
                    sounds.playBack();
                    onClose();
                  }}
                  className="wii-btn px-8 py-3 rounded-full text-slate-700 font-extrabold text-sm"
                >
                  Return to Channel Grid
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
