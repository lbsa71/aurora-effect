/**
 * Configuration interface for simulation parameters
 */

import {
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useConfigStore } from '../../store/simulation';
import { apiClient } from '../../services/api';
import type { PresetScenario } from '../../types/presets';

export const Configuration = () => {
  const { config, maxSteps, updateInterval, setConfig, setMaxSteps, setUpdateInterval, resetConfig } = useConfigStore();
  const [presets, setPresets] = useState<PresetScenario[]>([]);
  const [selectedPreset, setSelectedPreset] = useState<string>('');
  const [loadingPresets, setLoadingPresets] = useState(false);

  useEffect(() => {
    const loadPresets = async () => {
      try {
        setLoadingPresets(true);
        const response = await apiClient.getPresets();
        setPresets(response.presets);
      } catch (error) {
        console.error('Failed to load presets:', error);
      } finally {
        setLoadingPresets(false);
      }
    };

    loadPresets();
  }, []);

  const handleNumberChange = (field: keyof typeof config) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value)) {
      setConfig({ [field]: value });
    }
  };

  const handlePresetChange = (presetId: string) => {
    setSelectedPreset(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setConfig(preset.config);
      if (preset.maxSteps) setMaxSteps(preset.maxSteps);
      if (preset.updateInterval) setUpdateInterval(preset.updateInterval);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'fermi': return 'error';
      case 'optimistic': return 'success';
      case 'steady-state': return 'warning';
      case 'research': return 'info';
      default: return 'default';
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Simulation Configuration
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Scenario Preset</InputLabel>
              <Select
                value={selectedPreset}
                label="Scenario Preset"
                onChange={(e) => handlePresetChange(e.target.value)}
                disabled={loadingPresets}
              >
                <MenuItem value="">
                  <em>Custom Configuration</em>
                </MenuItem>
                {presets.map((preset) => (
                  <MenuItem key={preset.id} value={preset.id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                      <Chip 
                        label={preset.category} 
                        size="small" 
                        color={getCategoryColor(preset.category)}
                      />
                      <Typography>{preset.name}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedPreset && presets.find(p => p.id === selectedPreset) && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                {presets.find(p => p.id === selectedPreset)?.description}
              </Typography>
            )}
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Physical Parameters
            </Typography>
            
            <TextField
              fullWidth
              label="Stellar Density (stars/pc³)"
              type="number"
              value={config.stellarDensity}
              onChange={handleNumberChange('stellarDensity')}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Settleable Fraction (0-1)"
              type="number"
              value={config.settleableFraction}
              onChange={handleNumberChange('settleableFraction')}
              margin="normal"
              size="small"
              inputProps={{ min: 0, max: 1, step: 0.1 }}
            />
            
            <TextField
              fullWidth
              label="Stellar Velocity (km/s)"
              type="number"
              value={config.stellarVelocityKmS}
              onChange={handleNumberChange('stellarVelocityKmS')}
              margin="normal"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Probe Parameters
            </Typography>
            
            <TextField
              fullWidth
              label="Probe Velocity (km/s)"
              type="number"
              value={config.probeVelocityKmS}
              onChange={handleNumberChange('probeVelocityKmS')}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Probe Range (light-years)"
              type="number"
              value={config.probeRangeLy}
              onChange={handleNumberChange('probeRangeLy')}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Launch Interval (years)"
              type="number"
              value={config.probeLaunchIntervalYr}
              onChange={handleNumberChange('probeLaunchIntervalYr')}
              margin="normal"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Civilization Parameters
            </Typography>
            
            <TextField
              fullWidth
              label="Civilization Lifetime (years, 0=infinite)"
              type="number"
              value={config.civilizationLifetimeYr}
              onChange={handleNumberChange('civilizationLifetimeYr')}
              margin="normal"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Simulation Parameters
            </Typography>
            
            <TextField
              fullWidth
              label="Number of Systems"
              type="number"
              value={config.numSystems}
              onChange={handleNumberChange('numSystems')}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Box Size (parsecs)"
              type="number"
              value={config.boxSizePc}
              onChange={handleNumberChange('boxSizePc')}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Time Step (years)"
              type="number"
              value={config.timeStepYr}
              onChange={handleNumberChange('timeStepYr')}
              margin="normal"
              size="small"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Runtime Parameters
            </Typography>
            
            <TextField
              fullWidth
              label="Max Steps"
              type="number"
              value={maxSteps}
              onChange={(e) => setMaxSteps(parseInt(e.target.value))}
              margin="normal"
              size="small"
            />
            
            <TextField
              fullWidth
              label="Update Interval (steps)"
              type="number"
              value={updateInterval}
              onChange={(e) => setUpdateInterval(parseInt(e.target.value))}
              margin="normal"
              size="small"
            />
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button variant="outlined" onClick={resetConfig}>
                Reset to Defaults
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
