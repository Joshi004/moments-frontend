import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Slider,
  Typography,
  Stack,
} from '@mui/material';
import {
  PlayArrow,
  Pause,
  VolumeUp,
  VolumeOff,
  Fullscreen,
  SkipPrevious,
  SkipNext,
} from '@mui/icons-material';

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  onPlayPause,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onFullscreen,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  isMuted,
  moments = [],
}) => {
  const [hoveredMoment, setHoveredMoment] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, relativeX: 0 });
  const seekBarRef = useRef(null);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate positions for moments visualization
  const getMomentPosition = (time) => {
    if (!duration || duration === 0) return 0;
    return (time / duration) * 100;
  };

  // Convert mouse X position to time value
  const getTimeFromPosition = (x) => {
    if (!seekBarRef.current || !duration || duration === 0) return 0;
    const rect = seekBarRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (x - rect.left) / rect.width));
    return percent * duration;
  };

  // Handle mouse move to detect which moment is hovered
  const handleMouseMove = (e) => {
    if (!seekBarRef.current || !duration || duration === 0 || moments.length === 0) {
      setHoveredMoment(null);
      return;
    }

    const rect = seekBarRef.current.getBoundingClientRect();
    const relativeX = e.clientX - rect.left;
    const hoverTime = getTimeFromPosition(e.clientX);

    // Find moment that contains hoverTime
    const moment = moments.find(m => 
      hoverTime >= m.start_time && hoverTime <= m.end_time
    );

    setHoveredMoment(moment);
    setMousePosition({ x: e.clientX, relativeX });
  };

  // Handle mouse leave to clear hovered moment
  const handleMouseLeave = () => {
    setHoveredMoment(null);
  };

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        p: 2,
        borderRadius: '0 0 8px 8px',
        zIndex: 5,
      }}
    >
      {/* Seek Bar with Moments Overlay */}
      <Box 
        ref={seekBarRef}
        sx={{ position: 'relative', mb: 2 }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Tooltip for hovered moment */}
        {hoveredMoment && seekBarRef.current && (
          <Box
            sx={{
              position: 'absolute',
              bottom: '100%',
              left: `${(mousePosition.relativeX / seekBarRef.current.offsetWidth) * 100}%`,
              transform: 'translateX(-50%)',
              mb: 1,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <Box
              sx={{
                backgroundColor: 'rgba(0, 0, 0, 0.9)',
                color: 'white',
                padding: '6px 12px',
                borderRadius: '4px',
                fontSize: '0.875rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                transition: 'opacity 0.15s ease-in-out, transform 0.15s ease-in-out',
              }}
            >
              {hoveredMoment.title}
            </Box>
            {/* Tooltip arrow */}
            <Box
              sx={{
                position: 'absolute',
                top: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: 0,
                height: 0,
                borderLeft: '6px solid transparent',
                borderRight: '6px solid transparent',
                borderTop: '6px solid rgba(0, 0, 0, 0.9)',
              }}
            />
          </Box>
        )}

        {/* Moments Segments and Markers */}
        {duration > 0 && moments.length > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: 0,
              right: 0,
              transform: 'translateY(-50%)',
              height: 6,
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            {/* Colored segments for moments */}
            {moments.map((moment, index) => {
              const startPercent = getMomentPosition(moment.start_time);
              const endPercent = getMomentPosition(moment.end_time);
              const width = endPercent - startPercent;
              const isHovered = hoveredMoment && hoveredMoment.start_time === moment.start_time;
              
              return (
                <Box
                  key={`segment-${index}`}
                  sx={{
                    position: 'absolute',
                    left: `${startPercent}%`,
                    width: `${width}%`,
                    height: '100%',
                    backgroundColor: '#2196F3',
                    opacity: isHovered ? 0.7 : 0.5,
                    borderRadius: '3px',
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                />
              );
            })}
            
            {/* Markers at start times */}
            {moments.map((moment, index) => {
              const startPercent = getMomentPosition(moment.start_time);
              const isHovered = hoveredMoment && hoveredMoment.start_time === moment.start_time;
              
              return (
                <Box
                  key={`marker-${index}`}
                  sx={{
                    position: 'absolute',
                    left: `${startPercent}%`,
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 4,
                    height: 4,
                    backgroundColor: '#2196F3',
                    opacity: isHovered ? 1 : 0.8,
                    borderRadius: '50%',
                    border: '1px solid white',
                    transition: 'opacity 0.2s ease-in-out',
                  }}
                />
              );
            })}
          </Box>
        )}
        
        {/* Slider */}
        <Slider
          value={isNaN(currentTime) ? 0 : Math.max(0, Math.min(currentTime, duration || 0))}
          max={duration && duration > 0 ? duration : 100}
          min={0}
          step={0.1}
          onChange={(e, value) => onSeek(value)}
          disabled={!duration || duration === 0 || isNaN(duration)}
          sx={{
            color: 'primary.main',
            height: 6,
            position: 'relative',
            zIndex: 2,
            '& .MuiSlider-thumb': {
              width: 16,
              height: 16,
            },
          }}
        />
      </Box>

      {/* Controls Row */}
      <Stack direction="row" spacing={1} alignItems="center">
        {/* Previous Button */}
        <IconButton
          onClick={onPrevious}
          disabled={!hasPrevious}
          sx={{ color: 'white' }}
          size="small"
        >
          <SkipPrevious />
        </IconButton>

        {/* Play/Pause Button */}
        <IconButton onClick={onPlayPause} sx={{ color: 'white' }} size="large">
          {isPlaying ? <Pause /> : <PlayArrow />}
        </IconButton>

        {/* Next Button */}
        <IconButton
          onClick={onNext}
          disabled={!hasNext}
          sx={{ color: 'white' }}
          size="small"
        >
          <SkipNext />
        </IconButton>

        {/* Time Display */}
        <Typography variant="body2" sx={{ ml: 2, minWidth: 100 }}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </Typography>

        {/* Volume Control */}
        <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto', minWidth: 120 }}>
          <IconButton onClick={onToggleMute} sx={{ color: 'white' }} size="small">
            {isMuted || volume === 0 ? <VolumeOff /> : <VolumeUp />}
          </IconButton>
          <Slider
            value={volume}
            max={100}
            onChange={(e, value) => onVolumeChange(value)}
            sx={{
              color: 'primary.main',
              width: 80,
              '& .MuiSlider-thumb': {
                width: 12,
                height: 12,
              },
            }}
          />
        </Box>

        {/* Fullscreen Button */}
        <IconButton onClick={onFullscreen} sx={{ color: 'white' }} size="small">
          <Fullscreen />
        </IconButton>
      </Stack>
    </Box>
  );
};

export default VideoControls;

