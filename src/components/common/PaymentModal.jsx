import React, { useState } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Banknote, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X,
  Lock
} from 'lucide-react';
import { paymentService } from '../../services/paymentService';

export default function PaymentModal({
  isOpen,
  onClose,
  requestId,
  userId,
  partnerId,
  amount = 680.00,
  onPaymentSuccess
}) {
  if (!isOpen) return null;

  const [paymentMethod, setPaymentMethod] = useState('UPI'); // UPI, CARD, CASH
  const [upiId, setUpiId] = useState('customer@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('789');
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setErrorMsg(null);

    try {
      const order = await paymentService.processPayment({
        requestId,
        userId,
        partnerId,
        amount,
        method: paymentMethod,
        paymentDetails: {
          upiId,
          cardNumber,
          forceFail: false
        }
      });

      setResult(order);
      if (onPaymentSuccess) {
        onPaymentSuccess(order);
      }
    } catch (err) {
      setErrorMsg("Payment processing failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
              Secure Payment Gateway
            </span>
            <h3 className="text-lg font-bold text-white">Emergency Roadside Payment</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success State */}
        {result ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-white">Payment Successful!</h4>
              <p className="text-xs text-slate-400 mt-1">Transaction Ref: {result.transactionId}</p>
              <div className="inline-block mt-3 px-4 py-1.5 rounded-full bg-slate-800 text-brand-400 font-bold text-base">
                ₹{amount.toFixed(2)} Paid
              </div>
            </div>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">
              Safe emergency dispensing receipt generated and logged in database.
            </p>
            <button
              onClick={onClose}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition shadow-glow"
            >
              Continue to Tracking & Rating
            </button>
          </div>
        ) : (
          <form onSubmit={handlePay} className="mt-4 space-y-5">
            {/* Amount Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Total Fuel & Delivery Fare</span>
                <p className="text-xs text-emerald-400 font-medium">Includes rapid dispatch & fuel</p>
              </div>
              <span className="text-2xl font-black text-white">₹{amount.toFixed(2)}</span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">Select Payment Method</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'UPI'
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Smartphone className="w-5 h-5" />
                  <span className="text-xs font-bold">UPI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'CARD'
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <CreditCard className="w-5 h-5" />
                  <span className="text-xs font-bold">Credit / Debit Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-3 rounded-xl border text-center transition flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'CASH'
                      ? 'bg-brand-500/20 border-brand-500 text-brand-400'
                      : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  <Banknote className="w-5 h-5" />
                  <span className="text-xs font-bold">Cash on Delivery</span>
                </button>
              </div>
            </div>

            {/* Method Inputs */}
            {paymentMethod === 'UPI' && (
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Virtual Payment Address (VPA)</label>
                <input
                  type="text"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  placeholder="name@upi"
                  required
                />
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                    placeholder="4532 •••• •••• 9012"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-slate-400">Expiry (MM/YY)</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      placeholder="MM/YY"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">CVV</label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-sm text-white focus:ring-2 focus:ring-brand-500 focus:outline-none"
                      placeholder="•••"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300">
                💵 <span className="font-semibold text-white">Cash on Delivery:</span> Pay the authorized delivery partner directly via cash or UPI scan when fuel dispensing is completed.
              </div>
            )}

            {/* Architecture Notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>256-bit SSL Encrypted Payment Transaction</span>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={processing}
              className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition shadow-glow flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Payment Securely...</span>
                </>
              ) : (
                <span>Confirm & Pay ₹{amount.toFixed(2)}</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
