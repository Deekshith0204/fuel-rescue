import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  PhoneCall, 
  CheckCircle2, 
  ExternalLink, 
  Clock, 
  Flame, 
  ShieldCheck, 
  Truck,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  KeyRound
} from 'lucide-react';
import { useEmergencyRequest } from '../../context/EmergencyRequestContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import StatusTimeline from '../../components/common/StatusTimeline';
import GoogleMapTracker from '../../components/common/GoogleMapTracker';
import OtpVerificationModal from '../../components/partner/OtpVerificationModal';
import RoadsideChatModal from '../../components/common/RoadsideChatModal';
import { audioService } from '../../services/audioService';

export default function ActiveDeliveryPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const { activeRequest, updateStatus } = useEmergencyRequest();
  const [updating, setUpdating] = useState(false);
  const [otpModalOpen, setOtpModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);

  if (!activeRequest || activeRequest.status === 'COMPLETED' || activeRequest.status === 'CANCELLED') {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <Truck className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Active Emergency Task</h2>
        <p className="text-xs text-slate-400">
          You currently do not have any accepted dispatches in progress.
        </p>
        <Link
          to="/partner"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition"
        >
          <span>Return to Partner Hub</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handleProgressStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await updateStatus(newStatus, {
        partnerId: currentUser?.id || currentUser?.uid,
        partnerName: currentUser?.name || "Authorized Responder"
      });
      addNotification({
        type: newStatus === 'COMPLETED' ? 'success' : 'info',
        title: `Status Updated: ${newStatus}`,
        message: `Emergency request status updated to ${newStatus}.`
      });
      if (newStatus === 'COMPLETED') {
        navigate('/partner/history');
      }
    } catch (e) {
      alert("Failed to update status: " + e.message);
    } finally {
      setUpdating(false);
    }
  };

  const openGoogleNavigation = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${activeRequest.latitude},${activeRequest.longitude}&travelmode=driving`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
              Emergency Dispense Mission In Progress
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{activeRequest.customerName}</span>
              <span className="text-xs text-slate-400 font-mono">#{activeRequest.id.slice(-6)}</span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setChatModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-400 text-xs font-bold border border-slate-700/60 flex items-center gap-1.5 transition"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Roadside Chat</span>
          </button>

          <button
            onClick={openGoogleNavigation}
            className="px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-glow flex items-center justify-center gap-2 transition"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Launch Google Maps GPS</span>
          </button>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <StatusTimeline currentStatus={activeRequest.status} />
      </div>

      {/* Main Grid: Google Maps + Dispatch Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <GoogleMapTracker
            customerLat={activeRequest.latitude || 12.9724}
            customerLng={activeRequest.longitude || 77.6015}
            partnerLat={activeRequest.partnerLat || 12.9750}
            partnerLng={activeRequest.partnerLng || 77.5960}
            customerAddress={activeRequest.address}
            partnerName={currentUser?.name || "Authorized Dispatcher"}
            partnerVehicle={currentUser?.vehicleNumber || "KA-01-EQ-9021"}
            status={activeRequest.status}
            estimatedMinutes={activeRequest.estimatedTimeMinutes || 6}
            distanceKm={activeRequest.distanceKm || 2.1}
          />
        </div>

        {/* Step-by-Step Delivery Actions */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Emergency Action Checklist
            </h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleProgressStatus('ON_THE_WAY')}
                disabled={updating || activeRequest.status === 'ON_THE_WAY' || activeRequest.status === 'ARRIVED'}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                  activeRequest.status === 'ON_THE_WAY'
                    ? 'bg-brand-500 text-white border-brand-400 shadow-glow'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Navigation className="w-4 h-4" />
                  <span>1. Mark "On The Way"</span>
                </div>
                {activeRequest.status === 'ON_THE_WAY' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              <button
                type="button"
                onClick={() => handleProgressStatus('ARRIVED')}
                disabled={updating || activeRequest.status === 'ARRIVED'}
                className={`w-full p-3.5 rounded-2xl border text-left text-xs font-bold transition flex items-center justify-between ${
                  activeRequest.status === 'ARRIVED'
                    ? 'bg-amber-500 text-white border-amber-400 shadow-glow'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>2. Mark "Arrived at Vehicle"</span>
                </div>
                {activeRequest.status === 'ARRIVED' && <CheckCircle2 className="w-4 h-4 text-white" />}
              </button>

              {/* Handover OTP Gated Complete Action */}
              <button
                type="button"
                onClick={() => setOtpModalOpen(true)}
                disabled={updating}
                className="w-full p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-glow flex items-center justify-center gap-2 transition"
              >
                <KeyRound className="w-4 h-4" />
                <span>3. Verify Handover OTP & Complete</span>
              </button>
            </div>

            {/* Motorist Information */}
            <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Motorist Contact</span>
              <p className="text-white font-bold">{activeRequest.customerName}</p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a
                  href={`tel:${activeRequest.customerPhone || "+919876543210"}`}
                  className="py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-brand-400" />
                  <span>Call Motorist</span>
                </a>

                <button
                  type="button"
                  onClick={() => setChatModalOpen(true)}
                  className="py-2 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-semibold text-[11px] flex items-center justify-center gap-1.5 border border-brand-500/30 transition"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Roadside Chat</span>
                </button>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-brand-400">Stranded Vehicle:</span> {activeRequest.vehicleType || "Car"}
                {activeRequest.message && (
                  <p className="mt-1 text-slate-300">"{activeRequest.message}"</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Safety Handover OTP Verification Modal */}
      <OtpVerificationModal
        isOpen={otpModalOpen}
        onClose={() => setOtpModalOpen(false)}
        expectedOtp={activeRequest.deliveryOtp || '4829'}
        customerName={activeRequest.customerName}
        onSuccess={() => {
          setOtpModalOpen(false);
          handleProgressStatus('COMPLETED');
        }}
      />

      {/* Roadside Chat Modal */}
      <RoadsideChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        requestId={activeRequest.id}
        currentUserRole="partner"
        partnerName={currentUser?.name || "Authorized Dispatcher"}
        customerName={activeRequest.customerName || "Motorist"}
      />
    </div>
  );
}
