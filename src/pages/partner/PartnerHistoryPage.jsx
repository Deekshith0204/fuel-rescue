import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Clock, 
  MapPin, 
  Star, 
  IndianRupee, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestService, reviewService } from '../../firebase/services';

export default function PartnerHistoryPage() {
  const { currentUser } = useAuth();
  const [completedRequests, setCompletedRequests] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      try {
        const allReqs = await requestService.getAll();
        const done = allReqs.filter(r => r.status === 'COMPLETED');
        setCompletedRequests(done);

        const revs = await reviewService.getAll();
        setReviews(revs);
      } catch (e) {
        console.warn("Failed to load partner history", e);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [currentUser]);

  const totalPayout = completedRequests.reduce((sum, r) => sum + (r.totalAmount || 500) * 0.8, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Deliveries & Earnings Hub
          </h1>
          <p className="text-xs text-slate-400">
            Log of fulfilled emergency dispatches, service fees, and customer ratings
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-4">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Total Net Partner Payout</span>
            <p className="text-xl font-extrabold text-brand-400">₹{totalPayout.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Completed Deliveries */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Completed Dispatches ({completedRequests.length})
          </h3>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading history...</div>
          ) : completedRequests.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No completed emergency dispatches found yet.
            </div>
          ) : (
            completedRequests.map((req) => (
              <div 
                key={req.id}
                className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {req.quantity}L {req.fuelType} Delivered
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                      Completed
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate max-w-sm">{req.address}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Customer: {req.customerName || "Motorist"} • Ref: #{req.id.slice(-6)}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="block text-sm font-extrabold text-white">
                    ₹{((req.totalAmount || 500) * 0.8).toFixed(2)}
                  </span>
                  <span className="text-[10px] text-emerald-400">Disbursed</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right 1 Col: Customer Ratings & Feedback */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Motorist Reviews & Safety Feedback
          </h3>

          {reviews.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
              No reviews received yet.
            </div>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-white">{rev.userName}</span>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{rev.rating}.0</span>
                  </div>
                </div>
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{rev.comment}"
                </p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(rev.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
