import axios from 'axios';

export async function getCoachingFromLLaMA(emotionData: any): Promise<string> {
  const prompt = `
Act as an AI sales coach. Based on this emotion report from a sales pitch:
${JSON.stringify(emotionData)}

Give feedback on tone, pacing, confidence. Suggest one improvement and rewrite the pitch intro more confidently.
`;

  const response = await axios.post('http://localhost:11434/api/generate', {
    model: 'llama3',
    prompt,
    stream: false,
  });

  return response.data.response;
}
