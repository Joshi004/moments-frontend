import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  LinearProgress,
  Button,
  Stack,
  Chip,
  Link as MuiLink,
} from '@mui/material';
import { Timeline } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { getActivePipelines } from '../../services/api';
import { SUB_STAGE_LABELS, formatDuration } from '../../utils/pipelineHelpers';

const STAGE_LABELS = {
  download: 'Downloading',
  audio: 'Extracting Audio',
  audio_upload: 'Uploading Audio',
  transcript: 'Transcribing',
  generation: 'Generating Moments',
  clips: 'Processing Clips',
  refinement: 'Refining Moments',
};

const ActivePipelinesWidget = ({ videos = [], initialActivePipelines = [] }) => {
  const navigate = useNavigate();
  const [activePipelines, setActivePipelines] = useState(initialActivePipelines);
  // Tick counter used only to trigger re-renders every second for elapsed time display
  const [, setTick] = useState(0);

  // Polling effect for active pipelines
  useEffect(() => {
    if (activePipelines.length === 0) return;

    const pollInterval = setInterval(async () => {
      try {
        const result = await getActivePipelines();
        const updated = result.map((p) => ({ ...p, videoId: p.video_id }));
        setActivePipelines(updated);
      } catch (err) {
        console.error('Error polling active pipelines:', err);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }, [activePipelines.length]);

  // Single tick interval to refresh elapsed time display every second
  useEffect(() => {
    if (activePipelines.length === 0) return;
    const tickInterval = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(tickInterval);
  }, [activePipelines.length]);

  const getVideoFilename = (videoId) => {
    const video = videos.find(v => v.id === videoId);
    return video?.filename || video?.id || 'Unknown';
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Timeline />
        <Typography variant="h6" sx={{ fontWeight: 600, flex: 1 }}>
          Active Pipelines
        </Typography>
        {activePipelines.length > 0 && (
          <Chip
            label={activePipelines.length}
            color="primary"
            size="small"
          />
        )}
      </Box>

      {activePipelines.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Timeline sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            No active pipelines running
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {activePipelines.map((pipeline) => {
            const filename = getVideoFilename(pipeline.videoId);
            const stageLabel = STAGE_LABELS[pipeline.current_stage] || 'Processing';
            const elapsed = pipeline.started_at
              ? Math.max(0, Math.floor((Date.now() - new Date(pipeline.started_at).getTime()) / 1000))
              : 0;
            const currentStageData = pipeline.stages?.[pipeline.current_stage];
            const subStage = currentStageData?.sub_stage;
            const subStageLabel = subStage ? SUB_STAGE_LABELS[subStage] : null;

            return (
              <Box
                key={pipeline.videoId}
                sx={{
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: 'background.paper',
                  transition: 'background-color 0.2s',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  },
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                    {filename}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/videos/${pipeline.videoId}`)}
                    sx={{ ml: 1 }}
                  >
                    View
                  </Button>
                </Box>
                
                <Box sx={{ mb: 1 }}>
                  <LinearProgress
                    sx={{
                      height: 6,
                      borderRadius: 1,
                      backgroundColor: 'action.hover',
                    }}
                  />
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      {stageLabel}
                    </Typography>
                    {subStageLabel && (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'block' }}>
                        {subStageLabel}
                      </Typography>
                    )}
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    Elapsed: {formatDuration(elapsed)}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Stack>
      )}

      {activePipelines.length > 0 && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <MuiLink
            component={RouterLink}
            to="/pipelines"
            underline="hover"
            sx={{ fontSize: '0.875rem', fontWeight: 500 }}
          >
            View All Pipelines
          </MuiLink>
        </Box>
      )}
    </Paper>
  );
};

export default ActivePipelinesWidget;
