import React, { useState } from 'react';
import { Paper, Box, Button, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '@mui/material';
import { Cancel as CancelIcon } from '@mui/icons-material';
import usePipelineStatus from '../../hooks/usePipelineStatus';
import PipelineProgressStepper from '../PipelineProgressStepper';

const ProgressSection = ({ videoId, requestId, onCancel }) => {
  const { status, currentStage, stages, error, totalDuration, startedAt } = usePipelineStatus(videoId, true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

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
          startedAt={startedAt}
          videoId={videoId}
          requestId={requestId}
          onCancel={onCancel}
        />

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
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

