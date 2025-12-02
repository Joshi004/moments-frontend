import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import { ContentCut } from '@mui/icons-material';

const ExtractClipsModal = ({ open, onClose, onExtract, video, isExtracting }) => {
  const [overrideExisting, setOverrideExisting] = useState(true);
  const [submitError, setSubmitError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setOverrideExisting(true);
      setSubmitError('');
    }
  }, [open]);

  const handleExtract = () => {
    setSubmitError('');
    
    const config = {
      override_existing: overrideExisting,
    };

    onExtract(config);
  };

  const handleClose = () => {
    if (!isExtracting) {
      setOverrideExisting(true);
      setSubmitError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ContentCut />
          <span>Extract Moment Clips</span>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {submitError && (
            <Alert severity="error">{submitError}</Alert>
          )}

          {/* Information Section */}
          <Box>
            <Typography variant="body2" color="text.secondary" paragraph>
              This will extract video clips for all original moments. Padding (30 seconds on each side) is configured in the backend and aligned to word boundaries from the transcript.
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Each clip will be saved as: <code style={{ backgroundColor: '#f5f5f5', padding: '2px 6px', borderRadius: '4px' }}>
                {'<video>_<moment_id>_clip.mp4'}
              </code>
            </Typography>
          </Box>

          {/* Override Option */}
          <Box>
            <FormControlLabel
              control={
                <Checkbox
                  checked={overrideExisting}
                  onChange={(e) => setOverrideExisting(e.target.checked)}
                  disabled={isExtracting}
                />
              }
              label="Override existing clips"
            />
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', ml: 4 }}>
              If unchecked, existing clips will be skipped. If checked, they will be replaced.
            </Typography>
          </Box>

          {/* What happens next */}
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              What happens next?
            </Typography>
            <Typography variant="body2" color="text.secondary" component="ul" sx={{ pl: 2, mt: 1 }}>
              <li>Extract clips for all <strong>original moments</strong> (refined moments are skipped)</li>
              <li>Apply 30s padding on each side, aligned to word boundaries from transcript</li>
              <li>Save clips to <code>static/moment_clips/</code> directory</li>
              <li>Use FFmpeg for fast extraction (no re-encoding)</li>
            </Typography>
          </Box>

          {isExtracting && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
              <CircularProgress size={24} color="inherit" />
              <Typography variant="body2">
                Extracting clips... This may take a few minutes depending on the number of moments.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isExtracting}>
          Cancel
        </Button>
        <Button
          onClick={handleExtract}
          variant="contained"
          color="primary"
          disabled={isExtracting}
          startIcon={isExtracting ? <CircularProgress size={16} /> : <ContentCut />}
        >
          {isExtracting ? 'Extracting...' : 'Extract Clips'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExtractClipsModal;

