# Functions and Algorithms

This document extracts the key mathematical formulas, algorithms, and parameters from "The Fermi Paradox and the Aurora Effect: Exo-civilization Settlement, Expansion, and Steady States" (Carroll-Nellenback et al., 2019).

## Core Parameters

### Physical Parameters
- **f**: Fraction of systems that are settleable (0 < f ≤ 1)
- **ρ**: Density of star systems (stars/pc³)
  - Solar neighborhood: ρ ≈ 0.08 pc⁻³ ≈ 0.0023 lyr⁻³
- **d_p**: Probe range (maximum distance a probe can travel)
  - Typical value: 10 light-years
- **v_p**: Probe velocity (relative to host system)
  - Range: 0.001c to 0.1c
- **v_s**: Average velocity of stellar substrate (stellar motions)
  - Solar neighborhood: v_s ≈ 30 km/s
- **T_p**: Probe launch period (time to assemble a new probe)
  - Range: 1 to 1000 years
- **T_s**: Settlement civilization lifetime
  - Time until settlement dies or stops launching probes
- **t_p**: Probe travel time = d_p / v_p

### Normalized Dimensionless Parameters
- **η** (eta): Normalized density of settleable systems within probe range
  - η = ρ · f · d_p³
  - η = f · 2.3 · (d_p / 10 lyr)³
  - Critical threshold: η_c ≈ 0.88 (full connectivity)

- **ν_s** (nu_s): Velocity of stellar substrate normalized by probe speed
  - ν_s = v_s / v_p
  - ν_s = 0.01 · (v_s / 30 km/s) · (c / v_p)

- **τ_p** (tau_p): Probe launch period normalized to probe travel time
  - τ_p = T_p / t_p
  - τ_p = 0.1 · (T_p / 100 yr) · (v_p / c) · (d_p / 10 lyr)⁻¹

## Settlement Front Speed Model

### High Density Limit (η > η_c ≈ 0.88)
When there are many settleable systems within range:

```
ν_p = (3/2) / (τ_p + 2/3)                    for τ_p ≫ 1
ν_p ≈ 1                                      for τ_p → 0
```

More precisely:
```
ν_p = (τ_p + 3 - 2·log(1 + 3·τ_p)) / (τ_p + 2/3)²
```

### Low Density Limit (η < η_c)
When settleable systems are sparse, stellar diffusion dominates:

```
ν = ν_s = v_s / v_p
```

The front speed is limited by stellar motions, not probe speed.

### Intermediate Density
```
ν = max[ν_s, ν_l]
```

where:
```
ν_l = (τ_l + 3 - 2·log(1 + 3·τ_l)) / (τ_l + 2/3)²
τ_l = (1/τ_p + 1/τ_c)⁻¹
τ_c = 1 / (2·η·ν_s)
```

### Encounter Time
Time between stellar encounters due to stellar motions:
```
T_c = π / (ρ · f · v_s²)
```

### Effective Launch Time
```
T_l = (1/T_p + 1/T_c)⁻¹
```

### Probability of System in Range
Probability that another unsettled system is in range and ahead of the settlement front:
```
φ = 1 - exp(-η/4)³
```

where φ (phi) is approximately 1/4 for the upwind fraction.

## Critical Density Thresholds

Average distance to Nth nearest neighbor:
```
⟨l_N⟩ = (4π·η)⁻¹/³ · Γ(N + 1/3) / (N!)
```

Critical densities where average distance to Nth neighbor equals probe range:
- **η_1 ≈ 0.170**: Average distance to 1st neighbor = d_p
- **η_2 ≈ 0.403**: Average distance to 2nd neighbor = d_p
- **η_3 ≈ 0.640**: Average distance to 3rd neighbor = d_p
- **η_4 ≈ 0.878**: Average distance to 4th neighbor = d_p (full connectivity threshold)

## Steady State Model

### Equilibrium ODE
The ratio of settled to unsettled systems evolves as:
```
dX/dt = (1/T_l)·(1 - X) - (1/T_s)·X
```

where:
- X: Fraction of settleable systems that are settled (0 ≤ X ≤ 1)
- T_s: Settlement civilization lifetime
- T_l: Effective probe launch rate

### Steady State Solution
At equilibrium (dX/dt = 0):
```
X_eq = 1 - T_l/T_s
```

