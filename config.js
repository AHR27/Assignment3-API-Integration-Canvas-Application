/**
 * ============================================
 * CONFIGURATION FILE - Central API Keys Storage
 * ============================================
 * @description This file stores all API credentials used across the application.
 */

// IMPORTANT: Get your own token from https://account.mapbox.com/access-tokens/
const MAPBOX_ACCESS_TOKEN = 'YOUR_MAPBOX_TOKEN_HERE';  // <-- Replace with your token locally

/**
 * @constant {object} MAP_DEFAULTS - Default map configuration settings
 * @property {Array<number>} center - Default longitude/latitude coordinates [lng, lat]
 * @property {number} zoom - Default zoom level
 * @property {string} style - Mapbox style URL
 * 
 * COORDINATES FOR:
 * Seven Mile Road, Dawkins Pen, Clarendon, Jamaica
 * Approximate coordinates: [-77.2500, 17.9500] (Clarendon parish area)
 */
const MAP_DEFAULTS = {
    center: [-77.2500, 17.9500],  // Clarendon, Jamaica (Seven Mile Road area)
    zoom: 13,
    style: 'mapbox://styles/mapbox/streets-v12'
};

/**
 * @constant {object} GEOCODING_CONFIG - Geocoding API parameters
 */
const GEOCODING_CONFIG = {
    limit: 1
};

/**
 * @constant {string} DEFAULT_SEARCH_LOCATION - Default location for search
 */
const DEFAULT_SEARCH_LOCATION = 'Seven Mile Road, Dawkins Pen, Clarendon, Jamaica';

console.log('✅ Config loaded with Mapbox token (first 20 chars):', MAPBOX_ACCESS_TOKEN.substring(0, 20) + '...');
console.log('📍 Default map center (Clarendon, Jamaica):', MAP_DEFAULTS.center);
console.log('📍 Default search location:', DEFAULT_SEARCH_LOCATION);

// Export for debugging
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MAPBOX_ACCESS_TOKEN, MAP_DEFAULTS, GEOCODING_CONFIG, DEFAULT_SEARCH_LOCATION };
}