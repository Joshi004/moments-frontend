import axios from 'axios';

// Get backend base URL from environment variables
// Priority: REACT_APP_API_URL > REACT_APP_BACKEND_PORT > window.REACT_APP_BACKEND_PORT > default
// Note: window.REACT_APP_BACKEND_PORT can be set at runtime via public/index.html or window object
const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    console.log('[API] Using REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
    return process.env.REACT_APP_API_URL;
  }
  // Check process.env first (set at build/start time)
  if (process.env.REACT_APP_BACKEND_PORT) {
    const url = `http://localhost:${process.env.REACT_APP_BACKEND_PORT}/api`;
    console.log('[API] Using REACT_APP_BACKEND_PORT:', process.env.REACT_APP_BACKEND_PORT, '->', url);
    return url;
  }
  // Check window object (can be set dynamically)
  if (typeof window !== 'undefined' && window.REACT_APP_BACKEND_PORT) {
    const url = `http://localhost:${window.REACT_APP_BACKEND_PORT}/api`;
    console.log('[API] Using window.REACT_APP_BACKEND_PORT:', window.REACT_APP_BACKEND_PORT, '->', url);
    return url;
  }
  console.warn('[API] No backend port configured, using default: 7005');
  return 'http://localhost:7005/api';
};

// API_BASE_URL will be computed dynamically on each request via interceptor

// Create axios instance with dynamic baseURL
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Override axios request interceptor to use dynamic baseURL
api.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl();
  return config;
});

// Export helper function for use in other components
// Returns backend base URL without /api suffix
export const getBackendBaseUrl = () => {
  if (process.env.REACT_APP_API_URL) {
    // Extract base URL without /api suffix
    return process.env.REACT_APP_API_URL.replace('/api', '');
  }
  // Check process.env first (set at build/start time)
  if (process.env.REACT_APP_BACKEND_PORT) {
    return `http://localhost:${process.env.REACT_APP_BACKEND_PORT}`;
  }
  // Check window object (can be set dynamically)
  if (typeof window !== 'undefined' && window.REACT_APP_BACKEND_PORT) {
    return `http://localhost:${window.REACT_APP_BACKEND_PORT}`;
  }
  return 'http://localhost:7005';
};

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
  return `${getApiBaseUrl()}/videos/${videoId}/stream`;
};

export const getThumbnailUrl = (videoId) => {
  return `${getApiBaseUrl()}/videos/${videoId}/thumbnail`;
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

export const refineMoment = async (videoId, momentId, config) => {
  try {
    const response = await api.post(`/videos/${videoId}/moments/${momentId}/refine`, config);
    return response.data;
  } catch (error) {
    console.error('Error refining moment:', error);
    throw error;
  }
};

export const getRefinementStatus = async (videoId, momentId) => {
  try {
    const response = await api.get(`/videos/${videoId}/refinement-status/${momentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching refinement status:', error);
    throw error;
  }
};

export const checkVideoAvailability = async (videoId, momentId) => {
  try {
    const response = await api.get(`/videos/${videoId}/moments/${momentId}/video-availability`);
    return response.data;
  } catch (error) {
    console.error('Error checking video availability:', error);
    throw error;
  }
};

export const extractClips = async (videoId, config) => {
  try {
    const response = await api.post(`/videos/${videoId}/extract-clips`, config);
    return response.data;
  } catch (error) {
    console.error('Error extracting clips:', error);
    throw error;
  }
};

export const getClipExtractionStatus = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/clip-extraction-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clip extraction status:', error);
    throw error;
  }
};

export const getAudioExtractionStatus = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/audio-extraction-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching audio extraction status:', error);
    throw error;
  }
};

export const getTranscriptionStatus = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/transcription-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching transcription status:', error);
    throw error;
  }
};

export default api;


