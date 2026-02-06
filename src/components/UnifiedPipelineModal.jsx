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
  Checkbox,
  Tooltip,
} from '@mui/material';
import { ExpandMore, Warning as WarningIcon } from '@mui/icons-material';
import { DEFAULT_GENERATION_PROMPT } from '../constants/prompts';

const UnifiedPipelineModal = ({ open, onClose, onStart, video }) => {
  // Per-phase model selection
  const [generationModel, setGenerationModel] = useState('qwen3_vl_fp8');
  const [refinementModel, setRefinementModel] = useState('qwen3_vl_fp8');
  const [generationTemperature, setGenerationTemperature] = useState(0.7);
  const [refinementTemperature, setRefinementTemperature] = useState(0.7);
  const [minMomentLength, setMinMomentLength] = useState(60);
  const [maxMomentLength, setMaxMomentLength] = useState(120);
  const [minMoments, setMinMoments] = useState(3);
  const [maxMoments, setMaxMoments] = useState(10);
  const [refinementParallelWorkers, setRefinementParallelWorkers] = useState(2);
  const [includeVideoRefinement, setIncludeVideoRefinement] = useState(true);
  const [generationPrompt, setGenerationPrompt] = useState(DEFAULT_GENERATION_PROMPT);
  const [useCustomPrompts, setUseCustomPrompts] = useState(false);
  const [overrideExistingMoments, setOverrideExistingMoments] = useState(false);
  const [overrideExistingRefinement, setOverrideExistingRefinement] = useState(false);
  const [errors, setErrors] = useState({});

  // Derived - check if refinement model supports video
  const refinementSupportsVideo = refinementModel === 'qwen3_vl_fp8';

  useEffect(() => {
    if (open) {
      // Reset form when modal opens
      setGenerationModel('qwen3_vl_fp8');
      setRefinementModel('qwen3_vl_fp8');
      setGenerationTemperature(0.7);
      setRefinementTemperature(0.7);
      setMinMomentLength(60);
      setMaxMomentLength(120);
      setMinMoments(3);
      setMaxMoments(10);
      setRefinementParallelWorkers(2);
      setIncludeVideoRefinement(true);
      setGenerationPrompt(DEFAULT_GENERATION_PROMPT);
      setUseCustomPrompts(false);
      setOverrideExistingMoments(false);
      setOverrideExistingRefinement(false);
      setErrors({});
    }
  }, [open]);

  const validate = () => {
    const newErrors = {};

    const minLen = parseFloat(minMomentLength);
    const maxLen = parseFloat(maxMomentLength);
    const minNum = parseInt(minMoments);
    const maxNum = parseInt(maxMoments);
    const genTemp = parseFloat(generationTemperature);
    const refTemp = parseFloat(refinementTemperature);
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

    if (isNaN(genTemp) || genTemp < 0 || genTemp > 2) {
      newErrors.generationTemperature = 'Temperature must be between 0.0 and 2.0';
    }

    if (isNaN(refTemp) || refTemp < 0 || refTemp > 2) {
      newErrors.refinementTemperature = 'Temperature must be between 0.0 and 2.0';
    }

    if (isNaN(workers) || workers < 1 || workers > 5) {
      newErrors.refinementParallelWorkers = 'Workers must be between 1 and 5';
    }

    if (!generationModel || (generationModel !== 'minimax' && generationModel !== 'qwen3_vl_fp8')) {
      newErrors.generationModel = 'Please select a valid generation model';
    }

    if (!refinementModel || (refinementModel !== 'minimax' && refinementModel !== 'qwen3_vl_fp8')) {
      newErrors.refinementModel = 'Please select a valid refinement model';
    }

    if (useCustomPrompts) {
      if (!generationPrompt.trim()) {
        newErrors.generationPrompt = 'Generation prompt cannot be empty';
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
      generation_model: generationModel,
      refinement_model: refinementModel,
      generation_temperature: parseFloat(generationTemperature),
      refinement_temperature: parseFloat(refinementTemperature),
      min_moment_length: parseFloat(minMomentLength),
      max_moment_length: parseFloat(maxMomentLength),
      min_moments: parseInt(minMoments),
      max_moments: parseInt(maxMoments),
      refinement_parallel_workers: parseInt(refinementParallelWorkers),
      include_video_refinement: refinementSupportsVideo && includeVideoRefinement,
      generation_prompt: useCustomPrompts ? generationPrompt.trim() : null,
      override_existing_moments: overrideExistingMoments,
      override_existing_refinement: overrideExistingRefinement,
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

          {/* Model and Temperature - Generation Phase */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Generation Phase - AI Model Configuration
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
              <FormControl fullWidth error={!!errors.generationModel}>
                <InputLabel>Generation Model</InputLabel>
                <Select
                  value={generationModel}
                  onChange={(e) => setGenerationModel(e.target.value)}
                  label="Generation Model"
                >
                  <MenuItem value="qwen3_vl_fp8">Qwen3-VL-FP8</MenuItem>
                  <MenuItem value="minimax">MiniMax M2</MenuItem>
                </Select>
                {errors.generationModel && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.generationModel}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label="Generation Temperature"
                type="number"
                value={generationTemperature}
                onChange={(e) => setGenerationTemperature(e.target.value)}
                error={!!errors.generationTemperature}
                helperText={errors.generationTemperature || 'Controls randomness (0.0-2.0)'}
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
              <FormControl fullWidth error={!!errors.refinementModel}>
                <InputLabel>Refinement Model</InputLabel>
                <Select
                  value={refinementModel}
                  onChange={(e) => setRefinementModel(e.target.value)}
                  label="Refinement Model"
                >
                  <MenuItem value="qwen3_vl_fp8">Qwen3-VL-FP8 (with video)</MenuItem>
                  <MenuItem value="minimax">MiniMax M2 (text only)</MenuItem>
                </Select>
                {errors.refinementModel && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.refinementModel}
                  </Typography>
                )}
              </FormControl>
              <TextField
                label="Refinement Temperature"
                type="number"
                value={refinementTemperature}
                onChange={(e) => setRefinementTemperature(e.target.value)}
                error={!!errors.refinementTemperature}
                helperText={errors.refinementTemperature || 'Controls randomness (0.0-2.0)'}
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
                    checked={refinementSupportsVideo && includeVideoRefinement}
                    onChange={(e) => setIncludeVideoRefinement(e.target.checked)}
                    disabled={!refinementSupportsVideo}
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

          {/* Override Options */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Override Options
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={overrideExistingMoments}
                    onChange={(e) => setOverrideExistingMoments(e.target.checked)}
                  />
                }
                label="Regenerate moments even if they exist"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={overrideExistingRefinement}
                    onChange={(e) => setOverrideExistingRefinement(e.target.checked)}
                  />
                }
                label="Re-refine all moments (including already refined)"
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
                <li>Moment Generation - AI generates moments from transcript ({generationModel})</li>
                {refinementSupportsVideo && (
                  <>
                    <li>Clip Extraction - Extract video clips for each moment</li>
                    <li>Clip Upload - Upload clips to remote server via SCP</li>
                  </>
                )}
                {!refinementSupportsVideo && (
                  <li style={{ color: 'gray', fontStyle: 'italic' }}>Clip stages skipped (refinement model does not support video)</li>
                )}
                <li>Moment Refinement - AI refines moment timestamps ({refinementModel})</li>
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





