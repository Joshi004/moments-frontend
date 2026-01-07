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
  // 'idle' | 'validating' | 'queued' | 'processing' | 'completed' | 'error'

  // Pipeline state
  const [videoId, setVideoId] = useState(null);
  const [requestId, setRequestId] = useState(null);
  const [isCached, setIsCached] = useState(false);

  // Results state
  const [moments, setMoments] = useState([]);
  const [totalDuration, setTotalDuration] = useState(null);
  const [error, setError] = useState(null);
  const [urlError, setUrlError] = useState(null);

  // Poll for completion
  useEffect(() => {
    if (pageState === 'processing' && videoId) {
      // usePipelineStatus hook in ProgressSection handles the polling
      // We just need to listen for completion via a different mechanism
      // For now, we'll use a simple interval to check
      const pollInterval = setInterval(async () => {
        try {
          const momentsData = await getMoments(videoId);
          if (momentsData && momentsData.length > 0) {
            // Pipeline likely completed, fetch moments
            clearInterval(pollInterval);
            setMoments(momentsData);
            setPageState('completed');
          }
        } catch (err) {
          // Moments not ready yet, continue polling
        }
      }, 5000); // Poll every 5 seconds

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
    setError(null);
    setUrlError(null);
  };

  const isProcessing = pageState === 'validating' || pageState === 'queued' || pageState === 'processing';
  const isIdle = pageState === 'idle';
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
      {isCompleted && (
        <ResultsSection
          videoId={videoId}
          moments={moments}
          totalDuration={totalDuration}
          onReset={handleReset}
        />
      )}
    </Container>
  );
};

export default URLGeneratePage;


