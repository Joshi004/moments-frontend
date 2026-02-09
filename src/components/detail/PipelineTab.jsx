import React, { useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import { PlayCircleOutline, History } from '@mui/icons-material';
import usePipelineStatus from '../../hooks/usePipelineStatus';
import PipelineProgressStepper from '../PipelineProgressStepper';
import PipelineRunCard from './PipelineRunCard';
import EmptyState from '../common/EmptyState';

const PipelineTab = ({
  videoId,
  video,
  pipelineHistory = [],
  onStartPipeline,
  onCancelPipeline,
  onRefreshHistory,
  isLoadingHistory = false,
}) => {
  // Poll for active pipeline status
  const { status, currentStage, stages, error, totalDuration } = usePipelineStatus(videoId, true);

  const isRunning = status === 'processing' || status === 'queued' || status === 'pending';
  const hasCompleted = status === 'completed' || status === 'failed' || status === 'cancelled';

  // Refresh history and video data when pipeline completes
  useEffect(() => {
    if (hasCompleted && onRefreshHistory) {
      onRefreshHistory();
    }
  }, [hasCompleted, onRefreshHistory]);

  return (
    <Box sx={{ p: 3 }}>
      {/* Run New Pipeline Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<PlayCircleOutline />}
          onClick={onStartPipeline}
          disabled={isRunning}
          fullWidth
          sx={{ py: 1.5 }}
        >
          Run New Pipeline
        </Button>
      </Box>

      {/* Active Pipeline Section */}
      {isRunning && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
            Active Pipeline
          </Typography>
          <Paper elevation={2} sx={{ p: 2 }}>
            <PipelineProgressStepper
              status={status}
              currentStage={currentStage}
              stages={stages}
              error={error}
              totalDuration={totalDuration}
              videoId={videoId}
              onCancel={onCancelPipeline}
            />
          </Paper>
        </Box>
      )}

      {/* Pipeline History Section */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <History />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Pipeline History
          </Typography>
        </Box>

        {pipelineHistory.length === 0 ? (
          <EmptyState
            icon={<History />}
            title="No pipeline history"
            message="No pipelines have been run for this video yet. Click 'Run New Pipeline' to start."
          />
        ) : (
          <Box>
            {pipelineHistory.map((run, index) => (
              <PipelineRunCard
                key={run.request_id || `run-${index}`}
                run={run}
                defaultExpanded={index === 0}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PipelineTab;
