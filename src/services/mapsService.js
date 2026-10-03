import { Loader } from '@googlemaps/js-api-loader';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

let loaderInstance = null;

export const isGoogleMapsConfigured = Boolean(
  GOOGLE_MAPS_API_KEY && 
  GOOGLE_MAPS_API_KEY !== "your-google-maps-api-key" &&
  GOOGLE_MAPS_API_KEY.length > 10
);

export function getGoogleMapsLoader() {
  if (!loaderInstance) {
    loaderInstance = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places", "geometry"]
    });
  }
  return loaderInstance;
}

/**
 * Calculate distance between two lat/lng coordinates using the Haversine Formula.
 * Returns distance in kilometers.
 */
export function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
  const R = 6371; // Radius of Earth in KM
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Number(d.toFixed(2));
}

/**
 * Get current browser geolocation with promises and high accuracy.
 */
export function getCurrentBrowserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by your browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        let msg = "Unable to retrieve your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission denied. Please allow location access or search manually.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location information is currently unavailable.";
            break;
          case error.TIMEOUT:
            msg = "The request to get user location timed out.";
            break;
        }
        reject(new Error(msg));
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  });
}

/**
 * Reverse geocode fallback for academic prototype
 */
export async function reverseGeocodeCoords(lat, lng) {
  if (window.google && window.google.maps && window.google.maps.Geocoder) {
    try {
      const geocoder = new window.google.maps.Geocoder();
      const response = await geocoder.geocode({ location: { lat, lng } });
      if (response.results && response.results[0]) {
        return response.results[0].formatted_address;
      }
    } catch (e) {
      console.warn("Google Geocoding API lookup failed:", e);
    }
  }

  // OpenStreetMap Nominatim Reverse Geocode (free, accurate, street-level)
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.display_name) {
        return data.display_name;
      }
    }
  } catch (e) {
    console.warn("Nominatim reverse geocode error:", e);
  }

  // Descriptive fallback location string
  return `GPS Coords: [${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E]`;
}

/**
 * Search locations via OpenStreetMap Nominatim
 */
export async function searchAddressOSM(query) {
  if (!query || query.trim().length < 2) return [];
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`, {
      headers: {
        'Accept-Language': 'en'
      }
    });
    if (res.ok) {
      const data = await res.json();
      return data.map(item => ({
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon)
      }));
    }
  } catch (err) {
    console.warn("Nominatim search error:", err);
  }
  return [];
}
