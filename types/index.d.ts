export interface EmotionResult {
  predictions: any[];
  summary: {
    mostFrequentEmotion: string;
    averageConfidence: number;
  };
}

export interface CoachingFeedback {
  emotionResult: EmotionResult;
  coaching: string;
}



