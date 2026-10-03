import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Compass, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Phone
} from 'lucide-react';
import { getGoogleMapsLoader, isGoogleMapsConfigured, calculateHaversineDistance } from '../../services/mapsService';

export default function GoogleMapTracker({
  customerLat = 12.9724,
  customerLng = 77.6015,
  partnerLat = 12.9750,
  partnerLng = 77.5960,
  customerAddress = "Residency Rd, Bengaluru",
  partnerName = "Rajesh Kumar",
  partnerVehicle = "KA-01-EQ-9021 (Safety Van)",
  status = "ON_THE_WAY",
  estimatedMinutes = 8,
  distanceKm = 2.1
}) {
  const mapContainerRef = useRef(null);
  const leafletMapRef = useRef(null);
  const leafletPartnerMarkerRef = useRef(null);
  const leafletCustomerMarkerRef = useRef(null);
  const leafletRouteLineRef = useRef(null);

  const googleMapRef = useRef(null);
  const googlePartnerMarkerRef = useRef(null);

  const [activeEngine, setActiveEngine] = useState(isGoogleMapsConfigured ? 'GOOGLE' : 'LEAFLET');
  const [simulatedPartnerPos, setSimulatedPartnerPos] = useState({ lat: partnerLat, lng: partnerLng });

  // Simulate smooth moving partner vehicle along delivery route
  useEffect(() => {
    if (status !== 'ON_THE_WAY' && status !== 'ACCEPTED') return;

    const interval = setInterval(() => {
      setSimulatedPartnerPos(prev => {
        // Step 8% closer to customer position
        const latStep = (customerLat - prev.lat) * 0.08;
        const lngStep = (customerLng - prev.lng) * 0.08;
        const nextLat = prev.lat + latStep;
        const nextLng = prev.lng + lngStep;

        // Update Leaflet marker position & polyline dynamically
        if (leafletPartnerMarkerRef.current) {
          leafletPartnerMarkerRef.current.setLatLng([nextLat, nextLng]);
        }
        if (leafletRouteLineRef.current) {
          leafletRouteLineRef.current.setLatLngs([
            [nextLat, nextLng],
            [customerLat, customerLng]
          ]);
        }

        // Update Google Maps marker if active
        if (googlePartnerMarkerRef.current) {
          googlePartnerMarkerRef.current.setPosition({ lat: nextLat, lng: nextLng });
        }

        return { lat: nextLat, lng: nextLng };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [customerLat, customerLng, status]);

  // Leaflet Custom Icons
  const createCustomerMarkerIcon = () => {
    return L.divIcon({
      className: 'tracker-customer-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: #ef4444;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 14px rgba(239, 68, 68, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
            animation: pulse 2s infinite;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
              <circle cx="12" cy="9" r="2.5"></circle>
            </svg>
          </div>
          <div style="
            margin-top: 3px;
            padding: 2px 6px;
            border-radius: 6px;
            background: rgba(15, 23, 42, 0.9);
            color: #ffffff;
            font-size: 10px;
            font-weight: 800;
            white-space: nowrap;
          ">
            Your Vehicle
          </div>
        </div>
      `,
      iconSize: [40, 56],
      iconAnchor: [20, 36]
    });
  };

  const createPartnerMarkerIcon = () => {
    return L.divIcon({
      className: 'tracker-partner-pin',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
          <div style="
            width: 42px;
            height: 42px;
            border-radius: 12px;
            background: #f97316;
            border: 3px solid #ffffff;
            box-shadow: 0 4px 16px rgba(249, 115, 22, 0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #ffffff;
          ">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
          <div style="
            margin-top: 3px;
            padding: 2px 6px;
            border-radius: 6px;
            background: #0f172a;
            color: #38bdf8;
            font-size: 10px;
            font-weight: 800;
            white-space: nowrap;
            border: 1px solid rgba(56, 189, 248, 0.3);
          ">
            ${partnerName.split(' ')[0]} (Rescuer)
          </div>
        </div>
      `,
      iconSize: [44, 58],
      iconAnchor: [22, 38]
    });
  };

  // Map Initialization
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (isGoogleMapsConfigured) {
      let isMounted = true;
      const loader = getGoogleMapsLoader();
      loader.load().then((google) => {
        if (!isMounted || !mapContainerRef.current) return;
        try {
          const customerPos = { lat: customerLat, lng: customerLng };
          const partnerPos = { lat: partnerLat, lng: partnerLng };
          const bounds = new google.maps.LatLngBounds();
          bounds.extend(customerPos);
          bounds.extend(partnerPos);

          const map = new google.maps.Map(mapContainerRef.current, {
            center: customerPos,
            zoom: 14,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false
          });
          googleMapRef.current = map;
          map.fitBounds(bounds, 60);

          new google.maps.Marker({
            position: customerPos,
            map,
            title: "Your Location"
          });

          const pMarker = new google.maps.Marker({
            position: partnerPos,
            map,
            title: `Rescuer: ${partnerName}`
          });
          googlePartnerMarkerRef.current = pMarker;

          const directionsService = new google.maps.DirectionsService();
          const directionsRenderer = new google.maps.DirectionsRenderer({
            map,
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#f97316",
              strokeWeight: 5
            }
          });

          directionsService.route(
            {
              origin: partnerPos,
              destination: customerPos,
              travelMode: google.maps.TravelMode.DRIVING
            },
            (result, status) => {
              if (status === google.maps.DirectionsStatus.OK) {
                directionsRenderer.setDirections(result);
              }
            }
          );
          setActiveEngine('GOOGLE');
        } catch (e) {
          console.warn("Google Maps init failed, using Leaflet:", e);
          initLeafletTracker();
        }
      }).catch(() => {
        initLeafletTracker();
      });

      return () => { isMounted = false; };
    } else {
      initLeafletTracker();
    }

    function initLeafletTracker() {
      if (leafletMapRef.current) return;
      setActiveEngine('LEAFLET');

      const map = L.map(mapContainerRef.current, {
        center: [customerLat, customerLng],
        zoom: 14,
        zoomControl: true
      });

      // CartoDB Voyager Tile Layer
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
        maxZoom: 19
      }).addTo(map);

      // Customer Marker
      const cMarker = L.marker([customerLat, customerLng], {
        icon: createCustomerMarkerIcon()
      }).addTo(map);
      leafletCustomerMarkerRef.current = cMarker;

      // Partner Marker
      const pMarker = L.marker([simulatedPartnerPos.lat, simulatedPartnerPos.lng], {
        icon: createPartnerMarkerIcon()
      }).addTo(map);
      leafletPartnerMarkerRef.current = pMarker;

      // Polyline route connecting Rescuer and Customer
      const routeLine = L.polyline(
        [
          [simulatedPartnerPos.lat, simulatedPartnerPos.lng],
          [customerLat, customerLng]
        ],
        {
          color: '#f97316',
          weight: 5,
          opacity: 0.85,
          dashArray: '8, 8',
          lineCap: 'round'
        }
      ).addTo(map);
      leafletRouteLineRef.current = routeLine;

      // Fit bounds to show both points with comfortable padding
      const group = L.featureGroup([cMarker, pMarker]);
      map.fitBounds(group.getBounds().pad(0.3));

      leafletMapRef.current = map;

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
  }, [customerLat, customerLng, partnerLat, partnerLng]);

  const openGoogleMapsExternal = () => {
    const url = `https://www.google.com/maps/dir/?api=1&origin=${simulatedPartnerPos.lat},${simulatedPartnerPos.lng}&destination=${customerLat},${customerLng}&travelmode=driving`;
    window.open(url, '_blank');
  };

  const calculatedDist = calculateHaversineDistance(
    simulatedPartnerPos.lat,
    simulatedPartnerPos.lng,
    customerLat,
    customerLng
  );

  return (
    <div className="w-full space-y-3">
      {/* Live Navigation Status Pill */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-600 dark:text-brand-400 shadow-sm">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>{partnerName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                PESO Certified
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">{partnerVehicle}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="flex items-center gap-1.5 text-xs font-black text-brand-600 dark:text-brand-400">
              <Clock className="w-3.5 h-3.5" />
              <span>ETA ~{estimatedMinutes} mins</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">
              {calculatedDist || distanceKm} km remaining
            </span>
          </div>

          <button
            type="button"
            onClick={openGoogleMapsExternal}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
            title="Open in Google Maps Navigation App"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Directions</span>
          </button>
        </div>
      </div>

      {/* Real Interactive Map Canvas */}
      <div className="relative w-full h-80 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-950">
        
        {/* Real Map DOM Mount */}
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Live Delivery Status Badge */}
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-md">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping inline-block"></span>
          <span>Live GPS Rescuer Dispatch En Route</span>
        </div>

        {/* Real-time Distance Overlay */}
        <div className="absolute bottom-3 right-3 z-[400] px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-800 dark:text-slate-200 shadow-md">
          <span>Distance: <strong className="text-brand-600 dark:text-brand-400">{calculatedDist || distanceKm} km</strong></span>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 px-1">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-rose-500" />
          <span>Delivery Destination: <strong className="text-slate-700 dark:text-slate-300">{customerAddress}</strong></span>
        </span>
        <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Safety Lock Pin Verified</span>
        </span>
      </div>
    </div>
  );
}
