import React, { useEffect, useRef, useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Crosshair,
  ExternalLink,
  Layers
} from 'lucide-react';
import { getGoogleMapsLoader, isGoogleMapsConfigured, getCurrentBrowserLocation, reverseGeocodeCoords } from '../../services/mapsService';

export default function GoogleMapPicker({
  initialLat = 12.9716,
  initialLng = 77.5946,
  onLocationSelect,
  initialAddress = ""
}) {
  const mapContainerRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState(initialAddress || "Residency Rd, Ashok Nagar, Bengaluru");
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [usingMockMap, setUsingMockMap] = useState(!isGoogleMapsConfigured);

  // Initialize Google Maps JavaScript API
  useEffect(() => {
    if (!isGoogleMapsConfigured) {
      setUsingMockMap(true);
      return;
    }

    let isMounted = true;
    const loader = getGoogleMapsLoader();

    loader.load().then((google) => {
      if (!isMounted || !mapContainerRef.current) return;

      try {
        const center = { lat: coords.lat, lng: coords.lng };
        
        // Initialize Map
        const map = new google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            }
          ]
        });
        mapInstanceRef.current = map;

        // Custom Marker
        const marker = new google.maps.Marker({
          position: center,
          map,
          draggable: true,
          title: "Drag to confirm exact emergency vehicle location",
          animation: google.maps.Animation.DROP
        });
        markerInstanceRef.current = marker;

        // Marker Drag Event
        marker.addListener('dragend', async () => {
          const position = marker.getPosition();
          const newLat = position.lat();
          const newLng = position.lng();
          setCoords({ lat: newLat, lng: newLng });
          
          const resolvedAddress = await reverseGeocodeCoords(newLat, newLng);
          setAddress(resolvedAddress);
          if (onLocationSelect) {
            onLocationSelect({ lat: newLat, lng: newLng, address: resolvedAddress });
          }
        });

        // Map Click Event
        map.addListener('click', async (e) => {
          const newLat = e.latLng.lat();
          const newLng = e.latLng.lng();
          marker.setPosition({ lat: newLat, lng: newLng });
          setCoords({ lat: newLat, lng: newLng });
          
          const resolvedAddress = await reverseGeocodeCoords(newLat, newLng);
          setAddress(resolvedAddress);
          if (onLocationSelect) {
            onLocationSelect({ lat: newLat, lng: newLng, address: resolvedAddress });
          }
        });

        // Initialize Places Autocomplete
        if (autocompleteInputRef.current && google.maps.places) {
          const autocomplete = new google.maps.places.Autocomplete(autocompleteInputRef.current, {
            types: ['geocode', 'establishment']
          });
          autocomplete.bindTo('bounds', map);

          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) return;

            const placeLat = place.geometry.location.lat();
            const placeLng = place.geometry.location.lng();
            const placeAddress = place.formatted_address || place.name;

            map.setCenter({ lat: placeLat, lng: placeLng });
            map.setZoom(16);
            marker.setPosition({ lat: placeLat, lng: placeLng });

            setCoords({ lat: placeLat, lng: placeLng });
            setAddress(placeAddress);
            if (onLocationSelect) {
              onLocationSelect({ lat: placeLat, lng: placeLng, address: placeAddress });
            }
          });
        }

        setMapLoaded(true);
      } catch (err) {
        console.warn("Google Maps load failed, switching to prototype radar view:", err);
        setUsingMockMap(true);
      }
    }).catch((err) => {
      console.warn("Google Maps Loader caught error:", err);
      setUsingMockMap(true);
    });

    return () => {
      isMounted = false;
    };
  }, [isGoogleMapsConfigured]);

  // Browser Geolocation Trigger
  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setGeoError(null);
    try {
      const loc = await getCurrentBrowserLocation();
      setCoords({ lat: loc.latitude, lng: loc.longitude });

      if (mapInstanceRef.current && markerInstanceRef.current) {
        const newPos = { lat: loc.latitude, lng: loc.longitude };
        mapInstanceRef.current.setCenter(newPos);
        mapInstanceRef.current.setZoom(16);
        markerInstanceRef.current.setPosition(newPos);
      }

      const resolved = await reverseGeocodeCoords(loc.latitude, loc.longitude);
      setAddress(resolved);
      if (onLocationSelect) {
        onLocationSelect({ lat: loc.latitude, lng: loc.longitude, address: resolved });
      }
    } catch (err) {
      setGeoError(err.message);
    } finally {
      setLocating(false);
    }
  };

  // Quick landmark preset selection helper
  const handlePresetSelect = (presetName, lat, lng, addr) => {
    setCoords({ lat, lng });
    setAddress(addr);
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setCenter({ lat, lng });
      markerInstanceRef.current.setPosition({ lat, lng });
    }
    if (onLocationSelect) {
      onLocationSelect({ lat, lng, address: addr });
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Search & Location Bar */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Pinpoint Exact Breakdown Location
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              ref={autocompleteInputRef}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Search via Google Places (e.g., MG Road, Silk Board, Indiranagar)..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="px-3.5 py-2.5 bg-brand-500/10 border border-brand-500/30 text-brand-400 hover:bg-brand-500 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
            title="Detect GPS Location"
          >
            <Crosshair className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{locating ? 'Locating...' : 'My GPS'}</span>
          </button>
        </div>

        {geoError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{geoError}</span>
          </div>
        )}
      </div>

      {/* Map View Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        {!usingMockMap ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* High-Fidelity Google Maps Prototype Radar View (shown when API key is pending) */
          <div className="w-full h-full relative flex flex-col justify-between p-4 bg-slate-900/90 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
            <div className="flex items-center justify-between z-10">
              <div className="px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-700 text-xs text-brand-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
                <span>Google Maps Simulation View</span>
              </div>
              <div className="text-[11px] text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
                Lat: {coords.lat.toFixed(4)} | Lng: {coords.lng.toFixed(4)}
              </div>
            </div>

            {/* Central Pin Visual */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-brand-500/20 emergency-pulse flex items-center justify-center">
                  <MapPin className="w-7 h-7 text-brand-500 -mt-2 drop-shadow-lg" />
                </div>
                <div className="mt-1 px-3 py-1 rounded-md bg-slate-950/90 border border-brand-500/40 text-[11px] font-bold text-white shadow-xl">
                  Emergency Breakdown Pin
                </div>
              </div>
            </div>

            {/* Quick City Presets */}
            <div className="z-10 bg-slate-950/90 border border-slate-800 rounded-xl p-2.5">
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-1.5">
                Popular Quick Landmarks:
              </p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePresetSelect("Residency Rd", 12.9724, 77.6015, "Residency Rd, Ashok Nagar, Bengaluru")}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-200 transition"
                >
                  Residency Rd (Central)
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect("Koramangala", 12.9340, 77.6101, "80 Feet Rd, Koramangala 4th Block, Bengaluru")}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-200 transition"
                >
                  Koramangala Sector
                </button>
                <button
                  type="button"
                  onClick={() => handlePresetSelect("Whitefield", 12.9698, 77.7500, "ITPL Main Road, Whitefield, Bengaluru")}
                  className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-200 transition"
                >
                  Whitefield Tech Corridor
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Selected Coordinates Overlay Badge */}
        <div className="absolute top-3 left-3 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-700/60 text-xs text-slate-200">
          <MapPin className="w-3.5 h-3.5 text-brand-400" />
          <span className="font-mono text-[11px]">{coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°</span>
        </div>
      </div>

      <p className="text-[11px] text-slate-400">
        💡 <span className="font-semibold text-slate-300">Tip:</span> You can drag the map pin or click anywhere on the map to pinpoint your exact stranded vehicle position.
      </p>
    </div>
  );
}
