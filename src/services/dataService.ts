import Parse from 'parse';
import { Poll, QuestionSuggestion, UserProfile } from '../types';

const APP_ID = import.meta.env.VITE_BACK4APP_APP_ID;
const JS_KEY = import.meta.env.VITE_BACK4APP_JS_KEY;

export const isLiveBackend = Boolean(APP_ID && JS_KEY);

if (isLiveBackend) {
  Parse.initialize(APP_ID, JS_KEY);
  Parse.serverURL = 'https://parseapi.back4app.com';
}

const DEFAULT_POLLS: Poll[] = [
  {
    id: 'poll-1',
    title: 'Which pet brings more joy to a home?',
    category: 'Daily',
    status: 'voting',
    expiresAt: '2 days left',
    totalVotes: 1420,
    optionA: { text: 'Dogs', votes: 840, predictions: 920 },
    optionB: { text: 'Cats', votes: 580, predictions: 500 },
  },
  {
    id: 'poll-2',
    title: 'Are you a morning person or a night owl?',
    category: 'Worldwide',
    status: 'voting',
    expiresAt: '4 days left',
    totalVotes: 3290,
    optionA: { text: 'Early Bird', votes: 1120, predictions: 980 },
    optionB: { text: 'Night Owl', votes: 2170, predictions: 2310 },
  },
  {
    id: 'poll-3',
    title: 'If you had to choose one breakfast forever:',
    category: 'Casual',
    status: 'voting',
    expiresAt: '6 days left',
    totalVotes: 870,
    optionA: { text: 'Pancakes & Syrup', votes: 470, predictions: 510 },
    optionB: { text: 'Crispy Waffles', votes: 400, predictions: 360 },
  },
  {
    id: 'poll-4',
    title: 'Do you prefer Summer or Winter?',
    category: 'Worldwide',
    status: 'closed',
    expiresAt: 'Ended yesterday',
    totalVotes: 5120,
    optionA: { text: 'Sunny Summer', votes: 3120, predictions: 2900 },
    optionB: { text: 'Snowy Winter', votes: 2000, predictions: 2220 },
    userVote: 'A',
    userPrediction: 'A',
  }
];

const STORAGE_KEY = 'everyone_votes_polls_v1';
const PROFILE_KEY = 'everyone_votes_profile_v1';

export const dataService = {
  getProfile(): UserProfile {
    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    const defaultProfile: UserProfile = {
      id: 'local-user-' + Math.random().toString(36).substring(2, 7),
      nickname: 'Player 1',
      color: '#1ea4ec',
      correctPredictions: 1,
      totalPredictionsCount: 1,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  updateProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  async getPolls(): Promise<Poll[]> {
    if (isLiveBackend) {
      try {
        const PollClass = Parse.Object.extend('Poll');
        const query = new Parse.Query(PollClass);
        const results = await query.find();
        if (results.length > 0) {
          return results.map((item) => ({
            id: item.id,
            title: item.get('title'),
            category: item.get('category') || 'Daily',
            status: item.get('status') || 'voting',
            expiresAt: item.get('expiresAt') ? new Date(item.get('expiresAt')).toLocaleDateString() : 'Soon',
            totalVotes: (item.get('votesCountA') || 0) + (item.get('votesCountB') || 0),
            optionA: {
              text: item.get('optionA'),
              votes: item.get('votesCountA') || 0,
              predictions: item.get('predictionsCountA') || 0,
            },
            optionB: {
              text: item.get('optionB'),
              votes: item.get('votesCountB') || 0,
              predictions: item.get('predictionsCountB') || 0,
            },
          }));
        }
      } catch (err) {
        console.warn('Back4App query failed, falling back to local storage:', err);
      }
    }

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_POLLS));
      return DEFAULT_POLLS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_POLLS;
    }
  },

  async castVote(pollId: string, choice: 'A' | 'B', prediction: 'A' | 'B'): Promise<Poll> {
    const polls = await this.getPolls();
    const pollIndex = polls.findIndex((p) => p.id === pollId);
    if (pollIndex === -1) throw new Error('Poll not found');

    const poll = { ...polls[pollIndex] };
    poll.userVote = choice;
    poll.userPrediction = prediction;

    if (choice === 'A') poll.optionA.votes += 1;
    else poll.optionB.votes += 1;

    if (prediction === 'A') poll.optionA.predictions += 1;
    else poll.optionB.predictions += 1;

    poll.totalVotes += 1;
    polls[pollIndex] = poll;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(polls));

    // Update user intuition stats
    const profile = this.getProfile();
    profile.totalPredictionsCount += 1;
    const majority = poll.optionA.votes >= poll.optionB.votes ? 'A' : 'B';
    if (prediction === majority) {
      profile.correctPredictions += 1;
    }
    this.updateProfile(profile);

    if (isLiveBackend) {
      try {
        const PollClass = Parse.Object.extend('Poll');
        const pollObj = new PollClass();
        pollObj.id = pollId;
        pollObj.increment(choice === 'A' ? 'votesCountA' : 'votesCountB');
        pollObj.increment(prediction === 'A' ? 'predictionsCountA' : 'predictionsCountB');
        await pollObj.save();

        const VoteClass = Parse.Object.extend('Vote');
        const vote = new VoteClass();
        vote.set('poll', pollObj);
        vote.set('voterId', profile.id);
        vote.set('selectedOption', choice);
        vote.set('predictedOption', prediction);
        await vote.save();
      } catch (err) {
        console.warn('Failed to sync vote to Back4App:', err);
      }
    }

    return poll;
  },

  async submitSuggestion(suggestion: QuestionSuggestion): Promise<void> {
    if (isLiveBackend) {
      try {
        const SuggestionClass = Parse.Object.extend('Suggestion');
        const obj = new SuggestionClass();
        obj.set('question', suggestion.question);
        obj.set('optionA', suggestion.optionA);
        obj.set('optionB', suggestion.optionB);
        obj.set('authorName', suggestion.author);
        obj.set('status', 'pending');
        await obj.save();
        return;
      } catch (err) {
        console.warn('Failed to push suggestion to Back4App:', err);
      }
    }
    // Local fallback
    const list = JSON.parse(localStorage.getItem('evc_suggestions') || '[]');
    list.push({ ...suggestion, date: new Date().toISOString() });
    localStorage.setItem('evc_suggestions', JSON.stringify(list));
  }
};
