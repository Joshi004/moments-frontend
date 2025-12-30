import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Chip,
  Stack,
} from '@mui/material';
import {
  Close,
  Psychology,
  Tune,
} from '@mui/icons-material';

const MomentConfigDrawer = ({ open, onClose, config, momentTitle }) => {
  if (!config) {
    return null;
  }

  const {
    model,
    temperature,
    operation_type,
    user_prompt,
    complete_prompt,
    min_moment_length,
    max_moment_length,
    min_moments,
    max_moments,
    left_padding,
    right_padding,
  } = config;

  const isGeneration = operation_type === 'generation';
  const isRefinement = operation_type === 'refinement';

  // Get model display name and color
  const getModelDisplay = () => {
    if (!model) return { name: 'Unknown', color: 'default' };
    const modelLower = model.toLowerCase();
    if (modelLower === 'minimax') {
      return { name: 'MiniMax', color: 'primary' };
    } else if (modelLower === 'qwen') {
      return { name: 'Qwen3-VL', color: 'success' };
    } else if (modelLower === 'qwen3_omni') {
      return { name: 'Qwen3-Omini', color: 'success' };
    } else if (modelLower === 'qwen3_vl_fp8') {
      return { name: 'Qwen3-VL-FP8', color: 'warning' };
    }
    return { name: model, color: 'default' };
  };

  const modelDisplay = getModelDisplay();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: '450px' },
          maxWidth: '100%',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, pr: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>
              Configuration
            </Typography>
            {momentTitle && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  fontSize: '0.85rem',
                  mt: 0.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {momentTitle}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} edge="end">
            <Close />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {/* Model Settings */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
              Model Settings
            </Typography>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={`Model: ${modelDisplay.name}`}
                  color={modelDisplay.color}
                  sx={{ fontSize: '0.8rem' }}
                />
                <Chip
                  label={`Temperature: ${temperature !== undefined ? temperature.toFixed(2) : 'N/A'}`}
                  variant="outlined"
                  sx={{ fontSize: '0.8rem' }}
                />
              </Box>
            </Stack>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Operation Type */}
          {(isGeneration || isRefinement) && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                  Operation Type
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {isGeneration && (
                    <Chip
                      label="Generation"
                      color="primary"
                      icon={<Psychology />}
                      sx={{ fontSize: '0.8rem' }}
                    />
                  )}
                  {isRefinement && (
                    <Chip
                      label="Refinement"
                      color="success"
                      icon={<Tune />}
                      sx={{ fontSize: '0.8rem' }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Generation Parameters */}
          {isGeneration && (min_moment_length !== undefined || max_moment_length !== undefined || min_moments !== undefined || max_moments !== undefined) && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                  Generation Parameters
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {min_moment_length !== undefined && (
                    <Chip
                      label={`Min Length: ${min_moment_length}s`}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                  {max_moment_length !== undefined && (
                    <Chip
                      label={`Max Length: ${max_moment_length}s`}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                  {min_moments !== undefined && (
                    <Chip
                      label={`Min Moments: ${min_moments}`}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                  {max_moments !== undefined && (
                    <Chip
                      label={`Max Moments: ${max_moments}`}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* Refinement Parameters */}
          {isRefinement && (left_padding !== undefined || right_padding !== undefined) && (
            <>
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                  Refinement Parameters
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {left_padding !== undefined && (
                    <Chip
                      label={`Left Padding: ${left_padding}s`}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                  {right_padding !== undefined && (
                    <Chip
                      label={`Right Padding: ${right_padding}s`}
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  )}
                </Box>
              </Box>

              <Divider sx={{ my: 2 }} />
            </>
          )}

          {/* User Prompt */}
          {user_prompt && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                User Prompt
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  maxHeight: '200px',
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {user_prompt}
                </Typography>
              </Box>
            </Box>
          )}

          {/* Complete Prompt */}
          {complete_prompt && complete_prompt !== user_prompt && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem' }}>
                Complete Prompt
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                Includes system instructions
              </Typography>
              <Box
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  maxHeight: '300px',
                  overflow: 'auto',
                }}
              >
                <Typography
                  variant="body2"
                  component="pre"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.7rem',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    margin: 0,
                  }}
                >
                  {complete_prompt}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Drawer>
  );
};

export default MomentConfigDrawer;




