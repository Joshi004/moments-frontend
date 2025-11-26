import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  IconButton,
  Typography,
  Paper,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import { Close, Add, AutoAwesome } from '@mui/icons-material';
import VideoControls from './VideoControls';
import VideoCaptions from './VideoCaptions';
import AddMomentDialog from './AddMomentDialog';
import GenerateMomentsModal from './GenerateMomentsModal';
import RefineMomentModal from './RefineMomentModal';
import MomentsList from './MomentsList';
import { getVideoStreamUrl, getMoments, addMoment, getTranscript, generateMoments, getGenerationStatus, refineMoment, getRefinementStatus } from '../services/api';

const VideoPlayer = ({
  video,
  videos,
  onClose,
  onPrevious,
  onNext,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [moments, setMoments] = useState([]);
  const [isAddMomentDialogOpen, setIsAddMomentDialogOpen] = useState(false);
  const [isGenerateMomentsModalOpen, setIsGenerateMomentsModalOpen] = useState(false);
  const [isGeneratingMoments, setIsGeneratingMoments] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [generationPollInterval, setGenerationPollInterval] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [transcript, setTranscript] = useState(null);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [currentCaptionText, setCurrentCaptionText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRefineMomentModalOpen, setIsRefineMomentModalOpen] = useState(false);
  const [momentToRefine, setMomentToRefine] = useState(null);
  const [isRefiningMoment, setIsRefiningMoment] = useState(false);
  const [refinementStatus, setRefinementStatus] = useState(null);
  const [refinementPollInterval, setRefinementPollInterval] = useState(null);

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
      // Reset generation state
      setIsGeneratingMoments(false);
      setGenerationStatus(null);
      // Reset refinement state
      setIsRefiningMoment(false);
      setRefinementStatus(null);
      setMomentToRefine(null);
      setIsRefineMomentModalOpen(false);
      // Stop any existing polling
      if (generationPollInterval) {
        clearInterval(generationPollInterval);
        setGenerationPollInterval(null);
      }
      if (refinementPollInterval) {
        clearInterval(refinementPollInterval);
        setRefinementPollInterval(null);
      }
    }
  }, [video, volume, isMuted]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (generationPollInterval) {
        clearInterval(generationPollInterval);
      }
      if (refinementPollInterval) {
        clearInterval(refinementPollInterval);
      }
    };
  }, [generationPollInterval, refinementPollInterval]);

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

  const handleGenerateMoments = async (config) => {
    if (!video) return;
    
    try {
      setIsGeneratingMoments(true);
      setSnackbar({ open: false, message: '', severity: 'info' });
      
      // Start generation
      await generateMoments(video.id, config);
      
      // Start polling for status
      const pollInterval = setInterval(async () => {
        try {
          const status = await getGenerationStatus(video.id);
          setGenerationStatus(status);
          
          if (status && status.status === 'completed') {
            // Generation completed
            clearInterval(pollInterval);
            setGenerationPollInterval(null);
            setIsGeneratingMoments(false);
            setIsGenerateMomentsModalOpen(false);
            
            // Refresh moments
            await fetchMoments();
            
            setSnackbar({
              open: true,
              message: 'Moments generated successfully!',
              severity: 'success',
            });
          } else if (status && status.status === 'failed') {
            // Generation failed
            clearInterval(pollInterval);
            setGenerationPollInterval(null);
            setIsGeneratingMoments(false);
            
            setSnackbar({
              open: true,
              message: 'Moment generation failed. Please try again.',
              severity: 'error',
            });
          }
        } catch (error) {
          console.error('Error polling generation status:', error);
          // Continue polling on error
        }
      }, 2000); // Poll every 2 seconds
      
      setGenerationPollInterval(pollInterval);
      
      // Set timeout to stop polling after 5 minutes
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setGenerationPollInterval(null);
          if (isGeneratingMoments) {
            setIsGeneratingMoments(false);
            setSnackbar({
              open: true,
              message: 'Generation timeout. Please check the status.',
              severity: 'warning',
            });
          }
        }
      }, 5 * 60 * 1000); // 5 minutes
      
    } catch (error) {
      console.error('Error generating moments:', error);
      setIsGeneratingMoments(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start moment generation. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
    const containerElement = containerRef.current;
    if (!containerElement) return;

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
      // Enter fullscreen on container (includes video, controls, and captions)
      if (containerElement.requestFullscreen) {
        containerElement.requestFullscreen();
      } else if (containerElement.webkitRequestFullscreen) {
        containerElement.webkitRequestFullscreen();
      } else if (containerElement.mozRequestFullScreen) {
        containerElement.mozRequestFullScreen();
      } else if (containerElement.msRequestFullscreen) {
        containerElement.msRequestFullscreen();
      }
      setIsFullscreen(true);
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const containerElement = containerRef.current;
      const isCurrentlyFullscreen = document.fullscreenElement || 
                                    document.webkitFullscreenElement || 
                                    document.mozFullScreenElement || 
                                    document.msFullscreenElement;
      // Check if our container is the fullscreen element
      const isContainerFullscreen = containerElement && (
        document.fullscreenElement === containerElement ||
        document.webkitFullscreenElement === containerElement ||
        document.mozFullScreenElement === containerElement ||
        document.msFullscreenElement === containerElement
      );
      setIsFullscreen(!!isContainerFullscreen);
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

      // Disable keyboard shortcuts when modals are open
      if (isAddMomentDialogOpen || isGenerateMomentsModalOpen || isRefineMomentModalOpen) {
        return;
      }

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
  }, [video, volume, duration, isAddMomentDialogOpen, isGenerateMomentsModalOpen, isRefineMomentModalOpen]);

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

  const handleMomentClick = (startTime) => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.currentTime = startTime;
      setCurrentTime(startTime);
      // Optionally auto-play when clicking on a moment
      // videoElement.play();
    }
  };

  const handleRefineClick = (moment) => {
    setMomentToRefine(moment);
    setIsRefineMomentModalOpen(true);
  };

  const handleRefineMoment = async (config) => {
    if (!video || !momentToRefine) return;
    
    try {
      setIsRefiningMoment(true);
      setSnackbar({ open: false, message: '', severity: 'info' });
      
      // Start refinement
      await refineMoment(video.id, momentToRefine.id, config);
      
      // Start polling for status
      const pollInterval = setInterval(async () => {
        try {
          const status = await getRefinementStatus(video.id, momentToRefine.id);
          setRefinementStatus(status);
          
          if (status && status.status === 'completed') {
            // Refinement completed
            clearInterval(pollInterval);
            setRefinementPollInterval(null);
            setIsRefiningMoment(false);
            setIsRefineMomentModalOpen(false);
            setMomentToRefine(null);
            
            // Refresh moments
            await fetchMoments();
            
            setSnackbar({
              open: true,
              message: 'Moment refined successfully!',
              severity: 'success',
            });
          } else if (status && status.status === 'failed') {
            // Refinement failed
            clearInterval(pollInterval);
            setRefinementPollInterval(null);
            setIsRefiningMoment(false);
            
            setSnackbar({
              open: true,
              message: 'Moment refinement failed. Please try again.',
              severity: 'error',
            });
          }
        } catch (error) {
          console.error('Error polling refinement status:', error);
          // Continue polling on error
        }
      }, 2000); // Poll every 2 seconds
      
      setRefinementPollInterval(pollInterval);
      
      // Set timeout to stop polling after 5 minutes
      setTimeout(() => {
        if (pollInterval) {
          clearInterval(pollInterval);
          setRefinementPollInterval(null);
          if (isRefiningMoment) {
            setIsRefiningMoment(false);
            setSnackbar({
              open: true,
              message: 'Refinement timeout. Please check the status.',
              severity: 'warning',
            });
          }
        }
      }, 5 * 60 * 1000); // 5 minutes
      
    } catch (error) {
      console.error('Error refining moment:', error);
      setIsRefiningMoment(false);
      const errorMessage = error.response?.data?.detail || error.message || 'Failed to start moment refinement. Please try again.';
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error',
      });
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
          ref={containerRef}
          sx={{
            position: 'relative',
            width: '100%',
            maxHeight: isFullscreen ? '100vh' : '60vh',
            height: isFullscreen ? '100vh' : 'auto',
            backgroundColor: 'black',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <video
            ref={videoRef}
            src={getVideoStreamUrl(video.id)}
            controls={false}
            style={{
              width: '100%',
              maxHeight: isFullscreen ? '100vh' : '60vh',
              height: isFullscreen ? '100%' : 'auto',
              display: 'block',
              objectFit: isFullscreen ? 'contain' : 'contain',
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
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={() => setIsGenerateMomentsModalOpen(true)}
                disabled={!video.has_transcript || isGeneratingMoments}
                sx={{ ml: 2 }}
              >
                Generate Moments
              </Button>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setIsAddMomentDialogOpen(true)}
              >
                Add Moment
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Moments List */}
        <MomentsList
          moments={moments}
          currentTime={currentTime}
          duration={duration}
          onMomentClick={handleMomentClick}
          onAddMomentClick={() => setIsAddMomentDialogOpen(true)}
          onGenerateMomentsClick={() => setIsGenerateMomentsModalOpen(true)}
          hasTranscript={!!video.has_transcript}
          onRefineClick={handleRefineClick}
        />
      </Box>

      <AddMomentDialog
        open={isAddMomentDialogOpen}
        onClose={() => setIsAddMomentDialogOpen(false)}
        onSave={handleAddMoment}
        videoDuration={duration}
      />

      <GenerateMomentsModal
        open={isGenerateMomentsModalOpen}
        onClose={() => setIsGenerateMomentsModalOpen(false)}
        onGenerate={handleGenerateMoments}
        video={video}
        isGenerating={isGeneratingMoments}
      />

      <RefineMomentModal
        open={isRefineMomentModalOpen}
        onClose={() => {
          if (!isRefiningMoment) {
            setIsRefineMomentModalOpen(false);
            setMomentToRefine(null);
          }
        }}
        onRefine={handleRefineMoment}
        moment={momentToRefine}
        isRefining={isRefiningMoment}
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
    </Paper>
  );
};

export default VideoPlayer;

