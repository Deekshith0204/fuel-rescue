import React from 'react';
import { ShieldCheck, AlertOctagon, CheckCircle2, FileCheck, Landmark } from 'lucide-react';

export default function SafetyCompliance() {
  return (
    <section className="py-16 bg-slate-900/40 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 md:p-12 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-brand-500/30 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Safety Architecture & Regulatory Compliance</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
              Engineered with Strict Adherence to Petroleum & Hazardous Goods Standards
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Transportation and dispensing of Class A (Petrol) and Class B (Diesel) fuels in real-world scenarios are subject to the Petroleum Act, 1934 and PESO (Petroleum and Explosives Safety Organization) guidelines. FuelRescue is architecturally prepared for commercial licensing through authorized Oil Marketing Companies (OMCs).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">PESO Approved Containers</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Authorized partners must utilize UN-certified, anti-static high-density containers with vapor-lock valves.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Partner Background & Hazard Training</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Delivery partners undergo identity verification and fire-hazard extinguishing training before activation.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Emergency Quantities Only</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Limited to 1 to 5 Litres per dispatch to adhere strictly to non-commercial roadside emergency exemptions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-white">Authorized OMC Integration Ready</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Data pipelines and API boundaries built to plug into certified fuel station franchise networks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
