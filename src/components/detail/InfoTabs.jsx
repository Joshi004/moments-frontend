import React, { useState, useMemo } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import OverviewTab from './OverviewTab';
import TranscriptTab from './TranscriptTab';
import PipelineTab from './PipelineTab';
import ClipsTab from './ClipsTab';

const TabPanel = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`info-tabpanel-${index}`}
      aria-labelledby={`info-tab-${index}`}
    >
      {value === index && children}
    </div>
  );
};

const InfoTabs = ({
  video,
  moments,
  transcript,
  currentTime,
  pipelineHistory,
  // Overview tab handlers
  onProcessAudio,
  onProcessTranscript,
  onGenerateMoments,
  onExtractClips,
  onRunPipeline,
  // Processing states
  isProcessingAudio,
  isProcessingTranscript,
  isGeneratingMoments,
  isExtractingClips,
  // Transcript tab handlers
  onSeekTo,
  onGenerateTranscript,
  // Pipeline tab handlers
  onStartPipeline,
  onCancelPipeline,
  onRefreshHistory,
  isLoadingHistory,
}) => {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  // Count clips for tab label
  const clipCount = useMemo(() => {
    return moments.filter(m => !m.is_refined).length;
  }, [moments]);

  return (
    <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            minHeight: 56,
            '& .MuiTab-root': {
              minHeight: 56,
              fontSize: '0.9rem',
              fontWeight: 500,
              textTransform: 'none',
            },
          }}
        >
          <Tab label="Overview" id="info-tab-0" aria-controls="info-tabpanel-0" />
          <Tab label="Transcript" id="info-tab-1" aria-controls="info-tabpanel-1" />
          <Tab
            label={`Pipeline${pipelineHistory.length > 0 ? ` (${pipelineHistory.length})` : ''}`}
            id="info-tab-2"
            aria-controls="info-tabpanel-2"
          />
          <Tab
            label={`Clips${clipCount > 0 ? ` (${clipCount})` : ''}`}
            id="info-tab-3"
            aria-controls="info-tabpanel-3"
          />
        </Tabs>
      </Box>

      <TabPanel value={selectedTab} index={0}>
        <OverviewTab
          video={video}
          moments={moments}
          transcript={transcript}
          onProcessAudio={onProcessAudio}
          onProcessTranscript={onProcessTranscript}
          onGenerateMoments={onGenerateMoments}
          onExtractClips={onExtractClips}
          onRunPipeline={onRunPipeline}
          isProcessingAudio={isProcessingAudio}
          isProcessingTranscript={isProcessingTranscript}
          isGeneratingMoments={isGeneratingMoments}
          isExtractingClips={isExtractingClips}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={1}>
        <TranscriptTab
          transcript={transcript}
          currentTime={currentTime}
          onSeekTo={onSeekTo}
          onGenerateTranscript={onGenerateTranscript}
          hasAudio={video?.has_audio || false}
          isProcessingTranscript={isProcessingTranscript}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={2}>
        <PipelineTab
          videoId={video?.id}
          video={video}
          pipelineHistory={pipelineHistory}
          onStartPipeline={onStartPipeline}
          onCancelPipeline={onCancelPipeline}
          onRefreshHistory={onRefreshHistory}
          isLoadingHistory={isLoadingHistory}
        />
      </TabPanel>

      <TabPanel value={selectedTab} index={3}>
        <ClipsTab
          moments={moments}
          videoId={video?.id}
          onExtractClips={onExtractClips}
          isExtractingClips={isExtractingClips}
        />
      </TabPanel>
    </Paper>
  );
};

export default InfoTabs;
