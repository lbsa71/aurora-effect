/**
 * Civilization Legend component
 * Displays active and extinct civilizations with their colors and statistics
 */

import {
  Card,
  CardContent,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { useSimulationStore } from '../../store/simulation';

const getCivilizationColor = (id: number): string => {
  const hue = (id * 137.5) % 360; // Golden angle - same as renderer
  return `hsl(${hue}, 70%, 60%)`;
};

const formatNumber = (num: number): string => {
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
  return num.toString();
};

export const Legend = () => {
  const snapshot = useSimulationStore((state) => state.snapshot);

  if (!snapshot?.civilizations || snapshot.civilizations.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Civilizations
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No civilizations yet
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const activeCivilizations = snapshot.civilizations.filter((c) => c.isActive);
  const extinctCivilizations = snapshot.civilizations.filter((c) => !c.isActive);

  const getSettledCount = (civId: number): number => {
    return snapshot.systems.filter((s) => s.civilizationId === civId).length;
  };

  const getLifetimeRemaining = (civilization: typeof snapshot.civilizations[0]): string => {
    if (civilization.lifetime === 0) return 'Infinite';
    
    const elapsed = snapshot.metrics.time - civilization.birthTime;
    const remaining = civilization.lifetime - elapsed;
    
    if (remaining <= 0) return 'Extinct';
    return `${formatNumber(remaining)} yr`;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Civilizations
        </Typography>

        {activeCivilizations.length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Active ({activeCivilizations.length})
            </Typography>
            <List dense disablePadding>
              {activeCivilizations.map((civ) => (
                <ListItem
                  key={civ.id}
                  disableGutters
                  sx={{ py: 0.5 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CircleIcon
                      sx={{
                        color: getCivilizationColor(civ.id),
                        fontSize: 16,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2">
                          Civ #{civ.id}
                        </Typography>
                        <Chip
                          label="Active"
                          size="small"
                          color="success"
                          sx={{ height: 18, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Birth: {formatNumber(civ.birthTime)} yr • 
                        Systems: {getSettledCount(civ.id)} • 
                        Remaining: {getLifetimeRemaining(civ)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        {activeCivilizations.length > 0 && extinctCivilizations.length > 0 && (
          <Divider sx={{ my: 1 }} />
        )}

        {extinctCivilizations.length > 0 && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Extinct ({extinctCivilizations.length})
            </Typography>
            <List dense disablePadding>
              {extinctCivilizations.map((civ) => (
                <ListItem
                  key={civ.id}
                  disableGutters
                  sx={{ py: 0.5, opacity: 0.6 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <CircleIcon
                      sx={{
                        color: getCivilizationColor(civ.id),
                        fontSize: 16,
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography variant="body2">
                          Civ #{civ.id}
                        </Typography>
                        <Chip
                          label="Extinct"
                          size="small"
                          sx={{ height: 18, fontSize: '0.7rem' }}
                        />
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        Birth: {formatNumber(civ.birthTime)} yr • 
                        Death: {formatNumber(civ.birthTime + civ.lifetime)} yr • 
                        Systems: {getSettledCount(civ.id)}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
};
