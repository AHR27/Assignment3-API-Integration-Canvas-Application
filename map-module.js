/**
 * ============================================
 * MAP MODULE - Geospatial Intelligence Component
 * ============================================
 * @description Handles Mapbox map initialization, geocoding API calls,
 *              marker management, and location search functionality.
 *              Default location: Seven Mile Road, Dawkins Pen, Clarendon, Jamaica
 */

// Global variables
let mapboxMap = null;
let currentMarker = null;

console.log('🔵 MAP MODULE LOADED - Checking config coordinates...');
console.log('📍 Config center coordinates (Clarendon, Jamaica):', MAP_DEFAULTS.center);
console.log('📍 Default search location:', DEFAULT_SEARCH_LOCATION);

/**
 * @description Initializes the Mapbox GL map with configuration coordinates
 * @param {string} containerId - The DOM element id where map will be rendered
 * @returns {Object|null} Mapbox map instance or null if failed
 */
function initializeMap(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`❌ Container element "${containerId}" not found!`);
        return null;
    }
    
    console.log(`🗺️ Initializing map in container: ${containerId}`);
    console.log(`📍 Setting map center to CLARENDON, JAMAICA (Seven Mile Road area): [${MAP_DEFAULTS.center[0]}, ${MAP_DEFAULTS.center[1]}]`);
    
    if (!MAPBOX_ACCESS_TOKEN) {
        console.error('❌ Mapbox token is missing!');
        return null;
    }
    
    try {
        mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
        
        const map = new mapboxgl.Map({
            container: containerId,
            style: MAP_DEFAULTS.style,
            center: MAP_DEFAULTS.center,
            zoom: MAP_DEFAULTS.zoom
        });
        
        // Add navigation controls
        map.addControl(new mapboxgl.NavigationControl(), 'top-right');
        
        // Log when map loads
        map.on('load', () => {
            const mapCenter = map.getCenter();
            console.log(`✅ Map loaded! Current center: [${mapCenter.lng.toFixed(4)}, ${mapCenter.lat.toFixed(4)}]`);
            
            const statusDiv = document.getElementById('searchStatus');
            if (statusDiv) {
                statusDiv.innerHTML = '✅ Map ready! Centered on Seven Mile Road, Dawkins Pen, Clarendon, Jamaica';
                statusDiv.style.background = '#e0f2e9';
            }
        });
        
        // Add click handler
        map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            console.log(`📍 Map clicked at: ${lng.toFixed(5)}, ${lat.toFixed(5)}`);
            const statusDiv = document.getElementById('searchStatus');
            if (statusDiv) {
                statusDiv.innerHTML = `📍 Clicked at [${lng.toFixed(5)}, ${lat.toFixed(5)}]`;
            }
        });
        
        // Error handler
        map.on('error', (e) => {
            console.error('❌ Mapbox error:', e.error);
        });
        
        console.log('✅ Map instance created');
        return map;
        
    } catch (error) {
        console.error('❌ Map initialization error:', error);
        return null;
    }
}

/**
 * @description Fetches geocoding data from Mapbox API with country biasing to Jamaica
 * @param {string} address - Location string
 * @returns {Promise<{lng: number, lat: number, placeName: string}>}
 */
