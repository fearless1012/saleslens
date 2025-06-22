import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [userInput, setUserInput] = useState('');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [emotions, setEmotions] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState<string[]>([]);

  const analyzeSentiment = async (text: string) => {
    const response = await axios.post('http://localhost:5000/analyze', { text });
    setEmotions(response.data.emotions);
    setFeedback(response.data.feedback);
  };

  const handleSubmit = async () => {
    if (!userInput.trim()) return;
    setTranscript([...transcript, `You: ${userInput}`]);
    await analyzeSentiment(userInput);
    setUserInput('');
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Practice</h1>
        <div className="profile">
          <img src="https://i.pravatar.cc/40" alt="User" />
          <span>Alex Meian<br /><small>Product manager</small></span>
        </div>
      </header>
      <main className="main">
        <section className="transcript">
          <h2>Transcript</h2>
          <div className="chat-box">
            {transcript.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>
          <input
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your message..."
          />
          <button onClick={handleSubmit}>Send</button>
        </section>

        <section className="sentiment">
          <h2>Sentiment Analysis</h2>
          <p>Lorem ipsum dolor sit amet consectetur.</p>
          {Object.entries(emotions).map(([label, score]) => (
            <div key={label} className="bar">
              <span>{label}</span>
              <div className="progress">
                <div className="fill" style={{ width: `${score * 100}%` }}></div>
              </div>
            </div>
          ))}
          <div className="feedback">
            {feedback.map((line, i) => (
              <p key={i}>• {line}</p>
            ))}
          </div>
        </section>
      </main>
      <footer>SalesLens ©2025</footer>
    </div>
  );
};

export default App;