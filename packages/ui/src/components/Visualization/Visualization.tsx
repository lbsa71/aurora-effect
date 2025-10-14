/**
 * Galaxy visualization component
 * Displays WebGPU-powered 3D/2D view of star systems
 */

import { Card, CardContent, Typography, Box } from '@mui/material';
import { GalaxyCanvas } from './GalaxyCanvas';
import { ViewControls } from './ViewControls';

export const Visualization = () => {
  return (
    <Card sx={{ p: 0, width: '100%' }}>
      <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
        <Typography variant="h6" gutterBottom>
          Galaxy Visualization
        </Typography>
        <Box sx={{ width: '1200px', height: '600px', position: 'relative' }}>
          <GalaxyCanvas />
        </Box>
        <Box sx={{ px: 2, pt: 2 }}>
          <ViewControls />
        </Box>
      </CardContent>
    </Card>
  );
};
