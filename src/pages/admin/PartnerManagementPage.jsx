import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  Star, 
  MapPin, 
  Check, 
  X,
  Phone,
  Mail,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { partnerService } from '../../firebase/services';

export default function PartnerManagementPage() {
  const [partners, setPartners] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form for new partner
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('Safety Van (PESO Certified Dispenser)');
  const [serviceArea, setServiceArea] = useState('Central Bengaluru Zone');

  useEffect(() => {
    async function load() {
      try {
        const p = await partnerService.getAll();
        setPartners(p);
      } catch (e) {
        console.warn("Failed to load partners", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleVerify = async (partnerId, status) => {
    await partnerService.updateVerification(partnerId, status);
    setPartners(prev => prev.map(p => p.id === partnerId ? { ...p, verificationStatus: status } : p));
  };

  const handleDeletePartner = async (partner) => {
    if (!window.confirm(`Are you sure you want to permanently delete partner unit "${partner.name}" (${partner.vehicleNumber})?`)) {
      return;
    }
    try {
      await partnerService.deletePartner(partner.id);
      setPartners(prev => prev.filter(p => p.id !== partner.id));
    } catch (err) {
      alert("Failed to delete partner: " + err.message);
    }
  };

  const handleAddPartner = async (e) => {
    e.preventDefault();
    const newP = await partnerService.addPartner({
      name,
      phone,
      email,
      vehicleNumber,
      vehicleType,
      serviceArea,
      latitude: 12.9716,
      longitude: 77.5946
    });
    setPartners(prev => [newP, ...prev]);
    setAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setVehicleNumber('');
  };

  const filteredPartners = partners.filter(p => 
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.vehicleNumber || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.serviceArea || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Emergency Delivery Fleet Management
          </h1>
          <p className="text-xs text-slate-400">
            Verify PESO compliance, audit vehicle fleets, and review partner roadside dispatches
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search partner, vehicle..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow flex items-center gap-1.5 transition shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Partner Unit</span>
          </button>
        </div>
      </div>

      {/* Fleet Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading fleet data...</div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No partner units found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">Partner Unit</th>
                  <th className="pb-3 font-semibold">Vehicle Specs</th>
                  <th className="pb-3 font-semibold">Service Corridor</th>
                  <th className="pb-3 font-semibold">Live GPS / Status</th>
                  <th className="pb-3 font-semibold">Rating / Deliveries</th>
                  <th className="pb-3 font-semibold">Compliance Status</th>
                  <th className="pb-3 font-semibold text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredPartners.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3">
                      <div>
                        <p className="font-bold text-white text-sm">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.phone}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="font-bold text-brand-400">{p.vehicleNumber}</p>
                      <p className="text-[10px] text-slate-400">{p.vehicleType}</p>
                    </td>
                    <td className="py-3 text-slate-300">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span>{p.serviceArea}</span>
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.availability === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        p.availability === 'BUSY' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {p.availability}
                      </span>
                      <span className="block text-[9px] text-slate-500 font-mono mt-0.5">
                        [{p.latitude?.toFixed(3)}°, {p.longitude?.toFixed(3)}°]
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{p.rating || 5.0}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">{p.totalDeliveries || 0} deliveries</span>
                    </td>
                    <td className="py-3">
                      {p.verificationStatus === 'VERIFIED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1 w-max">
                          <ShieldCheck className="w-3 h-3 text-emerald-400" />
                          VERIFIED
                        </span>
                      ) : p.verificationStatus === 'REJECTED' ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 w-max">
                          DECLINED
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse w-max">
                          VERIFICATION PENDING
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {p.verificationStatus !== 'VERIFIED' && (
                          <button
                            type="button"
                            onClick={() => handleVerify(p.id, 'VERIFIED')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-glow"
                            title="Approve partner profile so they can receive emergency orders"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Approve Partner</span>
                          </button>
                        )}
                        {p.verificationStatus !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => handleVerify(p.id, 'REJECTED')}
                            className="px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-600 text-white text-[11px] font-bold transition"
                            title="Decline partner verification"
                          >
                            Decline
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeletePartner(p)}
                          className="p-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                          title="Permanently Delete Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Partner Unit Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-brand-400" />
                <span>Onboard New Emergency Delivery Unit</span>
              </h3>
              <button onClick={() => setAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Responder / Driver Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Chandra"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300">Contact Mobile</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98450 11223"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="partner@fuelrescue.com"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="Safety Van (PESO Certified Dispenser)">Safety Van (PESO Dispenser)</option>
                    <option value="Rapid Assist Motorcycle (Hazmat Cans)">Motorcycle (Rapid Hazmat Cans)</option>
                    <option value="Quick-Response EV Van">Quick-Response EV Van</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300">Vehicle Number</label>
                  <input
                    type="text"
                    required
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="KA-04-MB-8899"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300">Assigned Geofenced Corridor</label>
                <input
                  type="text"
                  value={serviceArea}
                  onChange={(e) => setServiceArea(e.target.value)}
                  placeholder="e.g. Central Bengaluru Zone"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition mt-3"
              >
                Confirm & Enroll Partner
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
