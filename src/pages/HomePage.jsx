import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, CircularProgress, Alert } from '@mui/material';
import VideoGrid from '../components/VideoGrid';
import VideoPlayer from '../components/VideoPlayer';
import { getVideos } from '../services/api';

const HomePage = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <Box sx={{ 
      minHeight: '100vh',
      backgroundColor: 'background.default',
    }}>
      <Container maxWidth="xl" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
        <Box sx={{ 
          mb: { xs: 2, sm: 3, md: 4 },
          px: { xs: 1, sm: 2 },
        }}>
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
          <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
        </Box>
      )}
      </Container>
    </Box>
  );
};

export default HomePage;

