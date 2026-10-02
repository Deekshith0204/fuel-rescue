import React from 'react';
import { 
  Clock, 
  UserCheck, 
  CheckCircle, 
  Navigation, 
  MapPin, 
  CheckCircle2, 
  XCircle,
  AlertCircle
} from 'lucide-react';

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Request Created', desc: 'Searching for nearest partner', icon: Clock },
  { key: 'ASSIGNED', label: 'Partner Assigned', desc: 'Proximity matching confirmed', icon: UserCheck },
  { key: 'ACCEPTED', label: 'Partner Accepted', desc: 'Preparing certified dispensing gear', icon: CheckCircle },
  { key: 'ON_THE_WAY', label: 'On The Way', desc: 'En route with live GPS route', icon: Navigation },
  { key: 'ARRIVED', label: 'Partner Arrived', desc: 'At your vehicle location', icon: MapPin },
  { key: 'COMPLETED', label: 'Completed', desc: 'Safe dispensing finished', icon: CheckCircle2 }
];

export default function StatusTimeline({ currentStatus = 'PENDING' }) {
  if (currentStatus === 'CANCELLED') {
    return (
      <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3">
        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Emergency Request Cancelled</h4>
          <p className="text-xs text-rose-300/80">This emergency fuel delivery request was terminated.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex(s => s.key === currentStatus);
  const activeStep = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="w-full py-4">
      {/* Horizontal timeline for desktop */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-5 left-8 right-8 h-1 bg-slate-800 -z-0"></div>
        {/* Active progress track */}
        <div 
          className="absolute top-5 left-8 h-1 bg-gradient-to-r from-brand-500 to-amber-400 transition-all duration-700 -z-0"
          style={{ width: `${(activeStep / (STATUS_STEPS.length - 1)) * 88}%` }}
        ></div>

        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx < activeStep;
          const isCurrent = idx === activeStep;
          const isPending = idx > activeStep;

          return (
            <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-28">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  isCurrent 
                    ? 'bg-brand-500 border-white text-white shadow-glow emergency-pulse scale-110'
                    : isPassed
                    ? 'bg-brand-600/80 border-brand-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs font-semibold mt-2.5 ${isCurrent ? 'text-brand-400 font-bold' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                {step.label}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                {step.desc}
              </span>
            </div>
          );
        })}
      </div>

      {/* Vertical timeline for mobile screens */}
      <div className="md:hidden space-y-4">
        {STATUS_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isPassed = idx < activeStep;
          const isCurrent = idx === activeStep;
          const isPending = idx > activeStep;

          return (
            <div key={step.key} className="flex items-start gap-3">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 ${
                  isCurrent 
                    ? 'bg-brand-500 border-white text-white shadow-glow emergency-pulse'
                    : isPassed
                    ? 'bg-brand-600 border-brand-500 text-white'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1">
                <p className={`text-xs font-bold ${isCurrent ? 'text-brand-400' : isPassed ? 'text-slate-200' : 'text-slate-500'}`}>
                  {step.label} {isCurrent && <span className="ml-1 text-[10px] px-1.5 py-0.5 bg-brand-500/20 text-brand-300 rounded">Current</span>}
                </p>
                <p className="text-[11px] text-slate-400">{step.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
