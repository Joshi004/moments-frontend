import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import {
  URLInputSection,
  ConfigurationSection,
  ProgressSection,
  ResultsSection,
} from '../components/URLGenerate';
import {
  generateMomentsFromUrl,
  getMoments,
  cancelPipeline,
  getPipelineStatus,
} from '../services/api';

const DEFAULT_CONFIG = {
  model: 'qwen3_vl_fp8',
  temperature: 0.7,
  min_moment_length: 60,
  max_moment_length: 120,
  min_moments: 3,
  max_moments: 10,
  refinement_parallel_workers: 2,
  include_video_refinement: true,
};

const URLGeneratePage = () => {
  const navigate = useNavigate();

  // Form state
  const [url, setUrl] = useState('');
  const [forceDownload, setForceDownload] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // Page state
  const [pageState, setPageState] = useState('idle');
  // 'idle' | 'validating' | 'queued' | 'processing' | 'moments_ready' | 'completed' | 'error'

  // Pipeline state
  const [videoId, setVideoId] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [isCached, setIsCached] = useState(false);

  // Results state
  const [moments, setMoments] = useState([]);
  const [totalDuration, setTotalDuration] = useState(null);
  const [refinementProgress, setRefinementProgress] = useState(null);
  const [error, setError] = useState(null);
  const [urlError, setUrlError] = useState(null);

  // Poll for pipeline status and completion
  useEffect(() => {
    if ((pageState === 'processing' || pageState === 'moments_ready') && videoId) {
      const pollInterval = setInterval(async () => {
        try {
          const pipelineStatus = await getPipelineStatus(videoId);
          
          // Check if generation is complete (can show moments)
          const generationComplete = pipelineStatus.stages?.generation?.status === 'completed';
          
          if (generationComplete && pageState === 'processing') {
            const momentsData = await getMoments(videoId);
            setMoments(momentsData);
            setRefinementProgress(pipelineStatus.stages?.refinement?.progress);
            setPageState('moments_ready');
          }
          
          // Check for full completion
          if (pipelineStatus.status === 'completed') {
            const momentsData = await getMoments(videoId);
            setMoments(momentsData);
            setTotalDuration(pipelineStatus.total_duration_seconds);
            setPageState('completed');
            clearInterval(pollInterval);
          }
          
          // Check for failure or cancellation
          if (pipelineStatus.status === 'failed' || pipelineStatus.status === 'cancelled') {
            setError(pipelineStatus.error_message || `Pipeline ${pipelineStatus.status}`);
            setPageState('error');
            clearInterval(pollInterval);
          }
          
          // Update refinement progress if in moments_ready state
          if (pageState === 'moments_ready') {
            setRefinementProgress(pipelineStatus.stages?.refinement?.progress);
          }
        } catch (err) {
          console.error('Error polling pipeline status:', err);
          // Continue polling on error
        }
      }, 3000); // Poll every 3 seconds

      return () => clearInterval(pollInterval);
    }
  }, [pageState, videoId]);

  const validateUrl = (urlString) => {
    if (!urlString.trim()) {
      return 'URL is required';
    }

    try {
      const urlObj = new URL(urlString);
      const scheme = urlObj.protocol.replace(':', '');

      if (!['http', 'https', 'gs'].includes(scheme)) {
        return 'Unsupported URL scheme. Use http://, https://, or gs://';
      }

      if (scheme === 'gs' && !urlObj.hostname) {
        return 'GCS URI must specify bucket: gs://bucket/path';
      }

      if (!urlObj.pathname || urlObj.pathname === '/') {
        return 'URL must include a file path';
      }

      return null;
    } catch (e) {
      return 'Invalid URL format';
    }
  };

  const handleGenerateMoments = async () => {
    // Validate URL
    const validationError = validateUrl(url);
    if (validationError) {
      setUrlError(validationError);
      return;
    }

    setUrlError(null);
    setError(null);
    setPageState('validating');

    try {
      // Call API
      const response = await generateMomentsFromUrl(url, forceDownload, config);

      // Store response data
      setVideoId(response.video_id);
      setRequestId(response.request_id);
      setIsCached(response.is_cached);

      // Track in localStorage for history
      try {
        const recentVideos = JSON.parse(localStorage.getItem('recentPipelineVideos') || '[]');
        const newEntry = {
          video_id: response.video_id,
          request_id: response.request_id,
          timestamp: Date.now(),
          url: url,
        };
        // Add to front and keep only last 20
        const updated = [newEntry, ...recentVideos.filter(v => v.video_id !== response.video_id)].slice(0, 20);
        localStorage.setItem('recentPipelineVideos', JSON.stringify(updated));
      } catch (storageErr) {
        console.error('Failed to store in localStorage:', storageErr);
      }

      // Update page state
      if (response.download_required) {
        setPageState('processing'); // Will show download progress
      } else {
        setPageState('processing'); // Will skip download stage
      }
    } catch (err) {
      console.error('Error generating moments:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to start pipeline';
      setError(errorMessage);
      setPageState('error');
    }
  };

  const handleCancel = async () => {
    if (!videoId) return;

    try {
      await cancelPipeline(videoId);
      setError('Pipeline cancelled by user');
      setPageState('error');
    } catch (err) {
      console.error('Error cancelling pipeline:', err);
    }
  };

  const handleReset = () => {
    // Reset all state
    setUrl('');
    setForceDownload(false);
    setConfig(DEFAULT_CONFIG);
    setPageState('idle');
    setVideoId(null);
    setRequestId(null);
    setIsCached(false);
    setMoments([]);
    setTotalDuration(null);
    setRefinementProgress(null);
    setError(null);
    setUrlError(null);
  };

  const isProcessing = pageState === 'validating' || pageState === 'queued' || pageState === 'processing';
  const isIdle = pageState === 'idle';
  const isMomentsReady = pageState === 'moments_ready';
  const isCompleted = pageState === 'completed';
  const isError = pageState === 'error';

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/')} size="small">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Video Moments
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Generate from URL
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Paste a video URL to download and generate moments automatically
        </Typography>
      </Box>

      {/* URL Input Section */}
      {(isIdle || isError) && (
        <URLInputSection
          url={url}
          onUrlChange={setUrl}
          forceDownload={forceDownload}
          onForceDownloadChange={setForceDownload}
          disabled={isProcessing}
          error={urlError}
        />
      )}

      {/* Configuration Section */}
      {(isIdle || isError) && (
        <Box sx={{ mt: 3 }}>
          <ConfigurationSection
            config={config}
            onConfigChange={setConfig}
            disabled={isProcessing}
          />
        </Box>
      )}

      {/* Generate Button */}
      {(isIdle || isError) && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateMoments}
            disabled={isProcessing || !url.trim()}
            sx={{ minWidth: 200 }}
          >
            {isProcessing ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                Processing...
              </>
            ) : (
              'Generate Moments'
            )}
          </Button>
        </Box>
      )}

      {/* Error Alert */}
      {isError && error && (
        <Alert severity="error" sx={{ mt: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Cached Info */}
      {isProcessing && isCached && (
        <Alert severity="info" sx={{ mt: 3 }}>
          Video found in cache - download skipped
        </Alert>
      )}

      {/* Progress Section */}
      {isProcessing && videoId && (
        <ProgressSection
          videoId={videoId}
          requestId={requestId}
          onCancel={handleCancel}
        />
      )}

      {/* Results Section */}
      {(isMomentsReady || isCompleted) && (
        <ResultsSection
          videoId={videoId}
          requestId={requestId}
          moments={moments}
          totalDuration={totalDuration}
          refinementProgress={refinementProgress}
          isFullyComplete={isCompleted}
          onReset={handleReset}
        />
      )}
    </Container>
  );
};

export default URLGeneratePage;


