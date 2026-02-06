import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material';
import { ExpandMore, Warning, Delete as DeleteIcon } from '@mui/icons-material';

const DeleteVideoModal = ({ open, onClose, video, onDelete, isDeleting }) => {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  
  // Individual keep options
  const [keepOptions, setKeepOptions] = useState({
    // Local files
    keepLocalVideo: false,
    keepLocalAudio: false,
    keepLocalThumbnail: false,
    keepLocalTranscript: false,
    keepLocalMoments: false,
    keepLocalClips: false,
    // GCS
    keepGcsAudio: false,
    keepGcsClips: false,
    // State
    keepRedis: false,
    keepRegistry: false
  });

  const handleCheckboxChange = (option) => {
    setKeepOptions(prev => ({
      ...prev,
      [option]: !prev[option]
    }));
  };

  // Calculate category states
  const getLocalSelectAllState = () => {
    const localOptions = [
      keepOptions.keepLocalVideo,
      keepOptions.keepLocalAudio,
      keepOptions.keepLocalThumbnail,
      keepOptions.keepLocalTranscript,
      keepOptions.keepLocalMoments,
      keepOptions.keepLocalClips
    ];
    const checkedCount = localOptions.filter(Boolean).length;
    if (checkedCount === 0) return { checked: false, indeterminate: false };
    if (checkedCount === localOptions.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const getGcsSelectAllState = () => {
    const gcsOptions = [
      keepOptions.keepGcsAudio,
      keepOptions.keepGcsClips
    ];
    const checkedCount = gcsOptions.filter(Boolean).length;
    if (checkedCount === 0) return { checked: false, indeterminate: false };
    if (checkedCount === gcsOptions.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const getStateSelectAllState = () => {
    const stateOptions = [
      keepOptions.keepRedis,
      keepOptions.keepRegistry
    ];
    const checkedCount = stateOptions.filter(Boolean).length;
    if (checkedCount === 0) return { checked: false, indeterminate: false };
    if (checkedCount === stateOptions.length) return { checked: true, indeterminate: false };
    return { checked: false, indeterminate: true };
  };

  const handleLocalSelectAll = () => {
    const currentState = getLocalSelectAllState();
    const newValue = !currentState.checked;
    setKeepOptions(prev => ({
      ...prev,
      keepLocalVideo: newValue,
      keepLocalAudio: newValue,
      keepLocalThumbnail: newValue,
      keepLocalTranscript: newValue,
      keepLocalMoments: newValue,
      keepLocalClips: newValue
    }));
  };

  const handleGcsSelectAll = () => {
    const currentState = getGcsSelectAllState();
    const newValue = !currentState.checked;
    setKeepOptions(prev => ({
      ...prev,
      keepGcsAudio: newValue,
      keepGcsClips: newValue
    }));
  };

  const handleStateSelectAll = () => {
    const currentState = getStateSelectAllState();
    const newValue = !currentState.checked;
    setKeepOptions(prev => ({
      ...prev,
      keepRedis: newValue,
      keepRegistry: newValue
    }));
  };

  const handleDelete = () => {
    // Pass the keep options to the delete handler
    onDelete(video.id, {
      skipLocalVideo: keepOptions.keepLocalVideo,
      skipLocalAudio: keepOptions.keepLocalAudio,
      skipLocalThumbnail: keepOptions.keepLocalThumbnail,
      skipLocalTranscript: keepOptions.keepLocalTranscript,
      skipLocalMoments: keepOptions.keepLocalMoments,
      skipLocalClips: keepOptions.keepLocalClips,
      skipGcsAudio: keepOptions.keepGcsAudio,
      skipGcsClips: keepOptions.keepGcsClips,
      skipRedis: keepOptions.keepRedis,
      skipRegistry: keepOptions.keepRegistry
    });
  };

  const handleClose = () => {
    if (!isDeleting) {
      // Reset state when closing
      setAdvancedOpen(false);
      setKeepOptions({
        keepLocalVideo: false,
        keepLocalAudio: false,
        keepLocalThumbnail: false,
        keepLocalTranscript: false,
        keepLocalMoments: false,
        keepLocalClips: false,
        keepGcsAudio: false,
        keepGcsClips: false,
        keepRedis: false,
        keepRegistry: false
      });
      onClose();
    }
  };

  if (!video) return null;

  const hasKeepOptions = Object.values(keepOptions).some(v => v);
  const localState = getLocalSelectAllState();
  const gcsState = getGcsSelectAllState();
  const stateState = getStateSelectAllState();

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Delete Video
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Are you sure you want to delete <strong>"{video.title}"</strong>?
        </Typography>
        
        {!hasKeepOptions && (
          <>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 1 }}>
              This will permanently remove:
            </Typography>
            <Box component="ul" sx={{ pl: 3, mt: 0, mb: 2 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Local files (video, audio, thumbnail, transcript, moments, clips)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Cloud storage files (GCS audio and clips)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                Pipeline state (Redis)
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                URL registry entry
              </Typography>
            </Box>
          </>
        )}

        {hasKeepOptions && (
          <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
            Some resources will be preserved based on your advanced options.
          </Alert>
        )}

        <Accordion 
          expanded={advancedOpen} 
          onChange={(e, expanded) => setAdvancedOpen(expanded)}
          sx={{ mt: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="body2" fontWeight="medium">
              Advanced Options
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select resources to keep (not delete):
            </Typography>

            {/* Local Files Section */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={localState.checked}
                    indeterminate={localState.indeterminate}
                    onChange={handleLocalSelectAll}
                    disabled={isDeleting}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="medium">
                    Local Files
                  </Typography>
                }
              />
              <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepLocalVideo}
                      onChange={() => handleCheckboxChange('keepLocalVideo')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Video file (.mp4)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepLocalAudio}
                      onChange={() => handleCheckboxChange('keepLocalAudio')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Audio file (.wav)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepLocalThumbnail}
                      onChange={() => handleCheckboxChange('keepLocalThumbnail')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Thumbnail (.jpg)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepLocalTranscript}
                      onChange={() => handleCheckboxChange('keepLocalTranscript')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Transcript (.json)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepLocalMoments}
                      onChange={() => handleCheckboxChange('keepLocalMoments')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Moments metadata (.json)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepLocalClips}
                      onChange={() => handleCheckboxChange('keepLocalClips')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Video clips</Typography>}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* GCS Section */}
            <Box sx={{ mb: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={gcsState.checked}
                    indeterminate={gcsState.indeterminate}
                    onChange={handleGcsSelectAll}
                    disabled={isDeleting}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="medium">
                    Cloud Storage (GCS)
                  </Typography>
                }
              />
              <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepGcsAudio}
                      onChange={() => handleCheckboxChange('keepGcsAudio')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Audio file</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepGcsClips}
                      onChange={() => handleCheckboxChange('keepGcsClips')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Video clips</Typography>}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* State Section */}
            <Box>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={stateState.checked}
                    indeterminate={stateState.indeterminate}
                    onChange={handleStateSelectAll}
                    disabled={isDeleting}
                  />
                }
                label={
                  <Typography variant="body2" fontWeight="medium">
                    State
                  </Typography>
                }
              />
              <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepRedis}
                      onChange={() => handleCheckboxChange('keepRedis')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">Pipeline state (Redis)</Typography>}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={keepOptions.keepRegistry}
                      onChange={() => handleCheckboxChange('keepRegistry')}
                      disabled={isDeleting}
                    />
                  }
                  label={<Typography variant="body2">URL registry entry</Typography>}
                />
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={isDeleting}
          color="secondary"
        >
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          disabled={isDeleting}
          variant="contained"
          color="error"
          startIcon={isDeleting ? <CircularProgress size={20} /> : <DeleteIcon />}
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteVideoModal;
