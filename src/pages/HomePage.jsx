import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Snackbar, Alert } from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import VideoPlayer from '../components/VideoPlayer';
import ProcessAudioModal from '../components/ProcessAudioModal';
import ProcessTranscriptModal from '../components/ProcessTranscriptModal';
import { getVideos, processAudio, processTranscript } from '../services/api';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processAudioModalOpen, setProcessAudioModalOpen] = useState(false);
  const [processTranscriptModalOpen, setProcessTranscriptModalOpen] = useState(false);
  const [videoToProcess, setVideoToProcess] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError(null);
      const videosData = await getVideos();
      setVideos(videosData);
    } catch (err) {
      console.error('Error fetching videos:', err);
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to load videos. Please make sure the backend server is running on port 8005.';
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

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleCloseVideoPlayer = () => {
    setSelectedVideo(null);
  };

  const handlePreviousVideo = (video) => {
    setSelectedVideo(video);
  };

  const handleNextVideo = (video) => {
    setSelectedVideo(video);
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
      await processAudio(videoId);
      setSnackbar({
        open: true,
        message: 'Audio processing started. This may take a few minutes.',
        severity: 'info',
      });
      // Refresh videos after a delay to update has_audio status
      setTimeout(() => {
        fetchVideos();
      }, 2000);
    } catch (error) {
      console.error('Error processing audio:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start audio processing. Please try again.';
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
      await processTranscript(videoId);
      setSnackbar({
        open: true,
        message: 'Transcript generation started. This may take a few minutes.',
        severity: 'info',
      });
      // Refresh videos after a delay to update has_transcript status
      setTimeout(() => {
        fetchVideos();
      }, 2000);
    } catch (error) {
      console.error('Error processing transcript:', error);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start transcript generation. Please try again.';
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Video Moments
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Browse and manage your video collection
        </Typography>
      </Box>

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

      {!loading && !error && selectedVideo && (
        <VideoPlayer
          video={selectedVideo}
          videos={videos}
          onClose={handleCloseVideoPlayer}
          onPrevious={handlePreviousVideo}
          onNext={handleNextVideo}
        />
      )}

      {!loading && !error && !selectedVideo && (
        <VideoGrid
          videos={videos}
          onVideoClick={handleVideoClick}
          onAudioIconClick={handleAudioIconClick}
          onTranscriptIconClick={handleTranscriptIconClick}
        />
      )}

      <ProcessAudioModal
        open={processAudioModalOpen}
        onClose={() => {
          setProcessAudioModalOpen(false);
          setVideoToProcess(null);
        }}
        video={videoToProcess}
        onProcess={handleProcessAudio}
      />

      <ProcessTranscriptModal
        open={processTranscriptModalOpen}
        onClose={() => {
          setProcessTranscriptModalOpen(false);
          setVideoToProcess(null);
        }}
        video={videoToProcess}
        onProcess={handleProcessTranscript}
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
