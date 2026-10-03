import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Flame, 
  Layers, 
  Truck, 
  MapPin, 
  AlertTriangle, 
  ShieldCheck, 
  Compass, 
  Maximize2,
  TrendingUp,
  Activity,
  RotateCcw,
  Navigation
} from 'lucide-react';

const TILE_PROVIDERS = {
  STREETS: {
    name: 'Street Map',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
  },
  OSM: {
    name: 'OpenStreetMap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  DARK: {
    name: 'Dark Radar',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
  }
};

const HOTSPOTS = [
  {
    id: 1,
    name: "Outer Ring Road (Bellandur - Marathahalli)",
    shortName: "Outer Ring Rd",
    incidents: 64,
    severity: "CRITICAL",
    lat: 12.9279,
    lng: 77.6833,
    avgResponseMin: 7.2,
    topIssue: "Evening Peak Traffic Fuel Depletion",
    radius: 1800
  },
  {
    id: 2,
    name: "Silk Board - Electronic City Elevated Express",
    shortName: "Silk Board",
    incidents: 58,
    severity: "HIGH",
    lat: 12.9176,
    lng: 77.6238,
    avgResponseMin: 8.5,
    topIssue: "Elevated Expressway Stranded Motorists",
    radius: 1500
  },
  {
    id: 3,
    name: "Central MG Road - Residency Road Corridor",
    shortName: "Central MG Rd",
    incidents: 42,
    severity: "MEDIUM",
    lat: 12.9756,
    lng: 77.6066,
    avgResponseMin: 6.1,
    topIssue: "Weekend Night Out Fuel Exhaustion",
    radius: 1200
  },
  {
    id: 4,
    name: "Hebbal Flyover - Airport Expressway",
    shortName: "Hebbal Flyover",
    incidents: 39,
    severity: "HIGH",
    lat: 13.0358,
    lng: 77.5970,
    avgResponseMin: 9.4,
    topIssue: "Highway High-Speed Tank Empties",
    radius: 1400
  },
  {
    id: 5,
    name: "Indiranagar 100ft Road & CMH Road",
    shortName: "Indiranagar",
    incidents: 35,
    severity: "MEDIUM",
    lat: 12.9784,
    lng: 77.6408,
    avgResponseMin: 6.8,
    topIssue: "Commuter Gridlock Stoppages",
    radius: 1100
  },
  {
    id: 6,
    name: "Whitefield ITPL & Hope Farm Corridor",
    shortName: "Whitefield",
    incidents: 47,
    severity: "HIGH",
    lat: 12.9866,
    lng: 77.7381,
    avgResponseMin: 8.1,
    topIssue: "Tech Corridor Sub-urban Commute Stoppages",
    radius: 1500
  }
];

const FLEET_UNITS = [
  {
    id: "FR-01",
    partner: "Rajesh Kumar",
    vehicle: "KA-01-EQ-9021 (Safety Van)",
    type: "Van",
    fuelLiters: 180,
    lat: 12.9650,
    lng: 77.6100,
    status: "ON_THE_WAY",
    speed: "42 km/h",
    eta: "6 mins",
    destination: "Indiranagar 100ft Road"
  },
  {
    id: "FR-02",
    partner: "Vikram Singh",
    vehicle: "KA-05-MK-4412 (Quick Bike)",
    type: "Motorcycle",
    fuelLiters: 40,
    lat: 12.9320,
    lng: 77.6750,
    status: "PATROLLING",
    speed: "28 km/h",
    eta: "Ready",
    destination: "Bellandur Outer Ring Road"
  },
  {
    id: "FR-03",
    partner: "Pooja Patel",
    vehicle: "KA-03-JJ-8819 (Heavy Tender)",
    type: "Heavy Tender",
    fuelLiters: 350,
    lat: 12.9150,
    lng: 77.6280,
    status: "STANDBY",
    speed: "0 km/h",
    eta: "Ready",
    destination: "Silk Board Depot"
  },
  {
    id: "FR-04",
    partner: "Suresh Gowda",
    vehicle: "KA-04-AB-3112 (Rapid Assist)",
    type: "Safety Van",
    fuelLiters: 160,
    lat: 13.0280,
    lng: 77.5920,
    status: "ON_THE_WAY",
    speed: "55 km/h",
    eta: "4 mins",
    destination: "Hebbal Junction"
  }
];

