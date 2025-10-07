/**
 * Metrics display component
 */

import { Card, CardContent, Typography, Box } from '@mui/material';
import { useSimulationStore } from '../../store/simulation';

export const Metrics = () => {
  const latestUpdate = useSimulationStore((state) => state.latestUpdate);

  if (!latestUpdate) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Metrics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No simulation data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const formatNumber = (num: number, decimals: number = 2) => {
    return num.toFixed(decimals);
  };

  const formatLargeNumber = (num: number) => {
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Metrics
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Simulation Time
            </Typography>
            <Typography variant="h6">
              {formatLargeNumber(latestUpdate.time)} years
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Settled Fraction
            </Typography>
            <Typography variant="h6">
              {formatNumber(latestUpdate.settledFraction * 100, 1)}%
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Active Civilizations
            </Typography>
            <Typography variant="h6">
              {latestUpdate.activeCivilizations}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Probes in Flight
            </Typography>
            <Typography variant="h6">
              {latestUpdate.probesInFlight}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body2" color="text.secondary">
              Settlement Front Position
            </Typography>
            <Typography variant="h6">
              {formatNumber(latestUpdate.frontPosition, 1)} ly
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
