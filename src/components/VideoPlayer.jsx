import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Divider,
  Button,
} from '@mui/material';
import { Close, Add } from '@mui/icons-material';
import VideoControls from './VideoControls';
import VideoCaptions from './VideoCaptions';
import AddMomentDialog from './AddMomentDialog';
import { getVideoStreamUrl, getMoments, addMoment, getTranscript } from '../services/api';

const VideoPlayer = ({
  video,
  videos,
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
  const [moments, setMoments] = useState([]);
  const [isAddMomentDialogOpen, setIsAddMomentDialogOpen] = useState(false);
  const [transcript, setTranscript] = useState(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [currentCaptionText, setCurrentCaptionText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  const currentIndex = videos.findIndex((v) => v.id === video?.id);
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < videos.length - 1;

  useEffect(() => {
    if (video) {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.load();
        videoElement.volume = volume / 100;
        videoElement.muted = isMuted;
      }
      // Fetch moments when video changes
      fetchMoments();
      // Fetch transcript when video changes
      fetchTranscript();
      // Reset captions when video changes
      setCaptionsEnabled(false);
      setCurrentCaptionText('');
    }
  }, [video, volume, isMuted]);

  const fetchMoments = async () => {
    if (!video) return;
    try {
      const momentsData = await getMoments(video.id);
      setMoments(momentsData);
    } catch (error) {
      console.error('Error fetching moments:', error);
      setMoments([]);
    }
  };

  const fetchTranscript = async () => {
    if (!video) return;
    try {
      const transcriptData = await getTranscript(video.id);
      setTranscript(transcriptData);
    } catch (error) {
      console.error('Error fetching transcript:', error);
      setTranscript(null);
    }
  };

  const handleAddMoment = async (moment) => {
    if (!video) return;
    try {
      await addMoment(video.id, moment);
      // Refresh moments after successful addition
      await fetchMoments();
    } catch (error) {
      throw error; // Re-throw to let dialog handle error display
    }
  };

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
  }, [video]); // Re-attach listeners when video changes

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    // Update state immediately based on current paused state
    // This ensures the icon updates synchronously before the video action
    const willBePlaying = videoElement.paused;
    setIsPlaying(willBePlaying);

    // Then perform the play/pause action
    if (willBePlaying) {
      videoElement.play().catch((error) => {
        console.error('Error playing video:', error);
        // Revert state if play fails
        setIsPlaying(false);
      });
    } else {
      videoElement.pause();
    }
  };

  const handleFullscreen = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const isCurrentlyFullscreen = document.fullscreenElement || 
                                  document.webkitFullscreenElement || 
                                  document.mozFullScreenElement || 
                                  document.msFullscreenElement;

    if (isCurrentlyFullscreen) {
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      setIsFullscreen(false);
    } else {
      // Enter fullscreen
      if (videoElement.requestFullscreen) {
        videoElement.requestFullscreen();
      } else if (videoElement.webkitRequestFullscreen) {
        videoElement.webkitRequestFullscreen();
      } else if (videoElement.mozRequestFullScreen) {
        videoElement.mozRequestFullScreen();
      } else if (videoElement.msRequestFullscreen) {
        videoElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement || 
                                    document.webkitFullscreenElement || 
                                    document.mozFullScreenElement || 
                                    document.msFullscreenElement;
      setIsFullscreen(!!isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  const handleToggleCaptions = () => {
    setCaptionsEnabled(!captionsEnabled);
  };

  // Update caption text based on current time using segments
  useEffect(() => {
    if (!captionsEnabled || !transcript || !transcript.segment_timestamps || transcript.segment_timestamps.length === 0) {
      setCurrentCaptionText('');
      return;
    }

    const segments = transcript.segment_timestamps;
    
    // Find the segment that contains the current time
    // A segment is active if currentTime is between start (inclusive) and end (exclusive)
    // For the last segment, we include the end time to handle edge cases
    let activeSegment = null;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLastSegment = i === segments.length - 1;
      
      // Check if current time falls within this segment's time range
      if (currentTime >= segment.start && (isLastSegment ? currentTime <= segment.end : currentTime < segment.end)) {
        activeSegment = segment;
        break;
      }
    }
    
    // If no active segment found and we're before the first segment, show nothing
    // If we're after the last segment, show the last segment briefly, then clear
    if (!activeSegment) {
      // Check if we're past all segments
      const lastSegment = segments[segments.length - 1];
      if (currentTime >= lastSegment.end) {
        // Past the end - clear captions
        setCurrentCaptionText('');
        return;
      }
      // Before first segment - show nothing
      setCurrentCaptionText('');
      return;
    }
    
    // Display the active segment's text
    setCurrentCaptionText(activeSegment.text || '');
  }, [currentTime, captionsEnabled, transcript]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (!video) return;

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
  }, [video, volume, duration]);

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
    <Paper
      elevation={3}
      sx={{
        mb: 4,
        backgroundColor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box sx={{ position: 'relative', width: '100%' }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
            },
          }}
          aria-label="Close video player"
        >
          <Close />
        </IconButton>

        <Box
          sx={{
            position: 'relative',
            width: '100%',
            maxHeight: '60vh',
            backgroundColor: 'black',
          }}
        >
          <video
            ref={videoRef}
            src={getVideoStreamUrl(video.id)}
            controls={false}
            style={{
              width: '100%',
              maxHeight: '60vh',
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
            moments={moments}
            hasTranscript={!!transcript}
            captionsEnabled={captionsEnabled}
            onToggleCaptions={handleToggleCaptions}
            isFullscreen={isFullscreen}
          />

          <VideoCaptions
            text={currentCaptionText}
            enabled={captionsEnabled}
            isFullscreen={isFullscreen}
          />
        </Box>

        <Box sx={{ p: 2, backgroundColor: 'background.paper', mt: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6">{video.title}</Typography>
              <Typography variant="body2" color="text.secondary">
                {video.filename}
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setIsAddMomentDialogOpen(true)}
              sx={{ ml: 2 }}
            >
              Add Moment
            </Button>
          </Box>
        </Box>
      </Box>

      <AddMomentDialog
        open={isAddMomentDialogOpen}
        onClose={() => setIsAddMomentDialogOpen(false)}
        onSave={handleAddMoment}
        videoDuration={duration}
      />
    </Paper>
  );
};

export default VideoPlayer;

