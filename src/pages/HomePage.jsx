import React, { useState, useEffect, useMemo } from 'react';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import UnifiedPipelineModal from '../components/UnifiedPipelineModal';
import PipelineProgressModal from '../components/PipelineProgressModal';
import PipelineConfirmDialog from '../components/PipelineConfirmDialog';
import DeleteVideoModal from '../components/DeleteVideoModal';
import PageHeader from '../components/common/PageHeader';
import LibraryToolbar from '../components/library/LibraryToolbar';
import SkeletonCard from '../components/common/SkeletonCard';
import useDebounce from '../hooks/useDebounce';
import { removeThumbnailCacheEntry, cleanupExpiredThumbnailCache } from '../hooks/useThumbnailUrl';
import { getVideos, startPipeline, getPipelineStatus, cancelPipeline, deleteVideo } from '../services/api';
import { useNotifications } from '../contexts/NotificationContext';

const HomePage = () => {
  const { addNotification } = useNotifications();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
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
    cleanupExpiredThumbnailCache();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      // Cleanup pipeline polling
      Object.values(pipelineStatusPolling).forEach(interval => {
        if (interval) clearInterval(interval);
      });
    };
  }, [pipelineStatusPolling]);

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
      await startPipeline(videoForPipeline.id, config);
      
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
            // Add notification
            addNotification({
              type: 'success',
              message: `Pipeline completed for video ${videoId}`,
              actionUrl: `/videos/${videoId}`,
            });
          } else if (status.status === 'failed') {
            setSnackbar({
              open: true,
              message: `Pipeline failed: ${status.error_message || 'Unknown error'}`,
              severity: 'error',
            });
            // Add notification
            addNotification({
              type: 'error',
              message: `Pipeline failed for video ${videoId}`,
              actionUrl: `/videos/${videoId}`,
            });
          } else if (status.status === 'cancelled') {
            setSnackbar({
              open: true,
              message: 'Pipeline was cancelled',
              severity: 'warning',
            });
            // Add notification
            addNotification({
              type: 'warning',
              message: `Pipeline cancelled for video ${videoId}`,
              actionUrl: `/videos/${videoId}`,
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

      removeThumbnailCacheEntry(videoId);

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
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
          }}
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
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
            onProcessPipelineClick={handleProcessPipelineClick}
            onPipelineStatusClick={handlePipelineStatusClick}
            onDeleteClick={handleDeleteClick}
            pipelineStatuses={pipelineStatuses}
            hasActiveFilters={!activeFilters.includes('all') || debouncedSearchTerm.length > 0}
            onClearFilters={() => {
              setActiveFilters(['all']);
              setSearchTerm('');
            }}
            allVideosCount={videos.length}
          />
        </>
      )}

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
