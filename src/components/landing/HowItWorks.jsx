import React from 'react';
import { 
  Smartphone, 
  Cpu, 
  Navigation, 
  Fuel, 
  ShieldCheck, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const STEPS = [
  {
    number: "01",
    title: "1-Click Emergency Request",
    desc: "Open FuelRescue on your mobile browser. Allow GPS or search your location using Google Places Autocomplete.",
    icon: Smartphone,
    color: "from-orange-500 to-amber-500"
  },
  {
    number: "02",
    title: "Proximity Haversine Matching",
    desc: "Our dispatch algorithm scans active, verified roadside partners and assigns the request to the nearest available responder.",
    icon: Cpu,
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "03",
    title: "Live Google Maps Tracking",
    desc: "Watch your partner's route in real time with estimated time of arrival (ETA) and vehicle identification details.",
    icon: Navigation,
    color: "from-emerald-500 to-teal-500"
  },
  {
    number: "04",
    title: "Safe Roadside Dispensing",
    desc: "Partner dispenses fuel directly into your tank using certified anti-static funnels, letting you drive safely to the nearest pump.",
    icon: Fuel,
    color: "from-purple-500 to-pink-500"
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 bg-slate-900/50 border-t border-slate-800/60 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            System Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            How FuelRescue Gets You Back on the Road
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Engineered from ground up to minimize stranded highway wait times through automated proximity dispatch.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.number} 
                className="relative p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${step.color} flex items-center justify-center text-white shadow-lg`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-2xl font-black text-slate-700 font-mono group-hover:text-brand-500/60 transition">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 group-hover:text-brand-400 transition">
                    {step.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center text-[11px] font-semibold text-slate-400 group-hover:text-white transition">
                  <span>Stage {idx + 1} of 4</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-brand-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
