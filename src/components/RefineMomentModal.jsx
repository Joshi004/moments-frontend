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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const DEFAULT_PROMPT = `Before refining the timestamps, let's define what a moment is: A moment is a segment of a video (with its corresponding transcript) that represents something engaging, meaningful, or valuable to the viewer. A moment should be a complete, coherent thought or concept that makes sense on its own.

Now, analyze the word-level transcript and identify the precise start and end timestamps for this moment. The current timestamps may be slightly off. Find the exact point where this topic/segment naturally begins and ends.

Guidelines:
- Start the moment at the first word that introduces the topic or begins the engaging segment
- End the moment at the last word that concludes the thought or completes the concept
- Be precise with word boundaries
- Ensure the moment captures complete sentences or phrases
- The refined moment should represent a coherent, engaging segment that makes complete sense on its own`;

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

const RefineMomentModal = ({ open, onClose, onRefine, moment, isRefining }) => {
  const [userPrompt, setUserPrompt] = useState(DEFAULT_PROMPT);
  const [leftPadding, setLeftPadding] = useState(30);
  const [rightPadding, setRightPadding] = useState(30);
  const [model, setModel] = useState('minimax');
  const [temperature, setTemperature] = useState(0.7);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setUserPrompt(DEFAULT_PROMPT);
      setLeftPadding(30);
      setRightPadding(30);
      setModel('minimax');
      setTemperature(0.7);
      setErrors({});
      setSubmitError('');
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};

    // Validate prompt
    if (!userPrompt.trim()) {
      newErrors.userPrompt = 'Prompt cannot be empty';
    }

    // Validate padding
    const leftPad = parseFloat(leftPadding);
    const rightPad = parseFloat(rightPadding);
    
    if (isNaN(leftPad) || leftPad < 0) {
      newErrors.leftPadding = 'Left padding must be >= 0';
    }
    
    if (isNaN(rightPad) || rightPad < 0) {
      newErrors.rightPadding = 'Right padding must be >= 0';
    }

    // Validate temperature
    const temp = parseFloat(temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      newErrors.temperature = 'Temperature must be between 0.0 and 2.0';
    }

    // Validate model
    if (!model || (model !== 'minimax' && model !== 'qwen' && model !== 'qwen3_omni')) {
      newErrors.model = 'Please select a valid model';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRefine = () => {
    setSubmitError('');
    
    if (!validate()) {
      return;
    }

    const config = {
      user_prompt: userPrompt.trim(),
      left_padding: parseFloat(leftPadding),
      right_padding: parseFloat(rightPadding),
      model: model,
      temperature: parseFloat(temperature),
    };

    onRefine(config);
  };

  const handleClose = () => {
    if (!isRefining) {
      setUserPrompt(DEFAULT_PROMPT);
      setLeftPadding(30);
      setRightPadding(30);
      setModel('minimax');
      setTemperature(0.7);
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  if (!moment) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Refine Moment
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Improve timestamp precision using word-level analysis
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {submitError && (
            <Alert severity="error">{submitError}</Alert>
          )}

          {/* Moment Info */}
          <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Moment
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 500, mb: 1 }}>
              {moment.title}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip 
                label={`Start: ${formatTime(moment.start_time)}`} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label={`End: ${formatTime(moment.end_time)}`} 
                size="small" 
                variant="outlined"
              />
              <Chip 
                label={`Duration: ${formatTime(moment.end_time - moment.start_time)}`} 
                size="small" 
                color="primary"
                variant="outlined"
              />
            </Box>
          </Box>

          {/* Prompt Editor Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Refinement Prompt (Editable)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              This prompt guides the AI in finding precise timestamps. The system will automatically add context about the moment and word-level transcript format.
            </Typography>
            <TextField
              multiline
              rows={8}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              error={!!errors.userPrompt}
              helperText={errors.userPrompt || 'Customize how the AI should refine this moment'}
              fullWidth
              disabled={isRefining}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>

          {/* Padding Controls */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Context Padding (seconds)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
              Include additional words before and after the moment to give the AI more context. This helps ensure precise boundaries.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Left Padding"
                type="number"
                value={leftPadding}
                onChange={(e) => setLeftPadding(e.target.value)}
                error={!!errors.leftPadding}
                helperText={errors.leftPadding || 'Seconds before moment start'}
                disabled={isRefining}
                inputProps={{ min: 0, step: 1 }}
              />
              <TextField
                label="Right Padding"
                type="number"
                value={rightPadding}
                onChange={(e) => setRightPadding(e.target.value)}
                error={!!errors.rightPadding}
                helperText={errors.rightPadding || 'Seconds after moment end'}
                disabled={isRefining}
                inputProps={{ min: 0, step: 1 }}
              />
            </Box>
          </Box>

          {/* Model and Temperature Controls */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              AI Model Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth error={!!errors.model} disabled={isRefining}>
                <InputLabel>Model</InputLabel>
                <Select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  label="Model"
                >
                  <MenuItem value="minimax">MiniMax</MenuItem>
                  <MenuItem value="qwen">Qwen3-VL</MenuItem>
                  <MenuItem value="qwen3_omni">Qwen3-Omini</MenuItem>
                </Select>
                {errors.model && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.model}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label="Temperature"
                type="number"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                error={!!errors.temperature}
                helperText={errors.temperature || 'Controls randomness (0.0-2.0)'}
                disabled={isRefining}
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Info Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">How does refinement work?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" paragraph>
                When you click "Refine Moment", the system will:
              </Typography>
              <Typography component="ul" variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <li>Extract word-level timestamps from the transcript (with padding)</li>
                <li>Provide the AI with precise word boundaries and their timestamps</li>
                <li>Ask the AI to identify the exact start and end points</li>
                <li>Create a new refined moment with improved timestamps</li>
                <li>Keep the original moment for comparison</li>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Note: The refined moment will have the same title but more precise start/end times. Both moments will be visible in the moments list.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {isRefining && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Refining moment... This may take a minute.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isRefining}>
          Cancel
        </Button>
        <Button
          onClick={handleRefine}
          variant="contained"
          color="primary"
          disabled={isRefining}
          startIcon={isRefining ? <CircularProgress size={16} /> : null}
        >
          {isRefining ? 'Refining...' : 'Refine Moment'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RefineMomentModal;

