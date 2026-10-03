import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Fuel, Clock, MapPin, Receipt, CheckCircle2, ChevronRight, Filter, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { requestService, orderService } from '../../firebase/services';
import { invoiceService } from '../../services/invoiceService';

export default function OrderHistoryPage() {
  const { currentUser } = useAuth();
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    async function loadData() {
      if (!currentUser) return;
      try {
        const reqs = await requestService.getByUser(currentUser.id || currentUser.uid);
        setRequests(reqs);
      } catch (e) {
        console.warn("Failed to load history", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const handleDeleteOrder = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm("Are you sure you want to remove this fuel request record from your history?")) return;
    try {
      await requestService.delete(id);
      setRequests(prev => prev.filter(r => r.id !== id));
      if (selectedReceipt?.id === id) {
        setSelectedReceipt(null);
      }
    } catch (err) {
      alert("Failed to delete request: " + err.message);
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === 'ALL') return true;
    return r.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Emergency Order History
          </h1>
          <p className="text-xs text-slate-400">
            Past emergency roadside dispatches, fuel details, and payment receipts
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {['ALL', 'COMPLETED', 'ON_THE_WAY', 'CANCELLED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filter === f
                  ? 'bg-brand-500 text-white shadow-glow'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">
          Loading past orders...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 text-xs">
          No orders found matching the filter.
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map(req => (
            <div
              key={req.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Fuel className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">
                      {req.fuelType} ({req.quantity} Litres)
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      req.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      req.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                      'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate max-w-sm sm:max-w-md">{req.address}</span>
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Dispatched to: {req.partnerName || 'Rapid Assist Unit'} • Vehicle: {req.vehicleType || 'Car'}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-0 border-slate-800">
                <div className="sm:text-right">
                  <span className="block text-base font-extrabold text-white">
                    ₹{req.totalAmount?.toFixed(2) || '580.00'}
                  </span>
                  <span className="block text-[10px] text-emerald-400 font-medium">Payment Settled</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(req)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDeleteOrder(req.id, e)}
                    className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 hover:text-white text-rose-400 border border-rose-500/20 transition"
                    title="Delete Record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Invoice Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold text-brand-400 uppercase">FuelRescue Roadside E-Receipt</span>
                <h3 className="text-base font-bold text-white">Tax Invoice #{selectedReceipt.id.slice(-6)}</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Date & Time:</span>
                <span className="text-white">{new Date(selectedReceipt.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Service Category:</span>
                <span className="text-white">Emergency Fuel Top-Up ({selectedReceipt.fuelType})</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivered Litres:</span>
                <span className="text-white">{selectedReceipt.quantity} L</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Location:</span>
                <span className="text-white truncate max-w-[200px]">{selectedReceipt.address}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Certified Dispatcher:</span>
                <span className="text-white">{selectedReceipt.partnerName}</span>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-1">
                <div className="flex justify-between text-slate-400">
                  <span>Fuel Subtotal:</span>
                  <span>₹{selectedReceipt.subtotal?.toFixed(2) || '420.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Rapid Roadside Assist Fee:</span>
                  <span>₹{selectedReceipt.deliveryFee?.toFixed(2) || '150.00'}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Hazmat Emergency Surge:</span>
                  <span>₹{selectedReceipt.emergencySurge?.toFixed(2) || '50.00'}</span>
                </div>
                <div className="pt-1.5 border-t border-slate-800 flex justify-between font-bold text-sm text-brand-400">
                  <span>Grand Total Paid:</span>
                  <span>₹{selectedReceipt.totalAmount?.toFixed(2) || '620.00'}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => invoiceService.printReceipt(selectedReceipt)}
              className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>Print / Download Tax Invoice (PDF)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
