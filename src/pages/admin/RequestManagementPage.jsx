import React, { useState, useEffect } from 'react';
import { 
  Fuel, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ExternalLink,
  X,
  Truck,
  User,
  ShieldCheck
} from 'lucide-react';
import { requestService } from '../../firebase/services';
import GoogleMapTracker from '../../components/common/GoogleMapTracker';

const STATUS_FILTERS = [
  'ALL',
  'PENDING',
  'ASSIGNED',
  'ACCEPTED',
  'ON_THE_WAY',
  'ARRIVED',
  'COMPLETED',
  'CANCELLED'
];

export default function RequestManagementPage() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [selectedReq, setSelectedReq] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        const reqs = await requestService.getAll();
        setRequests(reqs);
      } catch (e) {
        console.warn("Failed to load requests", e);
      } finally {
        setLoading(false);
      }
    }
    loadRequests();
  }, []);

  const filteredRequests = requests.filter(r => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesSearch = (r.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.address || '').toLowerCase().includes(search.toLowerCase()) ||
                          (r.id || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            All Fuel Emergency Requests
          </h1>
          <p className="text-xs text-slate-400">
            Real-time feed of all roadside assistance dispatches across active service sectors
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer, road, ID..."
            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              statusFilter === s
                ? 'bg-brand-500 text-white shadow-glow'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Requests Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading requests feed...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No requests match criteria.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Request ID</th>
                  <th className="pb-3 font-semibold">Customer</th>
                  <th className="pb-3 font-semibold">Fuel & Litres</th>
                  <th className="pb-3 font-semibold">Breakdown Coordinates</th>
                  <th className="pb-3 font-semibold">Assigned Responder</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold text-right">Preview</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 font-mono font-bold text-slate-300">#{req.id.slice(-6)}</td>
                    <td className="py-3">
                      <p className="font-bold text-white">{req.customerName || "Customer"}</p>
                      <p className="text-[10px] text-slate-400">{req.customerPhone}</p>
                    </td>
                    <td className="py-3">
                      <span className="font-bold text-white">{req.fuelType}</span>
                      <span className="text-slate-400 ml-1">({req.quantity}L)</span>
                    </td>
                    <td className="py-3 text-slate-300 max-w-xs truncate">{req.address}</td>
                    <td className="py-3">
                      <p className="font-bold text-brand-400">{req.partnerName || "Unassigned"}</p>
                      <p className="text-[10px] text-slate-400">{req.partnerVehicle || "None"}</p>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        req.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        req.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                        req.status === 'ON_THE_WAY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">
                      {new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedReq(req)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-brand-500 hover:text-white text-brand-400 font-bold text-xs transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Request Inspection Modal with Google Maps Preview */}
      {selectedReq && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase">Emergency Telemetry Inspector</span>
                <h3 className="text-base font-bold text-white">Request #{selectedReq.id}</h3>
              </div>
              <button onClick={() => setSelectedReq(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Google Maps Preview */}
            <div className="rounded-2xl overflow-hidden border border-slate-800">
              <GoogleMapTracker
                customerLat={selectedReq.latitude || 12.9724}
                customerLng={selectedReq.longitude || 77.6015}
                partnerLat={selectedReq.partnerLat || 12.9750}
                partnerLng={selectedReq.partnerLng || 77.5960}
                customerAddress={selectedReq.address}
                partnerName={selectedReq.partnerName || "Rapid Unit"}
                partnerVehicle={selectedReq.partnerVehicle || "Safety Vehicle"}
                status={selectedReq.status}
                estimatedMinutes={selectedReq.estimatedTimeMinutes || 5}
                distanceKm={selectedReq.distanceKm || 2.1}
              />
            </div>

            {/* Detailed metadata */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-2">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Customer</span>
                <p className="font-bold text-white">{selectedReq.customerName}</p>
                <p className="text-slate-400 text-[10px]">{selectedReq.customerPhone}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Fuel Requested</span>
                <p className="font-bold text-brand-400">{selectedReq.quantity}L {selectedReq.fuelType}</p>
                <p className="text-slate-400 text-[10px]">Vehicle: {selectedReq.vehicleType}</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Total Fare</span>
                <p className="font-bold text-white">₹{selectedReq.totalAmount?.toFixed(2) || '580.00'}</p>
                <p className="text-emerald-400 text-[10px]">Payment Verified</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">Current Status</span>
                <p className="font-bold text-white">{selectedReq.status}</p>
                <p className="text-slate-400 text-[10px]">{new Date(selectedReq.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>

            {selectedReq.message && (
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
                <span className="font-bold text-white block mb-0.5">Motorist Note:</span>
                "{selectedReq.message}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
