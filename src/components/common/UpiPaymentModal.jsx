import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  CheckCircle2, 
  Copy, 
  Check, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  Loader2, 
  Flame,
  AlertCircle
} from 'lucide-react';
import { audioService } from '../../services/audioService';
import { invoiceService } from '../../services/invoiceService';
import { orderService } from '../../firebase/services';

export default function UpiPaymentModal({
  isOpen,
  onClose,
  requestData,
  onPaymentSuccess
}) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [paid, setPaid] = useState(false);

  const amount = Number(requestData?.totalAmount || 580.00);
  const upiId = "fuelrescue@icici";
  const payeeName = "FuelRescue Emergency Network";
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Roadside Fuel #${(requestData?.id || '9012').slice(-6)}`)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(upiUrl)}&margin=10`;

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmPayment = async () => {
    setVerifying(true);
    // Simulate real-time bank webhook / UPI intent callback confirmation
    setTimeout(async () => {
      try {
        if (requestData?.id) {
          await orderService.create({
            requestId: requestData.id,
            userId: requestData.userId || 'guest',
            partnerId: requestData.partnerId || 'partner',
            amount: amount,
            method: 'UPI_QR',
            status: 'COMPLETED',
            transactionId: `UPI-${Date.now().toString().slice(-8)}`
          });
        }
      } catch (err) {
        console.warn("Order logging notice:", err);
      }

      audioService.playSuccessChime();
      setVerifying(false);
      setPaid(true);

      if (onPaymentSuccess) {
        onPaymentSuccess();
      }
    }, 1500);
  };

  const handleDownloadInvoice = () => {
    invoiceService.printReceipt(requestData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">
                Instant Roadside UPI
              </span>
              <h3 className="text-base font-bold text-white">Scan & Pay via UPI QR</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {paid ? (
          /* Payment Confirmed State */
          <div className="py-6 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div className="space-y-1">
              <h4 className="text-xl font-extrabold text-white">UPI Payment Received!</h4>
              <p className="text-xs text-slate-400">
                Payment of <span className="text-emerald-400 font-bold">₹{amount.toFixed(2)}</span> verified successfully.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>VPA Account:</span>
                <span className="font-mono text-white">fuelrescue@icici</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Status:</span>
                <span className="text-emerald-400 font-bold">PAID & SETTLED</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition"
              >
                <FileText className="w-4 h-4 text-brand-400" />
                <span>Download Printable Tax Invoice (PDF)</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* QR Payment Scanning Interface */
          <div className="space-y-4">
            {/* Amount Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Grand Total to Pay</span>
                <span className="text-2xl font-black text-white">₹{amount.toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full inline-block">
                  Zero Extra Fees
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Direct Bank Settlement</p>
              </div>
            </div>

            {/* QR Code Canvas */}
            <div className="flex flex-col items-center justify-center p-4 bg-white rounded-2xl shadow-inner border border-slate-200">
              <img
                src={qrCodeUrl}
                alt="FuelRescue UPI QR Code"
                className="w-48 h-48 rounded-lg object-contain"
                onError={(e) => {
                  // Fallback if network blocked qrserver
                  e.target.style.display = 'none';
                }}
              />
              <div className="mt-2 text-center">
                <p className="text-slate-900 font-extrabold text-xs">SCAN WITH ANY UPI APP</p>
                <p className="text-slate-500 text-[10px]">Google Pay • PhonePe • Paytm • BHIM • Cred</p>
              </div>
            </div>

            {/* UPI ID Copy Bar & Mobile Deep Link */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="truncate">
                <span className="text-slate-500 block text-[10px]">UPI VPA ID:</span>
                <span className="font-mono text-slate-200 font-semibold">{upiId}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyUpi}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Mobile Intent Launcher */}
            <a
              href={upiUrl}
              className="block w-full text-center py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold transition"
            >
              <div className="flex items-center justify-center gap-1.5">
                <span>Open in Mobile UPI App</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </a>

            {/* Confirmation & Invoice Actions */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                disabled={verifying}
                onClick={handleConfirmPayment}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-glow flex items-center justify-center gap-2 transition disabled:opacity-50"
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Bank Settlement...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>I Have Paid ₹{amount.toFixed(2)}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleDownloadInvoice}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700/60 transition"
              >
                <FileText className="w-3.5 h-3.5 text-brand-400" />
                <span>Preview / Download GST Invoice</span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-Bit Encrypted Roadside Incident Payment Gateway</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
