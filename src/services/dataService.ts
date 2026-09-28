import Parse from 'parse';
import { Poll, QuestionSuggestion, UserProfile, UserVoteRecord } from '../types';

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
const HISTORY_KEY = 'everyone_votes_user_history_v1';

export const dataService = {
  getProfile(): UserProfile {
    if (isLiveBackend) {
      try {
        const currentUser = Parse.User.current();
        if (currentUser) {
          const profile: UserProfile = {
            id: currentUser.id,
            username: currentUser.get('username'),
            nickname: currentUser.get('nickname') || currentUser.get('username'),
            color: currentUser.get('color') || '#1ea4ec',
            correctPredictions: currentUser.get('correctPredictions') || 0,
            totalPredictionsCount: currentUser.get('totalPredictionsCount') || 0,
            isRegistered: true,
          };
          localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
          return profile;
        }
      } catch {
        /* ignore */
      }
    }

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
      isRegistered: false,
    };
    localStorage.setItem(PROFILE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  },

  updateProfile(profile: UserProfile): void {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  },

  async signUp(username: string, password: string, nickname?: string, color?: string): Promise<UserProfile> {
    const current = this.getProfile();
    const finalNick = nickname?.trim() || username;
    const finalColor = color || current.color;

    if (isLiveBackend) {
      const user = new Parse.User();
      user.set('username', username);
      user.set('password', password);
      user.set('nickname', finalNick);
      user.set('color', finalColor);
      user.set('correctPredictions', current.correctPredictions);
      user.set('totalPredictionsCount', current.totalPredictionsCount);

      const createdUser = await user.signUp();
      const profile: UserProfile = {
        id: createdUser.id,
        username: createdUser.get('username'),
        nickname: createdUser.get('nickname') || finalNick,
        color: createdUser.get('color') || finalColor,
        correctPredictions: createdUser.get('correctPredictions') ?? current.correctPredictions,
        totalPredictionsCount: createdUser.get('totalPredictionsCount') ?? current.totalPredictionsCount,
        isRegistered: true,
      };
      this.updateProfile(profile);
      return profile;
    }

    const localProfile: UserProfile = {
      ...current,
      id: 'user-' + username.toLowerCase().replace(/\s+/g, '-'),
      username,
      nickname: finalNick,
      color: finalColor,
      isRegistered: true,
    };
    this.updateProfile(localProfile);
    return localProfile;
  },

  async logIn(username: string, password: string): Promise<UserProfile> {
    if (isLiveBackend) {
      const user = await Parse.User.logIn(username, password);
      const profile: UserProfile = {
        id: user.id,
        username: user.get('username'),
        nickname: user.get('nickname') || user.get('username'),
        color: user.get('color') || '#1ea4ec',
        correctPredictions: user.get('correctPredictions') || 0,
        totalPredictionsCount: user.get('totalPredictionsCount') || 0,
        isRegistered: true,
      };
      this.updateProfile(profile);
      return profile;
    }

    const current = this.getProfile();
    const localProfile: UserProfile = {
      ...current,
      username,
      nickname: username,
      isRegistered: true,
    };
    this.updateProfile(localProfile);
    return localProfile;
  },

  async logOut(): Promise<UserProfile> {
    if (isLiveBackend) {
      try {
        await Parse.User.logOut();
      } catch (err) {
        console.warn('Parse logout error:', err);
      }
    }
    const guestProfile: UserProfile = {
      id: 'local-user-' + Math.random().toString(36).substring(2, 7),
      nickname: 'Player 1',
      color: '#1ea4ec',
      correctPredictions: 0,
      totalPredictionsCount: 0,
      isRegistered: false,
    };
    this.updateProfile(guestProfile);
    return guestProfile;
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
    const isCorrect = prediction === majority;
    if (isCorrect) {
      profile.correctPredictions += 1;
    }
    this.updateProfile(profile);

    // Record locally for immediate history feedback
    this.recordVoteHistory({
      id: 'vote-' + Date.now(),
      pollId: poll.id,
      pollTitle: poll.title,
      category: poll.category,
      selectedOption: choice,
      selectedOptionText: choice === 'A' ? poll.optionA.text : poll.optionB.text,
      predictedOption: prediction,
      predictedOptionText: prediction === 'A' ? poll.optionA.text : poll.optionB.text,
      majorityOption: majority,
      isPredictionCorrect: isCorrect,
      status: poll.status,
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric' }),
    });

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
        const currentUser = Parse.User.current();
        if (currentUser) {
          vote.set('user', currentUser);
          currentUser.set('totalPredictionsCount', profile.totalPredictionsCount);
          currentUser.set('correctPredictions', profile.correctPredictions);
          await currentUser.save();
        }
        vote.set('selectedOption', choice);
        vote.set('predictedOption', prediction);
        await vote.save();
      } catch (err) {
        console.warn('Failed to sync vote to Back4App:', err);
      }
    }

    return poll;
  },

  recordVoteHistory(record: UserVoteRecord): void {
    const list: UserVoteRecord[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    const existingIdx = list.findIndex((item) => item.pollId === record.pollId);
    if (existingIdx !== -1) {
      list[existingIdx] = record;
    } else {
      list.unshift(record);
    }
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  },

  async getUserVotes(): Promise<UserVoteRecord[]> {
    const profile = this.getProfile();
    if (isLiveBackend) {
      try {
        const VoteClass = Parse.Object.extend('Vote');
        const query = new Parse.Query(VoteClass);
        const currentUser = Parse.User.current();
        if (currentUser) {
          query.equalTo('user', currentUser);
        } else {
          query.equalTo('voterId', profile.id);
        }
        query.include('poll');
        query.descending('createdAt');
        const results = await query.find();

        if (results.length > 0) {
          return results.map((v) => {
            const pollObj = v.get('poll');
            const pollTitle = pollObj ? pollObj.get('title') : 'Channel Broadcast';
            const optA = pollObj ? pollObj.get('optionA') : 'Option A';
            const optB = pollObj ? pollObj.get('optionB') : 'Option B';
            const countA = pollObj ? (pollObj.get('votesCountA') || 0) : 0;
            const countB = pollObj ? (pollObj.get('votesCountB') || 0) : 0;
            const majority = countA >= countB ? 'A' : 'B';
            const selected = v.get('selectedOption') as 'A' | 'B';
            const predicted = v.get('predictedOption') as 'A' | 'B';
            return {
              id: v.id,
              pollId: pollObj ? pollObj.id : '',
              pollTitle,
              category: pollObj ? pollObj.get('category') : 'Daily',
              selectedOption: selected,
              selectedOptionText: selected === 'A' ? optA : optB,
              predictedOption: predicted,
              predictedOptionText: predicted === 'A' ? optA : optB,
              majorityOption: majority,
              isPredictionCorrect: predicted === majority,
              status: (pollObj?.get('status') as 'voting' | 'closed') || 'voting',
              date: v.createdAt ? new Date(v.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'Recently',
            };
          });
        }
      } catch (err) {
        console.warn('Could not fetch votes from Back4App, checking local storage:', err);
      }
    }

    const saved = localStorage.getItem(HISTORY_KEY);
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }

    const polls = await this.getPolls();
    const initialVotes: UserVoteRecord[] = [];
    polls.forEach((p) => {
      if (p.userVote && p.userPrediction) {
        const majority = p.optionA.votes >= p.optionB.votes ? 'A' : 'B';
        initialVotes.push({
          id: 'initial-' + p.id,
          pollId: p.id,
          pollTitle: p.title,
          category: p.category,
          selectedOption: p.userVote,
          selectedOptionText: p.userVote === 'A' ? p.optionA.text : p.optionB.text,
          predictedOption: p.userPrediction,
          predictedOptionText: p.userPrediction === 'A' ? p.optionA.text : p.optionB.text,
          majorityOption: majority,
          isPredictionCorrect: p.userPrediction === majority,
          status: p.status,
          date: 'Earlier',
        });
      }
    });
    return initialVotes;
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
