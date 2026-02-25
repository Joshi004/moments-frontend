import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Box,
  CircularProgress,
  Tooltip,
  Switch,
  FormControlLabel,
  Snackbar,
  DialogContentText,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VpnKeyIcon from '@mui/icons-material/VpnKey';
import RouterIcon from '@mui/icons-material/Router';
import {
  getModelConfigs,
  createModelConfig,
  updateModelConfig,
  deleteModelConfig,
  seedModelConfigs,
} from '../../services/api';

const extractErrorMessage = (err, fallback) => {
  const detail = err.response?.data?.detail;
  if (!detail) return fallback;
  if (Array.isArray(detail)) return detail.map((e) => e.msg || JSON.stringify(e)).join(', ');
  if (typeof detail === 'object') return detail.msg || JSON.stringify(detail);
  return String(detail);
};

/** Returns the effective host and port the connector will actually call for a model row. */
const getActiveEndpoint = (model) => {
  const mode = model.connection_mode || 'tunnel';
  if (mode === 'direct') {
    return {
      host: model.direct_host || '—',
      port: model.direct_port ? String(model.direct_port) : '—',
    };
  }
  return {
    host: model.ssh_remote_host || '—',
    port: model.ssh_local_port ? `localhost:${model.ssh_local_port}` : '—',
  };
};

const EMPTY_FORM = {
  name: '',
  ssh_host: '',
  ssh_remote_host: '',
  ssh_local_port: '',
  ssh_remote_port: '',
  model_id: '',
  supports_video: false,
  top_p: '',
  top_k: '',
  connection_mode: 'tunnel',
  direct_host: '',
  direct_port: '',
};

