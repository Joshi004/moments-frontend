import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  LinearProgress,
  Button,
  Chip,
  Stack,
  Link as MuiLink,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { STAGE_ORDER, formatDuration } from '../../utils/pipelineHelpers';
import PipelineConfirmDialog from '../PipelineConfirmDialog';

const ActivePipelineCard = ({ pipelineStatus, videoInfo, onCancel }) => {
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (!pipelineStatus) return null;

  const {
    video_id: videoId,
    status,
    current_stage: currentStage,
    stages = {},
    elapsed_time: elapsedTime,
  } = pipelineStatus;

  const filename = videoInfo?.filename || videoId;

  // Calculate overall progress based on completed stages
  const completedStages = STAGE_ORDER.filter(
    (stage) => stages[stage.key]?.status === 'completed'
  ).length;
  const totalStages = STAGE_ORDER.length;
  const progressPercentage = Math.round((completedStages / totalStages) * 100);

  // Get current stage label
  const currentStageLabel = STAGE_ORDER.find((s) => s.key === currentStage)?.label || 'Processing';

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    setCancelDialogOpen(false);
    if (onCancel) {
      await onCancel(videoId);
    }
  };

  return (
    <>
      <Card
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow 0.2s',
          '&:hover': {
            boxShadow: 3,
          },
        }}
      >
        <CardContent>
          {/* Header: filename + elapsed time */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <MuiLink
              component={RouterLink}
              to={`/videos/${videoId}`}
              underline="hover"
              sx={{ fontWeight: 600, fontSize: '0.9rem', flex: 1, mr: 1 }}
            >
              {filename}
            </MuiLink>
            <Chip
              label={`Elapsed: ${formatDuration(elapsedTime || 0)}`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>

          {/* Progress bar */}
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="caption" color="text.secondary">
                {currentStageLabel}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                {progressPercentage}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: 'action.hover',
              }}
            />
          </Box>

          {/* Stage indicators - small chips */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Pipeline Stages
            </Typography>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {STAGE_ORDER.map((stage) => {
                const stageData = stages[stage.key];
                const isCompleted = stageData?.status === 'completed';
                const isActive = stage.key === currentStage;
                const isSkipped = stageData?.status === 'skipped';
                const isFailed = stageData?.status === 'failed';

                let chipColor = 'default';
                let chipVariant = 'outlined';

                if (isFailed) {
                  chipColor = 'error';
                  chipVariant = 'filled';
                } else if (isCompleted) {
                  chipColor = 'success';
                  chipVariant = 'filled';
                } else if (isActive) {
                  chipColor = 'primary';
                  chipVariant = 'filled';
                } else if (isSkipped) {
                  chipColor = 'warning';
                  chipVariant = 'outlined';
                }

                return (
                  <Chip
                    key={stage.key}
                    label={stage.key}
                    size="small"
                    color={chipColor}
                    variant={chipVariant}
                    sx={{
                      height: 20,
                      fontSize: '0.65rem',
                      textTransform: 'uppercase',
                      animation: isActive ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
                      '@keyframes pulse': {
                        '0%, 100%': {
                          opacity: 1,
                        },
                        '50%': {
                          opacity: 0.7,
                        },
                      },
                    }}
                  />
                );
              })}
            </Stack>
          </Box>

          {/* Actions */}
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              size="small"
              component={RouterLink}
              to={`/videos/${videoId}`}
            >
              View Video
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleCancelClick}
            >
              Cancel
            </Button>
          </Box>
        </CardContent>
      </Card>

      <PipelineConfirmDialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleCancelConfirm}
        title="Cancel Pipeline"
        message={`Are you sure you want to cancel the pipeline for "${filename}"? This action cannot be undone.`}
      />
    </>
  );
};

export default ActivePipelineCard;
