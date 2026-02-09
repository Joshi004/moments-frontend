import React from 'react';
import {
  Box,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Error as ErrorIcon,
  Warning,
  Info,
  FiberManualRecord,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

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

const formatRelativeTime = (timestamp) => {
  const now = Date.now();
  const diff = now - timestamp;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
};

const NotificationItem = ({ notification, onRead, onClose }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const handleClick = () => {
    // Mark as read
    if (!notification.read) {
      onRead(notification.id);
    }

    // Navigate if actionUrl exists
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
      if (onClose) {
        onClose();
      }
    }
  };

  const iconColor = getColorByType(notification.type, theme);

  return (
    <ListItem
      disablePadding
      sx={{
        bgcolor: !notification.read 
          ? alpha(theme.palette.primary.main, 0.04) 
          : 'transparent',
      }}
    >
      <ListItemButton onClick={handleClick} sx={{ py: 1.5 }}>
        {/* Type Icon */}
        <ListItemIcon sx={{ color: iconColor, minWidth: 40 }}>
          {getIconByType(notification.type)}
        </ListItemIcon>

        {/* Message and Time */}
        <ListItemText
          primary={notification.message}
          secondary={formatRelativeTime(notification.timestamp)}
          primaryTypographyProps={{
            variant: 'body2',
            sx: { wordBreak: 'break-word' },
          }}
          secondaryTypographyProps={{
            variant: 'caption',
            color: 'text.secondary',
          }}
        />

        {/* Unread Indicator */}
        {!notification.read && (
          <Box
            sx={{
              ml: 1,
              color: theme.palette.primary.main,
            }}
          >
            <FiberManualRecord sx={{ fontSize: 10 }} />
          </Box>
        )}
      </ListItemButton>
    </ListItem>
  );
};

export default NotificationItem;
