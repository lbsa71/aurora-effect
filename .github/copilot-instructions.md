# Copilot Instructions for Aurora Effect

## Project Overview

**Aurora Effect** is a galactic settlement simulator based on the research paper "The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, and Steady States" by Carroll-Nellenback et al. (2019). The project simulates how space-faring civilizations spread across the galaxy, exploring solutions to the Fermi Paradox.

**Current Status**: Phase 4 In Progress! 🚧 - Core simulator library (46 tests), Web API (23 tests), and Web UI (7 components) fully implemented and tested. Phase 1 (Tickets 1.1-1.9), Phase 2 (Tickets 2.1-2.5), and Phase 3 (Tickets 3.1-3.7) complete. Phase 4 partially complete with scenario presets, time series charts, and data export.

**Repository Size**: Medium (~100+ files). Active npm workspaces monorepo with TypeScript, Vitest, ESLint, and GitHub Actions CI/CD configured. Includes simulator library, Web API, and Web UI packages.

## Technology Stack (Implemented)

- **Monorepo Structure**: npm workspaces ✅
- **Simulator**: TypeScript with Vitest testing ✅
- **API**: Node.js with Express and Socket.io ✅
- **UI**: React with Vite and TypeScript (Phase 3 in progress)
- **Build**: TypeScript compiler (tsc) ✅
- **Testing**: Vitest ✅
- **CI/CD**: GitHub Actions ✅

## Repository Structure

```
aurora-effect/
├── .github/
│   ├── copilot-instructions.md    # This file
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI pipeline
├── docs/
│   ├── Carroll-Nellenback_2019_AJ_158_117.pdf  # Original research paper
│   ├── FUNCTIONS_AND_ALGORITHMS.md             # Mathematical formulas & algorithms
│   ├── IMPLEMENTATION_STRATEGY.md               # Detailed implementation plan
│   ├── PHASE1_SUMMARY.md                        # Phase 1 completion summary
│   ├── PHASE2_SUMMARY.md                        # Phase 2 completion summary ✅
│   ├── PHASE3_SUMMARY.md                        # Phase 3 completion summary ✅
│   ├── PHASE4_SUMMARY.md                        # Phase 4 progress 🚧
│   └── VALIDATION_REPORT.md                     # Validation results ✅
├── packages/
│   ├── simulator/                  # Core simulation library ✅
│   │   ├── src/
│   │   │   ├── types.ts            # Type definitions
│   │   │   ├── utils.ts            # Utility functions
│   │   │   ├── initialization.ts   # System initialization
│   │   │   ├── targeting.ts        # Probe targeting algorithm
│   │   │   ├── simulation.ts       # Main simulation engine
│   │   │   ├── analytics.ts        # Analytical models
│   │   │   └── index.ts            # Public API
│   │   ├── validation/             # Validation scripts ✅
│   │   ├── tests/                  # 46 passing tests
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vitest.config.ts
│   └── api/                        # Web API ✅
│       ├── src/
│       │   ├── routes/             # API routes
│       │   ├── middleware/         # Express middleware
│       │   ├── services/           # Business logic
│       │   ├── types/              # Type definitions
│       │   ├── config/             # Configuration
│       │   ├── app.ts              # Express app setup
│       │   └── index.ts            # Server entry point
│       ├── tests/                  # 5 passing tests
│       ├── examples/               # Client examples
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
│   └── ui/                         # Web UI 🎉
│       ├── src/
│       │   ├── components/         # React components
│       │   │   ├── Configuration/  # Configuration form
│       │   │   ├── Controls/       # Simulation controls
│       │   │   ├── Layout/         # App layout
│       │   │   ├── Legend/         # Civilization legend
│       │   │   ├── Metrics/        # Metrics display
│       │   │   └── Visualization/  # Galaxy canvas (WebGPU/Canvas2D)
│       │   ├── hooks/              # Custom hooks
│       │   ├── services/           # API & WebSocket clients
│       │   ├── store/              # Zustand state
│       │   ├── types/              # Type definitions
│       │   ├── App.tsx
│       │   └── main.tsx
│       ├── public/
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── examples/                       # Example scripts ✅
│   └── basic-simulation.ts
├── .gitignore
├── .eslintrc.js                    # ESLint configuration
├── .prettierrc.json                # Prettier configuration
├── LICENSE                         # MIT License
├── package.json                    # Root workspace configuration
└── README.md                       # Project overview and documentation
```

## Key Documentation Files

**IMPLEMENTATION_STRATEGY.md** (docs/): Contains the complete development roadmap divided into 5 phases with detailed tickets. Phase 1 (Tickets 1.1-1.9) and Phase 2 (Tickets 2.1-2.5) are complete with working implementation.

**FUNCTIONS_AND_ALGORITHMS.md** (docs/): Mathematical model details including:
- Physical parameters (f, ρ, d_p, v_p, v_s, T_p, T_s)
- Normalized dimensionless parameters (η, ν_s, τ_p)
- Settlement front speed models
- Probe targeting algorithms
- Critical density thresholds

**README.md**: High-level project description, scientific background, features, quick start guide with installation and usage instructions.

## Development Workflow

### Initial Setup ✅
Project has been initialized with:
1. npm workspaces monorepo structure
2. TypeScript project with strict type checking
3. ESLint and Prettier configured
4. Vitest test framework with 46 passing tests
5. GitHub Actions CI/CD pipeline

