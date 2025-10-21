/**
 * Metrics display component with time series charts
 */

import { Card, CardContent, Typography, Box, Tabs, Tab, Button } from '@mui/material';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useSimulationStore } from '../../store/simulation';
import DownloadIcon from '@mui/icons-material/Download';

interface DataPoint {
  time: number;
  settledFraction: number;
  activeCivilizations: number;
  probesInFlight: number;
  frontPosition: number;
}

export const Metrics = () => {
  const latestUpdate = useSimulationStore((state) => state.latestUpdate);
  const [timeSeriesData, setTimeSeriesData] = useState<DataPoint[]>([]);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (latestUpdate) {
      setTimeSeriesData((prev) => {
        const newData = [...prev, {
          time: latestUpdate.time,
          settledFraction: latestUpdate.settledFraction * 100,
          activeCivilizations: latestUpdate.activeCivilizations,
          probesInFlight: latestUpdate.probesInFlight,
          frontPosition: latestUpdate.frontPosition,
        }];
        
        // Keep only last 100 data points to avoid performance issues
        return newData.slice(-100);
      });
    }
  }, [latestUpdate]);

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

  const formatTimeAxis = (time: number) => {
    if (time >= 1e6) return `${(time / 1e6).toFixed(1)}M`;
    if (time >= 1e3) return `${(time / 1e3).toFixed(1)}K`;
    return time.toString();
  };

  const handleExport = () => {
    const csvContent = [
      'Time (years),Settled Fraction (%),Active Civilizations,Probes in Flight,Front Position (ly)',
      ...timeSeriesData.map(d => 
        `${d.time},${d.settledFraction},${d.activeCivilizations},${d.probesInFlight},${d.frontPosition}`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aurora-effect-metrics-${Date.now()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Metrics
          </Typography>
          {timeSeriesData.length > 0 && (
            <Button
              size="small"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
            >
              Export
            </Button>
          )}
        </Box>

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2 }}>
          <Tab label="Current" />
          <Tab label="Charts" />
          <Tab label="Civilizations" />
        </Tabs>

        {activeTab === 0 && (
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
        )}

        {activeTab === 2 && latestUpdate.civilizationMetrics && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {latestUpdate.civilizationMetrics.map((civ) => (
              <Box
                key={civ.id}
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.paper'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: 16,
                      bgcolor: civ.color,
                      borderRadius: '50%',
                      border: '1px solid',
                      borderColor: 'divider'
                    }}
                  />
                  <Typography variant="subtitle2">
                    {civ.name || `Civilization ${civ.id}`}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      ml: 'auto',
                      px: 1,
                      py: 0.5,
                      bgcolor: civ.active ? 'success.main' : 'error.main',
                      color: 'white',
                      borderRadius: 1
                    }}
                  >
                    {civ.active ? 'Active' : 'Extinct'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Settled Systems
                    </Typography>
                    <Typography variant="body2">
                      {civ.settledSystemsCount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Active Probes
                    </Typography>
                    <Typography variant="body2">
                      {civ.activeProbeCount}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Birth Time
                    </Typography>
                    <Typography variant="body2">
                      {formatLargeNumber(civ.birthTime)} yr
                    </Typography>
                  </Box>
                  {civ.deathTime !== undefined && (
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        Death Time
                      </Typography>
                      <Typography variant="body2">
                        {formatLargeNumber(civ.deathTime)} yr
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {activeTab === 1 && timeSeriesData.length > 0 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Settled Fraction Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTimeAxis}
                  label={{ value: 'Time (years)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Settled %', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)}%`}
                  labelFormatter={(label: number) => `Time: ${formatLargeNumber(label)} yr`}
                />
                <Line 
                  type="monotone" 
                  dataKey="settledFraction" 
                  stroke="#8884d8" 
                  dot={false}
                  name="Settled Fraction"
                />
              </LineChart>
            </ResponsiveContainer>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Civilizations & Probes
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTimeAxis}
                  label={{ value: 'Time (years)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(label: number) => `Time: ${formatLargeNumber(label)} yr`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="activeCivilizations" 
                  stroke="#82ca9d" 
                  dot={false}
                  name="Active Civs"
                />
                <Line 
                  type="monotone" 
                  dataKey="probesInFlight" 
                  stroke="#ffc658" 
                  dot={false}
                  name="Probes"
                />
              </LineChart>
            </ResponsiveContainer>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Settlement Front Position
            </Typography>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={formatTimeAxis}
                  label={{ value: 'Time (years)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  label={{ value: 'Position (ly)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(2)} ly`}
                  labelFormatter={(label: number) => `Time: ${formatLargeNumber(label)} yr`}
                />
                <Line 
                  type="monotone" 
                  dataKey="frontPosition" 
                  stroke="#ff7300" 
                  dot={false}
                  name="Front Position"
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        )}

        {activeTab === 1 && timeSeriesData.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No time series data available yet. Start a simulation to see charts.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};
