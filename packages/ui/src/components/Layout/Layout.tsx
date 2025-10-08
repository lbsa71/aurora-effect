/**
 * Main application layout
 */

import { Box, Container, AppBar, Toolbar, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Aurora Effect: Galactic Settlement Simulator
          </Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth='xl' disableGutters sx={{ flex: 1, py: 3 }}>
        {children}
      </Container>
    </Box>
  );
};
