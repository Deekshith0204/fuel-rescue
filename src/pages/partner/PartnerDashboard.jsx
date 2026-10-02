import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Power, 
  Clock, 
  IndianRupee, 
  Star, 
  ShieldCheck, 
  ShieldAlert,
  Navigation, 
  AlertCircle, 
  Check, 
  X, 
  ArrowRight,
  Flame,
  AlertTriangle,
  Lock,
  Sparkles,
  Volume2,
  VolumeX,
  BellRing,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmergencyRequest } from '../../context/EmergencyRequestContext';
import { useNotifications } from '../../context/NotificationContext';
import { partnerService, requestService } from '../../firebase/services';
import { dispatchService } from '../../services/dispatchService';
import { audioService } from '../../services/audioService';

export default function PartnerDashboard() {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const { activeRequest, updateStatus } = useEmergencyRequest();
  const navigate = useNavigate();

  const [partnerProfile, setPartnerProfile] = useState(null);
  const [availability, setAvailability] = useState('OFFLINE'); // ONLINE, OFFLINE, BUSY
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [sirenSoundEnabled, setSirenSoundEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const loadPartnerData = async () => {
    if (!currentUser) return;
    try {
      const partner = await partnerService.getByUserId(currentUser.id || currentUser.uid);
      if (partner) {
        setPartnerProfile(partner);
        // If not verified, force OFFLINE
        if (partner.verificationStatus !== 'VERIFIED') {
          setAvailability('OFFLINE');
        } else {
          setAvailability(partner.availability || 'ONLINE');
        }
      }

      // CRITICAL RULE: Only verified partners can receive or see incoming orders!
      const isVerified = partner?.verificationStatus === 'VERIFIED';
      if (isVerified) {
        const allReqs = await requestService.getAll();
        const pendingForPartner = allReqs.filter(r => 
          (r.status === 'PENDING' || r.status === 'ASSIGNED') &&
          (!r.partnerId || r.partnerId === (currentUser.id || currentUser.uid))
        );
        setIncomingRequests(pendingForPartner);
        if (pendingForPartner.length > 0 && sirenSoundEnabled) {
          audioService.playEmergencySiren();
        }
      } else {
        setIncomingRequests([]);
      }
    } catch (err) {
      console.warn("Error loading partner profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestSiren = () => {
    audioService.playEmergencySiren();
    addNotification({
      type: 'info',
      title: 'Testing Emergency Dispatch Siren',
      message: 'Synthesizing dual-tone responder audible alert via Web Audio API.'
    });
  };

  useEffect(() => {
    loadPartnerData();

    // Listen for real-time verification updates from admin action
    const handlePartnerVerified = (e) => {
      const { partnerId, verificationStatus } = e.detail || {};
      const myId = currentUser?.id || currentUser?.uid;
      if (partnerId === myId || partnerProfile?.id === partnerId) {
        setPartnerProfile(prev => prev ? ({ ...prev, verificationStatus }) : null);
        if (verificationStatus === 'VERIFIED') {
          addNotification({
            type: 'success',
            title: 'Profile Approved by Admin!',
            message: 'Your partner profile has been verified. You can now toggle Online and receive emergency orders.'
          });
          loadPartnerData();
        }
      }
    };

    window.addEventListener('fuelrescue_partner_verified', handlePartnerVerified);
    return () => {
      window.removeEventListener('fuelrescue_partner_verified', handlePartnerVerified);
    };
  }, [currentUser]);

  const isVerified = partnerProfile?.verificationStatus === 'VERIFIED';
  const isRejected = partnerProfile?.verificationStatus === 'REJECTED';
  const isPending = !isVerified && !isRejected;

  const toggleAvailability = async (newStatus) => {
    if (!isVerified) {
      alert("Verification Pending: Your partner profile is awaiting administrator approval. You cannot go online or accept emergency requests until approved.");
      return;
    }
    setAvailability(newStatus);
    if (partnerProfile) {
      await partnerService.updateAvailability(partnerProfile.id || currentUser.id, newStatus);
      addNotification({
        type: 'info',
        title: `Status: ${newStatus}`,
        message: `Your responder availability is now set to ${newStatus}.`
      });
    }
  };

  const handleAcceptRequest = async (req) => {
    if (!isVerified) {
      alert("You cannot accept orders until your partner profile is verified by an Administrator.");
      return;
    }
    await updateStatus('ACCEPTED', {
      partnerId: currentUser?.id || currentUser?.uid,
      partnerName: currentUser?.name || "Authorized Dispatcher",
      partnerPhone: currentUser?.phone || "+91 98111 22334"
    });
    addNotification({
      type: 'success',
      title: 'Emergency Request Accepted',
      message: `Navigating to ${req.address}...`
    });
    navigate('/partner/active');
  };

  const handleRejectRequest = async (req) => {
    addNotification({
      type: 'info',
      title: 'Request Declined',
      message: 'Re-routing emergency request to the next nearest unit in grid.'
    });
    await dispatchService.handlePartnerRejection(
      req.id, 
      currentUser?.id || currentUser?.uid, 
      req.latitude, 
      req.longitude
    );
    setIncomingRequests(prev => prev.filter(r => r.id !== req.id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Profile & Online Status Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-2xl shadow-glow">
            {currentUser?.name?.charAt(0) || 'P'}
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white font-['Plus_Jakarta_Sans']">
                {currentUser?.name || "Delivery Partner"}
              </h1>

              {/* Real Verification Status Badge */}
              {isVerified ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  VERIFIED RESPONDER
                </span>
              ) : isRejected ? (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
                  <X className="w-3.5 h-3.5 text-rose-400" />
                  VERIFICATION REJECTED
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-extrabold flex items-center gap-1.5 animate-pulse shadow-sm">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  VERIFICATION PENDING
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Vehicle: <span className="font-mono text-slate-200">{partnerProfile?.vehicleNumber || "KA-01-EQ-9021"}</span> • {partnerProfile?.vehicleType || "Rapid Assist Unit"}
            </p>
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-brand-400" />
              <span>Assigned Corridor: {partnerProfile?.serviceArea || "Central Bengaluru Zone"}</span>
            </p>
          </div>
        </div>

        {/* Availability Toggle Switch */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <button
              type="button"
              disabled={!isVerified}
              onClick={() => toggleAvailability('ONLINE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                availability === 'ONLINE' && isVerified
                  ? 'bg-emerald-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={!isVerified ? "Online locked until admin verification" : "Go Online to receive orders"}
            >
              <span className={`w-2 h-2 rounded-full ${isVerified && availability === 'ONLINE' ? 'bg-emerald-300 animate-ping' : 'bg-slate-600'}`}></span>
              <span>ONLINE</span>
            </button>

            <button
              type="button"
              disabled={!isVerified}
              onClick={() => toggleAvailability('BUSY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${
                availability === 'BUSY' && isVerified
                  ? 'bg-amber-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-300"></span>
              <span>BUSY</span>
            </button>

            <button
              type="button"
              onClick={() => toggleAvailability('OFFLINE')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                availability === 'OFFLINE' || !isVerified
                  ? 'bg-rose-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>OFFLINE</span>
            </button>
          </div>

          {!isVerified && (
            <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Online toggle locked (Pending Admin Approval)
            </span>
          )}
        </div>
      </div>

      {/* ============================================================== */}
      {/* VERIFICATION PENDING PROMINENT NOTICE BANNER                   */}
      {/* ============================================================== */}
      {isPending && (
        <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/10 border-2 border-amber-500/30 shadow-2xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-500/20">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Account Under Review
                </span>
                <h3 className="text-lg font-extrabold text-white">
                  Verification Pending Administrator Approval
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-500/40 text-xs font-bold w-max flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              Status: Verification Pending
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Your delivery partner profile and vehicle registration have been submitted. For safety and regulatory compliance (PESO certified fuel dispensing guidelines), new responder accounts must be verified and approved by the Platform Administrator before receiving roadside emergency fuel requests.
          </p>

          {/* Onboarding Checklist Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">1. Profile Registration</span>
              <span className="font-bold text-emerald-400 flex items-center gap-1 text-xs">
                <Check className="w-3.5 h-3.5" /> Completed
              </span>
              <span className="text-[10px] text-slate-500 block">Identity & vehicle details submitted</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
              <span className="text-amber-300 block text-[11px] font-semibold">2. Admin Verification</span>
              <span className="font-bold text-amber-400 flex items-center gap-1 text-xs animate-pulse">
                <Clock className="w-3.5 h-3.5" /> Pending Review
              </span>
              <span className="text-[10px] text-slate-400 block">Administrator review in progress</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-slate-400 block text-[11px]">3. Order Dispatch Access</span>
              <span className="font-bold text-slate-400 flex items-center gap-1 text-xs">
                <Lock className="w-3.5 h-3.5" /> Locked
              </span>
              <span className="text-[10px] text-slate-500 block">Activates automatically on approval</span>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Notice Banner */}
      {isRejected && (
        <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/30 shadow-xl space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
              <X className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Partner Verification Declined</h3>
              <p className="text-xs text-slate-300">
                Your delivery partner verification has been declined by the Administrator. Please contact support to re-verify your vehicle compliance documentation.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today's Deliveries</span>
          <p className="text-2xl font-black text-white mt-1">
            {partnerProfile?.todayDeliveries || 0} Dispatches
          </p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Active corridor unit</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Today's Earnings</span>
          <p className="text-2xl font-black text-brand-400 mt-1">
            ₹{(partnerProfile?.todayEarnings || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Direct payout</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Total Career Earnings</span>
          <p className="text-2xl font-black text-white mt-1">
            ₹{(partnerProfile?.totalEarnings || 0).toFixed(2)}
          </p>
          <span className="text-[11px] text-emerald-400 mt-1 block">Total settled</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Service Rating</span>
          <div className="flex items-center gap-1.5 mt-1">
            <p className="text-2xl font-black text-amber-400">{partnerProfile?.rating || 5.0}</p>
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {partnerProfile?.totalDeliveries || 0} Motorist Deliveries
          </span>
        </div>
      </div>

      {/* Active Delivery Notification (if on duty and verified) */}
      {isVerified && activeRequest && activeRequest.status !== 'COMPLETED' && activeRequest.status !== 'CANCELLED' && (
        <div className="p-6 rounded-3xl bg-brand-500/10 border border-brand-500/50 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-500 text-white flex items-center justify-center shrink-0 shadow-glow emergency-pulse">
              <Navigation className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                Emergency Dispatch In Progress
              </span>
              <h3 className="text-lg font-bold text-white">
                {activeRequest.customerName} needs {activeRequest.quantity}L {activeRequest.fuelType}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">{activeRequest.address}</p>
            </div>
          </div>

          <Link
            to="/partner/active"
            className="px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition shrink-0"
          >
            <span>Open Navigation & Update Status</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Available / Incoming Requests Radar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Incoming Roadside Emergency Dispatches</span>
              {isVerified && <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse"></span>}
            </h3>
            <p className="text-xs text-slate-400">
              {isVerified 
                ? "Nearest proximity calls matched through Haversine spherical algorithm"
                : "Verification required: Dispatches locked until partner profile approval"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isVerified && (
              <>
                <button
                  type="button"
                  onClick={handleTestSiren}
                  className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5 transition"
                  title="Test Emergency Siren Audio Synthesizer"
                >
                  <BellRing className="w-3.5 h-3.5 animate-bounce" />
                  <span>Test Siren</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSirenSoundEnabled(!sirenSoundEnabled)}
                  className={`p-1.5 rounded-xl border text-xs font-bold transition flex items-center justify-center ${
                    sirenSoundEnabled
                      ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 border-slate-700 text-slate-500'
                  }`}
                  title={sirenSoundEnabled ? "Siren Alert: Active" : "Siren Alert: Muted"}
                >
                  {sirenSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </>
            )}

            <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1 rounded-full">
              {incomingRequests.length} Available
            </span>
          </div>
        </div>

        {/* Emergency Dispatch Siren Banner (when orders are waiting) */}
        {isVerified && incomingRequests.length > 0 && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-brand-600/20 via-amber-500/20 to-brand-600/20 border border-brand-500/40 flex items-center justify-between gap-3 animate-pulse">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow-glow">
                <BellRing className="w-4 h-4 animate-spin" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-brand-400 uppercase tracking-wide block">
                  🚨 Audible Emergency Dispatch Alert
                </span>
                <p className="text-[11px] text-slate-300">
                  {incomingRequests.length} roadside breakdown call{incomingRequests.length > 1 ? 's' : ''} awaiting immediate responder response.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTestSiren}
              className="px-3 py-1 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-[11px] font-bold shrink-0 transition"
            >
              Replay Siren
            </button>
          </div>
        )}

        {/* Locked state if not verified */}
        {!isVerified ? (
          <div className="py-12 px-4 text-center space-y-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">
              Orders Locked: Verification Pending Administrator Approval
            </h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              You will not receive roadside emergency fuel delivery orders until your partner profile and vehicle registration are approved by an Administrator.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-semibold">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Awaiting Administrator Verification
              </span>
            </div>
          </div>
        ) : incomingRequests.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-400">No pending emergency calls in your vicinity right now.</p>
            <p className="text-[11px] text-slate-500">Ensure your status is set to ONLINE to receive incoming calls.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {incomingRequests.map((req) => (
              <div 
                key={req.id}
                className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-brand-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white text-sm">
                      {req.quantity}L {req.fuelType} Required
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 text-[10px] font-bold">
                      {req.vehicleType || "Car"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ~{req.distanceKm || 2.1} km away
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{req.address}</span>
                  </p>

                  {req.message && (
                    <p className="text-[11px] text-slate-400 italic">
                      Note from motorist: "{req.message}"
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 sm:pt-0">
                  <button
                    type="button"
                    onClick={() => handleRejectRequest(req)}
                    className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <X className="w-3.5 h-3.5 text-rose-400" />
                    <span>Decline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAcceptRequest(req)}
                    className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition emergency-pulse"
                  >
                    <Check className="w-4 h-4" />
                    <span>Accept Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
