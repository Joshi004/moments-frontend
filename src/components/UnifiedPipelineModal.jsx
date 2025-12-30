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
import { ExpandMore } from '@mui/icons-material';

const DEFAULT_GENERATION_PROMPT = `Analyze the following video transcript and identify the most important, engaging, or valuable moments. Each moment should represent a distinct topic, insight, or highlight that would be meaningful to viewers.

Generate moments that:
- Capture key insights, turning points, or memorable segments
- Have clear, descriptive titles (5-15 words)
- Represent complete thoughts or concepts
- Are non-overlapping and well-spaced throughout the video`;

const DEFAULT_REFINEMENT_PROMPT = `Review and refine the timestamp boundaries for this moment to ensure they capture the complete thought or segment accurately.`;

const UnifiedPipelineModal = ({ open, onClose, onStart, video }) => {
  const [model, setModel] = useState('qwen3_vl_fp8');
  const [temperature, setTemperature] = useState(0.7);
  const [minMomentLength, setMinMomentLength] = useState(60);
  const [maxMomentLength, setMaxMomentLength] = useState(120);
  const [minMoments, setMinMoments] = useState(3);
  const [maxMoments, setMaxMoments] = useState(10);
  const [refinementParallelWorkers, setRefinementParallelWorkers] = useState(2);
  const [includeVideoRefinement, setIncludeVideoRefinement] = useState(true);
  const [generationPrompt, setGenerationPrompt] = useState(DEFAULT_GENERATION_PROMPT);
  const [refinementPrompt, setRefinementPrompt] = useState(DEFAULT_REFINEMENT_PROMPT);
  const [useCustomPrompts, setUseCustomPrompts] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setModel('qwen3_vl_fp8');
      setTemperature(0.7);
      setMinMomentLength(60);
      setMaxMomentLength(120);
      setMinMoments(3);
      setMaxMoments(10);
      setRefinementParallelWorkers(2);
      setIncludeVideoRefinement(true);
      setGenerationPrompt(DEFAULT_GENERATION_PROMPT);
      setRefinementPrompt(DEFAULT_REFINEMENT_PROMPT);
      setUseCustomPrompts(false);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};

    const minLen = parseFloat(minMomentLength);
    const maxLen = parseFloat(maxMomentLength);
    const minNum = parseInt(minMoments);
    const maxNum = parseInt(maxMoments);
    const temp = parseFloat(temperature);
    const workers = parseInt(refinementParallelWorkers);

    if (isNaN(minLen) || minLen <= 0) {
      newErrors.minMomentLength = 'Min moment length must be greater than 0';
    }

    if (isNaN(maxLen) || maxLen <= 0) {
      newErrors.maxMomentLength = 'Max moment length must be greater than 0';
    }

    if (!isNaN(minLen) && !isNaN(maxLen) && minLen >= maxLen) {
      newErrors.maxMomentLength = 'Max moment length must be greater than min moment length';
    }

    if (isNaN(minNum) || minNum <= 0) {
      newErrors.minMoments = 'Min moments must be greater than 0';
    }

    if (isNaN(maxNum) || maxNum <= 0) {
      newErrors.maxMoments = 'Max moments must be greater than 0';
    }

    if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
      newErrors.maxMoments = 'Max moments must be >= min moments';
    }

    if (isNaN(temp) || temp < 0 || temp > 2) {
      newErrors.temperature = 'Temperature must be between 0.0 and 2.0';
    }

    if (isNaN(workers) || workers < 1 || workers > 5) {
      newErrors.refinementParallelWorkers = 'Workers must be between 1 and 5';
    }

    if (!model || (model !== 'minimax' && model !== 'qwen3_vl_fp8')) {
      newErrors.model = 'Please select a valid model';
    }

    if (useCustomPrompts) {
      if (!generationPrompt.trim()) {
        newErrors.generationPrompt = 'Generation prompt cannot be empty';
      }
      if (!refinementPrompt.trim()) {
        newErrors.refinementPrompt = 'Refinement prompt cannot be empty';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStart = () => {
    if (!validate()) {
      return;
    }

    const config = {
      model: model,
      temperature: parseFloat(temperature),
      min_moment_length: parseFloat(minMomentLength),
      max_moment_length: parseFloat(maxMomentLength),
      min_moments: parseInt(minMoments),
      max_moments: parseInt(maxMoments),
      refinement_parallel_workers: parseInt(refinementParallelWorkers),
      include_video_refinement: includeVideoRefinement,
      generation_prompt: useCustomPrompts ? generationPrompt.trim() : null,
      refinement_prompt: useCustomPrompts ? refinementPrompt.trim() : null,
    };

    onStart(config);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Process All - Unified Pipeline</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
          <Alert severity="info">
            This will run the complete pipeline: Audio Extraction → Audio Upload → Transcription → Moment Generation → Clip Extraction → Clip Upload → Moment Refinement
          </Alert>

          {/* Model and Temperature */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              AI Model Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth error={!!errors.model}>
                <InputLabel>Model</InputLabel>
                <Select
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  label="Model"
                >
                  <MenuItem value="qwen3_vl_fp8">Qwen3-VL-FP8 (Full Pipeline)</MenuItem>
                  <MenuItem value="minimax">MiniMax M2 (Skip Clips)</MenuItem>
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
                value={minMomentLength}
                onChange={(e) => setMinMomentLength(e.target.value)}
                error={!!errors.minMomentLength}
                helperText={errors.minMomentLength}
                inputProps={{ min: 10, max: 300, step: 1 }}
              />
              <TextField
                label="Max Moment Length (seconds)"
                type="number"
                value={maxMomentLength}
                onChange={(e) => setMaxMomentLength(e.target.value)}
                error={!!errors.maxMomentLength}
                helperText={errors.maxMomentLength}
                inputProps={{ min: 30, max: 600, step: 1 }}
              />
              <TextField
                label="Min Moments"
                type="number"
                value={minMoments}
                onChange={(e) => setMinMoments(e.target.value)}
                error={!!errors.minMoments}
                helperText={errors.minMoments}
                inputProps={{ min: 1, max: 50 }}
              />
              <TextField
                label="Max Moments"
                type="number"
                value={maxMoments}
                onChange={(e) => setMaxMoments(e.target.value)}
                error={!!errors.maxMoments}
                helperText={errors.maxMoments}
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
                value={refinementParallelWorkers}
                onChange={(e) => setRefinementParallelWorkers(e.target.value)}
                error={!!errors.refinementParallelWorkers}
                helperText={errors.refinementParallelWorkers || 'Number of parallel refinement tasks'}
                inputProps={{ min: 1, max: 5 }}
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={includeVideoRefinement}
                    onChange={(e) => setIncludeVideoRefinement(e.target.checked)}
                  />
                }
                label="Include Video in Refinement"
                sx={{ mt: 1 }}
              />
            </Box>
          </Box>

          {/* Custom Prompts (Optional) */}
          <Accordion expanded={useCustomPrompts} onChange={(e, expanded) => setUseCustomPrompts(expanded)}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Custom Prompts (Optional)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Generation Prompt"
                  multiline
                  rows={6}
                  value={generationPrompt}
                  onChange={(e) => setGenerationPrompt(e.target.value)}
                  error={!!errors.generationPrompt}
                  helperText={errors.generationPrompt || 'Custom prompt for moment generation'}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    },
                  }}
                />
                <TextField
                  label="Refinement Prompt"
                  multiline
                  rows={4}
                  value={refinementPrompt}
                  onChange={(e) => setRefinementPrompt(e.target.value)}
                  error={!!errors.refinementPrompt}
                  helperText={errors.refinementPrompt || 'Custom prompt for moment refinement'}
                  fullWidth
                  sx={{
                    '& .MuiInputBase-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                    },
                  }}
                />
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Info Section */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2">Pipeline Stages</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary" paragraph>
                The pipeline will execute the following stages:
              </Typography>
              <Typography component="ol" variant="body2" color="text.secondary" sx={{ pl: 2 }}>
                <li>Audio Extraction - Extract WAV audio from video</li>
                <li>Audio Upload - Upload audio to remote server via SCP</li>
                <li>Transcription - Generate transcript using Parakeet</li>
                <li>Moment Generation - AI generates moments from transcript</li>
                {model === 'qwen3_vl_fp8' && (
                  <>
                    <li>Clip Extraction - Extract video clips for each moment</li>
                    <li>Clip Upload - Upload clips to remote server via SCP</li>
                  </>
                )}
                {model === 'minimax' && (
                  <li style={{ color: 'gray', fontStyle: 'italic' }}>Clip stages skipped (MiniMax does not support video)</li>
                )}
                <li>Moment Refinement - AI refines moment timestamps</li>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, fontStyle: 'italic' }}>
                Note: Stages that already have output files will be automatically skipped.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleStart} variant="contained" color="primary">
          Start Pipeline
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UnifiedPipelineModal;



