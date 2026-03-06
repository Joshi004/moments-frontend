import React, { useState, useRef, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  IconButton,
  Collapse,
  CircularProgress,
} from '@mui/material';
import { PlayArrow, Download, Close, ContentCut, Subject } from '@mui/icons-material';
import { getBackendBaseUrl, getClipTranscript } from '../../services/api';

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

const ClipCard = ({ moment, videoId, clipAvailable = false, clipUrl = null, clipMetadata = null }) => {
  const [playing, setPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [transcriptData, setTranscriptData] = useState(null);
  const [transcriptLoading, setTranscriptLoading] = useState(false);
  const [transcriptError, setTranscriptError] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);

  const videoRef = useRef(null);
  const activeWordRef = useRef(null);
  const transcriptContainerRef = useRef(null);

  // Compute stream URL unconditionally (hooks must run before any early return)
  // Fix: backend clips router is mounted under /api, so URL must include /api prefix
  const streamUrl = `${getBackendBaseUrl()}/api/clips/${moment.id}/stream`;

  // Attach timeupdate listener only when the video is playing AND transcript panel is open
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !playing || !showTranscript) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    return () => video.removeEventListener('timeupdate', handleTimeUpdate);
  }, [playing, showTranscript]);

  // Auto-scroll the active word into view whenever currentTime changes
  useEffect(() => {
    if (activeWordRef.current && transcriptContainerRef.current) {
      activeWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [currentTime]);

  const handleToggleTranscript = async () => {
    if (showTranscript) {
      setShowTranscript(false);
      return;
    }

    setShowTranscript(true);

    if (transcriptData) return;

    setTranscriptLoading(true);
    setTranscriptError(null);
    try {
      const data = await getClipTranscript(moment.id);
      setTranscriptData(data);
    } catch (err) {
      setTranscriptError('Failed to load transcript');
    } finally {
      setTranscriptLoading(false);
    }
  };

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

  const handlePlay = () => {
    setPlaying(true);
  };

  const handleClose = () => {
    setPlaying(false);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = streamUrl;
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
              position: 'relative',
              cursor: 'pointer',
              backgroundColor: 'black',
            }}
            onClick={handlePlay}
          >
            {clipUrl && (
              <video
                src={`${clipUrl}#t=0.1`}
                preload="metadata"
                muted
                playsInline
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}
            {/* Play overlay */}
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.35)',
              }}
            >
              <PlayArrow sx={{ fontSize: 64, color: 'white', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }} />
            </Box>
          </Box>
        ) : (
          <Box sx={{ position: 'relative', width: '100%', height: '100%' }}>
            <video
              ref={videoRef}
              src={streamUrl}
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
        {clipMetadata ? (
          <>
            <Typography variant="caption" color="text.secondary" display="block">
              Clip: {formatTime(clipMetadata.start_time)} - {formatTime(clipMetadata.end_time)}
              {' • '}
              {formatDuration(clipMetadata.start_time, clipMetadata.end_time)}
            </Typography>
            <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.68rem' }}>
              Moment: {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
              {' • '}
              {formatDuration(moment.start_time, moment.end_time)}
            </Typography>
            {(clipMetadata.resolution || clipMetadata.file_size_kb) && (
              <Typography variant="caption" color="text.disabled" display="block" sx={{ fontSize: '0.68rem' }}>
                {[
                  clipMetadata.resolution,
                  clipMetadata.file_size_kb
                    ? `${(clipMetadata.file_size_kb / 1024).toFixed(1)} MB`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' • ')}
              </Typography>
            )}
          </>
        ) : (
          <Typography variant="caption" color="text.secondary">
            {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
            {' • '}
            Duration: {formatDuration(moment.start_time, moment.end_time)}
          </Typography>
        )}
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
        <Button
          size="small"
          startIcon={<Subject />}
          onClick={handleToggleTranscript}
          sx={{ fontSize: '0.75rem' }}
          color={showTranscript ? 'primary' : 'inherit'}
        >
          Transcript
        </Button>
      </CardActions>

      {/* Transcript Panel */}
      <Collapse in={showTranscript}>
        <Box
          ref={transcriptContainerRef}
          sx={{ px: 1.5, pb: 1.5, maxHeight: 200, overflowY: 'auto' }}
        >
          {transcriptLoading && <CircularProgress size={20} />}
          {transcriptError && (
            <Typography variant="caption" color="error">
              {transcriptError}
            </Typography>
          )}
          {transcriptData && transcriptData.words && transcriptData.words.length > 0 && (
            <Typography variant="body2" sx={{ lineHeight: 1.8 }}>
              {transcriptData.words.map((word, idx) => {
                const isActive = playing && currentTime >= word.start && currentTime < word.end;
                return (
                  <span
                    key={idx}
                    ref={isActive ? activeWordRef : null}
                    style={{
                      backgroundColor: isActive ? 'rgba(25, 118, 210, 0.2)' : 'transparent',
                      fontWeight: isActive ? 600 : 400,
                      padding: '1px 2px',
                      borderRadius: 2,
                      transition: 'background-color 0.15s',
                    }}
                  >
                    {word.word}{' '}
                  </span>
                );
              })}
            </Typography>
          )}
          {transcriptData && (!transcriptData.words || transcriptData.words.length === 0) && (
            <Typography variant="caption" color="text.secondary">
              No transcript available
            </Typography>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default ClipCard;
