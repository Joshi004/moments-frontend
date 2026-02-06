import React from 'react';
import {
  Box,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Alert,
  Tooltip,
} from '@mui/material';
import { ExpandMore, Settings, Warning as WarningIcon } from '@mui/icons-material';

const ConfigurationSection = ({ config, onConfigChange, disabled }) => {
  const handleChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

  // Derived - check if refinement model supports video
  const refinementSupportsVideo = config.refinement_model === 'qwen3_vl_fp8';

  return (
    <Accordion defaultExpanded={false}>
      <AccordionSummary expandIcon={<ExpandMore />}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Settings color="action" />
          <Typography variant="h6">Advanced Options</Typography>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Model and Temperature - Generation Phase */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Generation Phase - AI Model Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Generation Model</InputLabel>
                <Select
                  value={config.generation_model}
                  onChange={(e) => handleChange('generation_model', e.target.value)}
                  label="Generation Model"
                  disabled={disabled}
                >
                  <MenuItem value="qwen3_vl_fp8">Qwen3-VL-FP8</MenuItem>
                  <MenuItem value="minimax">MiniMax M2</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Generation Temperature"
                type="number"
                value={config.generation_temperature}
                onChange={(e) => handleChange('generation_temperature', parseFloat(e.target.value))}
                disabled={disabled}
                helperText="Controls randomness (0.0-2.0)"
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Model and Temperature - Refinement Phase */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Refinement Phase - AI Model Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Refinement Model</InputLabel>
                <Select
                  value={config.refinement_model}
                  onChange={(e) => handleChange('refinement_model', e.target.value)}
                  label="Refinement Model"
                  disabled={disabled}
                >
                  <MenuItem value="qwen3_vl_fp8">Qwen3-VL-FP8 (with video)</MenuItem>
                  <MenuItem value="minimax">MiniMax M2 (text only)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Refinement Temperature"
                type="number"
                value={config.refinement_temperature}
                onChange={(e) => handleChange('refinement_temperature', parseFloat(e.target.value))}
                disabled={disabled}
                helperText="Controls randomness (0.0-2.0)"
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
            </Box>
            
            {/* Warning when refinement model doesn't support video */}
            {!refinementSupportsVideo && (
              <Alert severity="warning" icon={<WarningIcon />} sx={{ mt: 2 }}>
                MiniMax does not support video input. Video clips will not be extracted, 
                and refinement will use transcript only.
              </Alert>
            )}
          </Box>

          {/* Moment Parameters */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Moment Parameters
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <TextField
                label="Min Moment Length (seconds)"
                type="number"
                value={config.min_moment_length}
                onChange={(e) => handleChange('min_moment_length', parseFloat(e.target.value))}
                disabled={disabled}
                inputProps={{ min: 10, max: 300, step: 1 }}
              />
              <TextField
                label="Max Moment Length (seconds)"
                type="number"
                value={config.max_moment_length}
                onChange={(e) => handleChange('max_moment_length', parseFloat(e.target.value))}
                disabled={disabled}
                inputProps={{ min: 30, max: 600, step: 1 }}
              />
              <TextField
                label="Min Moments"
                type="number"
                value={config.min_moments}
                onChange={(e) => handleChange('min_moments', parseInt(e.target.value))}
                disabled={disabled}
                inputProps={{ min: 1, max: 50 }}
              />
              <TextField
                label="Max Moments"
                type="number"
                value={config.max_moments}
                onChange={(e) => handleChange('max_moments', parseInt(e.target.value))}
                disabled={disabled}
                inputProps={{ min: 1, max: 100 }}
              />
            </Box>
          </Box>

          {/* Refinement Settings */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Refinement Settings
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <TextField
                label="Parallel Workers"
                type="number"
                value={config.refinement_parallel_workers}
                onChange={(e) => handleChange('refinement_parallel_workers', parseInt(e.target.value))}
                disabled={disabled}
                helperText="Number of parallel refinement tasks"
                inputProps={{ min: 1, max: 5 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={refinementSupportsVideo && config.include_video_refinement}
                    onChange={(e) => handleChange('include_video_refinement', e.target.checked)}
                    disabled={disabled || !refinementSupportsVideo}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    Include Video in Refinement
                    {!refinementSupportsVideo && (
                      <Tooltip title="Selected refinement model does not support video">
                        <WarningIcon color="warning" fontSize="small" />
                      </Tooltip>
                    )}
                  </Box>
                }
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          {/* Generation Prompt */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Generation Prompt
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              Customize how the AI generates moments from the transcript
            </Typography>
            <TextField
              multiline
              rows={8}
              value={config.generation_prompt || ''}
              onChange={(e) => handleChange('generation_prompt', e.target.value)}
              disabled={disabled}
              helperText="Edit the prompt to customize how moments are generated"
              fullWidth
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ConfigurationSection;


