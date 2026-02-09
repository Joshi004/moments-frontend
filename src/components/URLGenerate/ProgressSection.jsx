import React, { useState, useEffect } from 'react';
import { Paper, Box, Typography, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import usePipelineStatus from '../../hooks/usePipelineStatus';
import PipelineProgressStepper from '../PipelineProgressStepper';

const ProgressSection = ({ videoId, requestId, onCancel }) => {
  const { status, currentStage, stages, error, totalDuration } = usePipelineStatus(videoId, true);
  const [elapsed, setElapsed] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  // Elapsed time counter
  useEffect(() => {
    const start = Date.now();
    const timer = setInterval(() => {
      setElapsed(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatElapsed = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleCancelClick = () => {
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = () => {
    setCancelDialogOpen(false);
    onCancel();
  };

  return (
    <>
      <Paper elevation={1} sx={{ p: 3, mt: 3 }}>
        <PipelineProgressStepper
          status={status}
          currentStage={currentStage}
          stages={stages}
          error={error}
          totalDuration={totalDuration}
          videoId={videoId}
          requestId={requestId}
          onCancel={onCancel}
        />
        
        {/* Elapsed time and cancel button */}
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Elapsed time: <strong>{formatElapsed(elapsed)}</strong>
          </Typography>
          <Button
            variant="outlined"
            color="error"
            startIcon={<CancelIcon />}
            onClick={handleCancelClick}
            size="small"
          >
            Cancel Pipeline
          </Button>
        </Box>
      </Paper>

      {/* Cancel confirmation dialog */}
      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Pipeline?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this pipeline? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>
            Keep Running
          </Button>
          <Button onClick={handleConfirmCancel} color="error" variant="contained">
            Cancel Pipeline
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ProgressSection;

