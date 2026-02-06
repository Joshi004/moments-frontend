import React from 'react';
import { Paper } from '@mui/material';
import usePipelineStatus from '../../hooks/usePipelineStatus';
import PipelineProgressStepper from '../PipelineProgressStepper';

const ProgressSection = ({ videoId, requestId, onCancel }) => {
  const { status, currentStage, stages, error, totalDuration } = usePipelineStatus(videoId, true);

  return (
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
    </Paper>
  );
};

export default ProgressSection;

