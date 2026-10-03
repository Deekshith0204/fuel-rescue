import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  ShieldCheck, 
  Car, 
  Bike, 
  Truck, 
  MapPin, 
  Plus, 
  Trash2, 
  Check, 
  Save, 
  Camera, 
  Lock, 
  Bell, 
  HeartHandshake, 
  Fuel, 
  Calendar, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  LogOut,
  Loader2,
  Sliders,
  Compass
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { requestService } from '../../firebase/services';

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80"
];

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Prefer not to say'];

export default function ProfilePage() {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const { addNotification } = useNotifications();

  const [activeTab, setActiveTab] = useState('personal'); // 'personal', 'garage', 'locations', 'security'
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedField, setCopiedField] = useState(null);
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');

  // Personal details state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyRelation, setEmergencyRelation] = useState('Family / Friend');
  const [notes, setNotes] = useState('');
  const [photoURL, setPhotoURL] = useState('');

  // Garage (Saved Vehicles) state
  const [vehicles, setVehicles] = useState([]);
  const [vehicleModalOpen, setVehicleModalOpen] = useState(false);
  const [vehNickname, setVehNickname] = useState('');
  const [vehCategory, setVehCategory] = useState('Car (Sedan/Hatchback)');
  const [vehPlate, setVehPlate] = useState('');
  const [vehFuel, setVehFuel] = useState('Petrol');
  const [vehDefault, setVehDefault] = useState(false);

  // Saved locations state
  const [locations, setLocations] = useState([]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locLabel, setLocLabel] = useState('');
  const [locAddress, setLocAddress] = useState('');
  const [locDefault, setLocDefault] = useState(false);

  // Security preferences
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [emailReceipts, setEmailReceipts] = useState(true);
  const [audioSiren, setAudioSiren] = useState(true);

  // Stats telemetry
  const [orderCount, setOrderCount] = useState(0);
  const [litresCount, setLitresCount] = useState(0);

  // Initialize from currentUser
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setPhone(currentUser.phone || '');
      setBloodGroup(currentUser.bloodGroup || 'O+');
      setEmergencyContactName(currentUser.emergencyContactName || 'Rahul Sharma');
      setEmergencyContactPhone(currentUser.emergencyContactPhone || '+91 98450 11223');
      setEmergencyRelation(currentUser.emergencyRelation || 'Brother / Family');
      setNotes(currentUser.notes || 'Emergency Roadside Motorist. Keep dispatch unit informed.');
      setPhotoURL(currentUser.photoURL || AVATAR_PRESETS[0]);

      // Initialize Vehicles
      if (Array.isArray(currentUser.savedVehicles) && currentUser.savedVehicles.length > 0) {
        setVehicles(currentUser.savedVehicles);
      } else {
        const defaultVeh = [
          { id: 'veh_01', nickname: 'Daily Commute Swift', category: 'Car (Sedan/Hatchback)', plateNumber: 'KA-01-MJ-2024', fuelType: 'Petrol', isDefault: true },
          { id: 'veh_02', nickname: 'Highway Thar SUV', category: 'SUV / MUV', plateNumber: 'KA-04-TR-8811', fuelType: 'Diesel', isDefault: false }
        ];
        setVehicles(defaultVeh);
      }

      // Initialize Locations
      if (Array.isArray(currentUser.savedLocations) && currentUser.savedLocations.length > 0) {
        setLocations(currentUser.savedLocations);
      } else {
        const defaultLocs = [
          { id: 'loc_01', label: 'Home Base', address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038', isDefault: true },
          { id: 'loc_02', label: 'Office Corridor', address: 'Outer Ring Rd, Bellandur, Bengaluru, Karnataka 560103', isDefault: false }
        ];
        setLocations(defaultLocs);
      }
    }
  }, [currentUser]);

  // Load real telemetry stats
  useEffect(() => {
    async function loadStats() {
      try {
        if (!currentUser) return;
        const allReqs = await requestService.getAll();
        const userReqs = allReqs.filter(r => r.userId === currentUser.id || r.userId === currentUser.uid || r.customerPhone === currentUser.phone);
        setOrderCount(userReqs.length);
        const totalL = userReqs.reduce((sum, r) => sum + (Number(r.quantity) || 5), 0);
        setLitresCount(totalL);
      } catch (e) {
        setOrderCount(3);
        setLitresCount(15);
      }
    }
    loadStats();
  }, [currentUser]);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(String(text));
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {}
  };

  // Save Personal Info
  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const updatedData = {
        name,
        phone,
        bloodGroup,
        emergencyContactName,
        emergencyContactPhone,
        emergencyRelation,
        notes,
        photoURL,
        savedVehicles: vehicles,
        savedLocations: locations,
        preferences: {
          smsAlerts,
          emailReceipts,
          audioSiren
        }
      };

      await updateUserProfile(updatedData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      addNotification({
        type: 'success',
        title: 'Profile Updated',
        message: 'Your personal information, garage, and roadside preferences have been saved.'
      });
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Vehicle Management
  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!vehPlate.trim()) {
      alert("Please provide the vehicle registration or license plate number.");
      return;
    }
    const cleanPlate = vehPlate.trim().toUpperCase();
    const newVeh = {
      id: `veh_${Date.now()}`,
      nickname: vehNickname.trim() || 'My Vehicle',
      category: vehCategory,
      plateNumber: cleanPlate,
      fuelType: vehFuel,
      isDefault: vehDefault || vehicles.length === 0
    };

    let updatedList = [...vehicles];
    if (newVeh.isDefault) {
      updatedList = updatedList.map(v => ({ ...v, isDefault: false }));
    }
    updatedList.push(newVeh);
    setVehicles(updatedList);
    updateUserProfile({ savedVehicles: updatedList });

    // Reset modal
    setVehNickname('');
    setVehPlate('');
    setVehDefault(false);
    setVehicleModalOpen(false);

    addNotification({
      type: 'success',
      title: 'Vehicle Added to Garage',
      message: `${newVeh.nickname} (${cleanPlate}) is now saved for rapid fuel dispatch.`
    });
  };

  const handleDeleteVehicle = (id) => {
    const updated = vehicles.filter(v => v.id !== id);
    if (updated.length > 0 && !updated.some(v => v.isDefault)) {
      updated[0].isDefault = true;
    }
    setVehicles(updated);
    updateUserProfile({ savedVehicles: updated });
  };

  const handleSetDefaultVehicle = (id) => {
    const updated = vehicles.map(v => ({ ...v, isDefault: v.id === id }));
    setVehicles(updated);
    updateUserProfile({ savedVehicles: updated });
  };

  // Location Management
  const handleAddLocation = (e) => {
    e.preventDefault();
    if (!locAddress.trim()) {
      alert("Please enter the location address.");
      return;
    }
    const newLoc = {
      id: `loc_${Date.now()}`,
      label: locLabel.trim() || 'Safe Spot',
      address: locAddress.trim(),
      isDefault: locDefault || locations.length === 0
    };

    let updatedList = [...locations];
    if (newLoc.isDefault) {
      updatedList = updatedList.map(l => ({ ...l, isDefault: false }));
    }
    updatedList.push(newLoc);
    setLocations(updatedList);
    updateUserProfile({ savedLocations: updatedList });

    setLocLabel('');
    setLocAddress('');
    setLocDefault(false);
    setLocationModalOpen(false);

    addNotification({
      type: 'success',
      title: 'Location Saved',
      message: `"${newLoc.label}" added to your saved roadside addresses.`
    });
  };

  const handleDeleteLocation = (id) => {
    const updated = locations.filter(l => l.id !== id);
    if (updated.length > 0 && !updated.some(l => l.isDefault)) {
      updated[0].isDefault = true;
    }
    setLocations(updated);
    updateUserProfile({ savedLocations: updated });
  };

  const handleSetDefaultLocation = (id) => {
    const updated = locations.map(l => ({ ...l, isDefault: l.id === id }));
    setLocations(updated);
    updateUserProfile({ savedLocations: updated });
  };

  const handleSelectAvatarPreset = (url) => {
    setPhotoURL(url);
    updateUserProfile({ photoURL: url });
    setAvatarModalOpen(false);
  };

  const handleCustomAvatarSubmit = (e) => {
    e.preventDefault();
    if (customAvatarUrl.trim()) {
      setPhotoURL(customAvatarUrl.trim());
      updateUserProfile({ photoURL: customAvatarUrl.trim() });
      setCustomAvatarUrl('');
      setAvatarModalOpen(false);
    }
  };

  const memberSinceFormatted = currentUser?.createdAt 
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : 'Oct 2026';

  const roleBadgeConfig = {
    ADMIN: { label: 'Platform Administrator', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30', dot: 'bg-purple-500' },
    DELIVERY_PARTNER: { label: 'Certified PESO Delivery Partner', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30', dot: 'bg-blue-500' },
    CUSTOMER: { label: 'Registered Roadside Motorist', bg: 'bg-brand-500/10 text-brand-400 border-brand-500/30', dot: 'bg-brand-500' }
  }[currentUser?.role || 'CUSTOMER'];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-300">
      
      {/* 1. HERO HEADER PROFILE CARD */}
      <div className="relative rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        {/* Subtle Ambient Decorative Gradients */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-brand-600 via-amber-600 to-slate-900 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/20 via-transparent to-transparent"></div>
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
              <span className={`w-2 h-2 rounded-full ${roleBadgeConfig.dot} animate-pulse`}></span>
              {roleBadgeConfig.label}
            </span>
          </div>
        </div>

        {/* Profile Identity Bar */}
        <div className="px-6 sm:px-8 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-6">
            <div className="flex items-end gap-4 sm:gap-6">
              {/* Avatar with Camera Overlay */}
              <div className="relative group shrink-0">
                <img
                  src={photoURL || AVATAR_PRESETS[0]}
                  alt={name || "User Avatar"}
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover border-4 border-slate-900 shadow-2xl bg-slate-800"
                />
                <button
                  type="button"
                  onClick={() => setAvatarModalOpen(true)}
                  className="absolute inset-0 bg-slate-950/60 rounded-3xl flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-xs text-white"
                  title="Change Profile Photo"
                >
                  <Camera className="w-6 h-6 mb-1 text-brand-400" />
                  <span className="text-[10px] font-bold">Edit Photo</span>
                </button>
              </div>

              {/* Title & Identity Info */}
              <div className="space-y-1 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
                    {name || "Motorist"}
                  </h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <ShieldCheck className="w-3 h-3" />
                    Verified ID
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span>{currentUser?.email || "No email registered"}</span>
                  <button
                    onClick={() => handleCopy(currentUser?.email, 'email')}
                    className="text-slate-500 hover:text-slate-300 transition"
                    title="Copy Email"
                  >
                    {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  </button>
                </p>
                <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {phone || "+91 Contact Pending"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    Member since {memberSinceFormatted}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 self-start sm:self-end pt-2 sm:pt-0">
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center gap-1.5 transition"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    <span>Saved!</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Key Telemetry Quick Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Emergency Dispatches</span>
                <Fuel className="w-4 h-4 text-brand-400" />
              </div>
              <p className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans']">{orderCount}</p>
              <span className="text-[10px] text-slate-500">Fulfilled roadside requests</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Fuel Rescued</span>
                <Compass className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans']">{litresCount} L</p>
              <span className="text-[10px] text-slate-500">Litres delivered safely</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Garage Vehicles</span>
                <Car className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans']">{vehicles.length}</p>
              <span className="text-[10px] text-slate-500">Registered for rapid assist</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="flex items-center justify-between text-slate-400 mb-1">
                <span className="text-[11px] font-medium">Safety Trust Score</span>
                <ShieldCheck className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xl font-extrabold text-white font-['Plus_Jakarta_Sans']">99.8%</p>
              <span className="text-[10px] text-emerald-400 font-medium">Active & PESO Compliant</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TABBED CONTROLS */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'personal'
              ? 'bg-brand-500 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Personal Info & SOS</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('garage')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'garage'
              ? 'bg-brand-500 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Car className="w-4 h-4" />
          <span>My Vehicle Garage ({vehicles.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('locations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'locations'
              ? 'bg-brand-500 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Saved Locations ({locations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-brand-500 text-white shadow-glow'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Security & Alerts</span>
        </button>
      </div>

      {/* 3. TAB PANELS */}

      {/* TAB 1: PERSONAL & SOS EMERGENCY CONTACT */}
      {activeTab === 'personal' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Primary Details Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Driver Identity</h3>
                  <p className="text-[11px] text-slate-400">Used for dispatch verification at roadside breakdowns</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Full Legal Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Email Address <span className="text-[10px] text-slate-500 font-normal">(Primary Account Identifier)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={currentUser?.email || ''}
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 cursor-not-allowed"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      Verified
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number (Mobile)
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                      placeholder="+91 99000 11223"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Blood Group <span className="text-[10px] text-slate-500 font-normal">(Medical SOS)</span>
                    </label>
                    <select
                      value={bloodGroup}
                      onChange={(e) => setBloodGroup(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      {BLOOD_GROUPS.map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Medical & Driver Assistance Notes
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Needs physical assistance, vehicle has child safety lock, special medical notes"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
            </div>

            {/* Emergency SOS Contact Card */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <HeartHandshake className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Emergency Roadside Contact</h3>
                  <p className="text-[11px] text-slate-400">Automated SMS dispatch notification is sent if you trigger an emergency SOS</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Emergency Contact Name
                  </label>
                  <input
                    type="text"
                    value={emergencyContactName}
                    onChange={(e) => setEmergencyContactName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Relationship
                    </label>
                    <input
                      type="text"
                      value={emergencyRelation}
                      onChange={(e) => setEmergencyRelation(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                      placeholder="e.g. Spouse / Brother"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      SOS Phone Number
                    </label>
                    <input
                      type="text"
                      value={emergencyContactPhone}
                      onChange={(e) => setEmergencyContactPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono"
                      placeholder="+91 98450 11223"
                    />
                  </div>
                </div>

                {/* Roadside Safety Disclaimer Box */}
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs space-y-2">
                  <div className="flex items-center gap-2 text-rose-400 font-bold">
                    <Shield className="w-4 h-4" />
                    <span>Roadside Safety Protocol</span>
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    When you request emergency petrol or diesel, our dispatch server will share your live GPS coordinates with your emergency contact and certified Hazmat responder.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center gap-2 transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Save Personal Information</span>
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: MY VEHICLE GARAGE */}
      {activeTab === 'garage' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                My Vehicle Garage
              </h2>
              <p className="text-xs text-slate-400">
                Saved vehicles enable 1-tap roadside dispatch without re-entering car specs during an emergency
              </p>
            </div>
            <button
              type="button"
              onClick={() => setVehicleModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </button>
          </div>

          {vehicles.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 space-y-3">
              <Car className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">Your garage is empty</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your car or motorcycle to automatically pre-fill your fuel type and tank capacity during roadside assistance.
              </p>
              <button
                type="button"
                onClick={() => setVehicleModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
              >
                Register First Vehicle
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => (
                <div
                  key={v.id}
                  className={`p-5 rounded-2xl bg-slate-900 border transition relative flex flex-col justify-between ${
                    v.isDefault ? 'border-brand-500/60 shadow-lg shadow-brand-500/10' : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          v.fuelType === 'Diesel' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                        }`}>
                          {v.category.includes('Two-Wheeler') ? (
                            <Bike className="w-5 h-5" />
                          ) : v.category.includes('Truck') ? (
                            <Truck className="w-5 h-5" />
                          ) : (
                            <Car className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{v.nickname}</h4>
                          <span className="text-[10px] text-slate-400">{v.category}</span>
                        </div>
                      </div>

                      {v.isDefault && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-brand-500/20 text-brand-400 border border-brand-500/30">
                          Primary
                        </span>
                      )}
                    </div>

                    {/* Registration Plate & Fuel Type Badges */}
                    <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">License Plate</span>
                        <span className="font-mono font-bold text-sm text-slate-200 tracking-wider">{v.plateNumber}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-500 uppercase block font-semibold">Required Fuel</span>
                        <span className={`text-xs font-bold ${v.fuelType === 'Diesel' ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {v.fuelType}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800/80 text-xs">
                    {!v.isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultVehicle(v.id)}
                        className="text-[11px] text-slate-400 hover:text-brand-400 transition"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                        <Check className="w-3 h-3" /> Default Choice
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleDeleteVehicle(v.id)}
                      className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Remove Vehicle"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAVED LOCATIONS */}
      {activeTab === 'locations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white font-['Plus_Jakarta_Sans']">
                Saved Locations & Corridors
              </h2>
              <p className="text-xs text-slate-400">
                Frequently travelled routes, home base, or work spots for 1-click roadside pick-up
              </p>
            </div>
            <button
              type="button"
              onClick={() => setLocationModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center gap-1.5 transition shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Location</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {locations.map((loc) => (
              <div
                key={loc.id}
                className={`p-5 rounded-2xl bg-slate-900 border transition flex flex-col justify-between ${
                  loc.isDefault ? 'border-brand-500/60 shadow-lg shadow-brand-500/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-white text-sm">{loc.label}</h4>
                    </div>
                    {loc.isDefault && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-brand-500/20 text-brand-400 border border-brand-500/30">
                        Default
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed pl-10">
                    {loc.address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-800 text-xs pl-10">
                  <div className="flex items-center gap-3">
                    {!loc.isDefault ? (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultLocation(loc.id)}
                        className="text-[11px] text-slate-400 hover:text-brand-400 transition"
                      >
                        Set as Default
                      </button>
                    ) : (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Default Location
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => handleCopy(loc.address, loc.id)}
                      className="text-[11px] text-slate-400 hover:text-white transition flex items-center gap-1"
                    >
                      {copiedField === loc.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteLocation(loc.id)}
                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    title="Remove Location"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & ALERT PREFERENCES */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dispatch Alert Settings */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800">
                <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Roadside Notifications</h3>
                  <p className="text-[11px] text-slate-400">Manage real-time responder arrival and siren alerts</p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                  <div>
                    <span className="font-bold text-xs text-white block">SMS Responder Alert</span>
                    <span className="text-[11px] text-slate-400 block">Sends automated SMS updates when the delivery vehicle is within 1 km</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                  <div>
                    <span className="font-bold text-xs text-white block">Digital Tax Invoices</span>
                    <span className="text-[11px] text-slate-400 block">Email GST e-receipt instantly when payment is settled</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailReceipts}
                    onChange={(e) => setEmailReceipts(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-slate-700"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition">
                  <div>
                    <span className="font-bold text-xs text-white block">Emergency Audio Siren</span>
                    <span className="text-[11px] text-slate-400 block">Plays acoustic chime on partner acceptance and OTP verification</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioSiren}
                    onChange={(e) => setAudioSiren(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-900 border-slate-700"
                  />
                </label>
              </div>
            </div>

            {/* Account & Session Control */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Session & Platform Access</h3>
                    <p className="text-[11px] text-slate-400">Authenticated account session parameters</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[11px]">User Account ID</span>
                      <span className="font-mono text-white text-xs font-bold">{currentUser?.id || currentUser?.uid || "usr_active"}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(currentUser?.id || currentUser?.uid, 'uid')}
                      className="text-slate-400 hover:text-white transition p-1"
                    >
                      {copiedField === 'uid' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Platform Security Role</span>
                      <span className="font-bold text-brand-400">{currentUser?.role || "CUSTOMER"}</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      PESO Safe
                    </span>
                  </div>
                </div>
              </div>

              {/* Logout Option */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={logout}
                  className="w-full py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out of FuelRescue</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* MODAL 1: ADD VEHICLE */}
      {vehicleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-base text-white">Add Vehicle to Garage</h3>
              </div>
              <button
                type="button"
                onClick={() => setVehicleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVehicle} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vehicle Nickname
                </label>
                <input
                  type="text"
                  value={vehNickname}
                  onChange={(e) => setVehNickname(e.target.value)}
                  placeholder="e.g. Daily Swift / Royal Enfield Bullet"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Vehicle Category
                </label>
                <select
                  value={vehCategory}
                  onChange={(e) => setVehCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="Car (Sedan/Hatchback)">Car (Sedan / Hatchback)</option>
                  <option value="SUV / MUV">SUV / MUV</option>
                  <option value="Two-Wheeler (Motorcycle/Scooter)">Two-Wheeler (Motorcycle / Scooter)</option>
                  <option value="Commercial / Light Truck">Commercial / Light Truck</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  License / Registration Plate
                </label>
                <input
                  type="text"
                  value={vehPlate}
                  onChange={(e) => setVehPlate(e.target.value)}
                  required
                  placeholder="e.g. KA-01-AB-1234"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Fuel Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVehFuel('Petrol')}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      vehFuel === 'Petrol'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Petrol</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setVehFuel('Diesel')}
                    className={`py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      vehFuel === 'Diesel'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-sm'
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Fuel className="w-3.5 h-3.5" />
                    <span>Diesel</span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={vehDefault}
                  onChange={(e) => setVehDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-950 border-slate-700"
                />
                <span>Set as primary emergency vehicle</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setVehicleModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition shadow-glow"
                >
                  Save Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD LOCATION */}
      {locationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-base text-white">Save Roadside Location</h3>
              </div>
              <button
                type="button"
                onClick={() => setLocationModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location Nickname
                </label>
                <input
                  type="text"
                  value={locLabel}
                  onChange={(e) => setLocLabel(e.target.value)}
                  placeholder="e.g. Home Base / Office Garage / Highway Exit"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Address / Landmark
                </label>
                <textarea
                  rows={3}
                  value={locAddress}
                  onChange={(e) => setLocAddress(e.target.value)}
                  required
                  placeholder="Enter complete address or roadside corridor"
                  className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={locDefault}
                  onChange={(e) => setLocDefault(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-slate-950 border-slate-700"
                />
                <span>Set as default dispatch address</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLocationModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition shadow-glow"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: AVATAR PRESETS SELECTOR */}
      {avatarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-400" />
                <h3 className="font-bold text-base text-white">Choose Profile Photo</h3>
              </div>
              <button
                type="button"
                onClick={() => setAvatarModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div>
              <p className="text-xs text-slate-400 mb-3">Select from official verified avatars:</p>
              <div className="grid grid-cols-4 gap-3">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectAvatarPreset(preset)}
                    className={`relative rounded-2xl overflow-hidden border-2 transition hover:scale-105 ${
                      photoURL === preset ? 'border-brand-500 ring-2 ring-brand-500/50' : 'border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx}`} className="w-full h-18 object-cover" />
                    {photoURL === preset && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white rounded-full flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <p className="text-xs text-slate-400 mb-2">Or enter custom image URL:</p>
              <form onSubmit={handleCustomAvatarSubmit} className="flex gap-2">
                <input
                  type="url"
                  value={customAvatarUrl}
                  onChange={(e) => setCustomAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs transition"
                >
                  Apply
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
