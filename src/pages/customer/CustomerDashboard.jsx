import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  Fuel, 
  Truck, 
  Navigation, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  PhoneCall,
  History,
  LifeBuoy,
  User,
  Car
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEmergencyRequest } from '../../context/EmergencyRequestContext';
import { requestService } from '../../firebase/services';
import StatusTimeline from '../../components/common/StatusTimeline';

export default function CustomerDashboard() {
  const { currentUser } = useAuth();
  const { activeRequest } = useEmergencyRequest();
  const [recentRequests, setRecentRequests] = useState([]);

  useEffect(() => {
    async function loadData() {
      if (currentUser?.uid) {
        try {
          const userRequests = await requestService.getUserRequests(currentUser.uid);
          setRecentRequests(userRequests.slice(0, 5));
        } catch (err) {
          console.error("Failed to load requests", err);
        }
      }
    }
    loadData();
  }, [currentUser, activeRequest]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 transition-colors">
      {/* Top Welcome & Emergency Action Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50/60 to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-orange-200/80 dark:border-slate-800 shadow-md dark:shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="space-y-2 z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Emergency Roadside Assist Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
            Hello, {currentUser?.name?.split(' ')[0] || 'Motorist'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed">
            Stranded with an empty tank? Our automated nearest-partner dispatch network is standing by 24/7.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="z-10 shrink-0 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/profile"
            className="px-5 py-4 rounded-2xl bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-700/90 border border-slate-300 dark:border-slate-700/80 hover:border-slate-400 text-slate-800 dark:text-slate-200 font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2.5"
          >
            <User className="w-5 h-5 text-brand-500 dark:text-brand-400" />
            <span>My Profile & Garage</span>
          </Link>
          <Link
            to="/customer/emergency"
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-black text-base shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-3 emergency-pulse"
          >
            <ShieldAlert className="w-6 h-6 text-white" />
            <span>REQUEST EMERGENCY FUEL</span>
          </Link>
        </div>
      </div>

      {/* Active Request Alert Banner (if there's an ongoing emergency request) */}
      {activeRequest && activeRequest.status !== 'COMPLETED' && activeRequest.status !== 'CANCELLED' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-brand-500/40 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-500 dark:text-brand-400 flex items-center justify-center">
                <Truck className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                  Active Emergency Request
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{activeRequest.fuelType} ({activeRequest.quantity} Litres)</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 font-mono font-bold">
                    #{activeRequest.id.slice(-6)}
                  </span>
                </h3>
              </div>
            </div>

            <Link
              to="/customer/tracking"
              className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center justify-center gap-2 transition"
            >
              <Navigation className="w-4 h-4" />
              <span>Open Live Radar Tracking</span>
            </Link>
          </div>

          {/* Real-time Status Timeline */}
          <StatusTimeline currentStatus={activeRequest.status} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Breakdown Spot</span>
              <p className="text-slate-900 dark:text-white font-medium truncate mt-0.5">{activeRequest.address}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Delivery Partner</span>
              <p className="text-slate-900 dark:text-white font-bold mt-0.5">
                {activeRequest.partnerName ? activeRequest.partnerName : 'Locating nearest carrier...'}
              </p>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80">
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Estimated Arrival</span>
              <p className="text-slate-900 dark:text-white font-bold mt-0.5">
                {activeRequest.estimatedTimeMinutes ? `~${activeRequest.estimatedTimeMinutes} mins` : 'Calculating route...'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 text-brand-500 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Fuel className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Emergency Fuel Top-Up</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">1L to 5L Petrol or Diesel dispatched with safety funnel kit.</p>
            <Link to="/customer/emergency" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline mt-3">
              <span>Order Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-500 dark:text-brand-400 flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">My Vehicle Garage</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Manage vehicles, fuel preferences, and emergency SOS contacts.</p>
            <Link to="/profile" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline mt-3">
              <span>Manage Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400 flex items-center justify-center shrink-0">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Order History & Receipts</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">View completed deliveries, invoices, and transaction logs.</p>
            <Link to="/customer/orders" className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline mt-3">
              <span>View Past Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <LifeBuoy className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">24/7 Roadside Help & SOS</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Hazard guidelines, highway police hotlines, and safety tips.</p>
            <Link to="/customer/help" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline mt-3">
              <span>Emergency Help</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Fuel Requests Table */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Recent Roadside Requests</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Log of emergency assistance dispatches for your account</p>
          </div>
          <Link to="/customer/orders" className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline">
            View All
          </Link>
        </div>

        {recentRequests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500 dark:text-slate-400">
            No recent emergency requests recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-600 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 font-semibold">
                  <th className="pb-3">Request ID</th>
                  <th className="pb-3">Fuel Details</th>
                  <th className="pb-3">Location</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Fare</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentRequests.map(req => (
                  <tr key={req.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                    <td className="py-3 font-mono text-slate-700 dark:text-slate-300 font-medium">#{req.id.slice(-6)}</td>
                    <td className="py-3">
                      <span className="font-bold text-slate-900 dark:text-white">{req.fuelType}</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-1">({req.quantity}L)</span>
                    </td>
                    <td className="py-3 text-slate-700 dark:text-slate-300 max-w-xs truncate">{req.address}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20' :
                        req.status === 'CANCELLED' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20' :
                        'bg-orange-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-orange-200 dark:border-brand-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">₹{req.totalAmount?.toFixed(2) || '580.00'}</td>
                    <td className="py-3 text-right">
                      <Link
                        to="/customer/tracking"
                        className="text-brand-600 dark:text-brand-400 hover:underline font-bold"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
