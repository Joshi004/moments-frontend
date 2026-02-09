import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  useTheme,
} from '@mui/material';
import { Close, Keyboard } from '@mui/icons-material';

const shortcuts = [
  {
    category: 'Global',
    items: [
      { keys: ['Cmd', 'K'], description: 'Focus global search', mac: true },
      { keys: ['Ctrl', 'K'], description: 'Focus global search', mac: false },
      { keys: ['?'], description: 'Show keyboard shortcuts' },
    ],
  },
  {
    category: 'Video Player',
    items: [
      { keys: ['Space'], description: 'Play / Pause' },
      { keys: ['←'], description: 'Seek backward 5 seconds' },
      { keys: ['→'], description: 'Seek forward 5 seconds' },
      { keys: ['F'], description: 'Toggle fullscreen' },
    ],
  },
  {
    category: 'Navigation',
    items: [
      { keys: ['Esc'], description: 'Close dialogs and drawers' },
    ],
  },
];

const KeyboardShortcutsDialog = ({ open, onClose }) => {
  const theme = useTheme();
  const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  const renderKey = (key) => (
    <Box
      component="kbd"
      sx={{
        display: 'inline-block',
        padding: '4px 8px',
        bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.06)',
        border: '1px solid',
        borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)',
        borderRadius: '4px',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        fontWeight: 600,
        color: 'text.primary',
        textAlign: 'center',
        minWidth: '24px',
        boxShadow: `0 2px 0 ${theme.palette.mode === 'dark' ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.1)'}`,
      }}
    >
      {key}
    </Box>
  );

  const renderShortcut = (shortcut) => {
    // Filter out platform-specific shortcuts
    if (shortcut.mac !== undefined) {
      if ((isMac && !shortcut.mac) || (!isMac && shortcut.mac)) {
        return null;
      }
    }

    return (
      <TableRow key={shortcut.keys.join('+') + shortcut.description}>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {shortcut.keys.map((key, index) => (
              <React.Fragment key={key}>
                {index > 0 && <Typography sx={{ mx: 0.5, color: 'text.secondary' }}>+</Typography>}
                {renderKey(key)}
              </React.Fragment>
            ))}
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">{shortcut.description}</Typography>
        </TableCell>
      </TableRow>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Keyboard />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Keyboard Shortcuts
            </Typography>
          </Box>
          <IconButton onClick={onClose} edge="end">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pb: 2 }}>
          {shortcuts.map((category, categoryIndex) => (
            <Box key={category.category} sx={{ mb: categoryIndex < shortcuts.length - 1 ? 3 : 0 }}>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  display: 'block',
                  mb: 1,
                }}
              >
                {category.category}
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableBody>
                    {category.items.map((shortcut) => renderShortcut(shortcut)).filter(Boolean)}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            Press <strong>Esc</strong> to close this dialog
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default KeyboardShortcutsDialog;