### Build & Test Commands
All commands run from repository root:
- Build: `npm run build` (compiles TypeScript to dist/ for all packages)
- Test: `npm run test` (runs Vitest tests for all packages)
- Validate: `npm run validate` (in packages/simulator - runs validation suite)
- Lint: `npm run lint` (runs ESLint)
- Format: `npm run format` (runs Prettier - not yet implemented)
- Dev (UI): `npm run dev:ui` (starts UI dev server at http://localhost:5173)
- Dev (API): `npm run dev:api` (starts API server at http://localhost:3000)
- Dev (Simulator): `npm run dev` (in packages/simulator)

### Running Examples
```bash
cd examples
npm install
npm run basic  # Run basic simulation example
```

## Architecture Guidelines

### Monorepo Organization ✅
The codebase is organized into packages:
1. **simulator/**: Core logic, data structures, algorithms (TypeScript) ✅
2. **api/**: REST API + WebSocket server (Node.js/Express) ✅
3. **ui/**: Visualization and controls (React or Vue.js) - planned for Phase 3

### Key Architectural Decisions (Implemented)

**Core Data Structures** (Ticket 1.2) ✅:
- StarSystem: position, velocity, settlement status, settleable flag, civilization ID
- Civilization: ID, origin, birth time, lifetime, probe count, active status
- Probe: source/target systems, launch/intercept times, civilization ID

**Probe Targeting Algorithm** (Ticket 1.4) ✅:
- Checks if system ready to launch (time since last ≥ T_p)
- Finds unsettled, untargeted systems in range
- Calculates intercept time considering relative velocities
- Selects system with shortest intercept time
- Handles N=10,000 systems efficiently

**Simulation Engine** (Ticket 1.5) ✅:
- Discrete time stepping with configurable dt
- Updates system positions with periodic boundaries
- Processes probe launches and arrivals
- Tracks metrics (X(t), front position, active civilizations)
- Handles civilization deaths (Ticket 1.7)

**Analytical Models** (Ticket 1.6) ✅:
- Front speed calculation (high/low/intermediate density regimes)
- Steady state equilibrium calculation
- Critical density thresholds (η_1 through η_4)
- Galaxy crossing time estimates

**Validation Requirements** (Ticket 1.9) ✅:
- Must reproduce Figure 3: Front snapshot and logistic curve ✅ PASSED
- Must reproduce Figures 6/7: Front crossing time vs. parameters ✅ PASSED
- Must reproduce Figure 8: Equilibrium fraction vs. parameters ✅ PASSED
- Must reproduce Figure 9: Steady-state validation ✅ PASSED
- Results match paper trends within acceptable bounds ✅ VALIDATED

## Code Quality Standards

**Testing Strategy** (Implemented) ✅:
- **Unit Tests**: 46 simulator tests + 23 API tests = 69 total passing tests
- **Integration Tests**: API integration tests with supertest
- **Validation Tests**: Complete validation suite reproduces all paper figures
- **Manual Testing**: Basic example and API client demonstrate functionality

**Performance Targets**:
- Support real-time simulation of 10,000+ star systems ✅ (architecture supports this)
- WebSocket updates must handle 10+ concurrent simulations (Phase 2)
- No memory leaks in long-running simulations ✅ (no known issues)

## Important Notes for Coding Agents

1. **Phase 4 In Progress**: Scenario presets (Ticket 4.4), time series charts, progress bar, and data export complete. 69 tests passing (23 API + 46 simulator). Remaining Phase 4 tickets (4.1, 4.2, 4.3, 4.5) not yet started.

2. **Phases 1-3 Complete**: All core simulator, API, and UI features implemented and validated.

3. **Scientific Accuracy Maintained**: Changes to simulation logic must align with Carroll-Nellenback et al. (2019) paper. Reference FUNCTIONS_AND_ALGORITHMS.md for correct formulas.

4. **Technology Stack Established**: Using TypeScript with npm workspaces, Vitest, ESLint, Express, Socket.io, Recharts, and GitHub Actions. This is the established stack.

5. **CI/CD Configured**: GitHub Actions workflow exists and runs on push/PR. Tests and linting run automatically.

6. **Build Infrastructure Complete**: All packages build successfully with TypeScript compiler.

7. **Validation Complete**: Ticket 1.9 is done. All four validation tests pass. See VALIDATION_REPORT.md.

8. **Advanced UI Features**: Time series charts with Recharts, preset scenario selector, CSV export, and progress bars all implemented.

## Common Pitfalls to Avoid

- **Don't break existing tests**: 69 unit tests (46 simulator + 23 API) currently passing - maintain this
- **Validation is complete**: Simulation results validated against the research paper ✅
- **API is complete**: Phase 2 REST API and WebSocket functionality complete ✅
- **Don't ignore performance**: Must handle 10,000+ systems efficiently ✅
- **Don't create code without tests**: Testing infrastructure exists - use it ✅
- **Read the paper**: FUNCTIONS_AND_ALGORITHMS.md and IMPLEMENTATION_STRATEGY.md are critical references

## Quick Reference

**File Count**: 110+ files (packages including UI, validation, tests, config, docs)
**Lines of Code**: ~18,000 (TypeScript simulator + API + UI + visualization + validation + tests)
**Test Coverage**: 69 tests (46 simulator + 23 API) - all passing
**Implementation Tickets**: 23/29 tickets complete ✅ (Phases 1-3 complete, Phase 4 partial)
**License**: MIT
**Target Performance**: 10,000+ systems, real-time updates, 60 fps visualization ✅
**Bundle Size**: 280.43 KB (gzipped) ✅

## Update Requirements
ALWAYS end your work with reviewing and updating these files:
- README.md
- docs/IMPLEMENTATION_STRATEGY.md
- .github/copilot-instructions.md (But MUST retain these Update Requirements)