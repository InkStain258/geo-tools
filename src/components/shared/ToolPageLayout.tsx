import React from 'react';
import { Box, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExportButton from './ExportButton';

interface ToolPageLayoutProps {
  title: string;
  children: React.ReactNode;
  exportRef?: React.RefObject<HTMLDivElement | null>;
  showExport?: boolean;
}

const ToolPageLayout: React.FC<ToolPageLayoutProps> = ({
  title,
  children,
  exportRef,
  showExport = true,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 1.5, md: 3 } }}>
      {/* Top toolbar */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: 2,
        py: 1,
        borderBottom: '1px solid #e0e0e0',
      }}>
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, flexGrow: 1, fontSize: { xs: '1.1rem', md: '1.5rem' } }}>
          {title}
        </Typography>
        {showExport && exportRef && (
          <ExportButton targetRef={exportRef} filename={title} />
        )}
      </Box>

      {/* Content area */}
      <Box ref={exportRef} sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: 2,
        minHeight: 'calc(100vh - 200px)',
      }}>
        {children}
      </Box>
    </Box>
  );
};

export default ToolPageLayout;
