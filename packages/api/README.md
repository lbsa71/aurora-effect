# Aurora Effect API

Web API for the Aurora Effect galactic settlement simulator. Provides REST endpoints and WebSocket support for managing and running simulations.

## Features

- **REST API**: Create, start, pause, resume, stop, and delete simulations
- **WebSocket**: Real-time simulation updates via Socket.io
- **Validation**: Input validation using Zod schemas
- **Multiple Simulations**: Support for up to 10 concurrent simulations
- **Data Export**: Export simulation snapshots and configurations

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

## API Endpoints

### Health Check

```
GET /health
```

Returns server health status.

### Simulations

#### Create Simulation

```
POST /api/simulations
```

Request body:
```json
{
  "config": {
    "stellarDensity": 0.1,
    "settleableFraction": 0.5,
    "stellarVelocityKmS": 30,
    "probeVelocityKmS": 1000,
    "probeRangeLy": 10,
    "probeLaunchIntervalYr": 1000,
    "civilizationLifetimeYr": 1000000,
    "numSystems": 10000,
    "boxSizePc": 1000,
    "timeStepYr": 1000
  },
  "maxSteps": 10000,
  "updateInterval": 100
}
```

#### List Simulations

```
GET /api/simulations
```

#### Get Simulation Status

```
GET /api/simulations/:id
```

#### Start Simulation

```
POST /api/simulations/:id/start
```

#### Pause Simulation

```
POST /api/simulations/:id/pause
```

#### Resume Simulation

```
POST /api/simulations/:id/resume
```

#### Stop Simulation

```
POST /api/simulations/:id/stop
```

#### Delete Simulation

```
DELETE /api/simulations/:id
```

#### Get Snapshot

```
GET /api/simulations/:id/snapshot
```

Returns current simulation state including systems, probes, civilizations, and metrics.

#### Get Configuration

```
GET /api/simulations/:id/config
```

Returns the simulation configuration.

## WebSocket Events

### Client to Server

#### Subscribe to Simulation Updates

```javascript
socket.emit('subscribe', simulationId);
```

#### Unsubscribe from Updates

```javascript
socket.emit('unsubscribe', simulationId);
```

### Server to Client

#### Status Update

```javascript
socket.on('status', (simulation) => {
  console.log('Simulation status:', simulation);
});
```

#### Simulation Update

```javascript
socket.on('update', (update) => {
  console.log('Update:', update);
  // update contains: id, time, settledFraction, activeCivilizations, probesInFlight, frontPosition
});
```

## Environment Variables

- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (default: development)
- `CORS_ORIGIN`: CORS origin (default: *)
- `MAX_SIMULATIONS`: Maximum concurrent simulations (default: 10)
- `UPDATE_INTERVAL_MS`: Update emit interval in milliseconds (default: 100)

## Testing

```bash
npm test
```

## License

MIT
