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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';

const DEFAULT_PROMPT = `Analyze the following video transcript and identify the most important, engaging, or valuable moments. Each moment should represent a distinct topic, insight, or highlight that would be meaningful to viewers.

Generate moments that:
- Capture key insights, turning points, or memorable segments
- Have clear, descriptive titles (5-15 words)
- Represent complete thoughts or concepts
- Are non-overlapping and well-spaced throughout the video`;

const GenerateMomentsModal = ({ open, onClose, onGenerate, video, isGenerating }) => {
  const [userPrompt, setUserPrompt] = useState(DEFAULT_PROMPT);
  const [minMomentLength, setMinMomentLength] = useState(60);
  const [maxMomentLength, setMaxMomentLength] = useState(600);
  const [minMoments, setMinMoments] = useState(1);
  const [maxMoments, setMaxMoments] = useState(10);
  const [model, setModel] = useState('qwen3_vl_fp8');
  const [temperature, setTemperature] = useState(0.7);
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (open) {
      setUserPrompt(DEFAULT_PROMPT);
      setMinMomentLength(60);
      setMaxMomentLength(600);
      setMinMoments(1);
      setMaxMoments(10);
      setModel('qwen3_vl_fp8');
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

    // Validate moment length
    const minLen = parseFloat(minMomentLength);
    const maxLen = parseFloat(maxMomentLength);
    
    if (isNaN(minLen) || minLen <= 0) {
      newErrors.minMomentLength = 'Min moment length must be greater than 0';
    }
    
    if (isNaN(maxLen) || maxLen <= 0) {
      newErrors.maxMomentLength = 'Max moment length must be greater than 0';
    }
    
    if (!isNaN(minLen) && !isNaN(maxLen) && minLen >= maxLen) {
      newErrors.maxMomentLength = 'Max moment length must be greater than min moment length';
    }

    // Validate number of moments (no upper limit, user controls this)
    const minNum = parseInt(minMoments);
    const maxNum = parseInt(maxMoments);
    
    if (isNaN(minNum) || minNum <= 0) {
      newErrors.minMoments = 'Min moments must be greater than 0';
    }
    
    if (isNaN(maxNum) || maxNum <= 0) {
      newErrors.maxMoments = 'Max moments must be greater than 0';
    }
    
    if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
      newErrors.maxMoments = 'Max moments must be >= min moments';
    }

    // Validate temperature
    const temp = parseFloat(temperature);
    if (isNaN(temp) || temp < 0 || temp > 2) {
      newErrors.temperature = 'Temperature must be between 0.0 and 2.0';
    }

    // Validate model
    if (!model || (model !== 'minimax' && model !== 'qwen' && model !== 'qwen3_omni' && model !== 'qwen3_vl_fp8')) {
      newErrors.model = 'Please select a valid model';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerate = () => {
    setSubmitError('');
    
    if (!validate()) {
      return;
    }

    const config = {
      user_prompt: userPrompt.trim(),
      min_moment_length: parseFloat(minMomentLength),
      max_moment_length: parseFloat(maxMomentLength),
      min_moments: parseInt(minMoments),
      max_moments: parseInt(maxMoments),
      model: model,
      temperature: parseFloat(temperature),
    };

    onGenerate(config);
  };

  const handleClose = () => {
    if (!isGenerating) {
      setUserPrompt(DEFAULT_PROMPT);
      setMinMomentLength(60);
      setMaxMomentLength(600);
      setMinMoments(1);
      setMaxMoments(10);
      setModel('qwen3_vl_fp8');
      setTemperature(0.7);
      setErrors({});
      setSubmitError('');
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Generate Moments</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          {submitError && (
            <Alert severity="error">{submitError}</Alert>
          )}

          {/* Prompt Editor Section */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Prompt (Editable)
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
              This prompt will be sent to the AI model. The system will automatically add input format instructions and response format requirements.
            </Typography>
            <TextField
              multiline
              rows={10}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              error={!!errors.userPrompt}
              helperText={errors.userPrompt || 'Edit the prompt to customize how moments are generated'}
              fullWidth
              disabled={isGenerating}
              sx={{
                '& .MuiInputBase-root': {
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                },
              }}
            />
          </Box>

          {/* Parameter Controls */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Generation Parameters
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <TextField
                label="Min Moment Length (seconds)"
                type="number"
                value={minMomentLength}
                onChange={(e) => setMinMomentLength(e.target.value)}
                error={!!errors.minMomentLength}
                helperText={errors.minMomentLength || 'Minimum duration for each moment'}
                disabled={isGenerating}
                inputProps={{ min: 1, step: 0.1 }}
              />
              <TextField
                label="Max Moment Length (seconds)"
                type="number"
                value={maxMomentLength}
                onChange={(e) => setMaxMomentLength(e.target.value)}
                error={!!errors.maxMomentLength}
                helperText={errors.maxMomentLength || 'Maximum duration for each moment'}
                disabled={isGenerating}
                inputProps={{ min: 1, step: 0.1 }}
              />
              <TextField
                label="Min Number of Moments"
                type="number"
                value={minMoments}
                onChange={(e) => setMinMoments(e.target.value)}
                error={!!errors.minMoments}
                helperText={errors.minMoments || 'Minimum number of moments to generate'}
                disabled={isGenerating}
                inputProps={{ min: 1 }}
              />
              <TextField
                label="Max Number of Moments"
                type="number"
                value={maxMoments}
                onChange={(e) => setMaxMoments(e.target.value)}
                error={!!errors.maxMoments}
                helperText={errors.maxMoments || 'Maximum number of moments to generate'}
                disabled={isGenerating}
                inputProps={{ min: 1 }}
              />
            </Box>
          </Box>

          {/* Model and Temperature Controls */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              AI Model Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth error={!!errors.model} disabled={isGenerating}>
                <InputLabel>Model</InputLabel>
                <Select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  label="Model"
                >
                  <MenuItem value="minimax" disabled={true}>MiniMax (temporarily disabled)</MenuItem>
                  <MenuItem value="qwen" disabled={true}>Qwen3-VL (temporarily disabled)</MenuItem>
                  <MenuItem value="qwen3_omni" disabled={true}>Qwen3-Omini (temporarily disabled)</MenuItem>
                  <MenuItem value="qwen3_vl_fp8">Qwen3-VL-FP8</MenuItem>
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
                disabled={isGenerating}
                inputProps={{ min: 0, max: 2, step: 0.1 }}
              />
            </Box>
          </Box>

          {/* Info Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">What happens next?</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" paragraph>
                When you click "Generate", the system will:
              </Typography>
              <Typography component="ul" variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <li>Load the video transcript</li>
                <li>Extract segment timestamps and text</li>
                <li>Build a complete prompt with your instructions plus system requirements</li>
                <li>Send the prompt to the AI model via secure connection</li>
                <li>Parse and validate the generated moments</li>
                <li>Replace existing moments with the newly generated ones</li>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Note: The system will automatically add input format explanations and response format requirements to your prompt. These backend instructions ensure the AI model understands the transcript format and returns valid JSON.
              </Typography>
            </AccordionDetails>
          </Accordion>

          {isGenerating && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
              <CircularProgress size={24} />
              <Typography variant="body2" color="text.secondary">
                Generating moments... This may take a few minutes.
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerate}
          variant="contained"
          color="primary"
          disabled={isGenerating}
          startIcon={isGenerating ? <CircularProgress size={16} /> : null}
        >
          {isGenerating ? 'Generating...' : 'Generate Moments'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateMomentsModal;

