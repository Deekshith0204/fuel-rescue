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
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [estimatedKm, setEstimatedKm] = useState(4.2);

  // Load live pricing from settings or default
  useEffect(() => {
    async function loadPricingAndLocation() {
      try {
        const livePricing = await pricingService.getPricingConfig();
        if (livePricing) setPricing(livePricing);
      } catch (e) {
        console.warn("Using default pricing", e);
      }

      // Check if user has a default vehicle in garage or saved location
      if (currentUser?.garage && currentUser.garage.length > 0) {
        const defaultVehicle = currentUser.garage.find(v => v.isDefault) || currentUser.garage[0];
        if (defaultVehicle) {
          if (defaultVehicle.fuelType) setFuelType(defaultVehicle.fuelType);
          if (defaultVehicle.type) setVehicleType(defaultVehicle.type);
        }
      }

      if (currentUser?.savedLocations && currentUser.savedLocations.length > 0) {
        const defaultLoc = currentUser.savedLocations.find(l => l.isDefault) || currentUser.savedLocations[0];
        if (defaultLoc && defaultLoc.address) {
          setLocation(prev => ({
            ...prev,
            address: defaultLoc.address,
            lat: defaultLoc.lat || prev.lat,
            lng: defaultLoc.lng || prev.lng
          }));
        }
      }

      // Estimate distance to nearest partner
      try {
        const partners = await dispatchService.getAvailablePartners();
        if (partners && partners.length > 0) {
          const nearest = partners.reduce((prev, curr) => {
            const d1 = calculateHaversineDistance(location.lat, location.lng, prev.latitude || 12.97, prev.longitude || 77.59);
            const d2 = calculateHaversineDistance(location.lat, location.lng, curr.latitude || 12.97, curr.longitude || 77.59);
            return d1 < d2 ? prev : curr;
          });
          const dist = calculateHaversineDistance(location.lat, location.lng, nearest.latitude || 12.97, nearest.longitude || 77.59);
          setEstimatedKm(Number(dist.toFixed(1)) || 3.5);
        }
      } catch (err) {
        console.warn("Nearest partner distance calculation fallback:", err);
      }
    }
    loadPricingAndLocation();
  }, [currentUser]);

  const effectiveQty = quantity === 'custom' ? (parseFloat(customQty) || 5) : quantity;

  // Dynamic Fare calculation
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
      navigate('/customer/tracking');
    } catch (err) {
      alert("Failed to submit request: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-200 dark:border-brand-500/20 text-xs font-bold uppercase tracking-wider">
                Emergency Breakdown Dispatch
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <Sparkles className="w-3 h-3" />
                Live Official Rates
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-2 font-['Plus_Jakarta_Sans']">
              Request Emergency Fuel
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Authorized mobile roadside dispensing unit dispatched to your exact GPS coordinates
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">Estimated Fare</span>
              <span className="text-2xl font-black text-brand-600 dark:text-brand-400 font-mono">₹{fare.totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Fuel Selection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Fuel className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                <span>1. Select Fuel Type & Quantity</span>
              </h3>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Petrol: <b className="text-slate-800 dark:text-white font-bold">₹{pricing.petrolPricePerLitre}/L</b></span>
                <span>•</span>
                <span>Diesel: <b className="text-slate-800 dark:text-white font-bold">₹{pricing.dieselPricePerLitre}/L</b></span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFuelType('Petrol')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                  fuelType === 'Petrol'
                    ? 'bg-orange-50 dark:bg-brand-500/20 border-brand-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-brand-500'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-base block text-slate-900 dark:text-white">Petrol (Gasoline)</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">Standard Octane • 2-Wheelers & Cars</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-brand-600 dark:text-brand-400 font-mono">₹{pricing.petrolPricePerLitre.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">/ Litre</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFuelType('Diesel')}
                className={`p-4 rounded-2xl border text-left transition flex items-center justify-between ${
                  fuelType === 'Diesel'
                    ? 'bg-blue-50 dark:bg-blue-500/20 border-blue-500 text-slate-900 dark:text-white shadow-sm ring-1 ring-blue-500'
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div>
                  <span className="font-bold text-base block text-slate-900 dark:text-white">Diesel (Automotive)</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 block">High Cetane • SUVs, Heavy Vehicles & Vans</span>
                </div>
                <div className="text-right">
                  <span className="text-base font-extrabold text-blue-600 dark:text-blue-400 font-mono">₹{pricing.dieselPricePerLitre.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block">/ Litre</span>
                </div>
              </button>
            </div>

            {/* Quantity Selector */}
            <div className="pt-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
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
                        ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                      ? 'bg-brand-500 text-white border-brand-500 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800/70 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
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
                    className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    required
                  />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 block">
                    Under roadside emergency safety norms, max mobile top-up is 10 litres to safely reach the nearest fuel station.
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Vehicle & Context */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Car className="w-4 h-4 text-brand-500 dark:text-brand-400" />
              <span>2. Vehicle Information</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['Car (Sedan/Hatchback)', 'SUV / MUV', 'Motorcycle / Scooter', 'Commercial / Other'].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVehicleType(v)}
                  className={`p-3 rounded-xl border text-xs text-center font-bold transition ${
                    vehicleType === v
                      ? 'bg-orange-50 dark:bg-brand-500/20 border-brand-500 text-brand-700 dark:text-brand-300'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Optional Message for Partner (e.g., Highway km marker, car colour, hazard lights)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="White Swift stranded on left shoulder near toll booth, hazard lights flashing..."
                rows="2"
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Section 3: Location Picker */}
          <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-500 dark:text-brand-400" />
                <span>3. Pinpoint Breakdown Location</span>
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-brand-700 dark:text-brand-400 font-bold bg-orange-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-full border border-orange-200 dark:border-brand-500/20">
                <Navigation className="w-3.5 h-3.5" />
                <span>Est. Transit: ~{fare.distanceKm} km</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              Use GPS location, search your highway / street landmark via Google Places Autocomplete, or drag the marker to your precise vehicle position.
            </p>

            <GoogleMapPicker
              initialCoords={{ lat: location.lat, lng: location.lng }}
              initialAddress={location.address}
              onLocationSelect={handleLocationSelect}
            />
          </div>

          {/* Section 4: Upfront Price Breakdown */}
          <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Emergency Dispatch Fare Summary
              </h4>
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                Admin Verified Live Tariffs
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>{effectiveQty} Litre{effectiveQty > 1 ? 's' : ''} {fuelType} (@ ₹{fare.pricePerLitre.toFixed(2)}/L):</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{fare.fuelSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Base Rapid Dispatch Fee:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{fare.baseDeliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Distance Transit Charge ({fare.distanceKm} km @ ₹{fare.deliveryFeePerKm.toFixed(2)}/km):</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{fare.distanceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Emergency Roadside Safety Escort:</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{fare.emergencySurge.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-sm">
                <span className="font-bold text-slate-900 dark:text-white">Total Amount Due:</span>
                <span className="font-extrabold text-brand-600 dark:text-brand-400 text-base font-mono">₹{fare.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-900 dark:text-amber-200/90 text-[11px] flex items-center gap-2 mt-2">
              <Info className="w-4 h-4 text-amber-500 shrink-0" />
              <span>Payment is collected upon arrival via UPI, Card, or Cash on delivery.</span>
            </div>
          </div>

          {/* Submit Button */}
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
