import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { sounds } from '../services/soundService';
import { dataService } from '../services/dataService';
import { Poll, QuestionSuggestion } from '../types';

interface SuggestionModalProps {
  onClose: () => void;
  defaultNickname?: string;
  onPollCreated?: (newPoll: Poll) => void;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({
  onClose,
  defaultNickname = '',
  onPollCreated,
}) => {
  const [tab, setTab] = useState<'SUGGEST' | 'VOTE_LIST'>('SUGGEST');
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [author, setAuthor] = useState(defaultNickname);
  const [submitted, setSubmitted] = useState(false);

  const [suggestions, setSuggestions] = useState<QuestionSuggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'VOTE_LIST') {
      loadSuggestions();
    }
  }, [tab]);

  const loadSuggestions = async () => {
    setLoadingSuggestions(true);
    const data = await dataService.getSuggestions();
    setSuggestions(data);
    setLoadingSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !optionA || !optionB) return;
    sounds.playVoteConfirm();
    await dataService.submitSuggestion({
      question,
      optionA,
      optionB,
      author: author || 'Anonymous Mii',
    });
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const handleVoteAccept = async (suggestion: QuestionSuggestion) => {
    if (!suggestion.id || processingId) return;
    setProcessingId(suggestion.id);
    sounds.playVoteConfirm();

    try {
      const result = await dataService.voteAcceptSuggestion(suggestion.id);
      if (result.newPoll && onPollCreated) {
        onPollCreated(result.newPoll);
      }
      setSuccessBanner(`"${suggestion.question}" accepted & launched to the Channel!`);
      // Remove from pending list
      setSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-3xl border-4 border-wii-blue/40 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-wii-blue to-wii-cyan px-6 py-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white/90" />
            <h3 className="text-lg font-black">Community Suggestion Box</h3>
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

        {/* Tab Bar */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              setTab('SUGGEST');
            }}
            className={`px-4 py-2 rounded-t-2xl font-black text-xs transition-all ${
              tab === 'SUGGEST'
                ? 'bg-white text-wii-blue border-t-2 border-x-2 border-slate-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Propose Question
          </button>
          <button
            type="button"
            onClick={() => {
              sounds.playSelect();
              setTab('VOTE_LIST');
            }}
            className={`px-4 py-2 rounded-t-2xl font-black text-xs flex items-center gap-1.5 transition-all ${
              tab === 'VOTE_LIST'
                ? 'bg-white text-wii-blue border-t-2 border-x-2 border-slate-200 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Vote on Suggestions
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {successBanner && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              {successBanner}
            </div>
          )}

          {tab === 'SUGGEST' ? (
            submitted ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">📬</div>
                <h4 className="text-lg font-bold text-slate-800">Sent to Headquarters!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Your question has been added to community suggestions for approval.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Question
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Which superpower would you pick?"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-wii-blue focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Option A
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Invisibility"
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-wii-blue focus:outline-none text-sm font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                      Option B
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Flight"
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-wii-blue focus:outline-none text-sm font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Your Nickname{' '}
                    {defaultNickname && (
                      <span className="text-wii-blue font-semibold lowercase">
                        (pre-filled from Mii)
                      </span>
                    )}
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mario"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl focus:border-wii-blue focus:outline-none text-sm font-semibold"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full wii-btn py-3 rounded-2xl text-wii-blue font-black text-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" /> Submit to Channel
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-2xl text-xs text-slate-600 leading-relaxed">
                💡 <strong>1 Community Vote</strong> approves a question and immediately publishes it
                as an active broadcast on the channel grid!
              </div>

              {loadingSuggestions ? (
                <div className="py-8 text-center text-slate-400 font-bold text-xs">
                  Loading suggestions...
                </div>
              ) : suggestions.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <div className="text-3xl mb-2">📋</div>
                  <p className="text-xs font-bold text-slate-600">No Pending Suggestions</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Be the first to submit a question in the "Propose Question" tab!
                  </p>
                </div>
              ) : (
                suggestions.map((s) => (
                  <div
                    key={s.id}
                    className="p-4 rounded-2xl border-2 border-slate-200 bg-white hover:border-wii-blue/60 transition-all flex flex-col justify-between gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-semibold mb-1">
                        <span>Proposed by {s.author}</span>
                        <span>{s.createdAt}</span>
                      </div>
                      <h4 className="text-sm font-black text-slate-800 leading-snug">
                        {s.question}
                      </h4>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-slate-700">
                          {s.optionA}
                        </div>
                        <div className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl p-2 text-center text-slate-700">
                          {s.optionB}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleVoteAccept(s)}
                        disabled={Boolean(processingId)}
                        className="wii-btn px-4 py-2 rounded-xl text-xs font-black text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        {processingId === s.id ? 'Publishing...' : 'Vote to Accept (Publish)'}
                      </button>
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