import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const ProcessTranscriptModal = ({ open, onClose, video, onProcess }) => {
  const handleProcess = async () => {
    if (!video || !video.id) {
      console.error('ProcessTranscriptModal: video or video.id is missing', video);
      return;
    }
    
    if (onProcess) {
      console.log('Processing transcript for video:', video.id, 'title:', video.title, 'full video object:', video);
      try {
        await onProcess(video.id);
      } catch (error) {
        console.error('Error in handleProcess:', error);
        // Don't close modal on error, let the error toast handle it
        return;
      }
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Transcript</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Generate transcript from audio for "{video?.title || 'this video'}"?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This will transcribe the audio track using AI. The process will run in the background.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleProcess} color="primary" variant="contained">
          Generate Transcript
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessTranscriptModal;



