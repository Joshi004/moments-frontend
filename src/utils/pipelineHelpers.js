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
import { CircularProgress } from '@mui/material';

// All 8 stages -- always shown, download appears as "Skipped" when N/A
export const STAGE_ORDER = [
  { key: 'download', label: 'Video Download', icon: CloudDownload },
  { key: 'audio', label: 'Audio Extraction', icon: HourglassEmpty },
  { key: 'audio_upload', label: 'Audio Upload', icon: Upload },
  { key: 'transcript', label: 'Transcription', icon: Transcribe },
  { key: 'generation', label: 'Moment Generation', icon: AutoAwesome },
  { key: 'clips', label: 'Clip Extraction', icon: ContentCut },
  { key: 'clip_upload', label: 'Clip Upload', icon: Upload },
  { key: 'refinement', label: 'Moment Refinement', icon: TuneOutlined },
];

export const formatDuration = (seconds) => {
  if (!seconds) return '';
  if (seconds < 60) return `${seconds.toFixed(1)}s`;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}m ${secs}s`;
};

export const formatBytes = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const getStepIcon = (stageKey, stages) => {
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

export const getStepStatus = (stageKey, stages) => {
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
