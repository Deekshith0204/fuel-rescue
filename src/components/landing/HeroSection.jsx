import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  Flame, 
  Truck, 
  ArrowRight,
  ShieldCheck,
  PhoneCall
} from 'lucide-react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-500/10 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping"></span>
            <span className="font-semibold text-brand-400">Emergency Fuel Dispatch v2.4</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Average Response Under 20 Mins</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans'] leading-[1.1]">
            Out of Fuel? <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 via-amber-300 to-brand-500 bg-clip-text text-transparent">
              Help Is On The Way.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Request emergency roadside fuel assistance and connect with an authorized service partner in minutes. Don't push your car in the dark.
          </p>

          {/* Prominent CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/customer/emergency"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold text-base shadow-glow hover:scale-105 transition-all flex items-center justify-center gap-3 emergency-pulse"
            >
              <ShieldAlert className="w-5 h-5 text-white" />
              <span>REQUEST EMERGENCY FUEL</span>
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4 text-brand-400" />
              <span>Become a Delivery Partner</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Key Value Prop Pills */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>PESO Safety Compliant Cans</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Google Maps Live Radar</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Roadside Responders</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Card Preview */}
        <div className="mt-14 max-w-4xl mx-auto rounded-3xl bg-slate-900/80 border border-slate-800 p-4 sm:p-6 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-semibold">Active Dispatch Simulation Radar</span>
            </div>
            <div className="text-slate-400">
              City Hub: <span className="text-white font-medium">Bengaluru Urban Grid</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step 1</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-brand-400" />
                Tap GPS Breakdown Pin
              </h4>
              <p className="text-xs text-slate-400">Pinpoint your exact stalled location automatically or search with Google Places.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step 2</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Select Fuel & Litres
              </h4>
              <p className="text-xs text-slate-400">Choose Petrol or Diesel (1L, 2L, 5L) to reach the nearest authorized pump.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step 3</span>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-400" />
                Rapid Assist Arrives
              </h4>
              <p className="text-xs text-slate-400">Watch the certified partner drive directly to your stranded vehicle on Google Maps.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
