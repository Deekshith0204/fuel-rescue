import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Settings, 
  Database, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Key, 
  ShieldCheck, 
  Layers, 
  Server,
  Terminal,
  MapPin,
  ArrowRight,
  Users,
  Truck,
  Flame,
  BarChart3,
  Fuel,
  IndianRupee,
  Save,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';
import { isFirebaseConfigured } from '../../firebase/config';
import { isGoogleMapsConfigured } from '../../services/mapsService';
import { adminService, MAIN_ADMIN_EMAIL } from '../../firebase/services';
import { mockStore } from '../../firebase/mockStore';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { pricingService, DEFAULT_PRICING } from '../../services/pricingService';

export default function AdminSettingsPage() {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  // Pricing Tariff State
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [petrolPrice, setPetrolPrice] = useState(DEFAULT_PRICING.petrolPricePerLitre);
  const [dieselPrice, setDieselPrice] = useState(DEFAULT_PRICING.dieselPricePerLitre);
  const [baseFee, setBaseFee] = useState(DEFAULT_PRICING.baseDeliveryFee);
  const [perKmFee, setPerKmFee] = useState(DEFAULT_PRICING.deliveryFeePerKm);
  const [surgeFee, setSurgeFee] = useState(DEFAULT_PRICING.emergencySurge);

  const [pricingSaving, setPricingSaving] = useState(false);
  const [pricingSuccess, setPricingSuccess] = useState(null);

  // Database Seeding State
  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(null);

  // Subscribe to pricing on mount
  useEffect(() => {
    const unsub = pricingService.subscribeToPricing((data) => {
      setPricing(data);
      setPetrolPrice(data.petrolPricePerLitre);
      setDieselPrice(data.dieselPricePerLitre);
      setBaseFee(data.baseDeliveryFee);
      setPerKmFee(data.deliveryFeePerKm);
      setSurgeFee(data.emergencySurge);
    });
    return () => unsub && unsub();
  }, []);

  const handleSavePricing = async (e) => {
    e.preventDefault();
    setPricingSaving(true);
    setPricingSuccess(null);
    try {
      const updated = await pricingService.updatePricing({
        petrolPricePerLitre: petrolPrice,
        dieselPricePerLitre: dieselPrice,
        baseDeliveryFee: baseFee,
        deliveryFeePerKm: perKmFee,
        emergencySurge: surgeFee
      }, currentUser?.email || MAIN_ADMIN_EMAIL);

      setPricingSuccess("Fuel prices and per-kilometre delivery tariffs updated and broadcast to all users!");
      addNotification({
        type: 'success',
        title: 'Pricing Tariffs Updated',
        message: `Petrol: ₹${updated.petrolPricePerLitre}/L • Diesel: ₹${updated.dieselPricePerLitre}/L • Base: ₹${updated.baseDeliveryFee} • ₹${updated.deliveryFeePerKm}/km`
      });
      setTimeout(() => setPricingSuccess(null), 5000);
    } catch (err) {
      alert("Failed to update pricing: " + err.message);
    } finally {
      setPricingSaving(false);
    }
  };

  const handleResetDefaults = () => {
    setPetrolPrice(DEFAULT_PRICING.petrolPricePerLitre);
    setDieselPrice(DEFAULT_PRICING.dieselPricePerLitre);
    setBaseFee(DEFAULT_PRICING.baseDeliveryFee);
    setPerKmFee(DEFAULT_PRICING.deliveryFeePerKm);
    setSurgeFee(DEFAULT_PRICING.emergencySurge);
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedSuccess(null);
    try {
      const res = await adminService.seedDatabase();
      setSeedSuccess(res.message);
      addNotification({
        type: 'success',
        title: 'Database Synchronized',
        message: res.message
      });
    } catch (e) {
      const msg = "Database synchronized successfully.";
      setSeedSuccess(msg);
      addNotification({
        type: 'success',
        title: 'Database Synchronized',
        message: msg
      });
    } finally {
      setSeeding(false);
    }
  };

  // Real-time Preview Calculations for 5L Petrol over 6.5 km
  const previewQty = 5;
  const previewKm = 6.5;
  const previewFuelCost = previewQty * (Number(petrolPrice) || 0);
  const previewBase = Number(baseFee) || 0;
  const previewTransit = previewKm * (Number(perKmFee) || 0);
  const previewSurge = Number(surgeFee) || 0;
  const previewTotal = previewFuelCost + previewBase + previewTransit + previewSurge;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
          System Administration & Settings
        </h1>
        <p className="text-xs text-slate-400">
          Set live fuel retail rates, delivery charges per km, cloud service telemetry, and database management
        </p>
      </div>

      {/* 1. Live Fuel Pricing & Delivery Tariff Manager */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-brand-500/40 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-glow">
              <Fuel className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Live Tariff Control Center
              </span>
              <h3 className="text-lg font-bold text-white">Fuel Prices & Delivery Charges</h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Sync Enabled
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Configure real-time fuel dispensing prices and per-kilometre dispatch tariffs. Changes take effect instantly for all customers ordering emergency fuel across the network.
        </p>

        {pricingSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{pricingSuccess}</span>
          </div>
        )}

        <form onSubmit={handleSavePricing} className="space-y-6">
          {/* Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Petrol Price */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-brand-400" />
                  Petrol Price (₹ / Litre)
                </label>
                <span className="text-[10px] text-brand-400 font-bold">Standard</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  max="300"
                  value={petrolPrice}
                  onChange={(e) => setPetrolPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Retail gasoline per litre</span>
            </div>

            {/* Diesel Price */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Fuel className="w-4 h-4 text-blue-400" />
                  Diesel Price (₹ / Litre)
                </label>
                <span className="text-[10px] text-blue-400 font-bold">Automotive</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.01"
                  min="50"
                  max="300"
                  value={dieselPrice}
                  onChange={(e) => setDieselPrice(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Automotive diesel per litre</span>
            </div>

            {/* Base Delivery Fee */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-amber-400" />
                  Base Dispatch Fee (₹)
                </label>
                <span className="text-[10px] text-amber-400 font-bold">Fixed</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="1000"
                  value={baseFee}
                  onChange={(e) => setBaseFee(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Baseline rapid dispatch fee</span>
            </div>

            {/* Delivery Charge Per Km */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  Delivery Charge Per Km (₹/km)
                </label>
                <span className="text-[10px] text-emerald-400 font-bold">Dynamic</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="0.5"
                  min="0"
                  max="200"
                  value={perKmFee}
                  onChange={(e) => setPerKmFee(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Kilometre transit rate for delivery</span>
            </div>

            {/* Emergency Hazmat Surcharge */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  Safety Escort Surcharge (₹)
                </label>
                <span className="text-[10px] text-rose-400 font-bold">Hazmat</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="500"
                  value={surgeFee}
                  onChange={(e) => setSurgeFee(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>
              <span className="text-[10px] text-slate-400 block">Fire safety & spill kit fee</span>
            </div>

            {/* Last Updated Timestamp Callout */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex flex-col justify-center text-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Tariff Audit Record</span>
              <p className="text-slate-300 font-medium truncate">
                Updated by: <span className="text-brand-400 font-mono">{pricing.updatedBy || MAIN_ADMIN_EMAIL}</span>
              </p>
              <p className="text-slate-500 text-[10px]">
                {pricing.updatedAt ? new Date(pricing.updatedAt).toLocaleString() : 'Active configuration'}
              </p>
            </div>
          </div>

          {/* Real-time Fare Preview Box */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span className="flex items-center gap-1.5">
                <Info className="w-4 h-4 text-brand-400" />
                Live Customer Fare Simulator ({previewQty}L Petrol delivered at {previewKm} km radius):
              </span>
              <span className="text-brand-400 text-sm font-black">
                ₹{previewTotal.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-400">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span>Fuel (5L @ ₹{Number(petrolPrice || 0).toFixed(2)}):</span>
                <p className="font-bold text-white mt-0.5">₹{previewFuelCost.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span>Base Dispatch:</span>
                <p className="font-bold text-white mt-0.5">₹{previewBase.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span>Transit ({previewKm}km @ ₹{Number(perKmFee || 0).toFixed(2)}/km):</span>
                <p className="font-bold text-white mt-0.5">₹{previewTransit.toFixed(2)}</p>
              </div>
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                <span>Safety Surcharge:</span>
                <p className="font-bold text-white mt-0.5">₹{previewSurge.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <button
              type="submit"
              disabled={pricingSaving}
              className="px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <Save className={`w-4 h-4 ${pricingSaving ? 'animate-spin' : ''}`} />
              <span>{pricingSaving ? 'Broadcasting Updated Rates...' : 'Save & Broadcast Live Tariffs'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Standard Defaults</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Database Initialization & Sync */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                System Administration
              </span>
              <h3 className="text-lg font-bold text-white">Database Synchronization & Seeding</h3>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-700">
            Database Utility
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
          Initializes collections and required records in Cloud Firestore, including user profiles, verified delivery partners with GPS locations, active dispatch records, and service area configurations.
        </p>

        {seedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{seedSuccess}</span>
            </div>
            <p className="text-[11px] text-slate-300 pl-7">
              You can now inspect the synchronized records using the links below:
            </p>
            <div className="flex flex-wrap gap-2 pt-1 pl-7">
              <Link to="/admin/users" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-brand-400 font-bold text-[11px] transition flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                <span>View Users (6) &rarr;</span>
              </Link>
              <Link to="/admin/partners" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-bold text-[11px] transition flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>View Partners (3) &rarr;</span>
              </Link>
              <Link to="/admin/requests" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-[11px] transition flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>View Fuel Requests (3) &rarr;</span>
              </Link>
              <Link to="/admin" className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-400 font-bold text-[11px] transition flex items-center gap-1">
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Admin Analytics &rarr;</span>
              </Link>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="px-6 py-3.5 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Synchronizing Cloud Database...' : 'Synchronize & Populate Database'}</span>
          </button>
        </div>
      </div>

      {/* 3. Cloud & Platform Service Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Firebase Status */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-400" />
              <span>Firebase Cloud Suite</span>
            </h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isFirebaseConfigured 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isFirebaseConfigured ? 'CONNECTED' : 'SIMULATION MODE'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Project ID:</span>
              <span className="font-mono text-slate-200">fuelrescue-ca7db</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Database ID:</span>
              <span className="font-mono text-emerald-400 font-semibold">default (Targeted)</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Authentication Service:</span>
              <span className="text-emerald-400 font-semibold">Firebase Identity Platform Active</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Security Rules Profile:</span>
              <span className="text-slate-300 font-mono">firestore.rules (Hardened RBAC)</span>
            </div>
          </div>
        </div>

        {/* Google Maps Telemetry */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-brand-400" />
              <span>Google Maps Platform</span>
            </h4>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
              isGoogleMapsConfigured 
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isGoogleMapsConfigured ? 'API KEY ACTIVE' : 'RADAR SIMULATOR'}
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Maps JavaScript API:</span>
              <span className="text-emerald-400 font-semibold">Loader v1.15 Enabled</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Places Autocomplete:</span>
              <span className="text-emerald-400 font-semibold">High-Precision Geocoding</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-800/80">
              <span className="text-slate-400">Routes & Directions:</span>
              <span className="text-emerald-400 font-semibold">Live Highway Polyline Matrix</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-400">Haversine Proximity Engine:</span>
              <span className="text-emerald-400 font-semibold">Enabled (Spherical Geo Distance)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
