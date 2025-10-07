/**
 * Basic example of running the Aurora Effect simulator
 * This demonstrates the core functionality implemented in Phase 1
 */

import {
  SimulationConfig,
  initializeSystems,
  initializeCivilization,
  createSimulationState,
  runSimulation,
  calculateNormalizedParameters,
  calculateFrontSpeed,
  estimateMilkyWayCrossingTime,
} from '@aurora-effect/simulator';

function main(): void {
  console.log('Aurora Effect Simulator - Basic Example\n');
  console.log('========================================\n');

  // Define simulation configuration
  const config: SimulationConfig = {
    numSystems: 1000,
    boxSize: { x: 100, y: 100, z: 100 },
    density: 0.08, // systems/pc³ (solar neighborhood)
    settleableFraction: 0.2, // 20% of systems are settleable
    stellarVelocity: 30, // km/s
    probeVelocity: 0.01, // 1% of speed of light
    probeRange: 10, // light-years
    probeLaunchPeriod: 100, // years
    civilizationLifetime: 0, // infinite lifetime for this example
    initialSettledFraction: 0.01,
    timeStep: 100, // years
  };

  console.log('Configuration:');
  console.log(`  Systems: ${config.numSystems}`);
  console.log(`  Box Size: ${config.boxSize.x} × ${config.boxSize.y} × ${config.boxSize.z} ly`);
  console.log(`  Density: ${config.density} systems/pc³`);
  console.log(`  Settleable Fraction: ${config.settleableFraction}`);
  console.log(`  Probe Velocity: ${config.probeVelocity}c`);
  console.log(`  Probe Range: ${config.probeRange} ly`);
  console.log(`  Launch Period: ${config.probeLaunchPeriod} years`);
  console.log();

  // Calculate normalized parameters
  const params = calculateNormalizedParameters(config);
  console.log('Normalized Parameters:');
  console.log(`  η (eta): ${params.eta.toFixed(3)}`);
  console.log(`  ν_s (nu_s): ${params.nuS.toFixed(6)}`);
  console.log(`  τ_p (tau_p): ${params.tauP.toFixed(3)}`);
  console.log(`  Probe travel time: ${params.probeTravelTime.toFixed(1)} years`);
  console.log();

  // Calculate analytical predictions
  const frontSpeed = calculateFrontSpeed(params);
  const crossingTime = estimateMilkyWayCrossingTime(params, config.probeVelocity);

  console.log('Analytical Predictions:');
  console.log(`  Front speed: ${frontSpeed.toFixed(6)} (normalized)`);
  console.log(`  Milky Way crossing time: ${crossingTime.toFixed(1)} Myr`);
  console.log();

  // Initialize systems
  console.log('Initializing systems...');
  let systems = initializeSystems(config);
  console.log(`  Created ${systems.length} star systems`);
  const settleableCount = systems.filter((s) => s.settleable).length;
  console.log(`  ${settleableCount} are settleable (${((settleableCount / systems.length) * 100).toFixed(1)}%)`);
  console.log();

  // Create a civilization
  console.log('Creating civilization...');
  const result = initializeCivilization(systems, 1, 0, 0, '#00ff00');
  systems = result.systems;
  const civilization = result.civilization;
  console.log(`  Civilization ${civilization.id} created at system ${civilization.originSystemId}`);
  console.log();

  // Create simulation state
  const state = createSimulationState(systems, [civilization]);

  console.log('Initial State:');
  console.log(`  Settled fraction: ${(state.metrics.settledFraction * 100).toFixed(2)}%`);
  console.log(`  Settled systems: ${state.metrics.settledCount}`);
  console.log();

  // Run simulation
  console.log('Running simulation for 10,000 years...');
  let stepCount = 0;
  runSimulation(state, config, 10000, (s) => {
    stepCount++;
    if (stepCount % 10 === 0) {
      console.log(
        `  Time: ${s.time.toFixed(0)} years | ` +
          `Settled: ${s.metrics.settledCount} (${(s.metrics.settledFraction * 100).toFixed(1)}%) | ` +
          `Probes: ${s.metrics.probesInFlight} | ` +
          `Front: ${s.metrics.frontPosition.toFixed(1)} ly`
      );
    }
  });

  console.log();
  console.log('Final State:');
  console.log(`  Time: ${state.time} years`);
  console.log(`  Settled fraction: ${(state.metrics.settledFraction * 100).toFixed(2)}%`);
  console.log(`  Settled systems: ${state.metrics.settledCount}`);
  console.log(`  Active civilizations: ${state.metrics.activeCivilizations}`);
  console.log(`  Probes in flight: ${state.metrics.probesInFlight}`);
  console.log(`  Front position: ${state.metrics.frontPosition.toFixed(1)} ly`);
  console.log();
  console.log('Simulation complete!');
}

main();
