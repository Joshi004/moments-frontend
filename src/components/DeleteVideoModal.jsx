import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  RadioGroup,
  Radio,
  FormControlLabel,
  CircularProgress,
} from '@mui/material';
import { Warning, Delete as DeleteIcon } from '@mui/icons-material';

const SCOPE_OPTIONS = [
  {
    value: 'video_file',
    label: 'Delete video file',
    description:
      'Removes the source video and audio from cloud storage. Record, transcript, moments, and clips are preserved.',
  },
  {
    value: 'refined_moments',
    label: 'Delete refined moments',
    description:
      'Removes all refined moments and their clips. Root moments and the video are kept.',
  },
  {
    value: 'moments',
    label: 'Delete moments',
    description:
      'Removes all moments and their clips. Video and transcript are kept. Refined moments are automatically included.',
  },
  {
    value: 'all',
    label: 'Delete everything',
    description:
      'Permanently removes the video, all cloud files, moments, clips, transcript, and pipeline history. This cannot be undone.',
  },
];

const DEFAULT_SCOPE = 'all';

const DeleteVideoModal = ({ open, onClose, video, onDelete, isDeleting }) => {
  const [scope, setScope] = useState(DEFAULT_SCOPE);

  const handleDelete = () => {
    onDelete(video.id, { scope });
  };

  const handleClose = () => {
    if (!isDeleting) {
      setScope(DEFAULT_SCOPE);
      onClose();
    }
  };

  if (!video) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Warning color="warning" />
        Delete Video &mdash; {video.title}
      </DialogTitle>

      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Choose what to delete:
        </Typography>

        <RadioGroup
          value={scope}
          onChange={(e) => setScope(e.target.value)}
        >
          {SCOPE_OPTIONS.map((option) => {
            const isAutoIncluded =
              option.value === 'refined_moments' && scope === 'moments';

            return (
              <Box
                key={option.value}
                sx={{
                  border: '1px solid',
                  borderColor:
                    scope === option.value || isAutoIncluded
                      ? 'primary.main'
                      : 'divider',
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                  mb: 1,
                  opacity: isAutoIncluded ? 0.6 : 1,
                  bgcolor:
                    scope === option.value
                      ? 'action.selected'
                      : 'transparent',
                }}
              >
                <FormControlLabel
                  value={option.value}
                  disabled={isDeleting || isAutoIncluded}
                  control={
                    <Radio
                      size="small"
                      checked={scope === option.value || isAutoIncluded}
                    />
                  }
                  label={
                    <Typography variant="body2" fontWeight="medium">
                      {option.label}
                      {isAutoIncluded && (
                        <Typography
                          component="span"
                          variant="caption"
                          color="text.secondary"
                          sx={{ ml: 1 }}
                        >
                          (auto-included)
                        </Typography>
                      )}
                    </Typography>
                  }
                  sx={{ mb: 0 }}
                />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', pl: 4 }}
                >
                  {option.description}
                </Typography>
              </Box>
            );
          })}
        </RadioGroup>

        <Box
          sx={{
            mt: 2,
            p: 1.5,
            bgcolor: 'error.main',
            color: 'error.contrastText',
            borderRadius: 1,
          }}
        >
          <Typography variant="body2" fontWeight="medium">
            This action is permanent and cannot be undone.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose} disabled={isDeleting} color="secondary">
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
