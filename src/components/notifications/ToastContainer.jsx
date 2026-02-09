import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  IconButton,
  Typography,
  Button,
  Slide,
  alpha,
  useTheme,
} from '@mui/material';
import {
  Close,
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';

const TOAST_DURATION = 5000; // 5 seconds
const MAX_TOASTS = 3;

const getIconByType = (type) => {
  switch (type) {
    case 'success':
      return <CheckCircle />;
    case 'error':
      return <ErrorIcon />;
    case 'warning':
      return <Warning />;
    case 'info':
    default:
      return <Info />;
  }
};

const getColorByType = (type, theme) => {
  switch (type) {
    case 'success':
      return theme.palette.success.main;
    case 'error':
      return theme.palette.error.main;
    case 'warning':
      return theme.palette.warning.main;
    case 'info':
    default:
      return theme.palette.info.main;
  }
};

const Toast = ({ notification, onDismiss }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    setShow(true);
    
    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleDismiss();
    }, TOAST_DURATION);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setShow(false);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300); // Wait for slide-out animation
  };

  const handleAction = () => {
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      handleDismiss();
    }
  };

  const borderColor = getColorByType(notification.type, theme);

  return (
    <Slide direction="left" in={show} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 1.5,
          p: 1.5,
          minWidth: 300,
          maxWidth: 400,
          borderLeft: `4px solid ${borderColor}`,
          bgcolor: 'background.paper',
          mb: 1,
        }}
      >
        {/* Icon */}
        <Box
          sx={{
            color: borderColor,
            display: 'flex',
            alignItems: 'center',
            pt: 0.25,
          }}
        >
          {getIconByType(notification.type)}
        </Box>

        {/* Message */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {notification.message}
          </Typography>
          
          {/* Action Button */}
          {notification.actionUrl && (
            <Button
              size="small"
              onClick={handleAction}
              sx={{ mt: 0.5, p: 0, minWidth: 'auto' }}
            >
              View
            </Button>
          )}
        </Box>

        {/* Dismiss Button */}
        <IconButton
          size="small"
          onClick={handleDismiss}
          sx={{
            mt: -0.5,
            mr: -0.5,
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Paper>
    </Slide>
  );
};

const ToastContainer = () => {
  const theme = useTheme();
  const { notifications } = useNotifications();
  const [displayedToasts, setDisplayedToasts] = useState([]);
  const shownToastIdsRef = useRef(new Set());

  useEffect(() => {
    // Find new unread notifications that haven't been shown as toasts
    const newNotifications = notifications
      .filter(n => !n.read && !shownToastIdsRef.current.has(n.id))
      .slice(0, MAX_TOASTS);

    if (newNotifications.length > 0) {
      // Mark these as shown
      newNotifications.forEach(n => {
        shownToastIdsRef.current.add(n.id);
      });

      // Add to displayed toasts
      setDisplayedToasts(prev => {
        const combined = [...newNotifications, ...prev];
        return combined.slice(0, MAX_TOASTS);
      });
    }
  }, [notifications]);

  const handleDismiss = (id) => {
    setDisplayedToasts(prev => prev.filter(n => n.id !== id));
  };

  if (displayedToasts.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: theme.zIndex.snackbar,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      {displayedToasts.map(notification => (
        <Toast
          key={notification.id}
          notification={notification}
          onDismiss={handleDismiss}
        />
      ))}
    </Box>
  );
};

export default ToastContainer;
