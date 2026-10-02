import React from 'react';
import { MapPin, CheckCircle, Navigation, Shield, Compass } from 'lucide-react';
import { SAMPLE_SERVICE_AREAS } from '../../firebase/seedData';

export default function ServiceAreasSection() {
  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
            Geofenced Zones
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Current Emergency Coverage Corridors
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Actively mapped high-density highway corridors and metropolitan tech sectors with rapid partner response.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SAMPLE_SERVICE_AREAS.map((area) => (
            <div 
              key={area.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-brand-500/50 transition duration-300 relative group overflow-hidden shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-center justify-center text-brand-400">
                  <Compass className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                  {area.status}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-brand-400 transition">
                {area.name}
              </h3>
              <p className="text-xs text-slate-400 mb-4">{area.city} Region</p>

              <div className="space-y-2 pt-3 border-t border-slate-800 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Coverage Perimeter:</span>
                  <span className="text-slate-200 font-semibold">{area.radiusKm} km Radius</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Base Rapid Dispatch:</span>
                  <span className="text-slate-200 font-semibold">₹{area.baseDeliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Standby Responders:</span>
                  <span className="text-emerald-400 font-semibold">{area.activePartnersCount} Active Units</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