const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forceSeedDialogOpen, setForceSeedDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getModelConfigs();
      setModels(response.models || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load model configurations'));
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const response = await seedModelConfigs(false);
      setSnackbar({ open: true, message: response.message || 'Defaults seeded successfully', severity: 'success' });
      loadModels();
    } catch (err) {
      setSnackbar({ open: true, message: extractErrorMessage(err, 'Failed to seed defaults'), severity: 'error' });
    }
  };

  const handleForceSeedClick = () => setForceSeedDialogOpen(true);

  const handleForceSeed = async () => {
    setForceSeedDialogOpen(false);
    try {
      const response = await seedModelConfigs(true);
      setSnackbar({ open: true, message: response.message || 'Force-seeded successfully', severity: 'success' });
      loadModels();
    } catch (err) {
      setSnackbar({ open: true, message: extractErrorMessage(err, 'Failed to force-seed'), severity: 'error' });
    }
  };

  const handleEditOpen = (model) => {
    setSelectedModel(model);
    setFormData({
      name: model.name || '',
      ssh_host: model.ssh_host || '',
      ssh_remote_host: model.ssh_remote_host || '',
      ssh_local_port: model.ssh_local_port || '',
      ssh_remote_port: model.ssh_remote_port || '',
      model_id: model.model_id || '',
      supports_video: model.supports_video || false,
      top_p: model.top_p ?? '',
      top_k: model.top_k ?? '',
      connection_mode: model.connection_mode || 'tunnel',
      direct_host: model.direct_host || '',
      direct_port: model.direct_port || '',
    });
    setEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedModel(null);
    setFormData(EMPTY_FORM);
    setEditDialogOpen(true);
  };

  const handleDeleteOpen = (model) => {
    setSelectedModel(model);
    setDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const modelKey = selectedModel?.model_key || formData.model_key;
      if (!modelKey) {
        setSnackbar({ open: true, message: 'Model key is required', severity: 'error' });
        return;
      }

      const mode = formData.connection_mode || 'tunnel';

      // Common fields always sent
      const config = {
        name: formData.name,
        model_id: formData.model_id || null,
        supports_video: formData.supports_video,
        connection_mode: mode,
      };

      if (formData.top_p !== '' && formData.top_p !== null) {
        config.top_p = parseFloat(formData.top_p);
      }
      if (formData.top_k !== '' && formData.top_k !== null) {
        config.top_k = parseInt(formData.top_k);
      }

      // Only include the fields relevant to the active mode
      if (mode === 'tunnel') {
        config.ssh_host = formData.ssh_host;
        config.ssh_remote_host = formData.ssh_remote_host;
        config.ssh_local_port = parseInt(formData.ssh_local_port);
        config.ssh_remote_port = parseInt(formData.ssh_remote_port);
        // Preserve direct fields as null so they don't get stale
        config.direct_host = null;
        config.direct_port = null;
      } else {
        config.direct_host = formData.direct_host;
        config.direct_port = parseInt(formData.direct_port);
        // Preserve tunnel fields as null so they don't get stale
        config.ssh_host = null;
        config.ssh_remote_host = null;
        config.ssh_local_port = null;
        config.ssh_remote_port = null;
      }

      if (selectedModel) {
        await updateModelConfig(modelKey, config);
        setSnackbar({ open: true, message: `Updated ${modelKey} successfully`, severity: 'success' });
      } else {
        await createModelConfig(modelKey, config);
        setSnackbar({ open: true, message: `Created ${modelKey} successfully`, severity: 'success' });
      }

      setEditDialogOpen(false);
      loadModels();
    } catch (err) {
      setSnackbar({ open: true, message: extractErrorMessage(err, 'Failed to save configuration'), severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteModelConfig(selectedModel.model_key);
      setSnackbar({ open: true, message: `Deleted ${selectedModel.model_key} successfully`, severity: 'success' });
      setDeleteDialogOpen(false);
      loadModels();
    } catch (err) {
      setSnackbar({ open: true, message: extractErrorMessage(err, 'Failed to delete configuration'), severity: 'error' });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const isTunnel = formData.connection_mode !== 'direct';

  return (
    <>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Model Configuration Registry</Typography>
          <Box>
            <Button
              startIcon={<CloudUploadIcon />}
              onClick={handleSeedDefaults}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Seed Defaults
            </Button>
            <Button
              startIcon={<CloudUploadIcon />}
              onClick={handleForceSeedClick}
              variant="outlined"
              color="warning"
              sx={{ mr: 1 }}
            >
              Force Seed
            </Button>
            <Button
              startIcon={<AddIcon />}
              onClick={handleAddNew}
              variant="contained"
              sx={{ mr: 1 }}
            >
              Add Model
            </Button>
            <IconButton onClick={loadModels} color="primary">
              <RefreshIcon />
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Model Key</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Mode</strong></TableCell>
                <TableCell><strong>Active Host</strong></TableCell>
                <TableCell><strong>Active Port</strong></TableCell>
                <TableCell><strong>Video</strong></TableCell>
                <TableCell><strong>Updated</strong></TableCell>
                <TableCell align="right"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {models.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography variant="body2" color="textSecondary">
                      No models configured. Click "Seed Defaults" to initialize.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                models.map((model) => {
                  const mode = model.connection_mode || 'tunnel';
                  const isDirect = mode === 'direct';
                  const { host, port } = getActiveEndpoint(model);

                  return (
                    <TableRow
                      key={model.model_key}
                      hover
                      sx={{
                        borderLeft: isDirect
                          ? '3px solid #2e7d32'
                          : '3px solid #1565c0',
                      }}
                    >
                      <TableCell>
                        <Chip label={model.model_key} size="small" />
                      </TableCell>
                      <TableCell>{model.name}</TableCell>
                      <TableCell>
                        {isDirect ? (
                          <Chip
                            icon={<RouterIcon />}
                            label="direct"
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip
                            icon={<VpnKeyIcon />}
                            label="tunnel"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {isDirect ? (
                          <code>{host}</code>
                        ) : (
                          <Tooltip title={`SSH via ${model.ssh_host || ''}`}>
                            <code>{host}</code>
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell>
                        <code>{port}</code>
                      </TableCell>
                      <TableCell>
                        {model.supports_video ? (
                          <Chip label="Yes" color="success" size="small" />
                        ) : (
                          <Chip label="No" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        {model.updated_at ? new Date(model.updated_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleEditOpen(model)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteOpen(model)}>
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit / Create Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedModel ? `Edit ${selectedModel.model_key}` : 'Add New Model'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>

            {/* Model key — only for new models */}
            {!selectedModel && (
              <TextField
                label="Model Key"
                value={formData.model_key || ''}
                onChange={(e) => handleInputChange('model_key', e.target.value)}
                fullWidth
                required
                helperText="e.g., minimax, qwen3_vl_fp8"
              />
            )}

            {/* Common fields */}
            <TextField
              label="Display Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Model ID (Optional)"
              value={formData.model_id}
              onChange={(e) => handleInputChange('model_id', e.target.value)}
              fullWidth
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.supports_video}
                  onChange={(e) => handleInputChange('supports_video', e.target.checked)}
                />
              }
              label="Supports Video Input"
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Top P (Optional)"
                type="number"
                inputProps={{ step: 0.01, min: 0, max: 1 }}
                value={formData.top_p}
                onChange={(e) => handleInputChange('top_p', e.target.value)}
                fullWidth
              />
              <TextField
                label="Top K (Optional)"
                type="number"
                inputProps={{ step: 1, min: 1 }}
                value={formData.top_k}
                onChange={(e) => handleInputChange('top_k', e.target.value)}
                fullWidth
              />
            </Box>

            <Divider />

            {/* Connection mode selector */}
            <FormControl fullWidth>
              <InputLabel>Connection Mode</InputLabel>
              <Select
                value={formData.connection_mode || 'tunnel'}
                label="Connection Mode"
                onChange={(e) => handleInputChange('connection_mode', e.target.value)}
              >
                <MenuItem value="tunnel">Tunnel — SSH tunnel (default)</MenuItem>
                <MenuItem value="direct">Direct — Direct network access</MenuItem>
              </Select>
            </FormControl>

            {/* Tunnel-specific fields */}
            {isTunnel && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  p: 2,
                  borderLeft: '4px solid',
                  borderColor: 'primary.main',
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VpnKeyIcon color="primary" fontSize="small" />
                  <Typography variant="subtitle2" color="primary">
                    SSH Tunnel Configuration
                  </Typography>
                </Box>
                <TextField
                  label="SSH Host"
                  value={formData.ssh_host}
                  onChange={(e) => handleInputChange('ssh_host', e.target.value)}
                  fullWidth
                  required
                  helperText="Format: user@host (e.g., naresh@85.234.64.146)"
                />
                <TextField
                  label="SSH Remote Host (Worker)"
                  value={formData.ssh_remote_host}
                  onChange={(e) => handleInputChange('ssh_remote_host', e.target.value)}
                  fullWidth
                  required
                  helperText="e.g., worker-7, worker-17"
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Local Tunnel Port"
                    type="number"
                    value={formData.ssh_local_port}
                    onChange={(e) => handleInputChange('ssh_local_port', e.target.value)}
                    fullWidth
                    required
                    helperText="Port on localhost forwarded via SSH"
                  />
                  <TextField
                    label="Remote Service Port"
                    type="number"
                    value={formData.ssh_remote_port}
                    onChange={(e) => handleInputChange('ssh_remote_port', e.target.value)}
                    fullWidth
                    required
                    helperText="Port the model service listens on remotely"
                  />
                </Box>
              </Box>
            )}

            {/* Direct-specific fields */}
            {!isTunnel && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  p: 2,
                  borderLeft: '4px solid',
                  borderColor: 'success.main',
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <RouterIcon color="success" fontSize="small" />
                  <Typography variant="subtitle2" color="success.main">
                    Direct Connection
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="Direct Host"
                    value={formData.direct_host}
                    onChange={(e) => handleInputChange('direct_host', e.target.value)}
                    fullWidth
                    required
                    helperText="e.g., 100.90.255.107"
                  />
                  <TextField
                    label="Direct Port"
                    type="number"
                    inputProps={{ step: 1, min: 1, max: 65535 }}
                    value={formData.direct_port}
                    onChange={(e) => handleInputChange('direct_port', e.target.value)}
                    fullWidth
                    required
                    helperText="e.g., 8010"
                  />
                </Box>
              </Box>
            )}

          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the configuration for{' '}
            <strong>{selectedModel?.model_key}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Force Seed Confirmation Dialog */}
      <Dialog open={forceSeedDialogOpen} onClose={() => setForceSeedDialogOpen(false)}>
        <DialogTitle>Confirm Force Seed</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will overwrite all existing configurations with the defaults. Are you sure?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForceSeedDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleForceSeed} variant="contained" color="warning">
            Force Seed
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ModelManagement;
