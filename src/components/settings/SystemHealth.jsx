import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { checkHealth } from '../../services/api';

const SystemHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseTime, setResponseTime] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = async () => {
    setLoading(true);
    const start = Date.now();
    try {
      const data = await checkHealth();
      const endTime = Date.now();
      setResponseTime(endTime - start);
      setHealth(data);
      setLastChecked(new Date());
    } catch (err) {
      setHealth({ status: 'error', message: 'Backend unreachable' });
      setResponseTime(null);
      setLastChecked(new Date());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, []);

  const isHealthy = health?.status === 'ok' || health?.status === 'healthy';
  const isError = health?.status === 'error';

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">System Health</Typography>
        <Button
          startIcon={<RefreshIcon />}
          onClick={checkStatus}
          disabled={loading}
          variant="outlined"
        >
          Refresh
        </Button>
      </Box>

      {loading && !health ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Status Card */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Backend Status
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              {isHealthy ? (
                <>
                  <Chip
                    icon={<CheckCircle />}
                    label="Connected"
                    color="success"
                    size="medium"
                  />
                  {responseTime && (
                    <Typography variant="body2" color="text.secondary">
                      Response time: {responseTime}ms
                    </Typography>
                  )}
                </>
              ) : (
                <Chip
                  icon={<ErrorIcon />}
                  label="Disconnected"
                  color="error"
                  size="medium"
                />
              )}
            </Box>
          </Box>

          {lastChecked && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="caption" color="text.secondary">
                Last checked: {lastChecked.toLocaleString()}
              </Typography>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Health Data Display */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Health Data
            </Typography>
            {health ? (
              <Box
                component="pre"
                sx={{
                  mt: 2,
                  p: 2,
                  bgcolor: 'grey.100',
                  borderRadius: 1,
                  overflow: 'auto',
                  fontSize: '0.875rem',
                  fontFamily: 'monospace',
                }}
              >
                {JSON.stringify(health, null, 2)}
              </Box>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                No health data available
              </Alert>
            )}
          </Box>

          {isError && health?.message && (
            <Alert severity="error" sx={{ mt: 3 }}>
              {health.message}
            </Alert>
          )}
        </>
      )}
    </Paper>
  );
};

export default SystemHealth;
