import React from 'react';
import { Fuel, ShieldCheck, AlertCircle, PhoneCall, Award, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 pt-12 pb-8 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Academic Compliance & Statutory Notice Banner */}
        <div className="mb-10 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200/90 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-amber-800 dark:text-amber-300">Academic Prototype Notice & PESO Statutory Compliance: </span>
            FuelRescue is an academic prototype and simulation engineered for a B.Tech Computer Science & Engineering Final-Year Capstone Project. In compliance with Petroleum and Explosives Safety Organization (PESO) regulations and the Petroleum Act, all commercial fuel dispensing in actual production must be executed exclusively through legally licensed oil marketing companies (OMCs) and certified mobile refuelers.
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center text-white shadow-glow">
                <Fuel className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                Fuel<span className="text-brand-500">Rescue</span>
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Autonomous on-demand emergency roadside fuel delivery and rapid motor assistance platform powered by geolocation intelligence.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              ISO/PESO Ready Framework Design
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/customer/emergency" className="hover:text-brand-500 transition">Emergency Fuel Request</Link></li>
              <li><Link to="/customer/tracking" className="hover:text-brand-500 transition">Live Radar Tracking</Link></li>
              <li><Link to="/partner" className="hover:text-brand-500 transition">Delivery Partner Hub</Link></li>
              <li><Link to="/admin" className="hover:text-brand-500 transition">Control Center & Analytics</Link></li>
              <li><Link to="/customer/help" className="hover:text-brand-500 transition">Roadside Help & SOS</Link></li>
            </ul>
          </div>

          {/* Col 3: Service Zones */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Service Corridors</h4>
            <ul className="space-y-2 text-xs">
              <li>Central Bengaluru & Outer Ring Rd</li>
              <li>Whitefield Tech Park Sector</li>
              <li>Electronic City Expressway Hub</li>
              <li>Mumbai Western Express Highway (Sim)</li>
              <li>Delhi-NCR Rapid Emergency Transit (Sim)</li>
            </ul>
          </div>

          {/* Col 4: SOS Helpline */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Emergency Contact</h4>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">24/7 Roadside Control Toll-Free</p>
              <p className="text-base font-bold text-brand-600 dark:text-brand-400 flex items-center gap-1.5 mt-1">
                <PhoneCall className="w-4 h-4" /> 1800-FUEL-SOS
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Academic Prototype Simulation Line</p>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} FuelRescue Platform. Final Year B.Tech CSE Project.</p>
          <div className="flex items-center gap-4 text-xs">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Service</span>
            <span>•</span>
            <span>Safety Guidelines</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
