import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  PlayArrow,
  ContentCopy,
  CheckCircle,
} from '@mui/icons-material';

const formatTimestamp = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (seconds) => {
  if (seconds < 60) return `${Math.floor(seconds)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const MomentCard = ({ moment, index }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJSON = () => {
    const json = JSON.stringify(moment, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
  };

  const handleCloseCopied = () => {
    setCopied(false);
  };

  const duration = moment.end_time - moment.start_time;

  return (
    <>
      <Card variant="outlined" sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  label={`#${index + 1}`}
                  size="small"
                  color="primary"
                  sx={{ fontWeight: 600 }}
                />
                <Typography variant="h6" component="div">
                  {moment.title}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {formatTimestamp(moment.start_time)} - {formatTimestamp(moment.end_time)}
                </Typography>
                <Chip
                  label={formatDuration(duration)}
                  size="small"
                  variant="outlined"
                />
                {moment.virality_score && (
                  <Chip
                    label={`Score: ${moment.virality_score.toFixed(1)}/10`}
                    size="small"
                    color={moment.virality_score >= 8 ? 'success' : moment.virality_score >= 6 ? 'primary' : 'default'}
                  />
                )}
              </Box>

              {moment.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {moment.description}
                </Typography>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
              {moment.clip_url && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PlayArrow />}
                  href={moment.clip_url}
                  target="_blank"
                >
                  Play Clip
                </Button>
              )}
              <IconButton
                size="small"
                onClick={handleCopyJSON}
                color="primary"
                title="Copy JSON"
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={handleCloseCopied}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseCopied}
          severity="success"
          icon={<CheckCircle />}
          sx={{ width: '100%' }}
        >
          Moment JSON copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
};

export default MomentCard;

