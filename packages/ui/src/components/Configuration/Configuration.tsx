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
  Divider,
  IconButton,
  List,
  ListItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from 'react';
import { useConfigStore } from '../../store/simulation';
import { apiClient } from '../../services/api';
import type { PresetScenario } from '../../types/presets';

export const Configuration = () => {
  const { 
    config, 
    civilizations,
    maxSteps, 
    updateInterval, 
    setConfig, 
    addCivilization,
    removeCivilization,
    updateCivilization,
    setMaxSteps, 
    setUpdateInterval, 
    resetConfig 
  } = useConfigStore();
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

          {/* Civilizations Configuration */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="subtitle2">
                Civilizations ({civilizations.length})
              </Typography>
              <Button
                size="small"
                startIcon={<AddIcon />}
                onClick={addCivilization}
                disabled={civilizations.length >= 10}
              >
                Add Civilization
              </Button>
            </Box>
            <List dense>
              {civilizations.map((civ, index) => (
                <ListItem
                  key={civ.id}
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.paper'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                    <Box
                      sx={{
                        width: 20,
                        height: 20,
                        bgcolor: civ.color,
                        borderRadius: '50%',
                        border: '1px solid',
                        borderColor: 'divider'
                      }}
                    />
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <TextField
                          size="small"
                          label="Name"
                          value={civ.name || `Civilization ${index + 1}`}
                          onChange={(e) => updateCivilization(civ.id, { name: e.target.value })}
                          sx={{ flex: 1, minWidth: 120 }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Birth Time (yr)"
                          value={civ.birthTime}
                          onChange={(e) => updateCivilization(civ.id, { birthTime: parseFloat(e.target.value) || 0 })}
                          sx={{ width: 140 }}
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Lifetime (yr)"
                          value={civ.lifetime}
                          onChange={(e) => updateCivilization(civ.id, { lifetime: parseFloat(e.target.value) || 0 })}
                          sx={{ width: 140 }}
                        />
                        <TextField
                          size="small"
                          type="color"
                          value={civ.color}
                          onChange={(e) => updateCivilization(civ.id, { color: e.target.value })}
                          sx={{ width: 60 }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => removeCivilization(civ.id)}
                          disabled={civilizations.length === 1}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <TextField
                          size="small"
                          type="number"
                          label="Probe Velocity (km/s)"
                          placeholder={`Default: ${config.probeVelocityKmS}`}
                          value={civ.probeVelocity ?? ''}
                          onChange={(e) => updateCivilization(civ.id, { 
                            probeVelocity: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          sx={{ flex: 1 }}
                          helperText="Optional - overrides config default"
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Probe Range (ly)"
                          placeholder={`Default: ${config.probeRangeLy}`}
                          value={civ.probeRange ?? ''}
                          onChange={(e) => updateCivilization(civ.id, { 
                            probeRange: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          sx={{ flex: 1 }}
                          helperText="Optional - overrides config default"
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Launch Period (yr)"
                          placeholder={`Default: ${config.probeLaunchIntervalYr}`}
                          value={civ.probeLaunchPeriod ?? ''}
                          onChange={(e) => updateCivilization(civ.id, { 
                            probeLaunchPeriod: e.target.value ? parseFloat(e.target.value) : undefined 
                          })}
                          sx={{ flex: 1 }}
                          helperText="Optional - overrides config default"
                        />
                      </Box>
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
            <Typography variant="caption" color="text.secondary">
              Configure multiple starting civilizations with different colors, birth times, lifetimes, and probe capabilities.
              Leave probe parameters empty to use config defaults. At least one civilization is required.
            </Typography>
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
