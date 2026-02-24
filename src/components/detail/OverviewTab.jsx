import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Grid,
  IconButton,
  Tooltip,
  Button,
  Divider,
} from '@mui/material';
import {
  ContentCopy,
  AudioFile,
  Transcribe,
  AutoAwesome,
  ContentCut,
  PlayCircleOutline,
} from '@mui/icons-material';
import ProcessingStatusCard from './ProcessingStatusCard';
import { formatDuration } from '../../utils/formatters';

const OverviewTab = ({
  video,
  moments = [],
  transcript,
  onRunPipeline,
}) => {
  const [copiedId, setCopiedId] = useState(false);

  const handleCopyId = () => {
    if (video?.id) {
      navigator.clipboard.writeText(video.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  // Count clips - would need to check video-availability API
  // For now, show moments count as proxy
  const coarseMoments = useMemo(() => moments.filter(m => !m.is_refined), [moments]);
  const clipCount = coarseMoments.length; // Simplified - actual clips need availability check

  return (
    <Box sx={{ p: 3 }}>
      {/* Section 1: Video Metadata */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Video Information
      </Typography>
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Filename
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {video?.filename || 'N/A'}
            </Typography>
          </Box>
          
          <Divider />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Video ID
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                }}
              >
                {video?.id || 'N/A'}
              </Typography>
              <Tooltip title={copiedId ? 'Copied!' : 'Copy ID'}>
                <IconButton size="small" onClick={handleCopyId}>
                  <ContentCopy sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Divider />
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body2" color="text.secondary">
              Duration
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {video?.duration ? formatDuration(video.duration) : 'N/A'}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Section 2: Processing Status */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Processing Status
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <ProcessingStatusCard
            title="Audio"
            icon={<AudioFile />}
            status={video?.has_audio ? 'complete' : 'pending'}
            statusLabel={video?.has_audio ? 'Extracted' : 'Not Extracted'}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ProcessingStatusCard
            title="Transcript"
            icon={<Transcribe />}
            status={video?.has_transcript ? 'complete' : 'pending'}
            statusLabel={video?.has_transcript ? 'Generated' : 'Not Generated'}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ProcessingStatusCard
            title="Moments"
            icon={<AutoAwesome />}
            status={moments.length > 0 ? 'complete' : 'pending'}
            statusLabel={moments.length > 0 ? 'Generated' : 'None'}
            count={moments.length}
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          <ProcessingStatusCard
            title="Clips"
            icon={<ContentCut />}
            status={clipCount > 0 ? 'complete' : 'pending'}
            statusLabel={clipCount > 0 ? 'Extracted' : 'None'}
            count={clipCount}
          />
        </Grid>
      </Grid>

      {/* Section 3: Quick Actions */}
      <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
        Quick Actions
      </Typography>
      <Paper elevation={1} sx={{ p: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayCircleOutline />}
          onClick={onRunPipeline}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Run Full Pipeline
        </Button>
      </Paper>
    </Box>
  );
};

export default OverviewTab;
