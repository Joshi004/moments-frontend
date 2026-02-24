import React, { useRef, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  useTheme,
} from '@mui/material';
import { PlayArrow, MoreVert, Info, Delete } from '@mui/icons-material';

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDuration = (startTime, endTime) => {
  const duration = endTime - startTime;
  const mins = Math.floor(duration / 60);
  const secs = Math.floor(duration % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getModelName = (moment) => {
  const model = moment.generation_config?.model || moment.model_name;
  if (!model) return null;
  
  const modelLower = model.toLowerCase();
  if (modelLower === 'minimax') return 'MiniMax';
  if (modelLower === 'qwen') return 'Qwen3-VL';
  if (modelLower === 'qwen3_omni') return 'Qwen3-Omini';
  if (modelLower === 'qwen3_vl_fp8') return 'Qwen3-VL-FP8';
  return model;
};

const MomentCard = ({
  moment,
  isActive,
  onClick,
  onDeleteClick,
  onConfigClick,
}) => {
  const theme = useTheme();
  const cardRef = useRef(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    // Auto-scroll active moment into view
    if (isActive && cardRef.current) {
      cardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isActive]);

  const handleCardClick = () => {
    onClick(moment.start_time);
  };

  const handleMenuOpen = (e) => {
    e.stopPropagation();
    setMenuAnchorEl(e.currentTarget);
  };

  const handleMenuClose = (e) => {
    if (e) e.stopPropagation();
    setMenuAnchorEl(null);
  };

  const handleConfigClick = (e) => {
    e.stopPropagation();
    handleMenuClose();
    onConfigClick(moment.generation_config, moment.title);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    setDeleteDialogOpen(false);
    onDeleteClick(moment);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  const showConfigOption = !!moment.generation_config;

  return (
    <>
      <Box ref={cardRef} sx={{ mb: 1.5 }}>
        <Card
          onClick={handleCardClick}
          sx={{
            cursor: 'pointer',
            backgroundColor: isActive ? 'rgba(99, 102, 241, 0.08)' : 'background.paper',
            color: 'text.primary',
            border: '1px solid',
            borderColor: 'divider',
            borderLeft: isActive ? `4px solid ${theme.palette.primary.main}` : '1px solid',
            borderLeftColor: isActive ? theme.palette.primary.main : 'divider',
            boxShadow: isActive ? '0 2px 8px rgba(99, 102, 241, 0.15)' : 'none',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isActive 
                ? '0 2px 12px rgba(99, 102, 241, 0.2)' 
                : theme.shadows[2],
              backgroundColor: isActive 
                ? 'rgba(99, 102, 241, 0.12)' 
                : 'action.hover',
            },
          }}
          elevation={isActive ? 2 : 1}
        >
          <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
            {/* Header Row */}
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
              <Typography
                variant="h6"
                component="h3"
                sx={{
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '1rem',
                  lineHeight: 1.3,
                  flex: 1,
                  minWidth: 0,
                  pr: 2,
                }}
              >
                {moment.title}
              </Typography>
              
              {/* Action Buttons */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
                <PlayArrow sx={{ opacity: isActive ? 1 : 0.5, ml: 0.5 }} />
              </Box>
            </Box>

            {/* Timestamp and Duration */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontFamily: 'monospace',
                  opacity: isActive ? 0.9 : 0.7,
                  fontSize: '0.875rem',
                }}
              >
                {formatTime(moment.start_time)} - {formatTime(moment.end_time)}
              </Typography>
              
              <Typography
                variant="body2"
                sx={{
                  opacity: isActive ? 0.8 : 0.6,
                  fontSize: '0.75rem',
                }}
              >
                Duration: {formatDuration(moment.start_time, moment.end_time)}
              </Typography>
            </Box>

            {/* Model Chip */}
            {getModelName(moment) && (
              <Box>
                <Chip
                  label={getModelName(moment)}
                  size="small"
                  variant="outlined"
                  sx={{
                    fontSize: '0.7rem',
                    height: '20px',
                    opacity: 0.8,
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Three-dot menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onClick={(e) => e.stopPropagation()}
      >
        {showConfigOption && (
          <MenuItem onClick={handleConfigClick}>
            <Info fontSize="small" sx={{ mr: 1 }} />
            View Config
          </MenuItem>
        )}
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onClick={(e) => e.stopPropagation()}
      >
        <DialogTitle>Delete Moment?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{moment.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default MomentCard;
