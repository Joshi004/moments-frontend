import React from 'react';
import { Chip, Box } from '@mui/material';
import {
  CheckCircle,
  Error,
  HourglassEmpty,
  AutoAwesome,
  Upload,
  Transcribe,
  ContentCut,
  TuneOutlined,
} from '@mui/icons-material';
import { getSubStageBriefLabel } from '../utils/pipelineHelpers';

const STAGE_ICONS = {
  audio: HourglassEmpty,
  audio_upload: Upload,
  transcript: Transcribe,
  generation: AutoAwesome,
  clips: ContentCut,
  refinement: TuneOutlined,
};

const STAGE_LABELS = {
  audio: 'Extracting Audio',
  audio_upload: 'Uploading Audio',
  transcript: 'Transcribing',
  generation: 'Generating Moments',
  clips: 'Processing Clips',
  refinement: 'Refining',
};

const PipelineStatusBadge = ({ status, currentStage, subStage, onClick }) => {
  if (!status || status === 'never_run' || status === 'not_running') {
    return null;
  }

  // Determine if this is a historical run (no current stage and terminal status)
  const isHistorical = !currentStage && 
    (status === 'completed' || status === 'failed' || status === 'cancelled');

  // Hide old successful runs but keep failures visible for user awareness
  if (isHistorical && status === 'completed') {
    return null;
  }

  const getBadgeColor = () => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      case 'cancelled':
        return 'warning';
      case 'pending':
      case 'queued':
        return 'default';
      case 'processing':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getBadgeIcon = () => {
    if (status === 'completed') {
      return <CheckCircle sx={{ fontSize: 16 }} />;
    }
    if (status === 'failed') {
      return <Error sx={{ fontSize: 16 }} />;
    }
    if (status === 'processing' && currentStage) {
      const Icon = STAGE_ICONS[currentStage] || HourglassEmpty;
      return <Icon sx={{ fontSize: 16 }} />;
    }
    return <HourglassEmpty sx={{ fontSize: 16 }} />;
  };

  const getBadgeLabel = () => {
    if (status === 'completed') {
      return 'Completed';
    }
    if (status === 'failed') {
      return 'Failed';
    }
    if (status === 'cancelled') {
      return 'Cancelled';
    }
    if (status === 'queued' || status === 'pending') {
      return 'Queued';
    }
    if (status === 'processing' && currentStage) {
      const label = STAGE_LABELS[currentStage] || 'Processing';
      if (subStage) {
        const brief = getSubStageBriefLabel(subStage);
        return brief ? `${label} (${brief})` : label;
      }
      return label;
    }
    return 'Processing';
  };

  const isProcessing = status === 'processing';

  return (
    <Box
      sx={{
        position: 'absolute',
        bottom: 8,
        right: 8,
        zIndex: 10,
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) {
          onClick();
        }
      }}
    >
      <Chip
        icon={getBadgeIcon()}
        label={getBadgeLabel()}
        color={getBadgeColor()}
        size="small"
        sx={{
          cursor: 'pointer',
          fontWeight: 500,
          fontSize: '0.75rem',
          animation: isProcessing ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : 'none',
          '@keyframes pulse': {
            '0%, 100%': {
              opacity: 1,
            },
            '50%': {
              opacity: 0.7,
            },
          },
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s ease-in-out',
          },
        }}
      />
    </Box>
  );
};

export default PipelineStatusBadge;