async function geocodeAddress(address) {
    if (!address || address.trim() === '') {
        throw new Error('Please enter a valid location name.');
    }
    
    let searchQuery = address.trim();
    
    // Ensure Jamaica is in the search for better results
    if (!searchQuery.toLowerCase().includes('jamaica')) {
        searchQuery = searchQuery + ', Jamaica';
        console.log(`📍 Adding Jamaica to search: "${searchQuery}"`);
    }
    
    const encodedQuery = encodeURIComponent(searchQuery);
    
    // Add country bias to prefer Jamaica (JM)
    const jamaicaBBox = '-78.5,17.7,-76.0,18.6'; // Jamaica bounding box
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5&country=JM&bbox=${jamaicaBBox}`;
    
    console.log(`🌐 Geocoding: "${searchQuery}" with Jamaica bias`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
        if (response.status === 401) {
            throw new Error('Invalid Mapbox token. Please check your access token.');
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.features || data.features.length === 0) {
        // Fallback: try without country bias
        console.log('⚠️ No results with Jamaica bias, trying without bias...');
        const fallbackUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedQuery}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=5`;
        const fallbackResponse = await fetch(fallbackUrl);
        const fallbackData = await fallbackResponse.json();
        
        if (!fallbackData.features || fallbackData.features.length === 0) {
            throw new Error(`No results found for "${address}"`);
        }
        
        // Filter to prefer Jamaica results
        const jamaicaResults = fallbackData.features.filter(f => 
            f.place_name.toLowerCase().includes('jamaica')
        );
        
        const bestResult = jamaicaResults.length > 0 ? jamaicaResults[0] : fallbackData.features[0];
        const [lng, lat] = bestResult.center;
        const placeName = bestResult.place_name;
        
        console.log(`✅ Geocoded (fallback): "${placeName}" -> [${lng}, ${lat}]`);
        return { lng, lat, placeName };
    }
    
    // Filter results to prefer Jamaica
    const jamaicaResults = data.features.filter(f => 
        f.place_name.toLowerCase().includes('jamaica')
    );
    
    const bestResult = jamaicaResults.length > 0 ? jamaicaResults[0] : data.features[0];
    const [lng, lat] = bestResult.center;
    const placeName = bestResult.place_name;
    
    console.log(`✅ Geocoded: "${placeName}" -> [${lng}, ${lat}]`);
    
    return { lng, lat, placeName };
}

/**
 * @description Updates or creates marker on map
 * @param {Object} coordinates - {lng, lat}
 * @param {string} popupText - Text for popup
 */
