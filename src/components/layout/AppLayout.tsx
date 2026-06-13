import React, { useState } from 'react';
import {
  AppBar, Toolbar, Typography, IconButton, Box, TextField,
  InputAdornment, Tabs, Tab, Drawer, useMediaQuery, useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate, useLocation } from 'react-router-dom';
import { moduleLabels } from '@/data/tools';

interface AppLayoutProps {
  children: React.ReactNode;
}

const tabKeys = ['all', 'natural', 'atmosphere', 'astronomy', 'human', 'learning'];

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [searchQuery, setSearchQuery] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const currentTab = location.pathname === '/' ? 0 : tabKeys.findIndex(
    (_, i) => i > 0 && location.search.includes(`module=${tabKeys[i]}`)
  );

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    if (newValue === 0) {
      navigate('/');
    } else {
      navigate(`/?module=${tabKeys[newValue]}`);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#FAFAFA' }}>
      <AppBar position="sticky" sx={{ bgcolor: '#2E7D32' }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="inherit" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{ cursor: 'pointer', fontWeight: 700, mr: 2, whiteSpace: 'nowrap' }}
            onClick={() => navigate('/')}
          >
            🌍 GeoTools
          </Typography>
          <TextField
            size="small"
            placeholder="搜索工具..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{
              bgcolor: 'rgba(255,255,255,0.15)',
              borderRadius: 1,
              maxWidth: 260,
              '& .MuiInputBase-input': { color: '#fff', py: 0.5 },
              '& .MuiInputBase-input::placeholder': { color: 'rgba(255,255,255,0.7)' },
              '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'rgba(255,255,255,0.7)' }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <Box sx={{ flexGrow: 1 }} />
          {!isMobile && (
            <Tabs
              value={currentTab >= 0 ? currentTab : 0}
              onChange={handleTabChange}
              sx={{
                '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', minWidth: 80 },
                '& .Mui-selected': { color: '#fff' },
                '& .MuiTabs-indicator': { bgcolor: '#F57C00' },
              }}
            >
              <Tab label="全部" />
              {Object.entries(moduleLabels).map(([key, label]) => (
                <Tab key={key} label={label} />
              ))}
            </Tabs>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>模块</Typography>
          {Object.entries(moduleLabels).map(([key, label]) => (
            <Box
              key={key}
              sx={{ py: 1.5, px: 2, cursor: 'pointer', borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }}
              onClick={() => { navigate(`/?module=${key}`); setDrawerOpen(false); }}
            >
              {label}
            </Box>
          ))}
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1 }}>
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<{ searchQuery?: string }>, { searchQuery });
          }
          return child;
        })}
      </Box>

      <Box component="footer" sx={{ py: 2, textAlign: 'center', color: '#757575', fontSize: 12 }}>
        GeoTools 高中地理交互工具 © 2025 | 仅供学习使用
      </Box>
    </Box>
  );
};

export default AppLayout;
