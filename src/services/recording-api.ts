import axios from 'axios';

export type RecordingStatus = 'NeverStarted' | 'Recording' | 'Stopped' | 'Playing';

export interface RecordingState {
  status: RecordingStatus;
  targetUrl?: string;
}

const BASE_URL = '/api/recording';

export const recordingApi = {
  startRecording: async (targetUrl: string): Promise<void> => {
    await axios.post(`${BASE_URL}/start`, null, {
      params: { targetUrl }
    });
  },

  stopRecording: async (): Promise<void> => {
    await axios.post(`${BASE_URL}/stop`);
  },

  getStatus: async (): Promise<RecordingState> => {
    const response = await axios.get(`${BASE_URL}/status`);
    return response.data;
  },

  startPlayback: async (): Promise<void> => {
    await axios.post(`${BASE_URL}/playback/start`);
  },

  stopPlayback: async (): Promise<void> => {
    await axios.post(`${BASE_URL}/playback/stop`);
  }
}; 