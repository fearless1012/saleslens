type Sentiment = { label: string; score: number };

const SentimentGraph: React.FC<{ data: Sentiment[] }> = ({ data }) => (
  <div className="sentiment-box">
    {data.map(({ label, score }) => (
      <div key={label} className="bar-container">
        <label>{label}</label>
        <div className="bar" style={{ width: `${score * 100}%` }} />
      </div>
    ))}
  </div>
);