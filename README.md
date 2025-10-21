# Aurora Effect: Galactic Settlement Simulator

A simulation framework for modeling the settlement and expansion of space-faring civilizations across the galaxy, based on the research paper ["The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, and Steady States"](docs/Carroll-Nellenback_2019_AJ_158_117.pdf) by Carroll-Nellenback et al. (2019).

## Overview

The **Aurora Effect** refers to the hypothesis that not all star systems are suitable for settlement by an expanding civilization - some worlds are inherently unsettleable despite being technically habitable. This project provides an interactive simulator to explore how this constraint, combined with finite probe ranges, stellar motions, and civilization lifetimes, affects the spread of intelligent life through the galaxy.

### Why This Matters

The Fermi Paradox asks: "If intelligent alien civilizations are common, where is everybody?" This simulator helps explore potential answers by modeling realistic scenarios where:

- **The galaxy can be partially settled**: Even if space-faring civilizations exist, statistical fluctuations can leave large regions (like our solar neighborhood) unvisited
- **Settlement takes time but is inevitable**: Under conservative assumptions, the Milky Way can be filled with settlements in less than 300 million years - much less than its 13 billion year age
- **Finite lifetimes create steady states**: Civilizations that rise and fall can reach an equilibrium where only a fraction of settleable systems are occupied at any given time
- **Earth could be unvisited in an inhabited galaxy**: Our current circumstances are consistent with living in a galaxy that contains other civilizations

## Features

The Aurora Effect simulator will provide:

### Core Simulation Engine
- **Agent-based modeling**: Accurate implementation of the settlement dynamics described in the research paper
- **Realistic physics**: Incorporates stellar motions, probe velocity constraints, and launch rates
- **Flexible parameters**: Configure probe speeds, ranges, launch periods, settleable fractions, and civilization lifetimes
- **Multiple civilizations**: Simulate independent civilizations with different starting points and characteristics
- **Variable probe parameters**: Per-civilization probe capabilities (velocity, range, launch period) for technology asymmetry modeling
- **Analytical validation**: Compare simulation results with theoretical predictions from the paper

### Web API
- **RESTful interface**: Create, configure, and control simulations via HTTP endpoints
- **Real-time updates**: WebSocket support for live simulation state streaming
- **Concurrent simulations**: Run multiple scenarios simultaneously
- **Data export**: Export simulation data for further analysis

### Interactive Visualization
- **WebGPU-accelerated rendering**: High-performance 3D galaxy visualization with Canvas 2D fallback
- **Multiple view modes**: 3D perspective or 2D projections (XY, XZ, YZ planes)
- **Interactive camera**: Drag to rotate, scroll to zoom, with reset and auto-rotate features
- **Real-time updates**: Watch civilizations expand across the galaxy as simulation progresses
- **Color-coded systems**: Distinct colors for settled, targeted, settleable, and unsettleable systems
- **Civilization tracking**: Unique colors for each civilization using golden angle distribution
- **Metrics overlay**: Live display of system counts and active civilizations
- **Performance optimized**: Smooth 60 fps rendering for 10,000+ star systems

## Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/lbsa71/aurora-effect.git
cd aurora-effect

# Install dependencies
npm install

# Build the packages
npm run build

# Run tests
npm run test
```

### Running the Web UI

```bash
# Start the API server (in one terminal)
npm run dev:api

# Start the UI development server (in another terminal)
npm run dev:ui
```

The UI will be available at http://localhost:5173 and the API at http://localhost:3000

### Running with Docker 🐳

The easiest way to run the entire application is using Docker Compose:

```bash
# First, build the application
./docker-build.sh

# Then build and start all services
docker compose up

# Or run in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

The UI will be available at http://localhost and the API at http://localhost:3000

#### Individual Docker Images

You can also build and run individual services:

```bash
# Build the application first
./docker-build.sh

# Build API image
docker build -f packages/api/Dockerfile -t aurora-api .

# Build UI image
docker build -f packages/ui/Dockerfile -t aurora-ui .

# Run API container
docker run -p 3000:3000 aurora-api

# Run UI container
docker run -p 80:80 aurora-ui
```

#### Docker Environment Variables

**API Service:**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (default: production)
- `CORS_ORIGIN` - CORS origin (default: *)
- `MAX_SIMULATIONS` - Maximum concurrent simulations (default: 10)
- `UPDATE_INTERVAL_MS` - Update interval in milliseconds (default: 100)

