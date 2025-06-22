import axios from 'axios';
import fs from 'fs';

const HUME_API_KEY = 'YOUR_HUME_API_KEY';

export async function analyzeVoiceEmotion(filePath: string): Promise<any> {
  const response = await axios.post(
    'https://api.hume.ai/v1/voice/analyze',
    fs.createReadStream(filePath),
    {
      headers: {
        Authorization: `Bearer ${HUME_API_KEY}`,
        'Content-Type': 'audio/wav',
      },
    }
  );
  return response.data;
}
