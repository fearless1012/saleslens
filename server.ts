import express from 'express';
import multer from 'multer';
import cors from 'cors';
import fs from 'fs';
import { analyzeVoiceEmotion } from './services/hume';
import { getCoachingFromLLaMA } from './services/llama';

const app = express();
const upload = multer({ dest: 'uploads/' });
app.use(cors());

app.post('/api/analyze', upload.single('audio'), async (req, res) => {
  try {
    const filePath = req.file?.path;
    if (!filePath) return res.status(400).send('No audio file uploaded');

    const emotionResult = await analyzeVoiceEmotion(filePath);
    const coaching = await getCoachingFromLLaMA(emotionResult);

    fs.unlinkSync(filePath); // Clean up temp file
    res.json({ emotionResult, coaching });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Processing error');
  }
});

app.get('/', (req, res) => {
  res.send('AI Sales Tutor Backend is running');
});

app.listen(5000, () => console.log('Server running on http://localhost:5000'));


