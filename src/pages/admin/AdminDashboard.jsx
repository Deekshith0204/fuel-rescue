import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Truck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  IndianRupee, 
  Flame, 
  AlertTriangle,
  TrendingUp,
  MapPin,
  ShieldCheck,
  Fuel
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';
import { requestService, partnerService, adminService, orderService } from '../../firebase/services';
import BreakdownHeatmap from '../../components/admin/BreakdownHeatmap';

const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#a855f7'];

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activePartners: 0,
    todayRequests: 0,
    completedRequests: 0,
    pendingRequests: 0,
    cancelledRequests: 0,
    totalRevenue: 0
  });

  const [loading, setLoading] = useState(true);

  // Daily request trend data
  const requestsPerDayData = [
    { day: 'Mon', requests: 12, completed: 11 },
    { day: 'Tue', requests: 18, completed: 17 },
    { day: 'Wed', requests: 14, completed: 13 },
    { day: 'Thu', requests: 22, completed: 20 },
    { day: 'Fri', requests: 29, completed: 27 },
    { day: 'Sat', requests: 35, completed: 33 },
    { day: 'Sun', requests: 24, completed: 23 },
  ];

  // Fuel Type distribution
  const fuelTypeData = [
    { name: 'Petrol (Gasoline)', value: 68 },
    { name: 'Diesel', value: 32 }
  ];

  // Requests by area
  const areaData = [
    { area: 'Central Bengaluru', requests: 45 },
    { area: 'Koramangala & Indiranagar', requests: 38 },
    { area: 'Whitefield Corridor', requests: 29 },
    { area: 'Electronic City Express', requests: 24 },
  ];

  // Partner Performance
  const partnerPerfData = [
    { name: 'Rajesh K.', dispatches: 148, rating: 4.9 },
    { name: 'Vikram S.', dispatches: 215, rating: 4.8 },
    { name: 'Pooja P.', dispatches: 92, rating: 4.95 },
  ];

  useEffect(() => {
    async function loadStats() {
      try {
        const users = await adminService.getUsers();
        const partners = await partnerService.getAll();
        const reqs = await requestService.getAll();
        const orders = await orderService.getAll();

        const activeP = partners.filter(p => p.availability === 'ONLINE').length;
        const comp = reqs.filter(r => r.status === 'COMPLETED').length;
        const pend = reqs.filter(r => r.status === 'PENDING' || r.status === 'ASSIGNED').length;
        const canc = reqs.filter(r => r.status === 'CANCELLED').length;
        const rev = orders.reduce((sum, o) => sum + (o.amount || 0), 0);

        setStats({
          totalUsers: users.length,
          activePartners: activeP,
          todayRequests: reqs.length,
          completedRequests: comp,
          pendingRequests: pend,
          cancelledRequests: canc,
          totalRevenue: rev
        });
      } catch (e) {
        console.warn("Stats load failed", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider">
              Control Station & Telemetry
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Admin Management Console
          </h1>
          <p className="text-xs text-slate-400">
            Real-time fleet operations, dispatch telemetry, and platform financials
          </p>
        </div>
      </div>

      {/* 7 Core KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Total Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
          <span className="text-[10px] text-emerald-400">+12% this wk</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Active Partners</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-emerald-400">{stats.activePartners}</p>
          <span className="text-[10px] text-slate-400">Online & Ready</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Today's Calls</span>
            <Clock className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.todayRequests}</p>
          <span className="text-[10px] text-brand-400">Emergency Dispatches</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-black text-white">{stats.completedRequests}</p>
          <span className="text-[10px] text-emerald-400">Safely Dispensed</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Pending</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-amber-400">{stats.pendingRequests}</p>
          <span className="text-[10px] text-slate-400">In Routing</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Cancelled</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
          <p className="text-2xl font-black text-rose-400">{stats.cancelledRequests}</p>
          <span className="text-[10px] text-slate-400">2.1% cancel rate</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-brand-500/30 space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase">Platform Revenue</span>
            <IndianRupee className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-xl font-black text-brand-400">₹{stats.totalRevenue.toFixed(0)}</p>
          <span className="text-[10px] text-emerald-400">Direct Inflows</span>
        </div>
      </div>

      {/* Google Maps Incident Heatmap & Live Fleet Radar */}
      <BreakdownHeatmap />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Requests per Day */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-brand-400" />
              <span>Weekly Emergency Request Volume</span>
            </h3>
            <span className="text-[11px] text-slate-400">7-Day Rolling Trend</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestsPerDayData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="requests" fill="#f97316" radius={[6, 6, 0, 0]} name="Received" />
                <Bar dataKey="completed" fill="#10b981" radius={[6, 6, 0, 0]} name="Fulfilled" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Fuel Type Distribution */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Fuel className="w-4 h-4 text-amber-400" />
              <span>Fuel Demand Ratio (Petrol vs Diesel)</span>
            </h3>
            <span className="text-[11px] text-slate-400">PESO Standard</span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fuelTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                >
                  <Cell fill="#f97316" />
                  <Cell fill="#3b82f6" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend formatter={(val) => <span className="text-xs text-slate-300">{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Requests by Operational Area */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Emergency Incidents by Corridor</span>
            </h3>
            <span className="text-[11px] text-slate-400">High-Density Breakdown Zones</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaData} layout="vertical">
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="area" type="category" stroke="#64748b" fontSize={10} width={130} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="requests" fill="#3b82f6" radius={[0, 6, 6, 0]} name="Breakdowns" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Partner Performance & Ratings */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-400" />
              <span>Partner Fulfillment & Quality Score</span>
            </h3>
            <span className="text-[11px] text-slate-400">Audited Deliveries</span>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={partnerPerfData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                />
                <Bar dataKey="dispatches" fill="#a855f7" radius={[6, 6, 0, 0]} name="Completed Deliveries" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
