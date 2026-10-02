import React, { useState } from 'react';
import { 
  PhoneCall, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  LifeBuoy, 
  MessageSquare, 
  Send,
  HelpCircle
} from 'lucide-react';

export default function HelpSupportPage() {
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSupportSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center mx-auto shadow-glow">
          <LifeBuoy className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
          Roadside Safety & Support Hub
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Immediate guidance for stalled motorists, emergency contacts, and support tickets
        </p>
      </div>

      {/* Emergency Roadside Survival Protocol (Crucial UX for real roadside safety!) */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 border border-brand-500/40 shadow-2xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold text-brand-400 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 animate-pulse" />
          <span>Vehicle Breakdown Safety Checklist</span>
        </div>

        <h3 className="text-xl font-bold text-white">
          What to Do While Waiting for Your FuelRescue Responder:
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center">1</span>
            <h4 className="text-sm font-bold text-white">Turn on Hazard Lights</h4>
            <p className="text-xs text-slate-400">Immediately switch on your vehicle hazard warning flashers to alert oncoming traffic.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center">2</span>
            <h4 className="text-sm font-bold text-white">Pull to Shoulder Lane</h4>
            <p className="text-xs text-slate-400">If engine momentum permits, steer safely onto the emergency shoulder or road verge.</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center">3</span>
            <h4 className="text-sm font-bold text-white">Stay in Safe Distance</h4>
            <p className="text-xs text-slate-400">Exit passenger side if near highway lanes. Stand behind safety guardrails while waiting.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Urgent Hotline Contacts */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-brand-400" />
            <span>Emergency Roadside Direct Hotlines</span>
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">FuelRescue 24/7 Operations Desk</span>
                <p className="text-base font-bold text-white">1800-FUEL-SOS (Toll-Free)</p>
              </div>
              <a
                href="tel:18003835767"
                className="px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-400 text-xs font-bold hover:bg-brand-500 hover:text-white transition"
              >
                Call
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">National Highway Patrol (NHAI)</span>
                <p className="text-base font-bold text-white">1033 (Emergency Highway Assist)</p>
              </div>
              <a
                href="tel:1033"
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Call
              </a>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400">Emergency Police & Traffic Control</span>
                <p className="text-base font-bold text-white">112 (All-India Emergency Number)</p>
              </div>
              <a
                href="tel:112"
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Call
              </a>
            </div>
          </div>
        </div>

        {/* Contact Support Form */}
        <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-400" />
            <span>Submit Support / Grievance Ticket</span>
          </h3>

          {submitted ? (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">Ticket #FR-{Date.now().toString().slice(-4)} Dispatched</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                Our roadside support dispatcher will review your message within 15 minutes.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs text-slate-300 font-semibold hover:bg-slate-700 transition"
              >
                Send Another Note
              </button>
            </div>
          ) : (
            <form onSubmit={handleSupportSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Subject</label>
                <input
                  type="text"
                  required
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="e.g. Delayed delivery or refund inquiry"
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-slate-300">Message Description</label>
                <textarea
                  rows={4}
                  required
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Explain the breakdown incident or assistance required..."
                  className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Ticket</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
