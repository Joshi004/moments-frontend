import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Stack,
  Divider,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import StatusBadge from '../common/StatusBadge';
import { STAGE_ORDER, formatDuration } from '../../utils/pipelineHelpers';

const PipelineRunCard = ({ run, defaultExpanded = false }) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  if (!run) return null;

  const {
    status,
    start_time,
    total_duration_seconds,
    stages = {},
    config = {},
  } = run;

  // Calculate border color based on status
  const getBorderColor = () => {
    switch (status) {
      case 'completed':
        return 'success.main';
      case 'failed':
        return 'error.main';
      case 'cancelled':
        return 'warning.main';
      default:
        return 'divider';
    }
  };

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch {
      return timestamp;
    }
  };

  // Count stages
  const stageKeys = Object.keys(stages);
  const completedStages = stageKeys.filter(key => stages[key]?.status === 'completed').length;
  const totalStages = STAGE_ORDER.length;

  return (
    <Accordion
      expanded={expanded}
      onChange={(e, isExpanded) => setExpanded(isExpanded)}
      sx={{
        borderLeft: '4px solid',
        borderLeftColor: getBorderColor(),
        mb: 1,
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          '& .MuiAccordionSummary-content': {
            alignItems: 'center',
            gap: 2,
          },
        }}
      >
        <StatusBadge status={status} />
        
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatTimestamp(start_time)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {total_duration_seconds ? `Duration: ${formatDuration(total_duration_seconds)}` : 'In progress'}
            {' • '}
            {completedStages}/{totalStages} stages
          </Typography>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2 }} />
        
        {/* Configuration Summary */}
        {config && Object.keys(config).length > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Configuration
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {config.generation_model && (
                <Chip label={`Gen Model: ${config.generation_model}`} size="small" variant="outlined" />
              )}
              {config.refinement_model && (
                <Chip label={`Ref Model: ${config.refinement_model}`} size="small" variant="outlined" />
              )}
              {config.generation_temperature !== undefined && (
                <Chip label={`Gen Temp: ${config.generation_temperature}`} size="small" variant="outlined" />
              )}
              {config.refinement_temperature !== undefined && (
                <Chip label={`Ref Temp: ${config.refinement_temperature}`} size="small" variant="outlined" />
              )}
            </Stack>
          </Box>
        )}
        
        {/* Stage-by-stage breakdown */}
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            Pipeline Stages
          </Typography>
          <Stack spacing={1}>
            {STAGE_ORDER.map((stage) => {
              const stageData = stages[stage.key];
              const StageIcon = stage.icon;
              
              if (!stageData) {
                return (
                  <Box
                    key={stage.key}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'action.hover',
                    }}
                  >
                    <StageIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                      {stage.label}
                    </Typography>
                    <Chip label="Not Run" size="small" variant="outlined" />
                  </Box>
                );
              }

              const stageStatus = stageData.status;
              const stageDuration = stageData.duration_seconds;
              const stageError = stageData.error;
              const skipReason = stageData.skip_reason;

              return (
                <Box
                  key={stage.key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 1,
                    borderRadius: 1,
                    backgroundColor: stageStatus === 'completed' ? 'success.light' : 
                                   stageStatus === 'failed' ? 'error.light' :
                                   stageStatus === 'skipped' ? 'warning.light' : 'action.hover',
                    opacity: stageStatus === 'skipped' ? 0.7 : 1,
                  }}
                >
                  <StageIcon sx={{ fontSize: 20 }} />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {stage.label}
                    </Typography>
                    {stageError && (
                      <Typography variant="caption" color="error" sx={{ display: 'block' }}>
                        Error: {stageError}
                      </Typography>
                    )}
                    {skipReason && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Skipped: {skipReason}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Chip
                      label={stageStatus}
                      size="small"
                      color={stageStatus === 'completed' ? 'success' : 
                             stageStatus === 'failed' ? 'error' :
                             stageStatus === 'skipped' ? 'warning' : 'default'}
                    />
                    {stageDuration !== undefined && stageDuration > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        {formatDuration(stageDuration)}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default PipelineRunCard;
