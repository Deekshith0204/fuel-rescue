import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  MapPin, 
  Navigation, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  Crosshair,
  ExternalLink,
  Layers,
  Loader2
} from 'lucide-react';
import { 
  getGoogleMapsLoader, 
  isGoogleMapsConfigured, 
  getCurrentBrowserLocation, 
  reverseGeocodeCoords,
  searchAddressOSM
} from '../../services/mapsService';

export default function GoogleMapPicker({
  initialLat = 12.9716,
  initialLng = 77.5946,
  onLocationSelect,
  initialAddress = ""
}) {
  const mapContainerRef = useRef(null);
  const autocompleteInputRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletMarkerRef = useRef(null);
  const googleMapRef = useRef(null);
  const googleMarkerRef = useRef(null);

  const [coords, setCoords] = useState({ lat: initialLat, lng: initialLng });
  const [address, setAddress] = useState(initialAddress || "MG Road / Residency Rd, Ashok Nagar, Bengaluru");
  const [locating, setLocating] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [geoError, setGeoError] = useState(null);
  const [activeEngine, setActiveEngine] = useState(isGoogleMapsConfigured ? 'GOOGLE' : 'LEAFLET');

  // Helper to create a crisp custom Leaflet marker
  const createLeafletPinIcon = () => {
    return L.divIcon({
      className: 'emergency-picker-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: grab;">
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50% 50% 50% 0;
            background: #f97316;
            transform: rotate(-45deg);
            border: 3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(249, 115, 22, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              width: 14px;
              height: 14px;
              border-radius: 50%;
              background: #ffffff;
              transform: rotate(45deg);
            "></div>
          </div>
          <div style="
            width: 10px;
            height: 4px;
            background: rgba(0,0,0,0.3);
            border-radius: 50%;
            margin-top: 2px;
          "></div>
        </div>
      `,
      iconSize: [36, 42],
      iconAnchor: [18, 42]
    });
  };

  // Initialize Map Engine (Google Maps or Leaflet)
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (isGoogleMapsConfigured) {
      // Use Google Maps if valid key provided
      let isMounted = true;
      const loader = getGoogleMapsLoader();
      loader.load().then((google) => {
        if (!isMounted || !mapContainerRef.current) return;
        try {
          const center = { lat: coords.lat, lng: coords.lng };
          const map = new google.maps.Map(mapContainerRef.current, {
            center,
            zoom: 15,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
          googleMapRef.current = map;

          const marker = new google.maps.Marker({
            position: center,
            map,
            draggable: true,
            title: "Drag to confirm exact emergency vehicle location"
          });
          googleMarkerRef.current = marker;

          marker.addListener('dragend', async () => {
            const pos = marker.getPosition();
            const newLat = pos.lat();
            const newLng = pos.lng();
            setCoords({ lat: newLat, lng: newLng });
            const resolved = await reverseGeocodeCoords(newLat, newLng);
            setAddress(resolved);
            if (onLocationSelect) onLocationSelect({ lat: newLat, lng: newLng, address: resolved });
          });

          map.addListener('click', async (e) => {
            const newLat = e.latLng.lat();
            const newLng = e.latLng.lng();
            marker.setPosition({ lat: newLat, lng: newLng });
            setCoords({ lat: newLat, lng: newLng });
            const resolved = await reverseGeocodeCoords(newLat, newLng);
            setAddress(resolved);
            if (onLocationSelect) onLocationSelect({ lat: newLat, lng: newLng, address: resolved });
          });

          setActiveEngine('GOOGLE');
        } catch (e) {
          console.warn("Google Maps init error, falling back to Leaflet:", e);
          initLeaflet();
        }
      }).catch(() => {
        initLeaflet();
      });

      return () => { isMounted = false; };
    } else {
      initLeaflet();
    }

    function initLeaflet() {
      if (leafletMapRef.current) return;
      setActiveEngine('LEAFLET');

      const map = L.map(mapContainerRef.current, {
        center: [coords.lat, coords.lng],
        zoom: 15,
        zoomControl: true
      });

      // CartoDB Voyager Tile Layer (Real streets, clean roads, high contrast)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      // Draggable Marker
      const marker = L.marker([coords.lat, coords.lng], {
        draggable: true,
        icon: createLeafletPinIcon()
      }).addTo(map);

      marker.on('dragend', async () => {
        const pos = marker.getLatLng();
        setCoords({ lat: pos.lat, lng: pos.lng });
        const resolved = await reverseGeocodeCoords(pos.lat, pos.lng);
        setAddress(resolved);
        if (onLocationSelect) onLocationSelect({ lat: pos.lat, lng: pos.lng, address: resolved });
      });

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        const resolved = await reverseGeocodeCoords(lat, lng);
        setAddress(resolved);
        if (onLocationSelect) onLocationSelect({ lat, lng, address: resolved });
      });

      leafletMapRef.current = map;
      leafletMarkerRef.current = marker;

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);
    }

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update map pin when coords change programmatically
  const updateMapPosition = (newLat, newLng, newAddr) => {
    setCoords({ lat: newLat, lng: newLng });
    if (newAddr) setAddress(newAddr);

    if (activeEngine === 'LEAFLET' && leafletMapRef.current && leafletMarkerRef.current) {
      leafletMapRef.current.setView([newLat, newLng], 16, { animate: true });
      leafletMarkerRef.current.setLatLng([newLat, newLng]);
    } else if (activeEngine === 'GOOGLE' && googleMapRef.current && googleMarkerRef.current) {
      googleMapRef.current.setCenter({ lat: newLat, lng: newLng });
      googleMapRef.current.setZoom(16);
      googleMarkerRef.current.setPosition({ lat: newLat, lng: newLng });
    }

    if (onLocationSelect) {
      onLocationSelect({ lat: newLat, lng: newLng, address: newAddr || address });
    }
  };

  // Browser Geolocation Trigger
  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setGeoError(null);
    try {
      const loc = await getCurrentBrowserLocation();
      const resolved = await reverseGeocodeCoords(loc.latitude, loc.longitude);
      updateMapPosition(loc.latitude, loc.longitude, resolved);
    } catch (err) {
      setGeoError(err.message);
    } finally {
      setLocating(false);
    }
  };

  // Search Address on Enter or Search Click
  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!address || address.trim().length < 2) return;

    setSearching(true);
    setGeoError(null);
    try {
      const results = await searchAddressOSM(address);
      if (results && results.length > 0) {
        setSearchResults(results);
        const top = results[0];
        updateMapPosition(top.lat, top.lng, top.display_name);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.warn("Search failed:", err);
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Search & Location Bar */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
          Pinpoint Exact Breakdown Location on Real Map
        </label>
        
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
            <input
              ref={autocompleteInputRef}
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Search road or area (e.g., MG Road, Silk Board, Indiranagar)..."
              className="w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
            />
            {searching && (
              <div className="absolute right-3 top-3">
                <Loader2 className="w-4 h-4 text-brand-500 animate-spin" />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={searching}
            className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-sm"
          >
            Find
          </button>

          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={locating}
            className="px-3.5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 shadow-md shadow-brand-500/20"
            title="Detect My Real GPS Location"
          >
            <Crosshair className={`w-4 h-4 ${locating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{locating ? 'Locating...' : 'My GPS'}</span>
          </button>
        </form>

        {/* Search Results Dropdown (if multiple matches) */}
        {searchResults.length > 1 && (
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-lg text-xs space-y-1">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider px-2">
              Select Matching Landmark:
            </span>
            {searchResults.slice(0, 3).map((res, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  updateMapPosition(res.lat, res.lng, res.display_name);
                  setSearchResults([]);
                }}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 truncate flex items-center gap-2"
              >
                <MapPin className="w-3.5 h-3.5 text-brand-500 shrink-0" />
                <span className="truncate">{res.display_name}</span>
              </button>
            ))}
          </div>
        )}

        {geoError && (
          <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{geoError}</span>
          </div>
        )}
      </div>

      {/* Map View Canvas */}
      <div className="relative w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 shadow-lg bg-slate-100 dark:bg-slate-950">
        
        {/* Real Map DOM Mount Container */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Coordinates Overlay Badge */}
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-brand-500" />
          <span className="font-mono text-[11px] font-semibold">{coords.lat.toFixed(4)}°, {coords.lng.toFixed(4)}°</span>
        </div>

        {/* Quick Landmark Preset Bar at bottom of map */}
        <div className="absolute bottom-3 left-3 right-3 z-[400] flex items-center gap-1.5 overflow-x-auto py-1 px-2 rounded-xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-md">
          <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
            Quick Pins:
          </span>
          <button
            type="button"
            onClick={() => updateMapPosition(12.9724, 77.6015, "Residency Rd, Ashok Nagar, Bengaluru")}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 font-medium transition shrink-0"
          >
            Residency Rd
          </button>
          <button
            type="button"
            onClick={() => updateMapPosition(12.9340, 77.6101, "80 Feet Rd, Koramangala, Bengaluru")}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 font-medium transition shrink-0"
          >
            Koramangala
          </button>
          <button
            type="button"
            onClick={() => updateMapPosition(12.9784, 77.6408, "100ft Road, Indiranagar, Bengaluru")}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 font-medium transition shrink-0"
          >
            Indiranagar
          </button>
          <button
            type="button"
            onClick={() => updateMapPosition(12.9176, 77.6238, "Silk Board Junction, Hosur Rd, Bengaluru")}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 font-medium transition shrink-0"
          >
            Silk Board
          </button>
          <button
            type="button"
            onClick={() => updateMapPosition(12.9698, 77.7500, "ITPL Main Road, Whitefield, Bengaluru")}
            className="px-2.5 py-1 text-[11px] rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-brand-500 hover:text-white text-slate-700 dark:text-slate-200 font-medium transition shrink-0"
          >
            Whitefield
          </button>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 dark:text-slate-400">
        💡 <span className="font-semibold text-slate-700 dark:text-slate-300">Live Map Active:</span> Drag the orange pin or click anywhere on the street map to set your vehicle location.
      </p>
    </div>
  );
}
