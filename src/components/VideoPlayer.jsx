import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
} from '@mui/material';
import { Close } from '@mui/icons-material';
import VideoControls from './VideoControls';
import { getVideoStreamUrl } from '../services/api';

const VideoPlayer = ({
  video,
  videos,
  open,
  onClose,
  onPrevious,
  onNext,
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);

  const currentIndex = videos.findIndex((v) => v.id === video?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  useEffect(() => {
    if (video && open) {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.load();
        videoElement.volume = volume / 100;
        videoElement.muted = isMuted;
      }
    }
  }, [video, open, volume, isMuted]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => {
      if (videoElement) {
        setCurrentTime(videoElement.currentTime);
      }
    };
    
    const updateDuration = () => {
      if (videoElement && videoElement.duration) {
        setDuration(videoElement.duration);
      }
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    // Add event listeners
    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('loadeddata', updateDuration);
    videoElement.addEventListener('durationchange', updateDuration);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);

    // Initial duration check
    if (videoElement.duration) {
      setDuration(videoElement.duration);
    }

    // Cleanup function
    return () => {
      videoElement.removeEventListener('timeupdate', updateTime);
      videoElement.removeEventListener('loadedmetadata', updateDuration);
      videoElement.removeEventListener('loadeddata', updateDuration);
      videoElement.removeEventListener('durationchange', updateDuration);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [video, open]); // Re-attach listeners when video or open state changes

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Check the actual video element's paused property instead of React state
    // This avoids race conditions where state might not be updated yet
    if (videoElement.paused) {
      videoElement.play().catch((error) => {
        console.error('Error playing video:', error);
      });
    } else {
      videoElement.pause();
    }
  };

  const handleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (videoElement.requestFullscreen) {
      videoElement.requestFullscreen();
    } else if (videoElement.webkitRequestFullscreen) {
      videoElement.webkitRequestFullscreen();
    } else if (videoElement.mozRequestFullScreen) {
      videoElement.mozRequestFullScreen();
    } else if (videoElement.msRequestFullscreen) {
      videoElement.msRequestFullscreen();
    }
  };

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (!open) return;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          handlePlayPause();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          videoElement.currentTime = Math.max(0, videoElement.currentTime - 10);
          break;
        case 'ArrowRight':
          e.preventDefault();
          videoElement.currentTime = Math.min(
            duration,
            videoElement.currentTime + 10
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(100, volume + 10));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 10));
          break;
        case 'KeyF':
          e.preventDefault();
          handleFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [open, volume, duration]);

  const handleSeek = (value) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      // Clamp the value to valid range
      const clampedValue = Math.max(0, Math.min(value, duration || 0));
      videoElement.currentTime = clampedValue;
      setCurrentTime(clampedValue);
    }
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.volume = value / 100;
      if (value > 0) {
        setIsMuted(false);
        videoElement.muted = false;
      }
    }
  };

  const handleToggleMute = () => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const newMuted = !isMuted;
      setIsMuted(newMuted);
      videoElement.muted = newMuted;
    }
  };

  const handlePrevious = () => {
    if (hasPrevious && onPrevious) {
      onPrevious(videos[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (hasNext && onNext) {
      onNext(videos[currentIndex + 1]);
    }
  };

  if (!video) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'black',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogContent sx={{ p: 0, position: 'relative' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
          }}
        >
          <Close />
        </IconButton>

        <Box sx={{ position: 'relative', width: '100%' }}>
          <video
            ref={videoRef}
            src={getVideoStreamUrl(video.id)}
            controls={false}
            style={{
              width: '100%',
              maxHeight: '70vh',
              display: 'block',
            }}
            onLoadedMetadata={() => {
              if (videoRef.current && videoRef.current.duration) {
                setDuration(videoRef.current.duration);
              }
            }}
            onTimeUpdate={() => {
              if (videoRef.current) {
                setCurrentTime(videoRef.current.currentTime);
              }
            }}
          />

          <VideoControls
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={duration}
            volume={volume}
            isMuted={isMuted}
            onPlayPause={handlePlayPause}
            onSeek={handleSeek}
            onVolumeChange={handleVolumeChange}
            onToggleMute={handleToggleMute}
            onFullscreen={handleFullscreen}
            onPrevious={handlePrevious}
            onNext={handleNext}
            hasPrevious={hasPrevious}
            hasNext={hasNext}
          />
        </Box>

        <Box sx={{ p: 2, backgroundColor: 'background.paper' }}>
          <Typography variant="h6">{video.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {video.filename}
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default VideoPlayer;

