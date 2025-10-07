# Aurora Effect UI

Web-based user interface for the Aurora Effect galactic settlement simulator.

## Features

- **Configuration Interface**: Create and customize simulation parameters
- **Real-time Updates**: WebSocket connection for live simulation data
- **Simulation Controls**: Start, pause, resume, and stop simulations
- **Metrics Dashboard**: Display key statistics and charts
- **Galaxy Visualization**: Coming in Ticket 3.3

## Technology Stack

- **React** 19+ with TypeScript
- **Vite** for fast development and optimized builds
- **Material-UI (MUI)** for UI components
- **Zustand** for state management
- **Socket.io-client** for WebSocket connections

## Development

### Prerequisites

- Node.js 18+ and npm
- Aurora Effect API server running (see `../api`)

### Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

The UI will be available at http://localhost:5173

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Environment Variables

- `VITE_API_URL` - API server URL (default: http://localhost:3000)

## Project Structure

```
src/
├── components/       # React components
│   ├── Configuration/  # Parameter configuration
│   ├── Controls/       # Simulation controls
│   ├── Layout/         # App layout
│   ├── Metrics/        # Metrics display
│   └── Visualization/  # Galaxy visualization
├── hooks/            # Custom React hooks
├── services/         # API and WebSocket clients
├── store/            # Zustand state management
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Usage

1. Configure simulation parameters in the Configuration panel
2. Click "Create Simulation" to initialize
3. Click "Start" to begin the simulation
4. View real-time metrics and visualization as the simulation runs
5. Use Pause/Resume/Stop to control playback

## Phase 3 Implementation

This UI is being implemented as part of Phase 3 of the Aurora Effect project:

- ✅ Ticket 3.1: UI Framework Setup
- ⏳ Ticket 3.2: Configuration Interface (in progress)
- ⏳ Ticket 3.3: Galaxy Visualization Canvas
- ⏳ Ticket 3.4: Simulation Controls (in progress)
- ⏳ Ticket 3.5: Real-time Updates Integration (in progress)
- ⏳ Ticket 3.6: Metrics Dashboard (in progress)
- ⏳ Ticket 3.7: Civilization Legend

See [../../docs/PHASE3_SUMMARY.md](../../docs/PHASE3_SUMMARY.md) for the complete plan.
