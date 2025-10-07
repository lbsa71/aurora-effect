# Copilot Instructions for Aurora Effect

## Project Overview

**Aurora Effect** is a galactic settlement simulator based on the research paper "The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, and Steady States" by Carroll-Nellenback et al. (2019). The project simulates how space-faring civilizations spread across the galaxy, exploring solutions to the Fermi Paradox.

**Current Status**: Planning and Architecture phase - no code implementation yet. The repository contains comprehensive documentation and implementation strategy but no packages, build scripts, or source code.

**Repository Size**: Small (~5 files + docs). No dependencies, no build system configured yet.

## Technology Stack (Planned)

- **Monorepo Structure**: Will use npm workspaces, pnpm, or yarn workspaces
- **Simulator**: TypeScript or Python with NumPy
- **API**: Node.js with Express and Socket.io
- **UI**: React or Vue.js with Canvas/WebGL
- **Build**: Turborepo or Nx (not yet implemented)
- **Testing**: Jest/Vitest for JS/TS, Pytest for Python (not yet implemented)
- **CI/CD**: GitHub Actions (not yet configured)

## Repository Structure

```
aurora-effect/
├── .github/
│   └── copilot-instructions.md    # This file
├── docs/
│   ├── Carroll-Nellenback_2019_AJ_158_117.pdf  # Original research paper
│   ├── FUNCTIONS_AND_ALGORITHMS.md             # Mathematical formulas & algorithms
│   └── IMPLEMENTATION_STRATEGY.md               # Detailed implementation plan
├── .gitignore                      # Node.js/TypeScript/Python ignore patterns
├── LICENSE                         # MIT License
└── README.md                       # Project overview and documentation

# Future structure (not yet created):
├── packages/
│   ├── simulator/                  # Core simulation library
│   ├── api/                        # Web API with WebSocket support
│   └── ui/                         # Web-based visualization
└── examples/                       # Example configurations
```

## Key Documentation Files

**IMPLEMENTATION_STRATEGY.md** (docs/): Contains the complete development roadmap divided into 5 phases with detailed tickets:
- Phase 1: Core Simulator Library (Tickets 1.1-1.9)
- Phase 2: Web API (Tickets 2.1-2.5)
- Phase 3: Web UI (Tickets 3.1-3.7)
- Phase 4: Advanced Features (Tickets 4.1-4.5)
- Phase 5: Documentation and Polish (Tickets 5.1-5.4)

**FUNCTIONS_AND_ALGORITHMS.md** (docs/): Mathematical model details including:
- Physical parameters (f, ρ, d_p, v_p, v_s, T_p, T_s)
- Normalized dimensionless parameters (η, ν_s, τ_p)
- Settlement front speed models
- Probe targeting algorithms
- Critical density thresholds

**README.md**: High-level project description, scientific background, features, and quick start guide (currently placeholder as no code exists).

## Development Workflow (When Packages Exist)

### Initial Setup (Not Yet Applicable)
The project is in planning phase. When implementation begins, follow these steps:
1. Choose monorepo manager (npm workspaces, pnpm, or yarn)
2. Initialize TypeScript or Python project structure
3. Configure ESLint and Prettier
4. Set up Jest/Vitest or Pytest
5. Create GitHub Actions CI/CD pipeline

**Note**: Currently there is NO package.json, NO build scripts, NO test infrastructure. Any code changes should start with Ticket 1.1 from IMPLEMENTATION_STRATEGY.md.

### Build & Test Commands (Future)
Currently not applicable - no build system exists. When implementing:
- Build: TBD (likely `npm run build` or `pnpm build`)
- Test: TBD (likely `npm test` or `pytest`)
- Lint: TBD (likely `npm run lint`)
- Dev: TBD (likely `npm run dev`)

## Architecture Guidelines

### Monorepo Organization
The codebase will be split into three packages (not yet created):
1. **simulator/**: Core logic, data structures, algorithms (language TBD: TypeScript or Python)
2. **api/**: REST API + WebSocket server (Node.js/Express)
3. **ui/**: Visualization and controls (React or Vue.js)

### Key Architectural Decisions from IMPLEMENTATION_STRATEGY.md

**Core Data Structures** (Ticket 1.2):
- StarSystem: position, velocity, settlement status, settleable flag
- Civilization: ID, origin, birth time, lifetime, probe count
- Probe: source/target systems, launch/intercept times

**Probe Targeting Algorithm** (Ticket 1.4):
- Check if system ready to launch (time since last ≥ T_p)
- Find unsettled, untargeted systems in range
- Calculate intercept time considering velocities
- Select system with shortest intercept time
- Performance must handle N=10,000 systems

**Validation Requirements** (Ticket 1.9):
- Must reproduce Figure 3: Front snapshot and logistic curve
- Must reproduce Figures 6/7: Front crossing time vs. parameters
- Must reproduce Figure 8: Equilibrium fraction vs. parameters
- Results must match paper within statistical uncertainty

## Code Quality Standards

**Testing Strategy** (from IMPLEMENTATION_STRATEGY.md):
- **Unit Tests**: All mathematical functions, data structures, algorithms
- **Integration Tests**: API endpoints, WebSocket communication, UI components
- **Validation Tests**: Results vs. paper, regression tests, performance benchmarks
- **Manual Testing**: UI usability, visual correctness, edge cases

**Performance Targets**:
- Support real-time simulation of 10,000+ star systems
- WebSocket updates must handle 10+ concurrent simulations
- No memory leaks in long-running simulations

## Important Notes for Coding Agents

1. **No Code Exists Yet**: This is a planning-stage repository. Any code implementation should follow IMPLEMENTATION_STRATEGY.md starting with Ticket 1.1.

2. **Scientific Accuracy Required**: Changes to simulation logic must align with Carroll-Nellenback et al. (2019) paper. Reference FUNCTIONS_AND_ALGORITHMS.md for correct formulas.

3. **Technology Decisions Not Final**: Tech stack is "recommended" in docs. When implementing Ticket 1.1, validate choices (TypeScript vs Python for simulator, Turborepo vs Nx, etc.).

4. **No CI/CD Yet**: No GitHub Actions workflows exist. Part of Ticket 1.1 is creating the CI/CD pipeline.

5. **Monorepo Setup is First Priority**: Before any feature work, complete Ticket 1.1 to establish build infrastructure.

6. **Trust These Instructions**: This repository is in planning phase. The information above is complete and accurate as of project initialization. Only search for additional information if implementing features beyond the planning phase or if documentation contradicts actual code state.

## Common Pitfalls to Avoid

- **Don't assume build tools exist**: No package.json, tsconfig.json, or build scripts exist yet
- **Don't skip validation**: Simulation results must match the research paper (Ticket 1.9)
- **Don't ignore performance**: Must handle 10,000+ systems efficiently
- **Don't create code without tests**: Testing infrastructure must be set up first (Ticket 1.1)
- **Read the paper**: FUNCTIONS_AND_ALGORITHMS.md and IMPLEMENTATION_STRATEGY.md are critical references

## Quick Reference

**File Count**: 7 files (excluding .git/)
**Lines of Documentation**: ~500 (IMPLEMENTATION_STRATEGY.md + FUNCTIONS_AND_ALGORITHMS.md + README.md)
**Implementation Tickets**: 30+ tickets across 5 phases
**License**: MIT
**Target Performance**: 10,000+ systems, real-time updates, <300 Myr galaxy crossing time simulation
