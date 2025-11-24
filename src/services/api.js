import axios from 'axios';

const API_BASE_URL = 'http://localhost:7005/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getVideos = async () => {
  try {
    const response = await api.get('/videos');
    return response.data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    throw error;
  }
};

export const getVideo = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching video:', error);
    throw error;
  }
};

export const getVideoStreamUrl = (videoId) => {
  return `${API_BASE_URL}/videos/${videoId}/stream`;
};

export const getThumbnailUrl = (videoId) => {
  return `${API_BASE_URL}/videos/${videoId}/thumbnail`;
};

export const getMoments = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/moments`);
    return response.data;
  } catch (error) {
    console.error('Error fetching moments:', error);
    throw error;
  }
};

export const addMoment = async (videoId, moment) => {
  try {
    const response = await api.post(`/videos/${videoId}/moments`, moment);
    return response.data;
  } catch (error) {
    console.error('Error adding moment:', error);
    throw error;
  }
};

export const processAudio = async (videoId) => {
  try {
    const response = await api.post(`/videos/${videoId}/process-audio`);
    return response.data;
  } catch (error) {
    console.error('Error processing audio:', error);
    throw error;
  }
};

export const processTranscript = async (videoId) => {
  try {
    const response = await api.post(`/videos/${videoId}/process-transcript`);
    return response.data;
  } catch (error) {
    console.error('Error processing transcript:', error);
    throw error;
  }
};

export const getTranscript = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/transcript`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error;
  }
};

export const generateMoments = async (videoId, config) => {
  try {
    const response = await api.post(`/videos/${videoId}/generate-moments`, config);
    return response.data;
  } catch (error) {
    console.error('Error generating moments:', error);
    throw error;
  }
};

export const getGenerationStatus = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/generation-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching generation status:', error);
    throw error;
  }
};

export default api;


