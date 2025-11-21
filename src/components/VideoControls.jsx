import React from 'react';
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
}) => {
  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      sx={{
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        p: 2,
        borderRadius: '0 0 8px 8px',
      }}
    >
      {/* Seek Bar */}
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
          '& .MuiSlider-thumb': {
            width: 16,
            height: 16,
          },
          mb: 2,
        }}
      />

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

