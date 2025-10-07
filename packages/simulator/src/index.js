"use strict";
/**
 * Aurora Effect Simulator
 * Core simulation library for galactic settlement dynamics
 * Based on Carroll-Nellenback et al. (2019)
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logisticGrowth = exports.estimateMilkyWayCrossingTime = exports.calculatePhysicalFrontSpeed = exports.calculateGalaxyCrossingTime = exports.calculateFrontThickness = exports.calculateSteadyState = exports.calculateEta4 = exports.calculateEta3 = exports.calculateEta2 = exports.calculateEta1 = exports.calculateFrontSpeed = exports.runSimulation = exports.stepSimulation = exports.createSimulationState = exports.createProbe = exports.findBestTarget = exports.calculateInterceptTime = exports.initializeRandomSettlement = exports.initializeWithFront = exports.initializeCivilization = exports.initializeSystems = exports.applyPeriodicBoundaries = exports.generateMaxwellBoltzmannVelocity = exports.randomNormal = exports.calculateNormalizedParameters = exports.periodicDistance = exports.distance = exports.magnitude = exports.dotProduct = exports.scaleVector = exports.subtractVectors = exports.addVectors = exports.SECONDS_PER_YEAR = exports.PC_TO_LY = exports.LY_TO_PC = exports.SPEED_OF_LIGHT = void 0;
// Export types
__exportStar(require("./types"), exports);
// Export utilities
var utils_1 = require("./utils");
Object.defineProperty(exports, "SPEED_OF_LIGHT", { enumerable: true, get: function () { return utils_1.SPEED_OF_LIGHT; } });
Object.defineProperty(exports, "LY_TO_PC", { enumerable: true, get: function () { return utils_1.LY_TO_PC; } });
Object.defineProperty(exports, "PC_TO_LY", { enumerable: true, get: function () { return utils_1.PC_TO_LY; } });
Object.defineProperty(exports, "SECONDS_PER_YEAR", { enumerable: true, get: function () { return utils_1.SECONDS_PER_YEAR; } });
Object.defineProperty(exports, "addVectors", { enumerable: true, get: function () { return utils_1.addVectors; } });
Object.defineProperty(exports, "subtractVectors", { enumerable: true, get: function () { return utils_1.subtractVectors; } });
Object.defineProperty(exports, "scaleVector", { enumerable: true, get: function () { return utils_1.scaleVector; } });
Object.defineProperty(exports, "dotProduct", { enumerable: true, get: function () { return utils_1.dotProduct; } });
Object.defineProperty(exports, "magnitude", { enumerable: true, get: function () { return utils_1.magnitude; } });
Object.defineProperty(exports, "distance", { enumerable: true, get: function () { return utils_1.distance; } });
Object.defineProperty(exports, "periodicDistance", { enumerable: true, get: function () { return utils_1.periodicDistance; } });
Object.defineProperty(exports, "calculateNormalizedParameters", { enumerable: true, get: function () { return utils_1.calculateNormalizedParameters; } });
Object.defineProperty(exports, "randomNormal", { enumerable: true, get: function () { return utils_1.randomNormal; } });
Object.defineProperty(exports, "generateMaxwellBoltzmannVelocity", { enumerable: true, get: function () { return utils_1.generateMaxwellBoltzmannVelocity; } });
Object.defineProperty(exports, "applyPeriodicBoundaries", { enumerable: true, get: function () { return utils_1.applyPeriodicBoundaries; } });
// Export initialization functions
var initialization_1 = require("./initialization");
Object.defineProperty(exports, "initializeSystems", { enumerable: true, get: function () { return initialization_1.initializeSystems; } });
Object.defineProperty(exports, "initializeCivilization", { enumerable: true, get: function () { return initialization_1.initializeCivilization; } });
Object.defineProperty(exports, "initializeWithFront", { enumerable: true, get: function () { return initialization_1.initializeWithFront; } });
Object.defineProperty(exports, "initializeRandomSettlement", { enumerable: true, get: function () { return initialization_1.initializeRandomSettlement; } });
// Export targeting functions
var targeting_1 = require("./targeting");
Object.defineProperty(exports, "calculateInterceptTime", { enumerable: true, get: function () { return targeting_1.calculateInterceptTime; } });
Object.defineProperty(exports, "findBestTarget", { enumerable: true, get: function () { return targeting_1.findBestTarget; } });
Object.defineProperty(exports, "createProbe", { enumerable: true, get: function () { return targeting_1.createProbe; } });
// Export simulation functions
var simulation_1 = require("./simulation");
Object.defineProperty(exports, "createSimulationState", { enumerable: true, get: function () { return simulation_1.createSimulationState; } });
Object.defineProperty(exports, "stepSimulation", { enumerable: true, get: function () { return simulation_1.stepSimulation; } });
Object.defineProperty(exports, "runSimulation", { enumerable: true, get: function () { return simulation_1.runSimulation; } });
// Export analytical models
var analytics_1 = require("./analytics");
Object.defineProperty(exports, "calculateFrontSpeed", { enumerable: true, get: function () { return analytics_1.calculateFrontSpeed; } });
Object.defineProperty(exports, "calculateEta1", { enumerable: true, get: function () { return analytics_1.calculateEta1; } });
Object.defineProperty(exports, "calculateEta2", { enumerable: true, get: function () { return analytics_1.calculateEta2; } });
Object.defineProperty(exports, "calculateEta3", { enumerable: true, get: function () { return analytics_1.calculateEta3; } });
Object.defineProperty(exports, "calculateEta4", { enumerable: true, get: function () { return analytics_1.calculateEta4; } });
Object.defineProperty(exports, "calculateSteadyState", { enumerable: true, get: function () { return analytics_1.calculateSteadyState; } });
Object.defineProperty(exports, "calculateFrontThickness", { enumerable: true, get: function () { return analytics_1.calculateFrontThickness; } });
Object.defineProperty(exports, "calculateGalaxyCrossingTime", { enumerable: true, get: function () { return analytics_1.calculateGalaxyCrossingTime; } });
Object.defineProperty(exports, "calculatePhysicalFrontSpeed", { enumerable: true, get: function () { return analytics_1.calculatePhysicalFrontSpeed; } });
Object.defineProperty(exports, "estimateMilkyWayCrossingTime", { enumerable: true, get: function () { return analytics_1.estimateMilkyWayCrossingTime; } });
Object.defineProperty(exports, "logisticGrowth", { enumerable: true, get: function () { return analytics_1.logisticGrowth; } });
//# sourceMappingURL=index.js.map