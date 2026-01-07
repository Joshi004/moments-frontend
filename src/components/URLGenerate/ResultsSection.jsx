import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Alert,
  Snackbar,
  Divider,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Refresh,
  ContentCopy,
  HourglassEmpty,
} from '@mui/icons-material';
import MomentCard from './MomentCard';
import RefinementBanner from './RefinementBanner';

const formatDuration = (seconds) => {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const ResultsSection = ({ 
  videoId, 
  requestId,
  moments, 
  totalDuration, 
  refinementProgress,
  isFullyComplete,
  onReset 
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyAllJSON = () => {
    const json = JSON.stringify(moments, null, 2);
    navigator.clipboard.writeText(json);
    setCopiedAll(true);
  };

  const handleCloseCopied = () => {
    setCopiedAll(false);
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {isFullyComplete ? (
            <CheckCircle color="success" sx={{ fontSize: 32 }} />
          ) : (
            <HourglassEmpty color="primary" sx={{ fontSize: 32 }} />
          )}
          <Box>
            <Typography variant="h6">
              {isFullyComplete ? 'Pipeline Completed Successfully!' : 'Moments Generated!'}
            </Typography>
            {totalDuration && (
              <Typography variant="body2" color="text.secondary">
                Total Duration: {formatDuration(totalDuration)}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Video ID and Request ID Display */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
          <Chip 
            label={`Video: ${videoId}`}
            icon={<ContentCopy />}
            onClick={() => copyToClipboard(videoId, 'video')}
            color={copiedId === 'video' ? 'success' : 'default'}
            variant={copiedId === 'video' ? 'filled' : 'outlined'}
          />
          {requestId && (
            <Chip
              label={copiedId === 'request' ? 'Copied!' : 'Copy Request ID'}
              icon={<ContentCopy />}
              onClick={() => copyToClipboard(requestId, 'request')}
              color={copiedId === 'request' ? 'success' : 'default'}
              variant="outlined"
            />
          )}
        </Box>

        {/* Refinement Banner */}
        <RefinementBanner progress={refinementProgress} isComplete={isFullyComplete} />

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
          Generated Moments ({moments.length})
        </Typography>

        <Box sx={{ mt: 2 }}>
          {moments.length === 0 ? (
            <Alert severity="info">
              No moments were generated for this video.
            </Alert>
          ) : (
            moments.map((moment, index) => (
              <MomentCard key={index} moment={moment} index={index} />
            ))
          )}
        </Box>

        <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          {moments.length > 0 && (
            <Button
              variant="outlined"
              startIcon={<ContentCopy />}
              onClick={handleCopyAllJSON}
            >
              Copy All Moments JSON
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<Refresh />}
            onClick={onReset}
          >
            Process Another Video
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={copiedAll}
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
          All moments JSON copied to clipboard
        </Alert>
      </Snackbar>
    </>
  );
};

export default ResultsSection;


