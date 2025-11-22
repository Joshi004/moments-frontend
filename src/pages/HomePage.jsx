import React, { useState, useEffect, useRef } from 'react';
import { Container, Typography, Box, CircularProgress, Snackbar, Alert } from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import VideoPlayer from '../components/VideoPlayer';
import ProcessAudioModal from '../components/ProcessAudioModal';
import { getVideos, processAudio, getProcessingStatus } from '../services/api';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState({ active_jobs: 0, jobs: [] });
  const [processModalOpen, setProcessModalOpen] = useState(false);
  const [selectedVideoForProcessing, setSelectedVideoForProcessing] = useState(null);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const previousJobsRef = useRef(new Set());
  const previousJobStatusesRef = useRef(new Map());

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const data = await getVideos();
        setVideos(data);
        setError(null);
      } catch (err) {
        console.error('Error loading videos:', err);
        setError('Failed to load videos. Make sure the backend server is running.');
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // Polling for processing status
  useEffect(() => {
    let intervalId;
    let isMounted = true;
    
    const pollProcessingStatus = async () => {
      if (!isMounted) return;
      
      try {
        const status = await getProcessingStatus();
        if (!isMounted) return;
        
        // Check for completed/failed jobs before updating status
        const currentJobIds = new Set(status.jobs.map(job => job.video_id));
        const previousJobIds = previousJobsRef.current;
        const previousJobStatuses = previousJobStatusesRef.current;
        
        // Build current job statuses map
        const currentJobStatuses = new Map();
        status.jobs.forEach(job => {
          currentJobStatuses.set(job.video_id, job.status);
        });
        
        // Find jobs that completed or failed
        const completedOrFailedJobs = [];
        
        // Check jobs that were processing before
        previousJobStatuses.forEach((prevStatus, videoId) => {
          if (prevStatus === 'processing') {
            const currentStatus = currentJobStatuses.get(videoId);
            const noLongerInList = !currentJobIds.has(videoId);
            
            // Job completed (status changed to completed or removed from list)
            if (currentStatus === 'completed' || (noLongerInList && prevStatus === 'processing')) {
              completedOrFailedJobs.push({ videoId, success: true });
            }
            // Job failed (status changed to failed)
            else if (currentStatus === 'failed') {
              completedOrFailedJobs.push({ videoId, success: false });
            }
          }
        });
        
        // Update refs
        setProcessingStatus(status);
        previousJobsRef.current = currentJobIds;
        previousJobStatusesRef.current = currentJobStatuses;
        
        if (completedOrFailedJobs.length > 0) {
          // Refresh videos to update has_audio status
          try {
            const updatedVideos = await getVideos();
            if (isMounted) {
              setVideos(updatedVideos);
              
              // Show toast for completed/failed jobs
              completedOrFailedJobs.forEach(({ videoId, success }) => {
                const video = updatedVideos.find(v => v.id === videoId);
                const videoTitle = video ? video.title : videoId;
                setToast({
                  open: true,
                  message: success 
                    ? `Audio extracted successfully for "${videoTitle}"`
                    : `Failed to extract audio for "${videoTitle}"`,
                  severity: success ? 'success' : 'error'
                });
              });
            }
          } catch (err) {
            console.error('Error refreshing videos:', err);
          }
        }
        
        // Stop polling if no active jobs
        if (status.active_jobs === 0 && intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } catch (err) {
        console.error('Error fetching processing status:', err);
      }
    };
    
    // Start polling if there are active jobs
    if (processingStatus.active_jobs > 0) {
      intervalId = setInterval(pollProcessingStatus, 2500); // Poll every 2.5 seconds
      // Initial poll
      pollProcessingStatus();
    }
    
    return () => {
      isMounted = false;
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [processingStatus.active_jobs]);

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleClosePlayer = () => {
    setSelectedVideo(null);
  };

  const handlePreviousVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleNextVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleAudioIconClick = (video) => {
    setSelectedVideoForProcessing(video);
    setProcessModalOpen(true);
  };

  const handleProcessAudio = async (videoId) => {
    try {
      console.log('handleProcessAudio called with videoId:', videoId);
      await processAudio(videoId);
      // Update processing status immediately
      const status = await getProcessingStatus();
      setProcessingStatus(status);
      previousJobsRef.current = new Set(status.jobs.map(job => job.video_id));
      // Update job statuses ref
      const jobStatusesMap = new Map();
      status.jobs.forEach(job => {
        jobStatusesMap.set(job.video_id, job.status);
      });
      previousJobStatusesRef.current = jobStatusesMap;
      
      // Start polling if not already polling
      if (status.active_jobs > 0) {
        // Polling will be handled by useEffect
      }
    } catch (err) {
      console.error('Error processing audio:', err);
      console.error('Error response:', err.response?.data);
      const errorMessage = err.response?.data?.detail || err.message || 'Unknown error';
      setToast({
        open: true,
        message: `Failed to start audio processing: ${errorMessage}`,
        severity: 'error'
      });
    }
  };

  const handleCloseProcessModal = () => {
    setProcessModalOpen(false);
    setSelectedVideoForProcessing(null);
  };

  const handleCloseToast = () => {
    setToast({ ...toast, open: false });
  };

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2 },
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <Box>
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{
                fontWeight: 400,
                fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                mb: 0.5,
                color: 'text.primary',
              }}
            >
              Video Moments
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
              }}
            >
              Browse and watch your video collection
            </Typography>
          </Box>
          {/* Processing indicator */}
          {processingStatus.active_jobs > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              <Typography variant="body2" color="text.secondary">
                Processing {processingStatus.active_jobs} video{processingStatus.active_jobs !== 1 ? 's' : ''}...
              </Typography>
            </Box>
          )}
        </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          {/* Video Player at the top when a video is selected */}
          {selectedVideo && (
            <VideoPlayer
              video={selectedVideo}
              videos={videos}
              onClose={handleClosePlayer}
              onPrevious={handlePreviousVideo}
              onNext={handleNextVideo}
            />
          )}

          {/* Video Grid below the player */}
          <VideoGrid videos={videos} onVideoClick={handleVideoClick} onAudioIconClick={handleAudioIconClick} />
        </Box>
      )}
      
      {/* Process Audio Modal */}
      <ProcessAudioModal
        open={processModalOpen}
        onClose={handleCloseProcessModal}
        video={selectedVideoForProcessing}
        onProcess={handleProcessAudio}
      />
      
      {/* Toast notifications */}
      <Snackbar
        open={toast.open}
        autoHideDuration={5000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%' }}>
          {toast.message}
        </Alert>
      </Snackbar>
      </Container>
    </Box>
  );
};

export default HomePage;

