import React from 'react';
import { Box, IconButton, Slider, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import FastForwardIcon from '@mui/icons-material/FastForward';
import FastRewindIcon from '@mui/icons-material/FastRewind';

interface AnimationControlsProps {
  playing: boolean;
  speed: number;
  progress: number;
  onPlayPause: () => void;
  onSpeedChange: (speed: number) => void;
  onProgressChange: (progress: number) => void;
}

const AnimationControls: React.FC<AnimationControlsProps> = ({
  playing,
  speed,
  progress,
  onPlayPause,
  onSpeedChange,
  onProgressChange,
}) => {
  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      p: 1.5,
      bgcolor: '#f5f5f5',
      borderRadius: 2,
      mt: 1,
    }}>
      <IconButton
        onClick={() => onSpeedChange(Math.max(0.25, speed - 0.25))}
        size="small"
        title="减速"
      >
        <FastRewindIcon fontSize="small" />
      </IconButton>

      <IconButton
        onClick={onPlayPause}
        sx={{
          bgcolor: '#2E7D32',
          color: '#fff',
          '&:hover': { bgcolor: '#1B5E20' },
          transition: 'transform 0.2s',
          '&:active': { transform: 'scale(0.95)' },
        }}
      >
        {playing ? <PauseIcon /> : <PlayArrowIcon />}
      </IconButton>

      <IconButton
        onClick={() => onSpeedChange(Math.min(4, speed + 0.25))}
        size="small"
        title="加速"
      >
        <FastForwardIcon fontSize="small" />
      </IconButton>

      <Typography variant="caption" sx={{ minWidth: 36, textAlign: 'center', fontWeight: 600 }}>
        {speed.toFixed(2)}x
      </Typography>

      <Slider
        value={progress}
        onChange={(_, val) => onProgressChange(val as number)}
        min={0}
        max={100}
        size="small"
        sx={{ flex: 1, mx: 1 }}
      />

      <Typography variant="caption" sx={{ minWidth: 30, textAlign: 'right' }}>
        {Math.round(progress)}%
      </Typography>
    </Box>
  );
};

export default AnimationControls;
