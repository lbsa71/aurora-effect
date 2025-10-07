# Copilot Instructions for Aurora Effect

## Project Overview

**Aurora Effect** is a galactic settlement simulator based on the research paper "The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, and Steady States" by Carroll-Nellenback et al. (2019). The project simulates how space-faring civilizations spread across the galaxy, exploring solutions to the Fermi Paradox.

**Current Status**: Phase 1 Implementation - Core simulator library complete (Tickets 1.1-1.8). The repository contains a working TypeScript-based simulator with comprehensive tests. Validation against paper results (Ticket 1.9) is in progress.

**Repository Size**: Medium (~30+ files). Active npm workspaces monorepo with TypeScript, Vitest, ESLint, and GitHub Actions CI/CD configured.

## Technology Stack (Implemented)

- **Monorepo Structure**: npm workspaces ✅
- **Simulator**: TypeScript with Vitest testing ✅
- **API**: Node.js with Express and Socket.io (planned for Phase 2)
- **UI**: React or Vue.js with Canvas/WebGL (planned for Phase 3)
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
│   └── IMPLEMENTATION_STRATEGY.md               # Detailed implementation plan
├── packages/
│   └── simulator/                  # Core simulation library ✅
│       ├── src/
│       │   ├── types.ts            # Type definitions
│       │   ├── utils.ts            # Utility functions
│       │   ├── initialization.ts   # System initialization
│       │   ├── targeting.ts        # Probe targeting algorithm
│       │   ├── simulation.ts       # Main simulation engine
│       │   ├── analytics.ts        # Analytical models
│       │   └── index.ts            # Public API
│       ├── tests/                  # 46 passing tests
│       ├── package.json
│       ├── tsconfig.json
│       └── vitest.config.ts
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

**IMPLEMENTATION_STRATEGY.md** (docs/): Contains the complete development roadmap divided into 5 phases with detailed tickets. Phase 1 (Tickets 1.1-1.8) is complete with working implementation.

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
- Build: `npm run build` (compiles TypeScript to dist/)
- Test: `npm run test` (runs Vitest tests)
- Lint: `npm run lint` (runs ESLint)
- Format: `npm run format` (runs Prettier - not yet implemented)

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
2. **api/**: REST API + WebSocket server (Node.js/Express) - planned for Phase 2
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

**Validation Requirements** (Ticket 1.9) ⏳:
- Must reproduce Figure 3: Front snapshot and logistic curve (pending)
- Must reproduce Figures 6/7: Front crossing time vs. parameters (pending)
- Must reproduce Figure 8: Equilibrium fraction vs. parameters (pending)
- Results must match paper within statistical uncertainty (pending)

## Code Quality Standards

**Testing Strategy** (Implemented) ✅:
- **Unit Tests**: 46 passing tests covering mathematical functions, data structures, and algorithms
- **Integration Tests**: Simulation engine tests (API/UI tests planned for Phases 2-3)
- **Validation Tests**: Pending completion of Ticket 1.9
- **Manual Testing**: Basic example demonstrates core functionality

**Performance Targets**:
- Support real-time simulation of 10,000+ star systems ✅ (architecture supports this)
- WebSocket updates must handle 10+ concurrent simulations (Phase 2)
- No memory leaks in long-running simulations ✅ (no known issues)

## Important Notes for Coding Agents

1. **Core Simulator Complete**: Phase 1 Tickets 1.1-1.8 are complete. Code exists and is working. Focus on validation (Ticket 1.9) or Phase 2+ features.

2. **Scientific Accuracy Required**: Changes to simulation logic must align with Carroll-Nellenback et al. (2019) paper. Reference FUNCTIONS_AND_ALGORITHMS.md for correct formulas.

3. **Technology Stack Decided**: Using TypeScript with npm workspaces, Vitest, ESLint, and GitHub Actions. This is now the established stack.

4. **CI/CD Configured**: GitHub Actions workflow exists and runs on push/PR. Tests and linting run automatically.

5. **Build Infrastructure Complete**: Ticket 1.1 is done. Package builds successfully with TypeScript compiler.

6. **Next Priority**: Validation against paper results (Ticket 1.9) or starting Phase 2 (Web API).

## Common Pitfalls to Avoid

- **Don't break existing tests**: 46 tests currently passing - maintain this
- **Don't skip validation**: Simulation results must match the research paper (Ticket 1.9 pending)
- **Don't ignore performance**: Must handle 10,000+ systems efficiently ✅
- **Don't create code without tests**: Testing infrastructure exists - use it ✅
- **Read the paper**: FUNCTIONS_AND_ALGORITHMS.md and IMPLEMENTATION_STRATEGY.md are critical references

## Quick Reference

**File Count**: 30+ files (packages, tests, config, docs)
**Lines of Code**: ~2,500 (TypeScript simulator + tests)
**Test Coverage**: 46 passing tests
**Implementation Tickets**: 8/9 Phase 1 tickets complete (Ticket 1.9 pending)
**License**: MIT
**Target Performance**: 10,000+ systems, real-time updates, <300 Myr galaxy crossing time simulation ✅

## Update Requirements
ALWAYS end your work with reviewing and updating these files:
- README.md
- docs/IMPLEMENTATION_STRATEGY.md
- .github/copilot-instructions.md (But MUST retain these Update Requirements)