type Message = { speaker: 'AI' | 'You'; text: string };

const PracticeTranscript: React.FC<{ transcript: Message[] }> = ({ transcript }) => (
  <div className="transcript-box">
    {transcript.map((line, idx) => (
      <p key={idx}><strong>{line.speaker}:</strong> {line.text}</p>
    ))}
  </div>
);