**UI Service:**
- `VITE_API_URL` - API server URL (default: http://localhost:3000)

**Note**: The Docker build process requires pre-built application code. Run `./docker-build.sh` to build the application before building Docker images.

### Using published Docker images (GHCR)

Pre-built images are published to GitHub Container Registry (GHCR) by CI for both API and UI:

- API image: `ghcr.io/lbsa71/aurora-effect-api`
- UI image: `ghcr.io/lbsa71/aurora-effect-ui`

Tags:

- `latest` on the `main` branch
- Branch names (e.g., `refs/heads/feature-x` -> `feature-x`)
- Git tags (e.g., `v1.2.3`)
- Commit SHA (e.g., `sha-<shortsha>`)

Pull images directly:

```bash
docker pull ghcr.io/lbsa71/aurora-effect-api:latest
docker pull ghcr.io/lbsa71/aurora-effect-ui:latest
```

Run with Docker directly:

```bash
# API
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e CORS_ORIGIN=https://aurora-effect.lbsa71.net \
  -e MAX_SIMULATIONS=10 \
  -e UPDATE_INTERVAL_MS=100 \
  ghcr.io/lbsa71/aurora-effect-api:latest

# UI (configure API URL)
docker run -p 80:80 \
  -e VITE_API_URL=https://aurora-effect.lbsa71.net \
  ghcr.io/lbsa71/aurora-effect-ui:latest
```

Run with Docker Compose (production):

```bash
# Optionally select a tag (defaults to latest)
export TAG=v1.2.3   # or main branch name, or omit for latest

docker compose -f docker-compose.prod.yml up -d
```

Authentication to GHCR is not required for public images. If you need to authenticate (e.g., for rate limits), run:

```bash
echo "$GITHUB_TOKEN" | docker login ghcr.io -u <github-username> --password-stdin
```

### Running Examples

```bash
# Navigate to examples directory
cd examples
npm install

# Run the basic simulation example
npm run basic
```

### Using the Simulator Library

```typescript
import {
  SimulationConfig,
  initializeSystems,
  initializeCivilization,
  createSimulationState,
  runSimulation,
} from '@aurora-effect/simulator';

// Define configuration
const config: SimulationConfig = {
  numSystems: 1000,
  boxSize: { x: 100, y: 100, z: 100 },
  density: 0.08,
  settleableFraction: 0.2,
  stellarVelocity: 30,
  probeVelocity: 0.01,
  probeRange: 10,
  probeLaunchPeriod: 100,
  civilizationLifetime: 0,
  initialSettledFraction: 0.01,
  timeStep: 100,
};

// Initialize systems and civilization
let systems = initializeSystems(config);
const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');
systems = result.systems;

// Create and run simulation
const state = createSimulationState(systems, [result.civilization]);
runSimulation(state, config, 10000);

console.log(`Settled fraction: ${state.metrics.settledFraction}`);
```

## Project Structure

This is a monorepo containing three main packages:

```
aurora-effect/
├── packages/
│   ├── simulator/      # Core simulation library (TypeScript)
│   ├── api/           # Web API with WebSocket support (Node.js)
│   └── ui/            # Web-based visualization (React + Vite) ✨
├── docs/              # Documentation and research papers
│   ├── Carroll-Nellenback_2019_AJ_158_117.pdf
│   ├── FUNCTIONS_AND_ALGORITHMS.md
│   ├── IMPLEMENTATION_STRATEGY.md
│   ├── PHASE1_SUMMARY.md
│   ├── PHASE2_SUMMARY.md
│   └── PHASE3_SUMMARY.md
├── examples/          # Example configurations and scenarios
└── README.md
```

## Scientific Background

### The Settlement Model

The simulator implements a model where:

1. **Probes are launched** from settled systems to nearby unsettled systems
2. **Probes have finite range** (e.g., 10 light-years) and velocity (e.g., 0.01c)
3. **Systems move** through space with typical stellar velocities (~30 km/s)
4. **Only a fraction f** of systems are settleable (the "Aurora Effect")
5. **Civilizations have lifetimes** (T_s) after which they can no longer launch probes
6. **Settlement fronts propagate** through the galaxy via a combination of directed probes and stellar diffusion

### Key Parameters

The simulation is controlled by several dimensionless parameters:

- **η (eta)**: Normalized density of settleable systems (η = ρ·f·d_p³)
  - Critical threshold: η ≈ 0.88 for full connectivity
- **ν_s (nu_s)**: Ratio of stellar velocity to probe velocity
- **τ_p (tau_p)**: Ratio of probe launch period to travel time
- **T_s**: Settlement civilization lifetime
- **f**: Fraction of systems that are settleable

See [FUNCTIONS_AND_ALGORITHMS.md](docs/FUNCTIONS_AND_ALGORITHMS.md) for complete mathematical details.

### Key Findings

The original research demonstrated:

1. **Rapid settlement is possible**: The galaxy can be filled in < 300 Myr even with slow (0.001c) probes
2. **Stellar diffusion matters**: At low settleable densities, stellar motions enable spread even when probes can't reach neighbors
3. **Partial settlement is stable**: With finite lifetimes, 0 < X < 1 steady states exist
4. **Statistical clustering occurs**: Random variations create persistent unsettled regions
5. **Fermi Paradox resolution**: Earth being unvisited is consistent with an inhabited galaxy

## Documentation

- **[FUNCTIONS_AND_ALGORITHMS.md](docs/FUNCTIONS_AND_ALGORITHMS.md)**: Mathematical formulas, equations, and algorithms from the paper
- **[IMPLEMENTATION_STRATEGY.md](docs/IMPLEMENTATION_STRATEGY.md)**: Detailed implementation plan with tickets for each feature
- **[Research Paper](docs/Carroll-Nellenback_2019_AJ_158_117.pdf)**: Original Carroll-Nellenback et al. (2019) publication

## Example Scenarios

The simulator will include preset scenarios exploring:

- **Classic Fermi Paradox**: Why we don't see evidence of civilizations
- **Rare Earth**: Effects of very low settleable fractions (f ≪ 1)
- **Short-lived civilizations**: Equilibrium with frequent extinction
- **Slow expansion**: Conservative probe parameters (low v_p, high T_p)
- **Multiple civilizations**: Competing settlement fronts
- **Full settlement**: Optimistic parameters leading to X → 1

## Development Status

**Current Phase**: Phase 4 In Progress! 🚧

See [IMPLEMENTATION_STRATEGY.md](docs/IMPLEMENTATION_STRATEGY.md) for the complete development roadmap.

### ✅ Phase 1: Core Simulator Library (COMPLETE)
- ✅ Research paper analysis
- ✅ Mathematical model extraction
- ✅ Architecture design
- ✅ Implementation strategy
- ✅ Ticket 1.1: Project setup and infrastructure
- ✅ Ticket 1.2: Core data structures
- ✅ Ticket 1.3: System initialization
- ✅ Ticket 1.4: Probe targeting algorithm
- ✅ Ticket 1.5: Simulation time stepping
- ✅ Ticket 1.6: Analytical models
- ✅ Ticket 1.7: Civilization lifetime dynamics
- ✅ Ticket 1.8: Metrics and analysis
- ✅ Ticket 1.9: Validation against paper results ✨

**Status**: 46 unit tests passing, fully validated against the research paper!

### ✅ Phase 2: Web API (COMPLETE)
- ✅ Ticket 2.1: API Framework Setup
  - Express.js server with TypeScript
  - Socket.io WebSocket support
  - CORS configuration
  - Error handling middleware
  - Health check endpoint
- ✅ Ticket 2.2: Simulation Lifecycle Endpoints
  - Create, start, pause, resume, stop, delete simulations
  - List all simulations
  - Get simulation status
- ✅ Ticket 2.3: Configuration Management
  - Zod schema validation
  - Configuration templates
- ✅ Ticket 2.4: Real-time Updates via WebSocket
  - Room-based Socket.io for multiple simulations
  - Configurable update frequency
  - Client reconnection support
- ✅ Ticket 2.5: Data Export Endpoints
  - Current state snapshots
  - Configuration export

**Status**: 23 API tests passing (5 original + 10 presets + 8 demo starfield)!

### ✅ Phase 3: Web UI (COMPLETE)
- ✅ Ticket 3.1: UI Framework Setup
  - Vite + React 19 + TypeScript
  - Material-UI components
  - Zustand state management
  - Socket.io-client integration
- ✅ Ticket 3.2: Configuration Interface
  - Form for all simulation parameters
  - Real-time validation
  - Preset configurations
- ✅ Ticket 3.3: Galaxy Visualization Canvas
  - WebGPU-accelerated rendering with Canvas 2D fallback
  - 3D/2D view modes
  - Interactive camera controls
  - 60 fps for 10,000+ systems
- ✅ Ticket 3.4: Simulation Controls
  - Create, start, pause, resume, stop
  - Status indicators and error handling
- ✅ Ticket 3.5: Real-time Updates Integration
  - WebSocket connection management
  - Snapshot polling for visualization
  - Automatic reconnection
- ✅ Ticket 3.6: Metrics Dashboard
  - Real-time statistics display
  - Formatted numbers and units
- ✅ Ticket 3.7: Civilization Legend
  - Active and extinct civilization tracking
  - Color-coded legend with golden angle
  - System counts and lifetime remaining

**Status**: Production build at 280.43 KB (gzipped), all core features implemented!

### 🚧 Phase 4: Advanced Features (IN PROGRESS)
- ✅ Ticket 4.4: Scenario Presets
  - 10 scientifically designed scenarios
  - API endpoints for preset management
  - UI preset selector with categories
  - Covers Fermi Paradox, optimistic, steady-state, and research scenarios
- ✅ Time Series Charts
  - Real-time data visualization with Recharts
  - Settled fraction, civilizations, probes, front position
  - Interactive tooltips and formatted axes
  - CSV data export
- ✅ Progress Bar
  - Visual simulation completion indicator
- ✅ Ticket 4.1: Multiple Civilization Origins
  - Configure multiple starting civilizations with unique colors
  - Per-civilization metrics (settled systems, probes, status)
  - Add/remove/edit civilizations in UI
  - Visual civilization management interface
  - Civilization collision handling (first arrival wins)
- ⏳ Ticket 4.2: Variable Probe Parameters
- ⏳ Ticket 4.3: Galactic Features
- ⏳ Ticket 4.5: Performance Optimization

**Status**: 70 tests passing (24 API + 46 simulator), 5/7 features complete (71%)!  
**See detailed progress**: [docs/PHASE4_SUMMARY.md](docs/PHASE4_SUMMARY.md)

### Validation Results

The simulator has been **validated against key results** from Carroll-Nellenback et al. (2019):

- ✅ **Figure 3**: Settlement front exhibits logistic growth pattern
- ✅ **Figures 6/7**: Crossing times respond correctly to parameter changes
- ✅ **Figure 8**: Equilibrium fractions increase with civilization lifetime
- ✅ **Figure 9**: Steady-state behavior matches theoretical predictions

**Run validation**: `npm run validate` in `packages/simulator`  
**See full report**: [docs/VALIDATION_REPORT.md](docs/VALIDATION_REPORT.md)

### Next Steps
- 🚧 Phase 4: Advanced Features (in progress - 4/7 complete)
- ⏳ Phase 5: Documentation and Polish

## Technology Stack

- **Simulator**: TypeScript with Vitest ✅
- **API**: Node.js with Express and Socket.io ✅
- **UI**: React with Vite and TypeScript (in progress)
- **Build**: npm workspaces ✅
- **Testing**: Vitest ✅
- **CI/CD**: GitHub Actions ✅

## Contributing

Contributions are welcome! This project is in early development. Please see the [IMPLEMENTATION_STRATEGY.md](docs/IMPLEMENTATION_STRATEGY.md) for areas where help is needed.

### How to Contribute

1. Check existing issues or create a new one
2. Fork the repository
3. Create a feature branch
4. Make your changes with tests
5. Submit a pull request

## Citation

If you use this simulator in your research, please cite:

```bibtex
@article{carroll-nellenback2019,
  title={The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, and Steady States},
  author={Carroll-Nellenback, Jonathan and Frank, Adam and Wright, Jason and Scharf, Caleb},
  journal={The Astronomical Journal},
  volume={158},
  number={3},
  pages={117},
  year={2019},
  publisher={IOP Publishing}
}
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- **Research Team**: Jonathan Carroll-Nellenback, Adam Frank, Jason Wright, and Caleb Scharf for their original research
- **Inspiration**: The profound questions raised by the Fermi Paradox and the search for extraterrestrial intelligence
- **Community**: All contributors to this open-source project

## Related Projects

- [SETI@home](https://setiathome.berkeley.edu/) - Distributed computing for SETI
- [Breakthrough Listen](https://breakthroughinitiatives.org/initiative/1) - Search for intelligent life
- [Gaia Mission](https://www.cosmos.esa.int/web/gaia) - Stellar position and velocity data

## Contact

For questions, suggestions, or collaboration opportunities:

- **Issues**: [GitHub Issues](https://github.com/lbsa71/aurora-effect/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lbsa71/aurora-effect/discussions)

---

**"Where is everybody?"** - Enrico Fermi, 1950

Let's find out.