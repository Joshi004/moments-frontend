import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Box,
  Typography,
  IconButton,
  Divider,
  alpha,
  useTheme,
} from '@mui/material';
import {
  DashboardOutlined,
  VideoLibraryOutlined,
  LinkOutlined,
  TimelineOutlined,
  SettingsOutlined,
  ChevronLeft,
  ChevronRight,
  SlideshowOutlined,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { SIDEBAR_WIDTH, SIDEBAR_COLLAPSED_WIDTH } from '../../theme';
import { useThemeMode } from '../../contexts/ThemeContext';

const NAV_ITEMS = [
  { label: 'Dashboard', icon: <DashboardOutlined />, path: '/' },
  { label: 'Videos', icon: <VideoLibraryOutlined />, path: '/videos' },
  { label: 'Generate', icon: <LinkOutlined />, path: '/generate' },
  { label: 'Pipelines', icon: <TimelineOutlined />, path: '/pipelines' },
  { label: 'Settings', icon: <SettingsOutlined />, path: '/settings' },
];

const Sidebar = ({ open, onToggle, isMobile }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { mode, toggleMode } = useThemeMode();

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const handleNavClick = (path) => {
    navigate(path);
    // Auto-close drawer on mobile after navigation
    if (isMobile) {
      onToggle();
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      {/* Logo area */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: 64,
          px: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <SlideshowOutlined color="primary" sx={{ fontSize: 28 }} />
        {open && (
          <Typography variant="h6" sx={{ ml: 1.5, fontWeight: 600 }}>
            VideoMoments
          </Typography>
        )}
      </Box>

      {/* Navigation items */}
      <List sx={{ flex: 1, py: 2 }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const listItemButton = (
            <ListItemButton
              onClick={() => handleNavClick(item.path)}
              sx={{
                mx: 1,
                borderRadius: 1,
                mb: 0.5,
                ...(active && {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  borderLeft: '3px solid',
                  borderLeftColor: 'primary.main',
                  '&:hover': {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.12),
                  },
                }),
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 40,
                  color: active ? 'primary.main' : 'text.secondary',
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                sx={{
                  display: open ? 'block' : 'none',
                }}
              />
            </ListItemButton>
          );

          return (
            <ListItem key={item.path} disablePadding>
              {!open && !isMobile ? (
                <Tooltip title={item.label} placement="right">
                  {listItemButton}
                </Tooltip>
              ) : (
                listItemButton
              )}
            </ListItem>
          );
        })}
      </List>

      {/* Collapse toggle (desktop only) */}
      {!isMobile && (
        <Box sx={{ px: 2, py: 1 }}>
          <IconButton
            onClick={onToggle}
            sx={{
              width: '100%',
              borderRadius: 1,
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {open ? <ChevronLeft /> : <ChevronRight />}
          </IconButton>
        </Box>
      )}

      {/* Footer section */}
      <Box sx={{ p: 2 }}>
        <Divider sx={{ mb: 1.5 }} />
        
        {/* Dark mode toggle */}
        <Box sx={{ mb: 1.5 }}>
          {open ? (
            <ListItemButton
              onClick={toggleMode}
              sx={{
                borderRadius: 1,
                py: 0.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </ListItemIcon>
              <ListItemText
                primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
                primaryTypographyProps={{ variant: 'caption' }}
              />
            </ListItemButton>
          ) : (
            <Tooltip title={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} placement="right">
              <IconButton
                onClick={toggleMode}
                sx={{
                  width: '100%',
                  borderRadius: 1,
                }}
              >
                {mode === 'dark' ? <LightMode /> : <DarkMode />}
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: theme.palette.secondary.main,
            }}
          />
          {open && (
            <Typography variant="caption" color="text.secondary">
              System OK
            </Typography>
          )}
        </Box>
        {open && (
          <Typography variant="caption" color="text.secondary">
            v0.1.0
          </Typography>
        )}
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        variant="temporary"
        open={open}
        onClose={onToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    );
  }

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: open ? SIDEBAR_WIDTH : SIDEBAR_COLLAPSED_WIDTH,
          boxSizing: 'border-box',
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          overflowX: 'hidden',
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default Sidebar;
