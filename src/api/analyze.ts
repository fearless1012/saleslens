import axios from 'axios';

export async function sendAudioForAnalysis(audioBlob: Blob) {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.wav');

  const res = await axios.post('http://localhost:5000/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  return res.data;
}