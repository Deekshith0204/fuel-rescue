import React from 'react';
import { 
  Fuel, 
  Map, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Smartphone, 
  Users, 
  FileText 
} from 'lucide-react';

const FEATURES = [
  {
    icon: Fuel,
    title: "Petrol & Diesel Emergency Quantities",
    desc: "Order 1L, 2L, or 5L emergency top-ups designed to start your stalled engine and navigate safely to the nearest petrol station."
  },
  {
    icon: Map,
    title: "Google Maps Platform Powered",
    desc: "Native integration with Google Maps JavaScript API, Places Autocomplete, and Directions for sub-meter breakdown accuracy."
  },
  {
    icon: Clock,
    title: "Proximity-First Haversine Dispatch",
    desc: "Intelligent nearest-partner discovery calculates real-time driving distances and assigns local responders automatically."
  },
  {
    icon: ShieldCheck,
    title: "PESO & Safety Compliant Equipment",
    desc: "Prototype designed to interface only with certified fuel carriers equipped with spark-proof funnels and fire-safety kit."
  },
  {
    icon: Smartphone,
    title: "Real-Time Tracking & Push Alerts",
    desc: "Live route visualization, partner status timeline, and automated status notifications keeping motorists informed."
  },
  {
    icon: CreditCard,
    title: "Flexible Payment Simulation",
    desc: "Built-in checkout simulation supporting UPI, Cards, and Cash, structured cleanly for seamless Razorpay API migration."
  }
];

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-slate-950 border-t border-slate-800/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            Enterprise Grade Tech
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Engineered for High-Pressure Roadside Emergencies
          </h2>
          <p className="text-slate-400 text-sm sm:text-base">
            Combining reactive frontend state with Cloud Firestore real-time synchronization and Google Maps navigation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <div 
                key={feat.title}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-brand-500/40 transition duration-300 group hover:shadow-glow/20"
              >
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mb-5 group-hover:bg-brand-500 group-hover:text-white transition">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white mb-2 group-hover:text-brand-300 transition">
                  {feat.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
