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
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
  getModelConfigs,
  createModelConfig,
  updateModelConfig,
  deleteModelConfig,
  seedModelConfigs,
} from '../../services/api';

const ModelManagement = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [forceSeedDialogOpen, setForceSeedDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [formData, setFormData] = useState({});
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
      setError(err.response?.data?.detail || 'Failed to load model configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    try {
      const response = await seedModelConfigs(false);
      setSnackbar({
        open: true,
        message: response.message || 'Defaults seeded successfully',
        severity: 'success',
      });
      loadModels();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to seed defaults',
        severity: 'error',
      });
    }
  };

  const handleForceSeedClick = () => {
    setForceSeedDialogOpen(true);
  };

  const handleForceSeed = async () => {
    setForceSeedDialogOpen(false);
    try {
      const response = await seedModelConfigs(true);
      setSnackbar({
        open: true,
        message: response.message || 'Force-seeded successfully',
        severity: 'success',
      });
      loadModels();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to force-seed',
        severity: 'error',
      });
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
      top_p: model.top_p || '',
      top_k: model.top_k || '',
    });
    setEditDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedModel(null);
    setFormData({
      name: '',
      ssh_host: '',
      ssh_remote_host: '',
      ssh_local_port: '',
      ssh_remote_port: '',
      model_id: '',
      supports_video: false,
      top_p: '',
      top_k: '',
    });
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
        setSnackbar({
          open: true,
          message: 'Model key is required',
          severity: 'error',
        });
        return;
      }

      // Prepare config data
      const config = {
        name: formData.name,
        ssh_host: formData.ssh_host,
        ssh_remote_host: formData.ssh_remote_host,
        ssh_local_port: parseInt(formData.ssh_local_port),
        ssh_remote_port: parseInt(formData.ssh_remote_port),
        model_id: formData.model_id || null,
        supports_video: formData.supports_video,
      };

      if (formData.top_p) {
        config.top_p = parseFloat(formData.top_p);
      }
      if (formData.top_k) {
        config.top_k = parseInt(formData.top_k);
      }

      if (selectedModel) {
        // Update existing
        await updateModelConfig(modelKey, config);
        setSnackbar({
          open: true,
          message: `Updated ${modelKey} successfully`,
          severity: 'success',
        });
      } else {
        // Create new
        await createModelConfig(modelKey, config);
        setSnackbar({
          open: true,
          message: `Created ${modelKey} successfully`,
          severity: 'success',
        });
      }

      setEditDialogOpen(false);
      loadModels();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to save configuration',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteModelConfig(selectedModel.model_key);
      setSnackbar({
        open: true,
        message: `Deleted ${selectedModel.model_key} successfully`,
        severity: 'success',
      });
      setDeleteDialogOpen(false);
      loadModels();
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.response?.data?.detail || 'Failed to delete configuration',
        severity: 'error',
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

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
                <TableCell><strong>Worker</strong></TableCell>
                <TableCell><strong>SSH Host</strong></TableCell>
                <TableCell><strong>Ports</strong></TableCell>
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
                models.map((model) => (
                  <TableRow key={model.model_key} hover>
                    <TableCell>
                      <Chip label={model.model_key} size="small" />
                    </TableCell>
                    <TableCell>{model.name}</TableCell>
                    <TableCell>
                      <code>{model.ssh_remote_host}</code>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={model.ssh_host}>
                        <code>{model.ssh_host.substring(0, 20)}...</code>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      <code>{model.ssh_local_port}:{model.ssh_remote_port}</code>
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
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEditOpen(model)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteOpen(model)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedModel ? `Edit ${selectedModel.model_key}` : 'Add New Model'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
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
            <TextField
              label="Display Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              fullWidth
              required
            />
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
                label="Local Port"
                type="number"
                value={formData.ssh_local_port}
                onChange={(e) => handleInputChange('ssh_local_port', e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Remote Port"
                type="number"
                value={formData.ssh_remote_port}
                onChange={(e) => handleInputChange('ssh_remote_port', e.target.value)}
                fullWidth
                required
              />
            </Box>
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
            This will overwrite all existing configurations. Are you sure you want to continue?
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
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
