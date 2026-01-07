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
} from '@mui/material';
import { ExpandMore, Settings } from '@mui/icons-material';

const ConfigurationSection = ({ config, onConfigChange, disabled }) => {
  const handleChange = (field, value) => {
    onConfigChange({
      ...config,
      [field]: value,
    });
  };

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
          {/* Model and Temperature */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              AI Model Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth>
                <InputLabel>Model</InputLabel>
                <Select
                  value={config.model}
                  onChange={(e) => handleChange('model', e.target.value)}
                  label="Model"
                  disabled={disabled}
                >
                  <MenuItem value="qwen3_vl_fp8">Qwen3-VL-FP8 (Full Pipeline)</MenuItem>
                  <MenuItem value="minimax">MiniMax M2 (Skip Clips)</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Temperature"
                type="number"
                value={config.temperature}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                disabled={disabled}
                helperText="Controls randomness (0.0-2.0)"
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
            </Box>
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
                    checked={config.include_video_refinement}
                    onChange={(e) => handleChange('include_video_refinement', e.target.checked)}
                    disabled={disabled}
                  />
                }
                label="Include Video in Refinement"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default ConfigurationSection;


