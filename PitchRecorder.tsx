import { ReactMic } from 'react-mic';
import React, { useState } from 'react';

export const PitchRecorder = () => {
  const [record, setRecord] = useState(false);

  const onStop = async (recordedBlob: any) => {
    const formData = new FormData();
    formData.append('audio', recordedBlob.blob, 'pitch.wav');

    await fetch('http://localhost:5000/analyze', {
      method: 'POST',
      body: formData,
    });
  };

  return (
    <div>
      <ReactMic
        record={record}
        className="sound-wave"
        onStop={onStop}
        strokeColor="#000000"
        backgroundColor="#FF4081"
      />
      <button onClick={() => setRecord(true)}>Start</button>
      <button onClick={() => setRecord(false)}>Stop</button>
    </div>
  );
};
