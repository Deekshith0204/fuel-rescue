import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Fuel, 
  Car, 
  Bike, 
  MapPin, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Flame,
  ArrowRight,
  Loader2,
  Navigation,
  Sparkles
} from 'lucide-react';
import GoogleMapPicker from '../../components/common/GoogleMapPicker';
import { useEmergencyRequest } from '../../context/EmergencyRequestContext';
import { useAuth } from '../../context/AuthContext';
import { pricingService, DEFAULT_PRICING } from '../../services/pricingService';
import { dispatchService } from '../../services/dispatchService';
import { calculateHaversineDistance } from '../../services/mapsService';

export default function EmergencyRequestPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { submitEmergencyRequest } = useEmergencyRequest();

  // Form states
  const [fuelType, setFuelType] = useState('Petrol'); // Petrol or Diesel
  const [quantity, setQuantity] = useState(5); // 1, 2, 5, or custom
  const [vehicleType, setVehicleType] = useState('Car (Sedan/Hatchback)');
  const [customQty, setCustomQty] = useState('');
  const [message, setMessage] = useState('');

  // Location state
  const [location, setLocation] = useState({
    lat: 12.9724,
    lng: 77.6015,
    address: 'Residency Rd, Ashok Nagar, Bengaluru, Karnataka'
  });

  const [submitting, setSubmitting] = useState(false);
  const [confirmedSafety, setConfirmedSafety] = useState(true);

  // Live Admin Pricing & Distance State
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [estimatedKm, setEstimatedKm] = useState(4.2);

  // Subscribe to real-time pricing updates set by Admin
  useEffect(() => {
    const unsub = pricingService.subscribeToPricing((livePricing) => {
      setPricing(livePricing);
    });
    return () => unsub && unsub();
  }, []);

  // Compute proximity distance whenever location changes
  useEffect(() => {
    async function calculateProximity() {
      try {
        const partners = await dispatchService.findNearestPartners(location.lat, location.lng);
        if (partners && partners.length > 0) {
          setEstimatedKm(Number(partners[0].distanceKm.toFixed(1)));
        } else {
          // Approximate distance to central emergency hub
          const dist = calculateHaversineDistance(location.lat, location.lng, 12.9716, 77.5946);
          setEstimatedKm(Math.max(1.5, Number(dist.toFixed(1))));
        }
      } catch (e) {
        setEstimatedKm(4.2);
      }
    }
    calculateProximity();
  }, [location.lat, location.lng]);

  const effectiveQty = quantity === 'custom' ? (parseFloat(customQty) || 1) : quantity;

  // Dynamic Fare calculation using Admin-set rates and per-km transit
  const fare = pricingService.calculateFare(pricing, {
    fuelType,
    quantity: effectiveQty,
    distanceKm: estimatedKm
  });

  const handleLocationSelect = (loc) => {
    setLocation(loc);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location.address) {
      alert("Please confirm your breakdown location on the map.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        fuelType,
        quantity: effectiveQty,
        vehicleType,
        latitude: location.lat,
        longitude: location.lng,
        address: location.address,
        message: message.trim(),
        pricePerLitre: fare.pricePerLitre,
        subtotal: fare.fuelSubtotal,
        baseDeliveryFee: fare.baseDeliveryFee,
        deliveryFeePerKm: fare.deliveryFeePerKm,
        distanceKm: fare.distanceKm,
        deliveryFee: fare.totalDeliveryFee,
        emergencySurge: fare.emergencySurge,
        totalAmount: fare.totalAmount
      };

      await submitEmergencyRequest(payload);
      // Navigate directly to live tracking screen
      navigate('/customer/tracking');
    } catch (err) {
      alert("Failed to submit request: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20 text-xs font-bold uppercase tracking-wider">
                Emergency Breakdown Dispatch
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                Live Official Rates
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2 font-['Plus_Jakarta_Sans']">
              Request Emergency Fuel
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Authorized mobile roadside dispensing unit dispatched to your exact GPS coordinates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Estimated Fare</span>
              <span className="text-2xl font-black text-brand-400 font-mono">₹{fare.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Fuel Selection */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Fuel className="w-4 h-4 text-brand-400" />
                <span>1. Select Fuel Type & Quantity</span>
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span>Petrol: <b className="text-white">₹{pricing.petrolPricePerLitre}/L</b></span>
                <span>•</span>
                <span>Diesel: <b className="text-white">₹{pricing.dieselPricePerLitre}/L</b></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFuelType('Petrol')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                  fuelType === 'Petrol'
                    ? 'bg-brand-500/20 border-brand-500 text-white shadow-glow'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-base block">Petrol (Gasoline)</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">Standard Octane • 2-Wheelers & Petrol Cars</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-brand-400">₹{pricing.petrolPricePerLitre.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block">/ Litre</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFuelType('Diesel')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                  fuelType === 'Diesel'
                    ? 'bg-blue-500/20 border-blue-500 text-white shadow-glow'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-base block">Diesel (Automotive)</span>
                  <span className="text-xs text-slate-400 mt-0.5 block">High Cetane • SUVs, Heavy Vehicles & Vans</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-blue-400">₹{pricing.dieselPricePerLitre.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400 block">/ Litre</span>
                </div>
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                Emergency Safe Top-Up Quantity:
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 5].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setQuantity(qty)}
                    className={`py-3 rounded-xl border text-center transition font-bold text-sm ${
                      quantity === qty
                        ? 'bg-brand-500 text-white border-brand-500 shadow-glow'
                        : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {qty} Litre{qty > 1 ? 's' : ''}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setQuantity('custom')}
                  className={`py-3 rounded-xl border text-center transition font-bold text-sm ${
                    quantity === 'custom'
                      ? 'bg-brand-500 text-white border-brand-500 shadow-glow'
                      : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  Custom
                </button>
              </div>

              {quantity === 'custom' && (
                <div className="mt-3">
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="0.5"
                    value={customQty}
                    onChange={(e) => setCustomQty(e.target.value)}
                    placeholder="Enter litres (e.g. 3, 4, max 10L for roadside emergency)"
                    className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Under roadside emergency safety norms, max mobile top-up is 10 litres to safely reach the nearest fuel station.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Vehicle & Context */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-brand-400" />
              <span>2. Vehicle Information</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Car (Sedan/Hatchback)', 'SUV / MUV', 'Motorcycle / Scooter', 'Commercial / Other'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVehicleType(v)}
                  className={`p-3 rounded-xl border text-xs text-center font-semibold transition ${
                    vehicleType === v
                      ? 'bg-brand-500/20 border-brand-500 text-brand-300'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Optional Message for Partner (e.g., Highway km marker, car colour, hazard lights)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="White Swift stranded on left shoulder near toll booth, hazard lights flashing..."
                rows="2"
                className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Section 3: Google Map Location Picker */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>3. Pinpoint Breakdown Location</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-brand-400 font-semibold bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20">
                <Navigation className="w-3.5 h-3.5" />
                <span>Est. Transit: ~{fare.distanceKm} km</span>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Use GPS location, search your highway / street landmark via Google Places Autocomplete, or drag the marker to your precise vehicle position.
            </p>

            <GoogleMapPicker
              initialCoords={{ lat: location.lat, lng: location.lng }}
              initialAddress={location.address}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Section 4: Upfront Price Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Emergency Dispatch Fare Summary
              </h4>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                Admin Verified Live Tariffs
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>{effectiveQty} Litre{effectiveQty > 1 ? 's' : ''} {fuelType} (@ ₹{fare.pricePerLitre.toFixed(2)}/L):</span>
                <span className="font-semibold text-white">₹{fare.fuelSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Base Rapid Dispatch Fee:</span>
                <span className="font-semibold text-white">₹{fare.baseDeliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Distance Transit Charge ({fare.distanceKm} km @ ₹{fare.deliveryFeePerKm.toFixed(2)}/km):</span>
                <span className="font-semibold text-white">₹{fare.distanceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Emergency Roadside Safety Escort:</span>
                <span className="font-semibold text-white">₹{fare.emergencySurge.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-800 flex justify-between text-sm">
                <span className="font-bold text-white">Total Amount Due:</span>
                <span className="font-extrabold text-brand-400 text-base">₹{fare.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-[11px] flex items-center gap-2 mt-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Payment is collected upon arrival via UPI, Card, or Cash on delivery.</span>
            </div>
          </div>

          {/* Submit Emergency Request Button */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-black text-base shadow-glow hover:scale-[1.01] transition-all flex items-center justify-center gap-3 emergency-pulse disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Dispatching Nearest Emergency Partner...</span>
              </>
            ) : (
              <>
                <Flame className="w-5 h-5" />
                <span>CONFIRM & DISPATCH EMERGENCY FUEL (₹{fare.totalAmount.toFixed(2)})</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
