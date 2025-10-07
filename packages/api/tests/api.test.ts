import request from 'supertest';
import { createApp } from '../src/app';

describe('API Health Check', () => {
  const app = createApp();

  it('should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);

    expect(response.body).toHaveProperty('status', 'ok');
    expect(response.body).toHaveProperty('timestamp');
  });
});

describe('Simulation API', () => {
  const app = createApp();

  it('should create a simulation', async () => {
    const config = {
      stellarDensity: 0.1,
      settleableFraction: 0.5,
      stellarVelocityKmS: 30,
      probeVelocityKmS: 1000,
      probeRangeLy: 10,
      probeLaunchIntervalYr: 1000,
      civilizationLifetimeYr: 1000000,
      numSystems: 100,
      boxSizePc: 100,
      timeStepYr: 1000,
    };

    const response = await request(app)
      .post('/api/simulations')
      .send({ config, maxSteps: 1000, updateInterval: 100 })
      .expect(201);

    expect(response.body).toHaveProperty('simulation');
    expect(response.body.simulation).toHaveProperty('id');
    expect(response.body.simulation).toHaveProperty('status', 'created');
  });

  it('should list simulations', async () => {
    const response = await request(app)
      .get('/api/simulations')
      .expect(200);

    expect(response.body).toHaveProperty('simulations');
    expect(Array.isArray(response.body.simulations)).toBe(true);
  });

  it('should return 404 for non-existent simulation', async () => {
    const response = await request(app)
      .get('/api/simulations/non-existent-id')
      .expect(404);

    expect(response.body).toHaveProperty('code', 'NOT_FOUND');
  });

  it('should validate config', async () => {
    const invalidConfig = {
      stellarDensity: -1, // Invalid: negative
    };

    await request(app)
      .post('/api/simulations')
      .send({ config: invalidConfig })
      .expect(400);
  });
});
