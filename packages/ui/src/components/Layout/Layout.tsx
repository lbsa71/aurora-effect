/**
 * Main application layout
 */

import { useState } from 'react';
import { Box, Container, AppBar, Toolbar, Typography, IconButton, Tooltip } from '@mui/material';
import { Info } from '@mui/icons-material';
import type { ReactNode } from 'react';
import { InfoModal } from './InfoModal';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Aurora Effect: Galactic Settlement Simulator
          </Typography>
          <Tooltip title="About Aurora Effect">
            <IconButton
              color="inherit"
              onClick={() => setInfoOpen(true)}
              aria-label="information"
            >
              <Info />
            </IconButton>
          </Tooltip>
        </Toolbar>
      </AppBar>
      <Container maxWidth='xl' disableGutters sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>
      <InfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
    </Box>
  );
};
