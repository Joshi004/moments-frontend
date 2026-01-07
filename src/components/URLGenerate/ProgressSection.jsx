import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  CircularProgress,
  LinearProgress,
  Chip,
  Button,
  Alert,
} from '@mui/material';
import {
  CheckCircle,
  Error,
  SkipNext,
  HourglassEmpty,
  CloudDownload,
  Upload,
  Transcribe,
  AutoAwesome,
  ContentCut,
  TuneOutlined,
  Cancel,
} from '@mui/icons-material';
import usePipelineStatus from '../../hooks/usePipelineStatus';

const STAGE_ORDER = [
  { key: 'download', label: 'Video Download', icon: CloudDownload },
  { key: 'audio', label: 'Audio Extraction', icon: HourglassEmpty },
  { key: 'audio_upload', label: 'Audio Upload', icon: Upload },
  { key: 'transcript', label: 'Transcription', icon: Transcribe },
  { key: 'generation', label: 'Moment Generation', icon: AutoAwesome },
  { key: 'clips', label: 'Clip Extraction', icon: ContentCut },
  { key: 'clip_upload', label: 'Clip Upload', icon: Upload },
  { key: 'refinement', label: 'Moment Refinement', icon: TuneOutlined },
];

const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

const formatDuration = (seconds) => {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

const ProgressSection = ({ videoId, requestId, onCancel }) => {
  const { status, currentStage, stages, error } = usePipelineStatus(videoId, true);

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

  const isRunning = status === 'processing' || status === 'queued' || status === 'pending';

  return (
    <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Pipeline Progress
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Video ID: <strong>{videoId}</strong>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Request ID: <strong>{requestId}</strong>
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {isRunning && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {/* Download Progress Bar */}
      {currentStage === 'download' && stages.download && stages.download.progress && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" gutterBottom>
            Downloading: {formatBytes(stages.download.progress.bytes_downloaded)} / {formatBytes(stages.download.progress.total_bytes)}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={stages.download.progress.percentage || 0}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            {stages.download.progress.percentage || 0}%
          </Typography>
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

      {isRunning && (
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
    </Paper>
  );
};

export default ProgressSection;


