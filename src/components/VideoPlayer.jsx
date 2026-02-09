import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';
import VideoControls from './VideoControls';
import VideoCaptions from './VideoCaptions';
import { getVideoStreamUrl } from '../services/api';

const VideoPlayer = ({
  video,
  moments = [],
  transcript = null,
  onTimeUpdate,
  onPrevious,
  onNext,
  hasPrevious = false,
  hasNext = false,
}) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [captionsEnabled, setCaptionsEnabled] = useState(false);
  const [currentCaptionText, setCurrentCaptionText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (video) {
      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.load();
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
          src={getVideoStreamUrl(video.id)}
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
};

export default VideoPlayer;
