import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const ProcessAudioModal = ({ open, onClose, video, onProcess }) => {
  const handleProcess = async () => {
    if (!video || !video.id) {
      console.error('ProcessAudioModal: video or video.id is missing', video);
      return;
    }
    
    if (onProcess) {
      console.log('Processing audio for video:', video.id, 'title:', video.title, 'full video object:', video);
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
      <DialogTitle>Process Audio File</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Extract audio from "{video?.title || 'this video'}"?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This will extract the audio track and save it as a WAV file. The process will run in the background.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleProcess} color="primary" variant="contained">
          Process Audio File
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ProcessAudioModal;