export default function BreakdownHeatmap() {
  const [viewMode, setViewMode] = useState('HEATMAP'); // 'HEATMAP' or 'FLEET'
  const [timeRange, setTimeRange] = useState('WEEK'); // 'TODAY', 'WEEK', 'MONTH'
  const [selectedHotspot, setSelectedHotspot] = useState(null);
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [tileStyle, setTileStyle] = useState('STREETS'); // 'STREETS', 'OSM', 'DARK'

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const tileLayerRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Prevent re-initialization if already exists
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [12.9716, 77.5946], // Bengaluru City Center
        zoom: 12,
        zoomControl: false,
        attributionControl: true
      });

      // Add Zoom Control to Top Right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Base Tile Layer
      const initialProvider = TILE_PROVIDERS[tileStyle];
      tileLayerRef.current = L.tileLayer(initialProvider.url, {
        attribution: initialProvider.attribution,
        maxZoom: 19
      }).addTo(map);

      // Dedicated FeatureGroup for dynamic markers/circles
      markersLayerRef.current = L.featureGroup().addTo(map);

      mapInstanceRef.current = map;

      // Invalidate size to guarantee crisp tile render
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 300);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Tile Style Change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    const provider = TILE_PROVIDERS[tileStyle];
    tileLayerRef.current.setUrl(provider.url);
  }, [tileStyle]);

  // Render Hotspots or Fleet Markers dynamically
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    const layer = markersLayerRef.current;
    layer.clearLayers();

    if (viewMode === 'HEATMAP') {
      HOTSPOTS.forEach((spot) => {
        const isCritical = spot.severity === 'CRITICAL';
        const isHigh = spot.severity === 'HIGH';
        const color = isCritical ? '#dc2626' : isHigh ? '#ea580c' : '#ca8a04';
        const fillColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#eab308';

        // 1. Heat Radius Circle on Real Roads
        const circle = L.circle([spot.lat, spot.lng], {
          radius: spot.radius,
          color: color,
          fillColor: fillColor,
          fillOpacity: 0.28,
          weight: 2
        }).addTo(layer);

        // 2. Incident Badge Marker (Custom DivIcon)
        const markerHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: 38px; 
              height: 38px; 
              border-radius: 50%; 
              background: ${fillColor}; 
              border: 3px solid #ffffff; 
              box-shadow: 0 4px 14px rgba(0,0,0,0.4); 
              display: flex; 
              align-items: center; 
              justify-content: center;
              font-weight: 900;
              font-size: 13px;
              color: #ffffff;
              animation: pulse 2s infinite;
            ">
              ${spot.incidents}
            </div>
            <div style="
              margin-top: 4px;
              padding: 2px 8px;
              border-radius: 6px;
              background: rgba(15, 23, 42, 0.9);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: #ffffff;
              font-size: 11px;
              font-weight: 700;
              white-space: nowrap;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
            ">
              ${spot.shortName}
            </div>
          </div>
        `;

        const markerIcon = L.divIcon({
          html: markerHtml,
          className: 'leaflet-hotspot-pin',
          iconSize: [42, 60],
          iconAnchor: [21, 30]
        });

        const marker = L.marker([spot.lat, spot.lng], { icon: markerIcon }).addTo(layer);

        // Rich Interactive Popup
        const popupContent = `
          <div style="min-width: 220px; font-family: system-ui, sans-serif; color: #0f172a; padding: 4px 0;">
            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px;">
              <span style="
                background: ${isCritical ? '#fee2e2' : '#ffedd5'}; 
                color: ${color}; 
                font-size: 10px; 
                font-weight: 800; 
                padding: 2px 6px; 
                border-radius: 9999px; 
                text-transform: uppercase;
              ">${spot.severity} HOTSPOT</span>
              <span style="font-size: 12px; font-weight: 800; color: #0f172a;">${spot.incidents} Incidents</span>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 800; line-height: 1.2;">${spot.name}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b; line-height: 1.3;">${spot.topIssue}</p>
            <div style="display: flex; justify-content: space-between; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <span style="color: #64748b;">Avg Response:</span>
              <strong style="color: #059669;">${spot.avgResponseMin} mins</strong>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        circle.bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedHotspot(spot);
          setSelectedFleet(null);
        });
      });
    } else {
      // FLEET RADAR MODE
      FLEET_UNITS.forEach((unit) => {
        const isEnRoute = unit.status === 'ON_THE_WAY';
        const badgeColor = isEnRoute ? '#f97316' : unit.status === 'PATROLLING' ? '#0ea5e9' : '#10b981';

        const fleetHtml = `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
            <div style="
              width: 40px; 
              height: 40px; 
              border-radius: 12px; 
              background: ${badgeColor}; 
              border: 3px solid #ffffff; 
              box-shadow: 0 4px 16px rgba(0,0,0,0.4); 
              display: flex; 
              align-items: center; 
              justify-content: center;
              color: #ffffff;
            ">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div style="
              margin-top: 4px;
              padding: 2px 8px;
              border-radius: 6px;
              background: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(255, 255, 255, 0.2);
              color: #ffffff;
              font-size: 11px;
              font-weight: 800;
              white-space: nowrap;
            ">
              ${unit.id} • ${unit.partner.split(' ')[0]}
            </div>
          </div>
        `;

        const fleetIcon = L.divIcon({
          html: fleetHtml,
          className: 'leaflet-fleet-pin',
          iconSize: [44, 62],
          iconAnchor: [22, 31]
        });

        const marker = L.marker([unit.lat, unit.lng], { icon: fleetIcon }).addTo(layer);

        const popupContent = `
          <div style="min-width: 220px; font-family: system-ui, sans-serif; color: #0f172a; padding: 4px 0;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-weight: 800; color: #0f172a; font-size: 13px;">${unit.id} (${unit.type})</span>
              <span style="
                background: ${isEnRoute ? '#ffedd5' : '#dcfce7'}; 
                color: ${badgeColor}; 
                font-size: 10px; 
                font-weight: 800; 
                padding: 2px 6px; 
                border-radius: 9999px;
              ">${unit.status}</span>
            </div>
            <h4 style="margin: 0 0 2px 0; font-size: 13px; font-weight: 700;">${unit.partner}</h4>
            <p style="margin: 0 0 8px 0; font-size: 11px; color: #64748b;">${unit.vehicle}</p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px; border-top: 1px solid #e2e8f0; padding-top: 6px;">
              <div><span style="color: #64748b;">Payload:</span> <strong>${unit.fuelLiters}L</strong></div>
              <div><span style="color: #64748b;">Speed:</span> <strong>${unit.speed}</strong></div>
              <div><span style="color: #64748b;">Target:</span> <strong>${unit.destination}</strong></div>
              <div><span style="color: #64748b;">ETA:</span> <strong style="color: #ea580c;">${unit.eta}</strong></div>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);

        marker.on('click', () => {
          setSelectedFleet(unit);
          setSelectedHotspot(null);
        });
      });
    }
  }, [viewMode]);

  // Recenter Map Helper
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([12.9716, 77.5946], 12, { animate: true });
    }
  };

  return (
    <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden p-6 space-y-6 transition-colors">
      
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/20">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Geographic Incident Intelligence
              </span>
              <span className="text-slate-400 dark:text-slate-600">•</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block"></span>
                Live GPS Active
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Breakdown Density Heatmap & Fleet Radar
            </h2>
          </div>
        </div>

        {/* View Mode & Map Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Incident vs Fleet Mode Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => {
                setViewMode('HEATMAP');
                setSelectedFleet(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'HEATMAP'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Incident Heatmap</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setViewMode('FLEET');
                setSelectedHotspot(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                viewMode === 'FLEET'
                  ? 'bg-brand-500 text-white shadow-md shadow-brand-500/30'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Live Fleet Radar</span>
            </button>
          </div>

          {/* Map Layer Style Switcher */}
          <div className="flex items-center p-1 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
            <Layers className="w-3.5 h-3.5 ml-2 mr-1 text-slate-400" />
            {Object.keys(TILE_PROVIDERS).map((key) => (
              <button
                key={key}
                onClick={() => setTileStyle(key)}
                className={`px-2.5 py-1 rounded-xl font-bold transition ${
                  tileStyle === key 
                    ? 'bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-400 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={TILE_PROVIDERS[key].name}
              >
                {TILE_PROVIDERS[key].name}
              </button>
            ))}
          </div>

          {/* Recenter Button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:border-brand-500/30 transition shadow-sm"
            title="Reset Map to Bengaluru Center"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Metric Quick Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Total Grid Incidents</span>
          <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">285 Calls</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">↑ 14% vs last week</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Avg Response Speed</span>
          <span className="text-lg font-black text-brand-600 dark:text-brand-400 mt-0.5 block">7.2 mins</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Fastest: 4.8m in MG Rd</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Highest Risk Hotspot</span>
          <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">Outer Ring Road</span>
          <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">64 stranded vehicles</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] block font-medium">Active Fleet Responders</span>
          <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">4 Units Active</span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">100% PESO Certified Units</span>
        </div>
      </div>

      {/* Main REAL Leaflet Map Container */}
      <div className="relative w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-950">
        
        {/* Real Leaflet Map DOM Mount */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Heatmap Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-[400] p-3 rounded-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[10px] space-y-1.5 shadow-xl">
          <span className="font-extrabold text-slate-900 dark:text-white block uppercase tracking-wider">
            {viewMode === 'HEATMAP' ? 'Breakdown Severity Scale' : 'Fleet Status Legend'}
          </span>
          {viewMode === 'HEATMAP' ? (
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose-600 inline-block shadow-sm"></span>
                <span>Critical (&gt;50)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500 inline-block shadow-sm"></span>
                <span>High (35-50)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block shadow-sm"></span>
                <span>Moderate (&lt;35)</span>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-medium">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-orange-500 inline-block"></span>
                <span>En Route</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-sky-500 inline-block"></span>
                <span>Patrolling</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
                <span>Standby</span>
              </span>
            </div>
          )}
        </div>

        {/* Real GPS Info Overlay */}
        <div className="absolute top-4 left-4 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 shadow-md">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Bengaluru City Emergency Perimeter (OpenStreetMap Live)</span>
        </div>
      </div>

      {/* Selected Hotspot Deep Dive Card */}
      {selectedHotspot && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-brand-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                selectedHotspot.severity === 'CRITICAL' 
                  ? 'bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-500/30'
                  : 'bg-orange-500/20 text-orange-700 dark:text-orange-300 border-orange-500/30'
              }`}>
                {selectedHotspot.severity} HOTSPOT
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedHotspot.name}</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Primary Cause: <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedHotspot.topIssue}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-medium">Avg Response</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{selectedHotspot.avgResponseMin} mins</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-medium">Volume</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedHotspot.incidents} Incidents</span>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Selected Fleet Unit Deep Dive Card */}
      {selectedFleet && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-brand-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in transition-all">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] font-extrabold uppercase">
                {selectedFleet.status}
              </span>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{selectedFleet.partner} ({selectedFleet.id})</h4>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Assigned Vehicle: <span className="font-semibold text-slate-900 dark:text-slate-200">{selectedFleet.vehicle}</span> • Current Speed: <span className="font-semibold text-brand-600 dark:text-brand-400">{selectedFleet.speed}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-medium">Fuel Payload</span>
              <span className="font-bold text-slate-900 dark:text-white">{selectedFleet.fuelLiters} Liters</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-medium">Heading To</span>
              <span className="font-bold text-brand-600 dark:text-brand-400 truncate max-w-[120px] block">{selectedFleet.destination}</span>
            </div>
            <button
              onClick={() => setSelectedFleet(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
