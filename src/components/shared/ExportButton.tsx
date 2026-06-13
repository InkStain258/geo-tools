import React, { useState } from 'react';
import { IconButton, Tooltip, Snackbar, Alert, CircularProgress } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { exportToPNG } from '@/utils/exportImage';

interface ExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement | null>;
  filename?: string;
}

const ExportButton: React.FC<ExportButtonProps> = ({ targetRef, filename = 'export' }) => {
  const [loading, setLoading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMsg, setSnackMsg] = useState('');
  const [snackSeverity, setSnackSeverity] = useState<'success' | 'error'>('success');

  const handleExport = async () => {
    if (!targetRef.current) return;
    setLoading(true);
    try {
      await exportToPNG(targetRef.current, filename);
      setSnackMsg('导出成功！');
      setSnackSeverity('success');
    } catch {
      setSnackMsg('导出失败，请重试');
      setSnackSeverity('error');
    } finally {
      setLoading(false);
      setSnackOpen(true);
    }
  };

  return (
    <>
      <Tooltip title="导出PNG">
        <IconButton
          onClick={handleExport}
          disabled={loading}
          sx={{ transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.08)' } }}
        >
          {loading ? <CircularProgress size={24} /> : <PhotoCameraIcon />}
        </IconButton>
      </Tooltip>
      <Snackbar
        open={snackOpen}
        autoHideDuration={2000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={snackSeverity} onClose={() => setSnackOpen(false)} variant="filled">
          {snackMsg}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportButton;
