import React, { useState } from 'react';
import {
  Paper,
  Box,
  Typography,
  Checkbox,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Close,
  Delete,
  Timeline,
  SelectAll,
} from '@mui/icons-material';

const BulkActionBar = ({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onRunPipeline,
  onCancel,
  allSelected,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pipelineDialogOpen, setPipelineDialogOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDelete();
  };

  const handlePipelineClick = () => {
    setPipelineDialogOpen(true);
  };

  const handlePipelineConfirm = () => {
    setPipelineDialogOpen(false);
    onRunPipeline();
  };

  return (
    <>
      <Paper
        elevation={3}
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          p: 2,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: 2,
        }}
      >
        {/* Select All Checkbox */}
        <Tooltip title={allSelected ? "Deselect all" : "Select all"}>
          <Checkbox
            checked={allSelected}
            indeterminate={selectedCount > 0 && !allSelected}
            onChange={allSelected ? onDeselectAll : onSelectAll}
            sx={{
              color: 'inherit',
              '&.Mui-checked': {
                color: 'inherit',
              },
              '&.MuiCheckbox-indeterminate': {
                color: 'inherit',
              },
            }}
          />
        </Tooltip>

        {/* Selected count text */}
        <Typography variant="body1" sx={{ fontWeight: 600, flex: 1 }}>
          {selectedCount} video{selectedCount !== 1 ? 's' : ''} selected
        </Typography>

        {/* Action buttons */}
        <Button
          variant="outlined"
          startIcon={<Timeline />}
          onClick={handlePipelineClick}
          sx={{
            borderColor: 'inherit',
            color: 'inherit',
            '&:hover': {
              borderColor: 'inherit',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Run Pipeline
        </Button>

        <Button
          variant="outlined"
          startIcon={<Delete />}
          onClick={handleDeleteClick}
          sx={{
            borderColor: 'error.light',
            color: 'error.light',
            '&:hover': {
              borderColor: 'error.light',
              bgcolor: 'rgba(255, 255, 255, 0.1)',
            },
          }}
        >
          Delete
        </Button>

        {/* Cancel button */}
        <Tooltip title="Exit selection mode">
          <IconButton
            onClick={onCancel}
            size="small"
            sx={{
              color: 'inherit',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.1)',
              },
            }}
          >
            <Close />
          </IconButton>
        </Tooltip>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Selected Videos?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedCount} video{selectedCount !== 1 ? 's' : ''}? 
            This action cannot be undone. All associated data (moments, transcripts, clips) will also be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Pipeline Confirmation Dialog */}
      <Dialog open={pipelineDialogOpen} onClose={() => setPipelineDialogOpen(false)}>
        <DialogTitle>Run Pipeline on Selected Videos?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will start the full processing pipeline for {selectedCount} video{selectedCount !== 1 ? 's' : ''}. 
            This may take several minutes depending on video length.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPipelineDialogOpen(false)}>Cancel</Button>
          <Button onClick={handlePipelineConfirm} color="primary" variant="contained">
            Run Pipeline
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default BulkActionBar;
