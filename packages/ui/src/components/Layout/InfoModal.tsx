/**
 * Info Modal Component
 * Displays information about the Aurora Effect simulator
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
  Link,
  Box,
  Divider,
} from '@mui/material';
import { Close } from '@mui/icons-material';

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

export const InfoModal = ({ open, onClose }: InfoModalProps) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" component="span">
            About Aurora Effect
          </Typography>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="body1" paragraph>
            The <strong>Aurora Effect</strong> refers to the hypothesis that not all star systems 
            are suitable for settlement by an expanding civilization - some worlds are inherently 
            unsettleable despite being technically habitable. This simulator explores how this 
            constraint, combined with finite probe ranges, stellar motions, and civilization 
            lifetimes, affects the spread of intelligent life through the galaxy.
          </Typography>

          <Typography variant="body1" paragraph>
            This interactive simulator helps explore potential answers to the{' '}
            <strong>Fermi Paradox</strong> ("If intelligent alien civilizations are common, where 
            is everybody?") by modeling realistic scenarios where the galaxy can be partially 
            settled, leaving large regions unvisited, or where civilizations reach steady-state 
            equilibria with only a fraction of settleable systems occupied.
          </Typography>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              Research Paper
            </Typography>
            <Typography variant="body2" paragraph>
              This simulation is based on the research paper:
            </Typography>
            <Typography variant="body2" sx={{ fontStyle: 'italic', mb: 1 }}>
              "The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, 
              and Steady States"
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Authors:</strong> Jonathan Carroll-Nellenback, Adam Frank, Jason Wright, 
              and Caleb Scharf
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Published in:</strong> The Astronomical Journal, Volume 158, Number 3, 
              Page 117 (2019)
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>Publisher:</strong> IOP Publishing
            </Typography>
            <Link
              href="https://iopscience.iop.org/article/10.3847/1538-3881/ab31a3"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'block', mb: 1 }}
            >
              View paper on IOPscience
            </Link>
            <Link
              href="https://arxiv.org/abs/1902.04450"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ display: 'block' }}
            >
              View paper on arXiv
            </Link>
          </Box>

          <Divider />

          <Box>
            <Typography variant="h6" gutterBottom>
              Key Findings
            </Typography>
            <Box component="ul" sx={{ pl: 2 }}>
              <li>
                <Typography variant="body2">
                  <strong>Rapid settlement is possible:</strong> The galaxy can be filled in 
                  less than 300 million years even with slow probes
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Stellar diffusion matters:</strong> At low settleable densities, 
                  stellar motions enable spread even when probes can't reach neighbors
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Partial settlement is stable:</strong> With finite lifetimes, 
                  steady states with 0 &lt; X &lt; 1 exist
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Statistical clustering occurs:</strong> Random variations create 
                  persistent unsettled regions
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  <strong>Fermi Paradox resolution:</strong> Earth being unvisited is consistent 
                  with an inhabited galaxy
                </Typography>
              </li>
            </Box>
          </Box>

          <Divider />

          <Box>
            <Typography variant="body2" color="text.secondary">
              This is an open-source project. Learn more at{' '}
              <Link
                href="https://github.com/lbsa71/aurora-effect"
                target="_blank"
                rel="noopener noreferrer"
              >
                github.com/lbsa71/aurora-effect
              </Link>
            </Typography>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
