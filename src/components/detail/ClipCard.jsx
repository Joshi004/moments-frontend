import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  IconButton,
} from '@mui/material';
import { PlayArrow, Download, Close, ContentCut } from '@mui/icons-material';
import { getBackendBaseUrl } from '../../services/api';

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (startTime, endTime) => {
  const duration = endTime - startTime;
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const ClipCard = ({ moment, videoId, clipAvailable = false, clipPath = null }) => {
  const [playing, setPlaying] = useState(false);

  if (!clipAvailable) {
    return (
      <Card
        sx={{
          opacity: 0.6,
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: 140,
            backgroundColor: 'grey.300',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <ContentCut sx={{ fontSize: 48, color: 'text.disabled' }} />
          <Typography variant="caption" color="text.secondary">
            Not Extracted
          </Typography>
        </Box>
        <CardContent sx={{ p: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {moment.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  // Construct clip URL
  const clipUrl = clipPath 
    ? `${getBackendBaseUrl()}${clipPath}`
    : `${getBackendBaseUrl()}/static/moment_clips/${videoId}_${moment.id}_clip.mp4`;

  const handlePlay = () => {
    setPlaying(true);
  };

  const handleClose = () => {
    setPlaying(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = clipUrl;
    link.download = `${moment.title.replace(/[^a-zA-Z0-9]/g, '_')}_clip.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card
      sx={{
        borderRadius: 2,
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        '&:hover': {
          boxShadow: 4,
        },
      }}
    >
      {/* Thumbnail / Placeholder */}
      <Box
        sx={{
          position: 'relative',
          height: 140,
          backgroundColor: 'grey.300',
        }}
      >
        {!playing ? (
          <Box
            sx={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'grey.800',
              cursor: 'pointer',
            }}
            onClick={handlePlay}
          >
            <PlayArrow sx={{ fontSize: 64, color: 'white' }} />
          </Box>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <video
              src={clipUrl}
              controls
              autoPlay
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: 'black',
              }}
            />
            <IconButton
              onClick={handleClose}
              sx={{
                position: 'absolute',
                top: 4,
                right: 4,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.8)',
                },
              }}
              size="small"
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>
        )}
      </Box>

      {/* Content */}
      <CardContent sx={{ p: 1.5 }}>
        <Typography variant="subtitle2" noWrap sx={{ mb: 0.5 }}>
          {moment.title}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
          {' • '}
          Duration: {formatDuration(moment.start_time, moment.end_time)}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 1.5, pb: 1.5, pt: 0 }}>
        <Button
          size="small"
          startIcon={<PlayArrow />}
          onClick={handlePlay}
          sx={{ fontSize: '0.75rem' }}
        >
          Play
        </Button>
        <Button
          size="small"
          startIcon={<Download />}
          onClick={handleDownload}
          sx={{ fontSize: '0.75rem' }}
        >
          Download
        </Button>
      </CardActions>
    </Card>
  );
};

export default ClipCard;
