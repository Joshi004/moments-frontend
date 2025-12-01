import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  Collapse,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Stack,
} from '@mui/material';
import {
  ExpandMore,
  Settings,
  Psychology,
  Speed,
  Tune,
} from '@mui/icons-material';

const MomentConfigDisplay = ({ generationConfig }) => {
  const [expanded, setExpanded] = useState(false);

  if (!generationConfig) {
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
  } = generationConfig;

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
    <Box sx={{ mt: 1 }}>
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded(!expanded)}
        sx={{
          boxShadow: 'none',
          border: '1px solid',
          borderColor: 'divider',
          '&:before': { display: 'none' },
          '&.Mui-expanded': {
            margin: 0,
          },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            minHeight: 36,
            '&.Mui-expanded': {
              minHeight: 36,
            },
            '& .MuiAccordionSummary-content': {
              margin: '8px 0',
              '&.Mui-expanded': {
                margin: '8px 0',
              },
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Settings sx={{ fontSize: '0.9rem', opacity: 0.7 }} />
            <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.75rem' }}>
              Configuration
            </Typography>
            <Box sx={{ flex: 1 }} />
            <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
              <Chip
                label={modelDisplay.name}
                size="small"
                color={modelDisplay.color}
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: '18px' }}
              />
              <Chip
                label={`Temp: ${temperature !== undefined ? temperature.toFixed(1) : 'N/A'}`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: '18px' }}
              />
              {isGeneration && (
                <Chip
                  label="Generation"
                  size="small"
                  color="primary"
                  variant="outlined"
                  icon={<Psychology sx={{ fontSize: '0.7rem !important' }} />}
                  sx={{ fontSize: '0.65rem', height: '18px' }}
                />
              )}
              {isRefinement && (
                <Chip
                  label="Refinement"
                  size="small"
                  color="success"
                  variant="outlined"
                  icon={<Tune sx={{ fontSize: '0.7rem !important' }} />}
                  sx={{ fontSize: '0.65rem', height: '18px' }}
                />
              )}
            </Stack>
          </Box>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 1, pb: 1 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {/* Model and Temperature */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, fontSize: '0.7rem' }}>
                Model Settings
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                <Chip
                  label={`Model: ${modelDisplay.name}`}
                  size="small"
                  color={modelDisplay.color}
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
                <Chip
                  label={`Temperature: ${temperature !== undefined ? temperature.toFixed(2) : 'N/A'}`}
                  size="small"
                  sx={{ fontSize: '0.7rem', height: '20px' }}
                />
              </Box>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Generation Parameters */}
            {isGeneration && (
              <>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, fontSize: '0.7rem' }}>
                    Generation Parameters
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {min_moment_length !== undefined && (
                      <Chip
                        label={`Min Length: ${min_moment_length}s`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                    {max_moment_length !== undefined && (
                      <Chip
                        label={`Max Length: ${max_moment_length}s`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                    {min_moments !== undefined && (
                      <Chip
                        label={`Min Moments: ${min_moments}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                    {max_moments !== undefined && (
                      <Chip
                        label={`Max Moments: ${max_moments}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                  </Box>
                </Box>
                <Divider sx={{ my: 0.5 }} />
              </>
            )}

            {/* Refinement Parameters */}
            {isRefinement && (
              <>
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, fontSize: '0.7rem' }}>
                    Refinement Parameters
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    {left_padding !== undefined && (
                      <Chip
                        label={`Left Padding: ${left_padding}s`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                    {right_padding !== undefined && (
                      <Chip
                        label={`Right Padding: ${right_padding}s`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                  </Box>
                </Box>
                <Divider sx={{ my: 0.5 }} />
              </>
            )}

            {/* User Prompt */}
            {user_prompt && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                  User Prompt
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    maxHeight: '150px',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.7rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0,
                      opacity: 0.9,
                    }}
                  >
                    {user_prompt}
                  </Typography>
                </Box>
              </Box>
            )}

            {/* Complete Prompt (Expandable) */}
            {complete_prompt && complete_prompt !== user_prompt && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 600, opacity: 0.8, fontSize: '0.7rem', mb: 0.5, display: 'block' }}>
                  Complete Prompt (with system instructions)
                </Typography>
                <Box
                  sx={{
                    p: 1,
                    bgcolor: 'action.hover',
                    borderRadius: 1,
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  <Typography
                    variant="caption"
                    component="pre"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.65rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      margin: 0,
                      opacity: 0.8,
                    }}
                  >
                    {complete_prompt}
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default MomentConfigDisplay;



