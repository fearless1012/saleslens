import React, { useState } from 'react';
import { sendAudioForAnalysis } from '../api/analyze';
import PracticeTranscript from '../components/PracticeTranscript';
import SentimentGraph from '../components/SentimentGraph';

const Practice = () => {
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState([]);
  const [sentiment, setSentiment] = useState([]);

  const handleSubmit = async () => {
    if (!audioBlob) return;

    const { emotionResult, coaching } = await sendAudioForAnalysis(audioBlob);
    setTranscript(coaching.transcript); // optional if parsed
    setSentiment([
      { label: 'Anxiety', score: emotionResult.anxiety },
      { label: 'Happy', score: emotionResult.happy },
      { label: 'Doubt', score: emotionResult.doubt }
    ]);
  };

  return (
    <div className="practice-page">
      <h2>Practice</h2>
      {/* Upload, record, or play audio UI goes here */}
      <button onClick={handleSubmit}>Analyze</button>

      <PracticeTranscript transcript={transcript} />
      <SentimentGraph data={sentiment} />
    </div>
  );
};

export default Practice;