/**
 * Galaxy visualization component (placeholder for Ticket 3.3)
 */

import { Card, CardContent, Typography, Box } from '@mui/material';

export const Visualization = () => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Galaxy Visualization
        </Typography>
        <Box
          sx={{
            height: 400,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'background.default',
            borderRadius: 1,
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Visualization coming in Ticket 3.3
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
