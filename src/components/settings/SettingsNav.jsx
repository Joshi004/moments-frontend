import React from 'react';
import {
  Paper,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  SmartToy,
  MonitorHeart,
} from '@mui/icons-material';

const SettingsNav = ({ activeSection, onSectionChange }) => {
  return (
    <Paper sx={{ width: 220, flexShrink: 0, p: 1 }}>
      <List component="nav">
        <ListItemButton
          selected={activeSection === 'models'}
          onClick={() => onSectionChange('models')}
        >
          <ListItemIcon>
            <SmartToy />
          </ListItemIcon>
          <ListItemText primary="AI Models" />
        </ListItemButton>
        <ListItemButton
          selected={activeSection === 'health'}
          onClick={() => onSectionChange('health')}
        >
          <ListItemIcon>
            <MonitorHeart />
          </ListItemIcon>
          <ListItemText primary="System Health" />
        </ListItemButton>
      </List>
    </Paper>
  );
};

export default SettingsNav;
