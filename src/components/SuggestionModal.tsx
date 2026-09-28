import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import { sounds } from '../services/soundService';
import { dataService } from '../services/dataService';

interface SuggestionModalProps {
  onClose: () => void;
  defaultNickname?: string;
}

export const SuggestionModal: React.FC<SuggestionModalProps> = ({
  onClose,
  defaultNickname = '',
}) => {
  const [question, setQuestion] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [author, setAuthor] = useState(defaultNickname);
  const [submitted, setSubmitted] = useState(false);

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

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border-4 border-wii-blue/40 shadow-2xl overflow-hidden p-6 animate-in fade-in zoom-in-95">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-black text-slate-800">Suggest a Question</h3>
          <button
            onClick={() => {
              sounds.playBack();
              onClose();
            }}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="text-center py-8">
            <div className="text-3xl mb-2">📬</div>
            <h4 className="text-lg font-bold text-slate-800">Sent to Headquarters!</h4>
            <p className="text-xs text-slate-500 mt-1">
              Your question might be featured in the next worldwide broadcast.
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
                Your Nickname (Optional)
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
        )}
      </div>
    </div>
  );
};