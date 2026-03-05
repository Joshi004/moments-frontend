import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  LinearProgress,
  Alert,
  Chip,
  Button,
} from '@mui/material';
import { Cancel } from '@mui/icons-material';
import {
  STAGE_ORDER,
  SUB_STAGE_LABELS,
  formatDuration,
  formatBytes,
  getStepIcon,
  getStepStatus,
} from '../utils/pipelineHelpers';
import useElapsedTime from '../hooks/useElapsedTime';

/**
 * Shared pipeline progress stepper component.
 * Displays all 8 pipeline stages with progress bars, status, and timing info.
 * Includes all features from both PipelineProgressModal and ProgressSection.
 */
const PipelineProgressStepper = ({
  status,
  currentStage,
  stages,
  error,
  totalDuration,
  startedAt,
  videoId,
  requestId,
  onCancel,
}) => {
  const isComplete = status === 'completed';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';
  const isRunning = status === 'processing' || status === 'queued' || status === 'pending';

  const elapsedTime = useElapsedTime(isRunning ? startedAt : null);

  const getActiveStep = () => {
    if (!currentStage) {
      return -1;
    }
    return STAGE_ORDER.findIndex((stage) => stage.key === currentStage);
  };

  return (
    <Box>
      {/* Header with title and IDs */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">Pipeline Progress</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isRunning && (
              <Chip
                label={`Elapsed: ${formatDuration(elapsedTime)}`}
                size="small"
                color="primary"
                variant="outlined"
              />
            )}
            {(isComplete || isFailed || isCancelled) && totalDuration && (
              <Chip
                label={`Total: ${formatDuration(totalDuration)}`}
                size="small"
                color={isComplete ? 'success' : 'default'}
                variant="outlined"
              />
            )}
          </Box>
        </Box>

        {/* Video and Request IDs */}
        {videoId && (
          <Typography variant="body2" color="text.secondary">
            Video ID: <strong>{videoId}</strong>
          </Typography>
        )}
        {requestId && (
          <Typography variant="body2" color="text.secondary">
            Request ID: <strong>{requestId}</strong>
          </Typography>
        )}
      </Box>

      {/* Status Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isComplete && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Pipeline completed successfully!
        </Alert>
      )}

      {isFailed && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Pipeline failed. Check the steps below for details.
        </Alert>
      )}

      {isCancelled && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Pipeline was cancelled.
        </Alert>
      )}

      {/* Indeterminate progress bar while running */}
      {isRunning && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Vertical Stepper with all 8 stages */}
      <Stepper activeStep={getActiveStep()} orientation="vertical">
        {STAGE_ORDER.map((stage) => {
          const stageData = stages[stage.key];
          const stepStatus = getStepStatus(stage.key, stages);
          const StageIcon = stage.icon;

          return (
            <Step key={stage.key} expanded>
              <StepLabel
                icon={getStepIcon(stage.key, stages)}
                optional={
                  stageData && stageData.duration_seconds ? (
                    <Typography variant="caption">
                      {formatDuration(stageData.duration_seconds)}
                    </Typography>
                  ) : null
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <StageIcon sx={{ fontSize: 18 }} />
                  <Typography variant="subtitle2">{stage.label}</Typography>
                  <Chip
                    label={stepStatus.label}
                    size="small"
                    color={stepStatus.color}
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              </StepLabel>
              <StepContent>
                {/* Skip reason */}
                {stageData && stageData.skipped && stageData.skip_reason && (
                  <Box sx={{ pl: 2, py: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Reason: {stageData.skip_reason}
                    </Typography>
                  </Box>
                )}

                {/* Error message */}
                {stageData && stageData.error && (
                  <Box sx={{ pl: 2, py: 1 }}>
                    <Alert severity="error" sx={{ py: 0 }}>
                      {stageData.error}
                    </Alert>
                  </Box>
                )}

                {/* Sub-stage label */}
                {stageData && stageData.status === 'processing' && stageData.sub_stage && (
                  <Box sx={{ pl: 2, py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                      {SUB_STAGE_LABELS[stageData.sub_stage] || stageData.sub_stage}
                    </Typography>
                  </Box>
                )}

                {/* Sub-stage download progress (for hidden downloads inside non-download stages) */}
                {stageData && stageData.status === 'processing' &&
                 (stageData.sub_stage === 'downloading_video' || stageData.sub_stage === 'downloading') &&
                 stage.key !== 'download' &&
                 stageData.progress?.total_bytes && (
                  <Box sx={{ pl: 2, py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatBytes(stageData.progress.bytes_downloaded || 0)} / {formatBytes(stageData.progress.total_bytes)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stageData.progress.percentage || 0}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {stageData.progress.percentage || 0}%
                    </Typography>
                  </Box>
                )}

                {/* Download Progress */}
                {stage.key === 'download' && stageData && stageData.progress && 
                 stageData.progress.total_bytes && (
                  <Box sx={{ pl: 2, py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Downloading: {formatBytes(stageData.progress.bytes_downloaded || 0)} / {formatBytes(stageData.progress.total_bytes)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stageData.progress.percentage || 0}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                      {stageData.progress.percentage || 0}%
                    </Typography>
                  </Box>
                )}

                {/* Audio Upload Progress */}
                {stage.key === 'audio_upload' && stageData && stageData.progress && 
                 stageData.progress.total_bytes && (
                  <Box sx={{ pl: 2, py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {formatBytes(stageData.progress.bytes_uploaded || 0)} / {formatBytes(stageData.progress.total_bytes)}
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={stageData.progress.percentage || 0}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                )}

                {/* Clip Extraction Progress */}
                {stage.key === 'clips' && stageData && stageData.progress && 
                 stageData.progress.total && (
                  <Box sx={{ pl: 2, py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {stageData.progress.processed === stageData.progress.total
                        ? stageData.progress.failed > 0
                          ? `Extracted ${stageData.progress.processed - stageData.progress.failed} of ${stageData.progress.total} clips (${stageData.progress.failed} failed)`
                          : `All ${stageData.progress.total} clips extracted`
                        : `Extracting clip ${stageData.progress.processed} of ${stageData.progress.total}...`
                      }
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(stageData.progress.processed / stageData.progress.total) * 100}
                      color={stageData.progress.failed > 0 ? "warning" : "primary"}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                )}

                {/* Refinement Progress */}
                {stage.key === 'refinement' && stageData && stageData.progress && 
                 stageData.progress.total && (
                  <Box sx={{ pl: 2, py: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {stageData.progress.processed === stageData.progress.total
                        ? stageData.progress.failed > 0
                          ? `Refined ${stageData.progress.successful} of ${stageData.progress.total} moments (${stageData.progress.failed} failed)`
                          : `All ${stageData.progress.total} moments refined`
                        : `Refining moment ${stageData.progress.processed} of ${stageData.progress.total}...`
                      }
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(stageData.progress.processed / stageData.progress.total) * 100}
                      color={stageData.progress.failed > 0 ? "warning" : "primary"}
                      sx={{ height: 6, borderRadius: 1 }}
                    />
                  </Box>
                )}
              </StepContent>
            </Step>
          );
        })}
      </Stepper>

      {/* Cancel button when running */}
      {isRunning && onCancel && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Cancel />}
            onClick={onCancel}
          >
            Cancel Pipeline
          </Button>
        </Box>
      )}
    </Box>
  );
};

PipelineProgressStepper.propTypes = {
  // Required - data from usePipelineStatus hook
  status: PropTypes.string,
  currentStage: PropTypes.string,
  stages: PropTypes.object,
  error: PropTypes.string,
  totalDuration: PropTypes.number,
  startedAt: PropTypes.string,

  // Identity
  videoId: PropTypes.string,
  requestId: PropTypes.string,

  // Actions
  onCancel: PropTypes.func,
};

PipelineProgressStepper.defaultProps = {
  stages: {},
  error: null,
  totalDuration: null,
  startedAt: null,
  requestId: null,
  onCancel: null,
};

export default PipelineProgressStepper;
