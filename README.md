# Video Moments Frontend

React frontend application for the Video Moments service.

## Setup

1. Install dependencies:
```bash
npm install
```

## Running the Application

```bash
npm start
```

The application will start on http://localhost:3005

Make sure the backend server is running on port 8005 before using the frontend.

## Features

- Video grid view with placeholder thumbnails
- Inline video player with custom controls
- Play/Pause functionality
- Seek bar for video navigation
- Volume control
- Fullscreen support
- Previous/Next video navigation
- Keyboard shortcuts:
  - Space: Play/Pause
  - Left/Right arrows: Seek ±10 seconds
  - Up/Down arrows: Volume control
  - F: Fullscreen

## Project Structure

- `src/components/` - React components (VideoGrid, VideoCard, VideoPlayer, VideoControls)
- `src/pages/` - Page components (HomePage)
- `src/services/` - API service layer