function updateMapMarker(coordinates, popupText) {
    if (currentMarker) {
        currentMarker.remove();
        console.log('📍 Removed existing marker');
    }
    
    // Create custom marker element
    const el = document.createElement('div');
    el.innerHTML = '📍';
    el.style.fontSize = '32px';
    el.style.cursor = 'pointer';
    el.style.filter = 'drop-shadow(2px 2px 2px rgba(0,0,0,0.3))';
    el.style.fontFamily = 'sans-serif';
    
    // Create popup
    const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <strong>📍 Seven Mile Road, Dawkins Pen, Clarendon</strong><br/>
        ${escapeHtml(popupText)}<br/>
        <small>Lat: ${coordinates.lat.toFixed(5)} | Lng: ${coordinates.lng.toFixed(5)}</small>
    `);
    
    // Add marker
    currentMarker = new mapboxgl.Marker(el)
        .setLngLat([coordinates.lng, coordinates.lat])
        .setPopup(popup)
        .addTo(mapboxMap);
    
    // Open popup
    currentMarker.togglePopup();
    
    console.log(`📍 Marker placed at [${coordinates.lng}, ${coordinates.lat}]`);
}

/**
 * @description Escape HTML special characters
 * @param {string} str - String to escape
 * @returns {string}
 */
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

/**
 * @description Main search function - geocode and fly to location
 * @param {string} locationQuery - Location to search
 * @returns {Promise<void>}
 */
async function searchLocationAndFly(locationQuery) {
    const statusDiv = document.getElementById('searchStatus');
    const searchBtn = document.getElementById('searchBtn');
    
    console.log(`🔍 SEARCH TRIGGERED for: "${locationQuery}"`);
    
    if (!locationQuery || locationQuery.trim() === '') {
        statusDiv.innerHTML = '⚠️ Please enter a location (e.g., Seven Mile Road, Dawkins Pen, Clarendon)';
        statusDiv.style.background = '#fff1f0';
        return;
    }
    
    if (!mapboxMap) {
        statusDiv.innerHTML = '❌ Map not initialized. Check console for errors.';
        statusDiv.style.background = '#ffe6e5';
        console.error('❌ Map not initialized!');
        return;
    }
    
    // Show loading
    statusDiv.innerHTML = '🔄 Searching for location in Jamaica...';
    statusDiv.style.background = '#e6f0ff';
    if (searchBtn) searchBtn.disabled = true;
    
    try {
        // Get coordinates with Jamaica bias
        const { lng, lat, placeName } = await geocodeAddress(locationQuery);
        
        console.log(`✈️ Flying to: [${lng}, ${lat}]`);
        
        // Fly to location
        mapboxMap.flyTo({
            center: [lng, lat],
            zoom: 15,
            duration: 1500
        });
        
        // Add marker after fly starts
        setTimeout(() => {
            updateMapMarker({ lng, lat }, placeName);
        }, 300);
        
        // Success message
        const shortName = placeName.length > 60 ? placeName.substring(0, 57) + '...' : placeName;
        statusDiv.innerHTML = `✅ Found: ${shortName}`;
        statusDiv.style.background = '#e0f2e9';
        console.log(`✅ Search successful!`);
        
    } catch (error) {
        console.error('❌ Search failed:', error);
        statusDiv.innerHTML = `❌ ${error.message}`;
        statusDiv.style.background = '#ffe6e5';
    } finally {
        if (searchBtn) searchBtn.disabled = false;
        setTimeout(() => {
            if (statusDiv.innerHTML.includes('Found')) {
                setTimeout(() => {
                    statusDiv.style.background = '#f0f4f9';
                }, 3000);
            }
        }, 1000);
    }
}

/**
 * @description Search for the default location (Seven Mile Road, Dawkins Pen, Clarendon)
 * @returns {Promise<void>}
 */
async function searchDefaultLocation() {
    console.log('📍 Searching for default location: Seven Mile Road, Dawkins Pen, Clarendon, Jamaica');
    await searchLocationAndFly(DEFAULT_SEARCH_LOCATION);
}

/**
 * @description Attaches event listeners
 */
function attachEventListeners() {
    const searchBtn = document.getElementById('searchBtn');
    const locationInput = document.getElementById('locationInput');
    
    if (!searchBtn) {
        console.error('❌ Search button not found!');
        return;
    }
    
    if (!locationInput) {
        console.error('❌ Location input not found!');
        return;
    }
    
    const handleSearch = () => {
        const query = locationInput.value.trim();
        searchLocationAndFly(query);
    };
    
    // Remove existing listeners to avoid duplicates
    const newSearchBtn = searchBtn.cloneNode(true);
    searchBtn.parentNode.replaceChild(newSearchBtn, searchBtn);
    
    const newLocationInput = locationInput.cloneNode(true);
    locationInput.parentNode.replaceChild(newLocationInput, locationInput);
    
    newSearchBtn.addEventListener('click', handleSearch);
    newLocationInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearch();
        }
    });
    
    console.log('✅ Event listeners attached');
    
    // Update global references
    const updatedSearchBtn = document.getElementById('searchBtn');
    const updatedLocationInput = document.getElementById('locationInput');
    if (updatedSearchBtn) updatedSearchBtn.id = 'searchBtn';
    if (updatedLocationInput) updatedLocationInput.id = 'locationInput';
}

// ============================================
// Page Initialization
// ============================================

console.log('🚀 Starting map initialization...');
console.log('📍 Default location: Seven Mile Road, Dawkins Pen, Clarendon, Jamaica');

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('📄 DOM loaded, creating map...');
    
    // Initialize map
    mapboxMap = initializeMap('map-container');
    
    if (mapboxMap) {
        mapboxMap.on('load', () => {
            console.log('✅ Map fully loaded');
            attachEventListeners();
            
            // Set input value to default location
            const locationInput = document.getElementById('locationInput');
            if (locationInput) {
                locationInput.value = DEFAULT_SEARCH_LOCATION;
            }
            
            // Automatically search for the default location
            setTimeout(() => {
                console.log('📍 Automatically searching for Seven Mile Road, Dawkins Pen, Clarendon...');
                searchDefaultLocation();
            }, 1000);
            
            const statusDiv = document.getElementById('searchStatus');
            if (statusDiv) {
                statusDiv.innerHTML = '✅ Ready! Showing Seven Mile Road, Dawkins Pen, Clarendon, Jamaica';
            }
        });
    } else {
        console.error('❌ Failed to create map');
    }
});