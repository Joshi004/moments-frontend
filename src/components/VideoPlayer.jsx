import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { Box } from '@mui/material';
import VideoControls from './VideoControls';
import VideoCaptions from './VideoCaptions';
import { getVideoUrl } from '../services/api';

const VideoPlayer = forwardRef(({
  video,
  moments = [],
  transcript = null,
  onTimeUpdate,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}, ref) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const refreshTimerRef = useRef(null);
  const isInitialLoad = useRef(true);

  // Expose seekTo and seekAndPlay methods via ref
  useImperativeHandle(ref, () => ({
    seekTo: (time) => {
      if (videoRef.current) {
        const clampedTime = Math.max(0, Math.min(time, videoRef.current.duration || 0));
        videoRef.current.currentTime = clampedTime;
        setCurrentTime(clampedTime);
      }
    },
    seekAndPlay: (time) => {
      if (videoRef.current) {
        const clampedTime = Math.max(0, Math.min(time, videoRef.current.duration || 0));
        videoRef.current.currentTime = clampedTime;
        setCurrentTime(clampedTime);
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    },
  }));
  
  // State for video playback
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [currentCaptionText, setCurrentCaptionText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // State for URL lifecycle management
  const [videoSrc, setVideoSrc] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  // Proactive URL refresh function
  const refreshUrl = useCallback(async () => {
    if (!video || !videoRef.current) return;
    
    try {
      console.log('Refreshing video URL (proactive refresh)');
      
      // Save current playback state
      const savedTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      // Fetch fresh URL
      const { url, expires_in_seconds } = await getVideoUrl(video.id);
      
      // Update video source
      setVideoSrc(url);
      
      // Wait for video to load new source
      const handleLoadedData = () => {
        // Restore playback position
        videoRef.current.currentTime = savedTime;
        
        // Resume playback if it was playing
        if (wasPlaying) {
          videoRef.current.play().catch(err => {
            console.error('Error resuming playback after URL refresh:', err);
          });
        }
        
        videoRef.current.removeEventListener('loadeddata', handleLoadedData);
      };
      
      videoRef.current.addEventListener('loadeddata', handleLoadedData);
      videoRef.current.load();
      
      // Set up next refresh timer (5 minutes before expiry)
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      const refreshDelayMs = (expires_in_seconds - 300) * 1000;
      refreshTimerRef.current = setTimeout(refreshUrl, refreshDelayMs);
      
      console.log(`URL refreshed. Next refresh in ${refreshDelayMs / 1000 / 60} minutes`);
    } catch (error) {
      console.error('Error refreshing video URL:', error);
    }
  }, [video]);

  // Error recovery handler (fallback for expired URLs)
  const handleVideoError = useCallback(async () => {
    if (!video || !videoRef.current) return;
    
    // Limit retries to prevent infinite loops
    if (retryCount >= 3) {
      console.error('Max retry attempts reached. Video URL may be permanently unavailable.');
      return;
    }
    
    try {
      console.log(`Video error detected (retry ${retryCount + 1}/3). Fetching fresh URL...`);
      
      // Save current playback state
      const savedTime = videoRef.current.currentTime;
      const wasPlaying = !videoRef.current.paused;
      
      // Fetch fresh URL
      const { url, expires_in_seconds } = await getVideoUrl(video.id);
      
      // Update video source
      setVideoSrc(url);
      setRetryCount(prev => prev + 1);
      
      // Wait for video to load new source
      const handleLoadedData = () => {
        // Restore playback position
        videoRef.current.currentTime = savedTime;
        
        // Resume playback if it was playing
        if (wasPlaying) {
          videoRef.current.play().catch(err => {
            console.error('Error resuming playback after error recovery:', err);
          });
        }
        
        videoRef.current.removeEventListener('loadeddata', handleLoadedData);
      };
      
      videoRef.current.addEventListener('loadeddata', handleLoadedData);
      videoRef.current.load();
      
      // Reset refresh timer for the new URL
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
      }
      const refreshDelayMs = (expires_in_seconds - 300) * 1000;
      refreshTimerRef.current = setTimeout(refreshUrl, refreshDelayMs);
      
      console.log('Video URL recovered successfully');
    } catch (error) {
      console.error('Error recovering from video error:', error);
    }
  }, [video, retryCount, refreshUrl]);

  // Initial URL fetch and timer setup
  useEffect(() => {
    if (!video) return;

    isInitialLoad.current = true;
    
    const loadVideoUrl = async () => {
      try {
        console.log('Loading video URL for:', video.id);
        
        // Fetch initial URL
        const { url, expires_in_seconds } = await getVideoUrl(video.id);
        
        // Set video source
        setVideoSrc(url);
        
        // Reset retry count for new video
        setRetryCount(0);
        
        // Clear any existing timer
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current);
        }
        
        // Set up proactive refresh timer (5 minutes before expiry)
        const refreshDelayMs = (expires_in_seconds - 300) * 1000;
        refreshTimerRef.current = setTimeout(refreshUrl, refreshDelayMs);
        
        console.log(`Video URL loaded. Expires in ${expires_in_seconds / 60} minutes. Refresh scheduled in ${refreshDelayMs / 1000 / 60} minutes.`);
      } catch (error) {
        console.error('Error loading video URL:', error);
      }
    };
    
    loadVideoUrl();
    
    // Cleanup on unmount or video change
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
    };
  }, [video, refreshUrl]);

  useEffect(() => {
    if (video) {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.volume = volume / 100;
        videoElement.muted = isMuted;
      }
      // Reset captions when video changes
      setCaptionsEnabled(false);
      setCurrentCaptionText('');
    }
  }, [video, volume, isMuted]);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const updateTime = () => {
      if (videoElement) {
        const time = videoElement.currentTime;
        setCurrentTime(time);
        // Notify parent of time update
        if (onTimeUpdate) {
          onTimeUpdate(time);
        }
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

    const handleLoadedDataAutoPlay = () => {
      if (isInitialLoad.current && videoRef.current) {
        isInitialLoad.current = false;
        videoRef.current.play().catch(() => {
          // Browser blocked auto-play (e.g. no prior interaction); stay paused silently
        });
      }
    };

    // Add event listeners
    videoElement.addEventListener('timeupdate', updateTime);
    videoElement.addEventListener('loadedmetadata', updateDuration);
    videoElement.addEventListener('loadeddata', updateDuration);
    videoElement.addEventListener('loadeddata', handleLoadedDataAutoPlay);
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
      videoElement.removeEventListener('loadeddata', handleLoadedDataAutoPlay);
      videoElement.removeEventListener('durationchange', updateDuration);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, [video, onTimeUpdate]);

  const handlePlayPause = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const willBePlaying = videoElement.paused;
    setIsPlaying(willBePlaying);

    if (willBePlaying) {
      videoElement.play().catch((error) => {
        console.error('Error playing video:', error);
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
    
    let activeSegment = null;
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      const isLastSegment = i === segments.length - 1;
      
      if (currentTime >= segment.start && (isLastSegment ? currentTime <= segment.end : currentTime < segment.end)) {
        activeSegment = segment;
        break;
      }
    }
    
    if (!activeSegment) {
      const lastSegment = segments[segments.length - 1];
      if (currentTime >= lastSegment.end) {
        setCurrentCaptionText('');
        return;
      }
      setCurrentCaptionText('');
      return;
    }
    
    setCurrentCaptionText(activeSegment.text || '');
  }, [currentTime, captionsEnabled, transcript]);

  useEffect(() => {
    // Keyboard shortcuts
    const handleKeyPress = (e) => {
      if (!video) return;

      const videoElement = videoRef.current;
      if (!videoElement) return;

      // Don't interfere with input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

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

  if (!video) return null;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16/9',
        backgroundColor: 'black',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: '100%',
          backgroundColor: 'black',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          controls={false}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            objectFit: 'contain',
          }}
          onLoadedMetadata={() => {
            if (videoRef.current && videoRef.current.duration) {
              setDuration(videoRef.current.duration);
            }
          }}
          onError={handleVideoError}
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
          onPrevious={onPrevious}
          onNext={onNext}
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
    </Box>
  );
});

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
