import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQS = [
  {
    q: "How does the nearest delivery partner get assigned?",
    a: "When you submit an emergency request, FuelRescue calculates the precise distance between your stranded coordinates and all online, verified partners using the Haversine spherical distance formula. The nearest available partner receives an automated high-priority dispatch offer."
  },
  {
    q: "How much fuel can I order during an emergency?",
    a: "Under roadside emergency regulations, FuelRescue delivers emergency top-up quantities (1 Litre, 2 Litres, or 5 Litres). This provides sufficient range to restart your vehicle and drive to the nearest fuel retail station."
  },
  {
    q: "What if my browser denies geolocation access?",
    a: "You can easily search for your exact road, highway mile marker, landmark, or intersection using our integrated Google Places Autocomplete search bar, and drag the emergency pin directly on Google Maps."
  },
  {
    q: "Is payment processed securely?",
    a: "Yes. Payments are processed securely via encrypted digital transactions supporting UPI, Credit/Debit Cards, and Cash on Delivery with immediate digital invoicing and transaction verification."
  },
  {
    q: "How are delivery partners vetted for safety?",
    a: "Partners undergo background verification, vehicle document screening, and safety audits before admin approval. They carry certified safety dispensing containers, grounding clamps, and emergency fire extinguishers."
  }
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState(0);

  return (
    <section className="py-20 bg-slate-900/60 border-t border-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold text-brand-400 uppercase tracking-widest px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
            Clear Answers for Stranded Motorists
          </h2>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div 
                key={faq.q}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm sm:text-base font-bold text-white hover:text-brand-400 transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-brand-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
