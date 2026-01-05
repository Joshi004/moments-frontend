import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  Alert,
  LinearProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  SkipNext,
  Cancel,
  HourglassEmpty,
  Upload,
  Transcribe,
  AutoAwesome,
  ContentCut,
  TuneOutlined,
} from '@mui/icons-material';
import usePipelineStatus from '../hooks/usePipelineStatus';

const STAGE_ORDER = [
  { key: 'audio', label: 'Audio Extraction', icon: HourglassEmpty },
  { key: 'audio_upload', label: 'Audio Upload', icon: Upload },
  { key: 'transcript', label: 'Transcription', icon: Transcribe },
  { key: 'generation', label: 'Moment Generation', icon: AutoAwesome },
  { key: 'clips', label: 'Clip Extraction', icon: ContentCut },
  { key: 'clip_upload', label: 'Clip Upload', icon: Upload },
  { key: 'refinement', label: 'Moment Refinement', icon: TuneOutlined },
];

const formatDuration = (seconds) => {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const PipelineProgressModal = ({ open, onClose, videoId, onCancel }) => {
  const { status, currentStage, stages, error, totalDuration } = usePipelineStatus(videoId, open);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [startTime, setStartTime] = useState(null);

  useEffect(() => {
    if (status === 'processing' || status === 'queued' || status === 'pending') {
      if (!startTime) {
        setStartTime(Date.now());
      }
      const interval = setInterval(() => {
        if (startTime) {
          setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  const getActiveStep = () => {
    if (!currentStage) {
      return -1;
    }
    return STAGE_ORDER.findIndex((stage) => stage.key === currentStage);
  };

  const getStepIcon = (stageKey) => {
    const stageStatus = stages[stageKey];
    if (!stageStatus) {
      return <HourglassEmpty sx={{ fontSize: 20, color: 'text.secondary' }} />;
    }

    if (stageStatus.status === 'completed') {
      return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
    }
    if (stageStatus.status === 'failed') {
      return <Error sx={{ fontSize: 20, color: 'error.main' }} />;
    }
    if (stageStatus.status === 'skipped') {
      return <SkipNext sx={{ fontSize: 20, color: 'warning.main' }} />;
    }
    if (stageStatus.status === 'processing') {
      return <CircularProgress size={20} />;
    }
    return <HourglassEmpty sx={{ fontSize: 20, color: 'text.secondary' }} />;
  };

  const getStepStatus = (stageKey) => {
    const stageStatus = stages[stageKey];
    if (!stageStatus) {
      return { color: 'default', label: 'Pending' };
    }

    switch (stageStatus.status) {
      case 'completed':
        return { color: 'success', label: 'Completed' };
      case 'failed':
        return { color: 'error', label: 'Failed' };
      case 'skipped':
        return { color: 'warning', label: 'Skipped' };
      case 'processing':
        return { color: 'primary', label: 'Processing' };
      default:
        return { color: 'default', label: 'Pending' };
    }
  };

  const isComplete = status === 'completed';
  const isFailed = status === 'failed';
  const isCancelled = status === 'cancelled';
  const isRunning = status === 'processing' || status === 'queued' || status === 'pending';

  const handleClose = () => {
    if (isRunning) {
      // Warn before closing
      if (window.confirm('Pipeline is still running. Close this window? (Pipeline will continue in background)')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel the pipeline?')) {
      onCancel();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Pipeline Progress</Typography>
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
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
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

          {isRunning && (
            <Box sx={{ mb: 2 }}>
              <LinearProgress />
            </Box>
          )}

          <Stepper activeStep={getActiveStep()} orientation="vertical">
            {STAGE_ORDER.map((stage) => {
              const stageData = stages[stage.key];
              const stepStatus = getStepStatus(stage.key);
              const StageIcon = stage.icon;

              return (
                <Step key={stage.key} expanded>
                  <StepLabel
                    icon={getStepIcon(stage.key)}
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
                    {stageData && stageData.skipped && stageData.skip_reason && (
                      <Box sx={{ pl: 2, py: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Reason: {stageData.skip_reason}
                        </Typography>
                      </Box>
                    )}
                    {stageData && stageData.error && (
                      <Box sx={{ pl: 2, py: 1 }}>
                        <Alert severity="error" sx={{ py: 0 }}>
                          {stageData.error}
                        </Alert>
                      </Box>
                    )}
                  </StepContent>
                </Step>
              );
            })}
          </Stepper>
        </Box>
      </DialogContent>
      <DialogActions>
        {isRunning && (
          <Button onClick={handleCancel} color="error" startIcon={<Cancel />}>
            Cancel Pipeline
          </Button>
        )}
        <Button onClick={handleClose} variant={isRunning ? 'outlined' : 'contained'}>
          {isRunning ? 'Close (Continue in Background)' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PipelineProgressModal;





