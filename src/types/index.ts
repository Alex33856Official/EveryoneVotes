export interface Poll {
  id: string;
  title: string;
  category: 'Daily' | 'Worldwide' | 'Casual';
  optionA: {
    text: string;
    icon?: string;
    votes: number;
    predictions: number;
  };
  optionB: {
    text: string;
    icon?: string;
    votes: number;
    predictions: number;
  };
  status: 'voting' | 'closed';
  expiresAt: string;
  totalVotes: number;
  userVote?: 'A' | 'B';
  userPrediction?: 'A' | 'B';
}

export interface UserProfile {
  id: string;
  nickname: string;
  color: string;
  correctPredictions: number;
  totalPredictionsCount: number;
}

export interface QuestionSuggestion {
  question: string;
  optionA: string;
  optionB: string;
  author: string;
}