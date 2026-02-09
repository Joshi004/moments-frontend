import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import ProcessAudioModal from '../components/ProcessAudioModal';
import ProcessTranscriptModal from '../components/ProcessTranscriptModal';
import UnifiedPipelineModal from '../components/UnifiedPipelineModal';
import PipelineProgressModal from '../components/PipelineProgressModal';
import PipelineConfirmDialog from '../components/PipelineConfirmDialog';
import DeleteVideoModal from '../components/DeleteVideoModal';
import PageHeader from '../components/common/PageHeader';
import LibraryToolbar from '../components/library/LibraryToolbar';
import useDebounce from '../hooks/useDebounce';
import { getVideos, processAudio, processTranscript, getAudioExtractionStatus, getTranscriptionStatus, startPipeline, getPipelineStatus, cancelPipeline, deleteVideo } from '../services/api';

const HomePage = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processAudioModalOpen, setProcessAudioModalOpen] = useState(false);
  const [processTranscriptModalOpen, setProcessTranscriptModalOpen] = useState(false);
  const [videoToProcess, setVideoToProcess] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  // Audio extraction state
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [audioExtractionPollInterval, setAudioExtractionPollInterval] = useState(null);
  // Transcription state
  const [isProcessingTranscript, setIsProcessingTranscript] = useState(false);
  const [transcriptionPollInterval, setTranscriptionPollInterval] = useState(null);
  // Pipeline state
  const [pipelineModalOpen, setPipelineModalOpen] = useState(false);
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [videoForPipeline, setVideoForPipeline] = useState(null);
  const [pipelineStatuses, setPipelineStatuses] = useState({});
  const [pipelineStatusPolling, setPipelineStatusPolling] = useState({});
  // Confirmation dialog state
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogConfig, setConfirmDialogConfig] = useState({});
  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Library enhancement state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState(['all']);
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('videoLibraryViewMode') || 'grid';
  });
  
  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    fetchVideos();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (audioExtractionPollInterval) {
        clearInterval(audioExtractionPollInterval);
      }
      if (transcriptionPollInterval) {
        clearInterval(transcriptionPollInterval);
      }
      // Cleanup pipeline polling
      Object.values(pipelineStatusPolling).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [audioExtractionPollInterval, transcriptionPollInterval, pipelineStatusPolling]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const videosData = await getVideos();
      setVideos(videosData);
    } catch (err) {
      console.error('Error fetching videos:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load videos. Please make sure the backend server is running.';
      setError(errorMessage);
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAudioIconClick = (video) => {
    setVideoToProcess(video);
    setProcessAudioModalOpen(true);
  };

  const handleTranscriptIconClick = (video) => {
    setVideoToProcess(video);
    setProcessTranscriptModalOpen(true);
  };

  const handleProcessAudio = async (videoId) => {
    try {
      setIsProcessingAudio(true);
      setSnackbar({ open: false, message: '', severity: 'info' });
      
      // Start audio extraction
      await processAudio(videoId);
      
      // Start polling for status
      const pollInterval = setInterval(async () => {
        try {
          const status = await getAudioExtractionStatus(videoId);
          
          if (status && status.status === 'completed') {
            // Extraction completed
            clearInterval(pollInterval);
            setAudioExtractionPollInterval(null);
            setIsProcessingAudio(false);
            setProcessAudioModalOpen(false);
            setVideoToProcess(null);
            
            // Refresh video list to show audio is available
            await fetchVideos();
            
            setSnackbar({
              open: true,
              message: 'Audio extracted successfully!',
              severity: 'success',
            });
          } else if (status && status.status === 'failed') {
            // Extraction failed
            clearInterval(pollInterval);
            setAudioExtractionPollInterval(null);
            setIsProcessingAudio(false);
            
            const errorMsg = status.error || 'Audio extraction failed. Please try again.';
            setSnackbar({
              open: true,
              message: errorMsg,
              severity: 'error',
            });
          }
        } catch (error) {
          console.error('Error polling audio extraction status:', error);
          // Continue polling on error
        }
      }, 2000); // Poll every 2 seconds
      
      setAudioExtractionPollInterval(pollInterval);
      
      // Set timeout to stop polling after 15 minutes
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setAudioExtractionPollInterval(null);
          if (isProcessingAudio) {
            setIsProcessingAudio(false);
            setSnackbar({
              open: true,
              message: 'Audio extraction timeout. Please check the status manually.',
              severity: 'warning',
            });
          }
        }
      }, 15 * 60 * 1000); // 15 minutes
      
    } catch (error) {
      console.error('Error processing audio:', error);
      setIsProcessingAudio(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start audio extraction. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      throw error;
    }
  };

  const handleProcessTranscript = async (videoId) => {
    try {
      setIsProcessingTranscript(true);
      setSnackbar({ open: false, message: '', severity: 'info' });
      
      // Start transcription
      await processTranscript(videoId);
      
      // Start polling for status
      const pollInterval = setInterval(async () => {
        try {
          const status = await getTranscriptionStatus(videoId);
          
          if (status && status.status === 'completed') {
            // Transcription completed
            clearInterval(pollInterval);
            setTranscriptionPollInterval(null);
            setIsProcessingTranscript(false);
            setProcessTranscriptModalOpen(false);
            setVideoToProcess(null);
            
            // Refresh video list to show transcript is available
            await fetchVideos();
            
            setSnackbar({
              open: true,
              message: 'Transcript generated successfully!',
              severity: 'success',
            });
          } else if (status && status.status === 'failed') {
            // Transcription failed
            clearInterval(pollInterval);
            setTranscriptionPollInterval(null);
            setIsProcessingTranscript(false);
            
            const errorMsg = status.error || 'Transcription failed. Please try again.';
            setSnackbar({
              open: true,
              message: errorMsg,
              severity: 'error',
            });
          }
        } catch (error) {
          console.error('Error polling transcription status:', error);
          // Continue polling on error
        }
      }, 2000); // Poll every 2 seconds
      
      setTranscriptionPollInterval(pollInterval);
      
      // Set timeout to stop polling after 15 minutes
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setTranscriptionPollInterval(null);
          if (isProcessingTranscript) {
            setIsProcessingTranscript(false);
            setSnackbar({
              open: true,
              message: 'Transcription timeout. Please check the status manually.',
              severity: 'warning',
            });
          }
        }
      }, 15 * 60 * 1000); // 15 minutes
      
    } catch (error) {
      console.error('Error processing transcript:', error);
      setIsProcessingTranscript(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start transcription. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
      throw error;
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Pipeline handlers
  const handleProcessPipelineClick = (video) => {
    setVideoForPipeline(video);
    
    // Check if moments exist for this video
    if (video.moments && video.moments.length > 0) {
      // Show confirmation dialog
      setConfirmDialogConfig({
        title: 'Moments Already Exist',
        message: `This video already has ${video.moments.length} moment(s). Do you want to regenerate them?`,
        onConfirm: () => {
          setConfirmDialogOpen(false);
          setPipelineModalOpen(true);
        }
      });
      setConfirmDialogOpen(true);
    } else {
      // No moments exist, proceed directly
      setPipelineModalOpen(true);
    }
  };

  const handleStartPipeline = async (config) => {
    if (!videoForPipeline) return;

    try {
      const result = await startPipeline(videoForPipeline.id, config);
      
      setPipelineModalOpen(false);
      setSnackbar({
        open: true,
        message: 'Pipeline started successfully!',
        severity: 'success',
      });

      // Start polling for this video's pipeline status
      startPipelineStatusPolling(videoForPipeline.id);

    } catch (error) {
      console.error('Error starting pipeline:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start pipeline';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const startPipelineStatusPolling = (videoId) => {
    // Clear existing interval if any
    if (pipelineStatusPolling[videoId]) {
      clearInterval(pipelineStatusPolling[videoId]);
    }

    const pollInterval = setInterval(async () => {
      try {
        const status = await getPipelineStatus(videoId);
        
        setPipelineStatuses(prev => ({
          ...prev,
          [videoId]: status,
        }));

        // Stop polling if pipeline completed, failed, or cancelled
        if (status.status === 'completed' || 
            status.status === 'failed' || 
            status.status === 'cancelled' ||
            status.status === 'not_running') {
          clearInterval(pipelineStatusPolling[videoId]);
          setPipelineStatusPolling(prev => {
            const newPolling = { ...prev };
            delete newPolling[videoId];
            return newPolling;
          });

          // Refresh video list if completed
          if (status.status === 'completed') {
            await fetchVideos();
            setSnackbar({
              open: true,
              message: 'Pipeline completed successfully!',
              severity: 'success',
            });
          } else if (status.status === 'failed') {
            setSnackbar({
              open: true,
              message: `Pipeline failed: ${status.error_message || 'Unknown error'}`,
              severity: 'error',
            });
          } else if (status.status === 'cancelled') {
            setSnackbar({
              open: true,
              message: 'Pipeline was cancelled',
              severity: 'warning',
            });
          }
        }
      } catch (error) {
        console.error('Error polling pipeline status:', error);
      }
    }, 2000); // Poll every 2 seconds

    setPipelineStatusPolling(prev => ({
      ...prev,
      [videoId]: pollInterval,
    }));

    // Set timeout to stop polling after 30 minutes
    setTimeout(() => {
      if (pipelineStatusPolling[videoId]) {
        clearInterval(pipelineStatusPolling[videoId]);
        setPipelineStatusPolling(prev => {
          const newPolling = { ...prev };
          delete newPolling[videoId];
          return newPolling;
        });
      }
    }, 30 * 60 * 1000); // 30 minutes
  };

  const handlePipelineStatusClick = (video) => {
    setVideoForPipeline(video);
    setProgressModalOpen(true);
  };

  const handleCancelPipeline = async () => {
    if (!videoForPipeline) return;

    try {
      await cancelPipeline(videoForPipeline.id);
      setSnackbar({
        open: true,
        message: 'Pipeline cancellation requested',
        severity: 'info',
      });
    } catch (error) {
      console.error('Error cancelling pipeline:', error);
      setSnackbar({
        open: true,
        message: 'Failed to cancel pipeline',
        severity: 'error',
      });
    }
  };

  // Delete handlers
  const handleDeleteClick = (video) => {
    setVideoToDelete(video);
    setDeleteModalOpen(true);
  };

  const handleDeleteVideo = async (videoId, options) => {
    try {
      setIsDeleting(true);
      setSnackbar({ open: false, message: '', severity: 'info' });

      const result = await deleteVideo(videoId, options);

      setDeleteModalOpen(false);
      setVideoToDelete(null);
      setIsDeleting(false);

      // Refresh video list
      await fetchVideos();

      const statusMessage = result.status === 'completed' 
        ? 'Video deleted successfully!' 
        : `Video partially deleted: ${result.errors?.join(', ') || 'Some resources could not be deleted'}`;

      setSnackbar({
        open: true,
        message: statusMessage,
        severity: result.status === 'completed' ? 'success' : 'warning',
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      setIsDeleting(false);
      
      const errorMessage = error.response?.data?.detail?.error 
        || error.response?.data?.detail 
        || error.message 
        || 'Failed to delete video. Please try again.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  // Filter and sort videos
  const processedVideos = useMemo(() => {
    let filtered = [...videos];

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(video => 
        (video.id && video.id.toLowerCase().includes(searchLower)) ||
        (video.filename && video.filename.toLowerCase().includes(searchLower)) ||
        (video.title && video.title.toLowerCase().includes(searchLower))
      );
    }

    // Apply status filters (skip if 'all' is active)
    if (!activeFilters.includes('all')) {
      filtered = filtered.filter(video => {
        return activeFilters.some(filter => {
          switch (filter) {
            case 'new':
              return !video.has_audio && !video.has_transcript && (!video.moments || video.moments.length === 0);
            case 'hasAudio':
              return video.has_audio === true;
            case 'hasTranscript':
              return video.has_transcript === true;
            case 'hasMoments':
              return video.moments && video.moments.length > 0;
            default:
              return false;
          }
        });
      });
    }

    // Apply sorting
    const sorted = [...filtered];
    switch (sortOption) {
      case 'oldest':
        sorted.reverse();
        break;
      case 'nameAsc':
        sorted.sort((a, b) => (a.filename || '').localeCompare(b.filename || ''));
        break;
      case 'nameDesc':
        sorted.sort((a, b) => (b.filename || '').localeCompare(a.filename || ''));
        break;
      case 'mostMoments':
        sorted.sort((a, b) => (b.moments?.length || 0) - (a.moments?.length || 0));
        break;
      case 'duration':
        sorted.sort((a, b) => (b.duration || 0) - (a.duration || 0));
        break;
      case 'newest':
      default:
        // API returns newest first by default, no additional sorting needed
        break;
    }

    return sorted;
  }, [videos, debouncedSearchTerm, activeFilters, sortOption]);

  // Generate results summary text
  const resultsSummary = useMemo(() => {
    const parts = [`Showing ${processedVideos.length} of ${videos.length} videos`];
    
    if (debouncedSearchTerm) {
      parts.push(`Search: "${debouncedSearchTerm}"`);
    }
    
    if (!activeFilters.includes('all')) {
      const filterLabels = activeFilters.map(filter => {
        switch (filter) {
          case 'new': return 'New';
          case 'hasAudio': return 'Has Audio';
          case 'hasTranscript': return 'Has Transcript';
          case 'hasMoments': return 'Has Moments';
          default: return '';
        }
      }).filter(Boolean);
      
      if (filterLabels.length > 0) {
        parts.push(`Filtered by: ${filterLabels.join(', ')}`);
      }
    }
    
    return parts.join(' • ');
  }, [processedVideos.length, videos.length, debouncedSearchTerm, activeFilters]);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PageHeader
        title="Video Library"
        subtitle="Browse, search, and manage your video collection"
      />

      {loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            Loading videos...
          </Typography>
        </Box>
      )}

      {error && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="error">
            {error}
          </Typography>
        </Box>
      )}

      {!loading && !error && (
        <>
          <LibraryToolbar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
            sortOption={sortOption}
            onSortChange={setSortOption}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {resultsSummary}
          </Typography>

          <VideoGrid
            videos={processedVideos}
            viewMode={viewMode}
            onAudioIconClick={handleAudioIconClick}
            onTranscriptIconClick={handleTranscriptIconClick}
            onProcessPipelineClick={handleProcessPipelineClick}
            onPipelineStatusClick={handlePipelineStatusClick}
            onDeleteClick={handleDeleteClick}
            pipelineStatuses={pipelineStatuses}
          />
        </>
      )}

      <ProcessAudioModal
        open={processAudioModalOpen}
        onClose={() => {
          setProcessAudioModalOpen(false);
          setVideoToProcess(null);
        }}
        video={videoToProcess}
        onProcess={handleProcessAudio}
        isProcessing={isProcessingAudio}
      />

      <ProcessTranscriptModal
        open={processTranscriptModalOpen}
        onClose={() => {
          setProcessTranscriptModalOpen(false);
          setVideoToProcess(null);
        }}
        video={videoToProcess}
        onProcess={handleProcessTranscript}
        isProcessing={isProcessingTranscript}
      />

      <UnifiedPipelineModal
        open={pipelineModalOpen}
        onClose={() => {
          setPipelineModalOpen(false);
          setVideoForPipeline(null);
        }}
        video={videoForPipeline}
        onStart={handleStartPipeline}
      />

      <PipelineProgressModal
        open={progressModalOpen}
        onClose={() => {
          setProgressModalOpen(false);
        }}
        videoId={videoForPipeline?.id}
        onCancel={handleCancelPipeline}
      />

      <PipelineConfirmDialog
        open={confirmDialogOpen}
        onClose={setConfirmDialogOpen}
        onConfirm={confirmDialogConfig.onConfirm}
        title={confirmDialogConfig.title}
        message={confirmDialogConfig.message}
      />

      <DeleteVideoModal
        open={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setVideoToDelete(null);
        }}
        video={videoToDelete}
        onDelete={handleDeleteVideo}
        isDeleting={isDeleting}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default HomePage;