Conditions:
- If T_s < T_l: X_eq = 0 (civilizations die before launching probes)
- If T_s > T_l: 0 < X_eq < 1 (partial settlement)
- If T_s ≫ T_l: X_eq → 1 (full settlement)

### Modified Model with Probe Travel Time
Including probe travel time in the steady state:
```
dX/dt = Y / (t_p + T_s)
dY/dt = (1/T_l)·(1 - X - Y) - Y / (t_p + T_s)
```

where:
- X: Fraction of settled systems
- Y: Fraction of systems with probes in transit
- 1 - X - Y: Fraction of unsettled, untargeted systems

## Settlement Front Thickness

The front grows from unsettled to fully settled following a logistic curve:
```
dX/dτ = (ln 2 / τ_l) · X · (1 - X)
```

Front width (in dimensionless units):
```
Δξ = ν · τ_l / ln 2
```

In the low density limit:
```
Δξ ≈ π / (η · ln 2) ≈ 1
```

## Probability Distributions

### Nearest Neighbor Distance
Probability of finding N or more neighbors within normalized distance ξ = d/d_p:
```
D_N(ξ) = 1 - Σ[i=0 to N-1] P_i(ξ)
```

where:
```
P_i(ξ) = (4πη·ξ³/3)^i · exp(-4πη·ξ³/3) / i!
```

### Distance to Nth Nearest Neighbor
```
dP_N/dξ = 4πξ² · Σ[i=0 to N-1] (4πη·ξ³/3)^i · exp(-4πη·ξ³/3) / i!
```

## Simulation Algorithm

### Agent-Based Settlement Model

**Initialization:**
1. Generate N systems with random positions in periodic box
2. Assign velocities from Maxwell-Boltzmann distribution
3. Mark fraction f of systems as settleable
4. Initialize small fraction as settled (e.g., X_0 = 0.01)

**Each Timestep:**
1. For each settled system ready to launch (time since last launch ≥ T_p):
   - Find all unsettled, untargeted systems
   - Calculate intercept time to each system
   - Filter by: intercept distance ≤ d_p and intercept time ≤ t_p
   - Target system with shortest intercept time
   - Mark system as targeted, schedule settlement at intercept time

2. Update system positions based on velocities

3. Settle systems whose intercept time has been reached

4. Track settled fraction X(t)

**Boundary Conditions:**
- Use periodic boundaries in all directions
- Shift reference frame to follow front speed
- Recycle systems leaving left boundary as unsettled on right

### Front Speed Estimation
1. Initialize with analytic estimate
2. Run simulation
3. Measure actual front position over time
4. Reestimate if front approaches boundary
5. Repeat until steady front speed achieved

## Galaxy Crossing Time

Time for settlement front to cross the galaxy:
```
t_cross = L_galaxy / (ν · v_p)
```

For Milky Way (L_galaxy ≈ 10⁵ lyr):
- Even with conservative parameters (v_p = 0.001c, slow launch rates)
- t_cross < 300 Myr ≪ Age of Galaxy (≈ 13 Gyr)

This demonstrates the galaxy can be readily filled under conservative assumptions.

## Reference Values

### Solar Neighborhood
- Star density: ρ = 0.07-0.09 pc⁻³
- Stellar velocity: v_s ≈ 30 km/s
- Speed of light: c ≈ 300,000 km/s

### Typical Simulation Parameters
- N = 10⁴ systems
- η = 0.1 to 10
- τ_p = 0.1 to 1.0
- ν_s = 0.001 to 0.1
- d_p = 10 lyr
- Box dimensions: 80-224 lyr per side
- Run time: 1000 yr to 30 Myr (until steady state)

## Key Insights

1. **Galaxy can be filled quickly**: Even with slow probes (0.001c) and long launch periods (1000 yr), the Milky Way can be settled in < 300 Myr

2. **Stellar motions matter**: At low settleable densities (η < 1), stellar diffusion can spread civilizations even when probes can't reach neighbors

3. **Partial settlement is stable**: With finite civilization lifetimes, the galaxy can reach a steady state with 0 < X < 1

4. **Earth could be unvisited**: In a partially settled galaxy, statistical fluctuations create large unsettled regions, explaining why Earth might not have been visited

5. **Critical density threshold**: Full connectivity requires η ≥ 0.88, meaning roughly 1 settleable system within probe range
