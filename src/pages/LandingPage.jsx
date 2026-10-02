import React from 'react';
import HeroSection from '../components/landing/HeroSection';
import HowItWorks from '../components/landing/HowItWorks';
import FeaturesSection from '../components/landing/FeaturesSection';
import SafetyCompliance from '../components/landing/SafetyCompliance';
import ServiceAreasSection from '../components/landing/ServiceAreasSection';
import FAQSection from '../components/landing/FAQSection';

export default function LandingPage() {
  return (
    <div className="space-y-0">
      <HeroSection />
      <HowItWorks />
      <FeaturesSection />
      <SafetyCompliance />
      <ServiceAreasSection />
      <FAQSection />
    </div>
  );
}
