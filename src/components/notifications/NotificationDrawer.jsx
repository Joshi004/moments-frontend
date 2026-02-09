import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  Button,
  Divider,
  IconButton,
} from '@mui/material';
import { Close, NotificationsNone } from '@mui/icons-material';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationItem from './NotificationItem';

const NotificationDrawer = ({ open, onClose }) => {
  const { notifications, markAllAsRead, clearAll, unreadCount, markAsRead } = useNotifications();

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAll();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 360,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <IconButton onClick={onClose} edge="end">
            <Close />
          </IconButton>
        </Box>

        {/* Mark all as read button */}
        {unreadCount > 0 && (
          <Box sx={{ px: 2, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
            <Button
              size="small"
              onClick={handleMarkAllAsRead}
              sx={{ textTransform: 'none' }}
            >
              Mark all as read
            </Button>
          </Box>
        )}

        {/* Notifications List */}
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          {notifications.length === 0 ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                py: 8,
                px: 3,
                textAlign: 'center',
              }}
            >
              <NotificationsNone
                sx={{
                  fontSize: 64,
                  color: 'text.secondary',
                  opacity: 0.5,
                  mb: 2,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ py: 0 }}>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={markAsRead}
                  onClose={onClose}
                />
              ))}
            </List>
          )}
        </Box>

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Button
                fullWidth
                variant="outlined"
                color="error"
                onClick={handleClearAll}
                sx={{ textTransform: 'none' }}
              >
                Clear all
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
};

export default NotificationDrawer;
