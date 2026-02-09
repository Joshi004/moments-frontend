import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Box } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import {
  SettingsNav,
  ModelManagement,
  SystemHealth,
} from '../components/settings';

const SettingsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSection = searchParams.get('section') || 'models';

  const handleSectionChange = (section) => {
    setSearchParams({ section });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <PageHeader
        title="Settings"
        subtitle="Manage AI models and system configuration"
      />
      <Box sx={{ display: 'flex', gap: 3 }}>
        <SettingsNav
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {activeSection === 'models' && <ModelManagement />}
          {activeSection === 'health' && <SystemHealth />}
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsPage;
