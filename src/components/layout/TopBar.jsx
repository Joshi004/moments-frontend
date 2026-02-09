import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Badge,
} from '@mui/material';
import {
  MenuOutlined,
  NotificationsOutlined,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import Breadcrumbs from './Breadcrumbs';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../theme';
import { useNotifications } from '../../contexts/NotificationContext';
import NotificationDrawer from '../notifications/NotificationDrawer';
import GlobalSearch from './GlobalSearch';

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/videos': 'Video Library',
  '/generate': 'Generate from URL',
  '/pipelines': 'Pipelines',
  '/settings': 'Settings',
};

const titleCase = (str) => {
  return str
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const TopBar = ({ onMenuToggle, sidebarOpen, isMobile }) => {
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState(false);

  // Get page title
  const getPageTitle = () => {
    const title = PAGE_TITLES[location.pathname];
    if (title) return title;

    // Fallback: title-case the last path segment
    const segments = location.pathname.split('/').filter(x => x);
    if (segments.length > 0) {
      return titleCase(segments[segments.length - 1]);
    }

    return 'Dashboard';
  };

  const pageTitle = getPageTitle();

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        ml: isMobile ? 0 : `${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}px`,
        width: isMobile ? '100%' : `calc(100% - ${sidebarOpen ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH}px)`,
        transition: (theme) =>
          theme.transitions.create(['margin-left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
      }}
    >
      <Toolbar>
        {/* Menu toggle button - only shown on mobile */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            onClick={onMenuToggle}
            sx={{ mr: 2 }}
          >
            <MenuOutlined />
          </IconButton>
        )}

        {/* Page title and breadcrumbs */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" noWrap sx={{ fontWeight: 600 }}>
            {pageTitle}
          </Typography>
          <Breadcrumbs />
        </Box>

        {/* Right side: search and notifications */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <GlobalSearch />
          <IconButton 
            color="inherit" 
            onClick={() => setNotificationDrawerOpen(true)}
          >
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>

      {/* Notification Drawer */}
      <NotificationDrawer 
        open={notificationDrawerOpen}
        onClose={() => setNotificationDrawerOpen(false)}
      />
    </AppBar>
  );
};

export default TopBar;
