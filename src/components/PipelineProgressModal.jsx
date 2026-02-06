import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import usePipelineStatus from '../hooks/usePipelineStatus';
import PipelineProgressStepper from './PipelineProgressStepper';

const PipelineProgressModal = ({ open, onClose, videoId, onCancel }) => {
  const { status, currentStage, stages, error, totalDuration } = usePipelineStatus(videoId, open);

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
      <DialogContent sx={{ pt: 3 }}>
        <PipelineProgressStepper
          status={status}
          currentStage={currentStage}
          stages={stages}
          error={error}
          totalDuration={totalDuration}
          videoId={videoId}
          onCancel={handleCancel}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant={isRunning ? 'outlined' : 'contained'}>
          {isRunning ? 'Close (Continue in Background)' : 'Close'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PipelineProgressModal;


