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

export const deleteMoment = async (videoId, momentId) => {
  try {
    const response = await api.delete(`/videos/${videoId}/moments/${momentId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting moment:', error);
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

// Pipeline API
export const startPipeline = async (videoId, config) => {
  try {
    const response = await api.post(`/pipeline/${videoId}/start`, config);
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
    return response.data;
  } catch (error) {
    console.error('Error fetching pipeline history:', error);
    throw error;
  }
};

// URL-based moment generation
export const generateMomentsFromUrl = async (videoUrl, forceDownload, config) => {
  try {
    const response = await api.post('/generate_moments', {
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
    
    // Add granular skip parameters if specified
    // Local file options
    if (options.skipLocalVideo) {
      params.append('skip_local_video', 'true');
    }
    if (options.skipLocalAudio) {
      params.append('skip_local_audio', 'true');
    }
    if (options.skipLocalThumbnail) {
      params.append('skip_local_thumbnail', 'true');
    }
    if (options.skipLocalTranscript) {
      params.append('skip_local_transcript', 'true');
    }
    if (options.skipLocalMoments) {
      params.append('skip_local_moments', 'true');
    }
    if (options.skipLocalClips) {
      params.append('skip_local_clips', 'true');
    }
    
    // GCS options
    if (options.skipGcsAudio) {
      params.append('skip_gcs_audio', 'true');
    }
    if (options.skipGcsClips) {
      params.append('skip_gcs_clips', 'true');
    }
    
    // State options
    if (options.skipRedis) {
      params.append('skip_redis', 'true');
    }
    if (options.skipRegistry) {
      params.append('skip_registry', 'true');
    }
    
    // Force option
    if (options.force) {
      params.append('force', 'true');
    }
    
    const queryString = params.toString();
    const url = `/videos/${videoId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await api.delete(url);
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


