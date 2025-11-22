import axios from 'axios';

const API_BASE_URL = 'http://localhost:8005/api';

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
    console.log('processAudio API call with videoId:', videoId, 'URL:', `/videos/${videoId}/process-audio`);
    const response = await api.post(`/videos/${videoId}/process-audio`);
    return response.data;
  } catch (error) {
    console.error('Error processing audio:', error);
    console.error('Error response:', error.response?.data);
    throw error;
  }
};

export const getProcessingStatus = async () => {
  try {
    const response = await api.get('/videos/processing-status');
    return response.data;
  } catch (error) {
    console.error('Error fetching processing status:', error);
    throw error;
  }
};

export default api;


