import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  MapPin, 
  PhoneCall, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  CreditCard, 
  Star, 
  AlertCircle,
  ShieldCheck, 
  RefreshCw, 
  Flame, 
  ArrowRight,
  MessageSquare,
  KeyRound,
  Copy,
  Check,
  FileText,
  Smartphone
} from 'lucide-react';
import { useEmergencyRequest } from '../../context/EmergencyRequestContext';
import { useAuth } from '../../context/AuthContext';
import StatusTimeline from '../../components/common/StatusTimeline';
import GoogleMapTracker from '../../components/common/GoogleMapTracker';
import PaymentModal from '../../components/common/PaymentModal';
import RatingModal from '../../components/common/RatingModal';
import UpiPaymentModal from '../../components/common/UpiPaymentModal';
import RoadsideChatModal from '../../components/common/RoadsideChatModal';
import { invoiceService } from '../../services/invoiceService';

export default function RequestTrackingPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { activeRequest, updateStatus, cancelRequest, refreshActiveRequest } = useEmergencyRequest();

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [upiModalOpen, setUpiModalOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  if (!activeRequest) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto">
          <Navigation className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Active Emergency Request</h2>
        <p className="text-xs text-slate-400">
          You currently do not have any active roadside fuel dispatches in transit.
        </p>
        <Link
          to="/customer/emergency"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition"
        >
          <span>Request Emergency Fuel Now</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const deliveryOtp = String(activeRequest.deliveryOtp || '4829');

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(deliveryOtp);
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  const handleDownloadInvoice = () => {
    invoiceService.printReceipt(activeRequest);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
            <Flame className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                Emergency Dispatch Radar
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs font-mono text-slate-400">#{activeRequest.id.slice(-6)}</span>
            </div>
            <h2 className="text-lg font-bold text-white">
              {activeRequest.fuelType} ({activeRequest.quantity} Litres) Delivery
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeRequest.status !== 'COMPLETED' && activeRequest.status !== 'CANCELLED' && (
            <button
              onClick={cancelRequest}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" />
              <span>Cancel Request</span>
            </button>
          )}

          <button
            onClick={refreshActiveRequest}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Tracking"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Status Timeline Progress Bar */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <StatusTimeline currentStatus={activeRequest.status} />
      </div>

      {/* Main Grid: Google Maps Radar + Partner Card & OTP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Google Map Tracker */}
        <div className="lg:col-span-2 space-y-4">
          <GoogleMapTracker
            customerLat={activeRequest.latitude || 12.9724}
            customerLng={activeRequest.longitude || 77.6015}
            partnerLat={activeRequest.partnerLat || 12.9750}
            partnerLng={activeRequest.partnerLng || 77.5960}
            customerAddress={activeRequest.address}
            partnerName={activeRequest.partnerName || "Rapid Assist Unit #1"}
            partnerVehicle={activeRequest.partnerVehicle || "KA-01-EQ-9021 (Safety Van)"}
            status={activeRequest.status}
            estimatedMinutes={activeRequest.estimatedTimeMinutes || 8}
            distanceKm={activeRequest.distanceKm || 2.1}
          />
        </div>

        {/* Right 1 Col: Partner Card + Handover OTP + Actions */}
        <div className="space-y-4">
          
          {/* SAFETY HANDOVER OTP CARD */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider">
                  Safety Handover OTP
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/40">
                PESO Security
              </span>
            </div>

            <p className="text-[11px] text-slate-300">
              Provide this code to your FuelRescue partner upon physical arrival to authorize fuel dispensing:
            </p>

            {/* 4 Digit PIN Display */}
            <div className="flex items-center justify-between gap-2 p-3 bg-slate-950/90 rounded-2xl border border-slate-800">
              <div className="flex gap-2">
                {deliveryOtp.split('').map((char, i) => (
                  <span
                    key={i}
                    className="w-10 h-12 flex items-center justify-center rounded-xl bg-slate-900 border border-amber-500/50 text-amber-400 font-black text-xl shadow-glow"
                  >
                    {char}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyOtp}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
              >
                {copiedOtp ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedOtp ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Partner Identification & Action Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Assigned Roadside Partner
            </h3>

            {activeRequest.partnerName ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-amber-500 text-white font-extrabold flex items-center justify-center text-lg shadow-glow">
                    {activeRequest.partnerName.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <span>{activeRequest.partnerName}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </h4>
                    <p className="text-xs text-slate-400">{activeRequest.partnerVehicle}</p>
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold mt-0.5">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>4.9 (148 Deliveries)</span>
                    </div>
                  </div>
                </div>

                {/* Roadside Contact Bar: Call & Live Chat */}
                <div className="pt-1 grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${activeRequest.partnerPhone || "+919811122334"}`}
                    className="py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-brand-400 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-slate-700/60"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => setChatModalOpen(true)}
                    className="py-2.5 rounded-xl bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center gap-1.5 transition border border-brand-500/30"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Roadside Chat</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center space-y-2">
                <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-xs text-slate-300 font-medium">Scanning Proximity Radius...</p>
                <p className="text-[11px] text-slate-500">Contacting closest PESO-certified units</p>
              </div>
            )}

            {/* Fare Summary */}
            <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="font-extrabold text-white text-sm">
                  ₹{activeRequest.totalAmount?.toFixed(2) || '580.00'}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Breakdown Location:</span>
                <span className="text-slate-300 truncate max-w-[180px]">{activeRequest.address}</span>
              </div>
            </div>

            {/* Invoicing & Payment Quick Triggers */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <button
                type="button"
                onClick={() => setUpiModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition"
              >
                <Smartphone className="w-4 h-4" />
                <span>Pay via UPI / QR Code</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition border border-slate-700/60"
              >
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Download GST Tax Invoice (PDF)</span>
              </button>
            </div>

            {/* Completion Actions (Rating) */}
            {activeRequest.status === 'COMPLETED' && (
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <button
                  type="button"
                  onClick={() => setRatingModalOpen(true)}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>Rate Partner Experience</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPI QR Payment Modal */}
      <UpiPaymentModal
        isOpen={upiModalOpen}
        onClose={() => setUpiModalOpen(false)}
        requestData={activeRequest}
        onPaymentSuccess={() => {
          setUpiModalOpen(false);
          setRatingModalOpen(true);
        }}
      />

      {/* Fallback Gateway Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        requestId={activeRequest.id}
        userId={activeRequest.userId}
        partnerId={activeRequest.partnerId}
        amount={activeRequest.totalAmount || 580.00}
        onPaymentSuccess={() => {
          setPaymentModalOpen(false);
          setRatingModalOpen(true);
        }}
      />

      {/* Roadside Chat Modal */}
      <RoadsideChatModal
        isOpen={chatModalOpen}
        onClose={() => setChatModalOpen(false)}
        requestId={activeRequest.id}
        currentUserRole="customer"
        partnerName={activeRequest.partnerName || "Rapid Assist Unit"}
        customerName={currentUser?.name || "Alex Mercer"}
      />

      {/* Rating & Review Modal */}
      <RatingModal
        isOpen={ratingModalOpen}
        onClose={() => setRatingModalOpen(false)}
        requestId={activeRequest.id}
        userId={activeRequest.userId}
        userName={currentUser?.name || "Alex Mercer"}
        partnerId={activeRequest.partnerId}
        partnerName={activeRequest.partnerName || "Rajesh Kumar"}
      />
    </div>
  );
}
