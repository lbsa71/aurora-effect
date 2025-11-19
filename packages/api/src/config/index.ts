export const PORT = process.env.PORT || 3000;
export const NODE_ENV = process.env.NODE_ENV || 'development';
export const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
export const MAX_SIMULATIONS = parseInt(process.env.MAX_SIMULATIONS || '10', 10);
export const UPDATE_INTERVAL_MS = parseInt(process.env.UPDATE_INTERVAL_MS || '100', 10);
export const BASE_PATH = process.env.BASE_PATH || '';
