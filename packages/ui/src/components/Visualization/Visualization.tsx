/**
 * Galaxy visualization component
 * Displays WebGPU-powered 3D/2D view of star systems
 */

import { Card, CardContent, Typography, Box, Grid } from '@mui/material';
import { GalaxyCanvas } from './GalaxyCanvas';
import { ViewControls } from './ViewControls';

export const Visualization = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Galaxy Visualization
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={9}>
            <Box
              sx={{
                height: 500,
                position: 'relative',
              }}
            >
              <GalaxyCanvas />
            </Box>
          </Grid>
          <Grid item xs={12} md={3}>
            <ViewControls />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
