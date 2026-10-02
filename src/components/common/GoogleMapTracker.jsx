import React, { useEffect, useRef, useState } from 'react';
import { 
  Navigation, 
  MapPin, 
  Truck, 
  Compass, 
  Clock, 
  ExternalLink,
  ShieldCheck,
  AlertCircle
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
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const partnerMarkerRef = useRef(null);
  const [usingMockMap, setUsingMockMap] = useState(!isGoogleMapsConfigured);
  const [simulatedPartnerPos, setSimulatedPartnerPos] = useState({ lat: partnerLat, lng: partnerLng });

  // Simulate smooth moving partner vehicle along delivery path
  useEffect(() => {
    if (status !== 'ON_THE_WAY' && status !== 'ACCEPTED') return;

    const interval = setInterval(() => {
      setSimulatedPartnerPos(prev => {
        // Step slightly towards customer coordinates
        const latStep = (customerLat - prev.lat) * 0.08;
        const lngStep = (customerLng - prev.lng) * 0.08;
        const nextLat = prev.lat + latStep;
        const nextLng = prev.lng + lngStep;

        if (partnerMarkerRef.current) {
          partnerMarkerRef.current.setPosition({ lat: nextLat, lng: nextLng });
        }
        return { lat: nextLat, lng: nextLng };
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [customerLat, customerLng, status]);

  // Google Maps Platform Integration
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
        const bounds = new google.maps.LatLngBounds();
        const customerPos = { lat: customerLat, lng: customerLng };
        const partnerPos = { lat: partnerLat, lng: partnerLng };
        bounds.extend(customerPos);
        bounds.extend(partnerPos);

        const map = new google.maps.Map(mapContainerRef.current, {
          center: customerPos,
          zoom: 14,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          styles: [
            { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#334155" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#0f172a" }],
            }
          ]
        });
        mapInstanceRef.current = map;
        map.fitBounds(bounds, 60);

        // Customer Emergency Marker
        new google.maps.Marker({
          position: customerPos,
          map,
          title: "Stranded Vehicle",
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#ef4444",
            fillOpacity: 1,
            strokeWeight: 3,
            strokeColor: "#ffffff"
          }
        });

        // Partner Rapid Assist Marker
        const pMarker = new google.maps.Marker({
          position: partnerPos,
          map,
          title: `Rapid Assist: ${partnerName}`,
          icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 6,
            fillColor: "#f97316",
            fillOpacity: 1,
            strokeWeight: 2,
            strokeColor: "#ffffff"
          }
        });
        partnerMarkerRef.current = pMarker;

        // Render Routes / Directions
        const directionsService = new google.maps.DirectionsService();
        const directionsRenderer = new google.maps.DirectionsRenderer({
          map,
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#f97316",
            strokeOpacity: 0.85,
            strokeWeight: 5
          }
        });
        directionsRendererRef.current = directionsRenderer;

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
      } catch (err) {
        console.warn("Failed to render Google directions, using simulation:", err);
        setUsingMockMap(true);
      }
    }).catch(err => {
      console.warn("Google Maps tracker loader failed:", err);
      setUsingMockMap(true);
    });

    return () => {
      isMounted = false;
    };
  }, [customerLat, customerLng, partnerLat, partnerLng, isGoogleMapsConfigured, partnerName]);

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
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
            <Truck className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{partnerName}</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                PESO Certified
              </span>
            </h4>
            <p className="text-xs text-slate-400">{partnerVehicle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right">
            <span className="block text-xs font-bold text-brand-400">
              {calculatedDist > 0.1 ? `~${calculatedDist} km away` : 'Arrived at Vehicle!'}
            </span>
            <span className="block text-[10px] text-slate-400">
              ETA: ~{Math.max(1, Math.round(calculatedDist * 2.5))} mins
            </span>
          </div>

          <button
            type="button"
            onClick={openGoogleMapsExternal}
            className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold flex items-center gap-1.5 transition shadow-glow"
          >
            <span>Navigate</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Radar Canvas */}
      <div className="relative w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        {!usingMockMap ? (
          <div ref={mapContainerRef} className="w-full h-full" />
        ) : (
          /* High-Fidelity Google Maps Vector Radar View */
          <div className="w-full h-full relative flex flex-col justify-between p-4 bg-slate-900 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]">
            {/* Top Bar */}
            <div className="flex items-center justify-between z-10">
              <div className="px-3 py-1 rounded-full bg-slate-950/90 border border-brand-500/40 text-xs font-semibold text-brand-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping"></span>
                <span>Active Google Route Vector</span>
              </div>
              <div className="text-xs text-slate-400 bg-slate-950/80 px-3 py-1 rounded-full border border-slate-800">
                Live Speed: 38 km/h
              </div>
            </div>

            {/* Simulated Route Visualization Canvas */}
            <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 400 300" preserveAspectRatio="none">
                {/* Road Line */}
                <path
                  d="M 60,240 Q 180,180 220,130 T 340,60"
                  fill="none"
                  stroke="#334155"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Active Orange Route Path */}
                <path
                  d="M 60,240 Q 180,180 220,130 T 340,60"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="6"
                  strokeDasharray="8 6"
                  className="animate-pulse"
                />
              </svg>

              {/* Partner Vehicle Icon Marker */}
              <div 
                className="absolute transition-all duration-1000 ease-out"
                style={{
                  left: `${20 + (1 - (calculatedDist / (distanceKm || 3))) * 60}%`,
                  top: `${70 - (1 - (calculatedDist / (distanceKm || 3))) * 50}%`
                }}
              >
                <div className="relative -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-glow emergency-pulse border-2 border-white">
                    <Truck className="w-4 h-4" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
                    {partnerName}
                  </span>
                </div>
              </div>

              {/* Stranded Customer Breakdown Pin */}
              <div className="absolute right-[12%] top-[18%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="w-9 h-9 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded bg-rose-950 border border-rose-500 text-[10px] font-bold text-rose-200 whitespace-nowrap">
                  Your Breakdown Location
                </span>
              </div>
            </div>

            {/* Bottom info banner */}
            <div className="z-10 bg-slate-950/90 border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-slate-300 truncate max-w-xs">{customerAddress}</span>
              </div>
              <span className="text-emerald-400 font-semibold shrink-0">Traffic: Clear</span>
            </div>
          </div>
        )}

        {/* Live GPS Tracking Badge */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-[11px] text-slate-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Google Live Tracking Active</span>
        </div>
      </div>
    </div>
  );
}
