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

export const getVideoUrl = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/url`);
    return response.data;  // { url: "...", expires_in_seconds: 14400 }
  } catch (error) {
    console.error('Error fetching video URL:', error);
    throw error;
  }
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

export const deleteMoment = async (videoId, momentId) => {
  try {
    const response = await api.delete(`/videos/${videoId}?scope=moments&moment_ids=${momentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting moment:', error);
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

export const checkVideoAvailability = async (videoId, momentId) => {
  try {
    const response = await api.get(`/videos/${videoId}/moments/${momentId}/video-availability`);
    return response.data;
  } catch (error) {
    console.error('Error checking video availability:', error);
    throw error;
  }
};

export const getClipsForVideo = async (videoId) => {
  try {
    const response = await api.get(`/videos/${videoId}/clips`);
    return response.data;
  } catch (error) {
    console.error('Error fetching clips for video:', error);
    throw error;
  }
};

export const getClipTranscript = async (momentIdentifier) => {
  const response = await api.get(`/clips/${momentIdentifier}/transcript`);
  return response.data;
};

// Pipeline API
export const startPipeline = async (videoId, config) => {
  try {
    const response = await api.post('/pipeline/start', { video_id: videoId, ...config });
    return response.data;
  } catch (error) {
    console.error('Error starting pipeline:', error);
    throw error;
  }
};

export const getPipelineStatus = async (videoId) => {
  try {
    const response = await api.get(`/pipeline/${videoId}/status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline status:', error);
    throw error;
  }
};

export const cancelPipeline = async (videoId) => {
  try {
    const response = await api.post(`/pipeline/${videoId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('Error cancelling pipeline:', error);
    throw error;
  }
};

export const getPipelineHistory = async (videoId) => {
  try {
    const response = await api.get(`/pipeline/${videoId}/history`);
    // API returns {video_id, runs: [], count: 0}, extract the runs array
    return response.data?.runs || [];
  } catch (error) {
    console.error('Error fetching pipeline history:', error);
    throw error;
  }
};

// URL-based moment generation
export const generateMomentsFromUrl = async (videoUrl, forceDownload, config) => {
  try {
    const response = await api.post('/pipeline/start', {
      video_url: videoUrl,
      force_download: forceDownload,
      ...config
    });
    return response.data;
  } catch (error) {
    console.error('Error generating moments from URL:', error);
    throw error;
  }
};

// Delete video and associated resources
export const deleteVideo = async (videoId, options = {}) => {
  try {
    const params = new URLSearchParams();
    params.append('scope', options.scope || 'all');
    if (options.force) {
      params.append('force', 'true');
    }
    const response = await api.delete(`/videos/${videoId}?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
};

// Admin - Model Configuration
export const getModelConfigs = async () => {
  try {
    const response = await api.get('/admin/models');
    return response.data;
  } catch (error) {
    console.error('Error fetching model configs:', error);
    throw error;
  }
};

export const getModelConfig = async (modelKey) => {
  try {
    const response = await api.get(`/admin/models/${modelKey}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching model config:', error);
    throw error;
  }
};

export const createModelConfig = async (modelKey, config) => {
  try {
    const response = await api.post(`/admin/models/${modelKey}`, config);
    return response.data;
  } catch (error) {
    console.error('Error creating model config:', error);
    throw error;
  }
};

export const updateModelConfig = async (modelKey, config) => {
  try {
    const response = await api.patch(`/admin/models/${modelKey}`, config);
    return response.data;
  } catch (error) {
    console.error('Error updating model config:', error);
    throw error;
  }
};

export const deleteModelConfig = async (modelKey) => {
  try {
    const response = await api.delete(`/admin/models/${modelKey}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting model config:', error);
    throw error;
  }
};

export const seedModelConfigs = async (force = false) => {
  try {
    const response = await api.post('/admin/models/seed', { force });
    return response.data;
  } catch (error) {
    console.error('Error seeding model configs:', error);
    throw error;
  }
};

export const getDefaultConfigs = async () => {
  try {
    const response = await api.get('/admin/models/defaults/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching default configs:', error);
    throw error;
  }
};

// Health Check
export const checkHealth = async () => {
  try {
    const response = await axios.get(`${getBackendBaseUrl()}/health`, { timeout: 5000 });
    return response.data;
  } catch (error) {
    // Try the /api base as fallback
    try {
      const response = await api.get('/health', { timeout: 5000 });
      return response.data;
    } catch {
      return { status: 'error', message: 'Backend unreachable' };
    }
  }
};

export default api;


