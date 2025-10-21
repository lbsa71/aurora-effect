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

  it('should create a simulation with multiple civilizations', async () => {
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

    const civilizations = [
      { id: 0, color: '#FF0000', birthTime: 0, lifetime: 1000000 },
      { id: 1, color: '#00FF00', birthTime: 0, lifetime: 1000000 },
      { id: 2, color: '#0000FF', birthTime: 0, lifetime: 500000 },
    ];

    const response = await request(app)
      .post('/api/simulations')
      .send({ config, civilizations, maxSteps: 1000, updateInterval: 100 })
      .expect(201);

    expect(response.body).toHaveProperty('simulation');
    expect(response.body.simulation).toHaveProperty('id');
    expect(response.body.simulation).toHaveProperty('status', 'created');
    expect(response.body.simulation).toHaveProperty('civilizations');
    expect(response.body.simulation.civilizations).toHaveLength(3);
    expect(response.body.simulation.civilizations[0].color).toBe('#FF0000');
    expect(response.body.simulation.civilizations[1].color).toBe('#00FF00');
    expect(response.body.simulation.civilizations[2].color).toBe('#0000FF');
  });

  it('should create a simulation with variable probe parameters per civilization', async () => {
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

    const civilizations = [
      {
        id: 0,
        color: '#FF0000',
        birthTime: 0,
        lifetime: 1000000,
        probeVelocity: 2000, // Fast probes
        probeRange: 20, // Long range
        probeLaunchPeriod: 500, // Frequent launches
      },
      {
        id: 1,
        color: '#00FF00',
        birthTime: 0,
        lifetime: 1000000,
        probeVelocity: 500, // Slow probes
        probeRange: 5, // Short range
        probeLaunchPeriod: 2000, // Infrequent launches
      },
      {
        id: 2,
        color: '#0000FF',
        birthTime: 0,
        lifetime: 500000,
        // No probe parameters - uses defaults
      },
    ];

    const response = await request(app)
      .post('/api/simulations')
      .send({ config, civilizations, maxSteps: 1000, updateInterval: 100 })
      .expect(201);

    expect(response.body).toHaveProperty('simulation');
    expect(response.body.simulation).toHaveProperty('id');
    expect(response.body.simulation).toHaveProperty('status', 'created');
    expect(response.body.simulation).toHaveProperty('civilizations');
    expect(response.body.simulation.civilizations).toHaveLength(3);
    
    // Verify probe parameters are preserved
    const civ0 = response.body.simulation.civilizations.find((c: any) => c.id === 0);
    expect(civ0.probeVelocity).toBe(2000);
    expect(civ0.probeRange).toBe(20);
    expect(civ0.probeLaunchPeriod).toBe(500);
    
    const civ1 = response.body.simulation.civilizations.find((c: any) => c.id === 1);
    expect(civ1.probeVelocity).toBe(500);
    expect(civ1.probeRange).toBe(5);
    expect(civ1.probeLaunchPeriod).toBe(2000);
    
    const civ2 = response.body.simulation.civilizations.find((c: any) => c.id === 2);
    expect(civ2.probeVelocity).toBeUndefined();
    expect(civ2.probeRange).toBeUndefined();
    expect(civ2.probeLaunchPeriod).toBeUndefined();
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
