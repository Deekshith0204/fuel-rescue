import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';
import { mockStore } from '../firebase/mockStore';

export const DEFAULT_PRICING = {
  petrolPricePerLitre: 102.86,
  dieselPricePerLitre: 87.92,
  baseDeliveryFee: 150.00,
  deliveryFeePerKm: 15.00,
  emergencySurge: 50.00,
  minDeliveryKm: 2,
  updatedAt: new Date().toISOString(),
  updatedBy: "ddk115070@gmail.com"
};

const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Operation timed out")), ms)
    )
  ]);
};

export const pricingService = {
  /**
   * Fetch current live pricing
   */
  getPricing: async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await withTimeout(getDoc(doc(db, 'platformSettings', 'pricing')), 2000);
        if (snap.exists()) {
          const data = snap.data();
          mockStore.setPricing(data);
          return { ...DEFAULT_PRICING, ...data };
        }
      } catch (e) {
        console.warn("Pricing Firestore lookup timed out, using cached/default:", e);
      }
    }
    const cached = mockStore.getPricing();
    return cached ? { ...DEFAULT_PRICING, ...cached } : DEFAULT_PRICING;
  },

  /**
   * Subscribe to real-time pricing updates
   */
  subscribeToPricing: (callback) => {
    // 1. Immediately provide current cache/default
    const initial = mockStore.getPricing() || DEFAULT_PRICING;
    callback(initial);

    // 2. Setup Firestore real-time listener if online
    let unsubFirestore = null;
    if (isFirebaseConfigured && db) {
      try {
        unsubFirestore = onSnapshot(doc(db, 'platformSettings', 'pricing'), (snap) => {
          if (snap.exists()) {
            const data = { ...DEFAULT_PRICING, ...snap.data() };
            mockStore.setPricing(data);
            callback(data);
          }
        }, (err) => {
          console.warn("Real-time pricing listener error:", err);
        });
      } catch (e) {
        console.warn("Could not attach pricing listener:", e);
      }
    }

    // 3. Listen to local broadcast events for cross-tab or offline updates
    const handleLocalUpdate = (e) => {
      if (e.detail) {
        callback(e.detail);
      }
    };
    window.addEventListener('fuelrescue_pricing_updated', handleLocalUpdate);

    return () => {
      if (unsubFirestore) unsubFirestore();
      window.removeEventListener('fuelrescue_pricing_updated', handleLocalUpdate);
    };
  },

  /**
   * Update fuel prices and per-km delivery charges (Admin only)
   */
  updatePricing: async (newPricing, adminEmail = 'ddk115070@gmail.com') => {
    const sanitized = {
      petrolPricePerLitre: Number(parseFloat(newPricing.petrolPricePerLitre || 102.86).toFixed(2)),
      dieselPricePerLitre: Number(parseFloat(newPricing.dieselPricePerLitre || 87.92).toFixed(2)),
      baseDeliveryFee: Number(parseFloat(newPricing.baseDeliveryFee || 150.00).toFixed(2)),
      deliveryFeePerKm: Number(parseFloat(newPricing.deliveryFeePerKm || 15.00).toFixed(2)),
      emergencySurge: Number(parseFloat(newPricing.emergencySurge || 50.00).toFixed(2)),
      minDeliveryKm: Number(parseFloat(newPricing.minDeliveryKm || 2)),
      updatedAt: new Date().toISOString(),
      updatedBy: adminEmail
    };

    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(setDoc(doc(db, 'platformSettings', 'pricing'), sanitized), 3000);
      } catch (e) {
        console.warn("Firestore pricing update failed/timed out, saving locally:", e);
      }
    }

    // Save to local store
    mockStore.setPricing(sanitized);

    // Broadcast local event
    window.dispatchEvent(new CustomEvent('fuelrescue_pricing_updated', { detail: sanitized }));

    return sanitized;
  },

  /**
   * Calculate detailed fare breakdown based on fuel type, quantity, and distance in km
   */
  calculateFare: (pricing, { fuelType, quantity, distanceKm = 0 }) => {
    const config = pricing || DEFAULT_PRICING;
    const qty = Number(quantity) || 1;
    const pricePerLitre = fuelType === 'Petrol' ? config.petrolPricePerLitre : config.dieselPricePerLitre;
    const fuelSubtotal = qty * pricePerLitre;

    const baseFee = config.baseDeliveryFee;
    const km = Math.max(0, Number(distanceKm) || 0);
    const distanceCharge = km * config.deliveryFeePerKm;
    const totalDeliveryFee = baseFee + distanceCharge;
    const surge = config.emergencySurge;
    const totalAmount = fuelSubtotal + totalDeliveryFee + surge;

    return {
      pricePerLitre: Number(pricePerLitre.toFixed(2)),
      effectiveQty: qty,
      fuelSubtotal: Number(fuelSubtotal.toFixed(2)),
      baseDeliveryFee: Number(baseFee.toFixed(2)),
      deliveryFeePerKm: Number(config.deliveryFeePerKm.toFixed(2)),
      distanceKm: Number(km.toFixed(1)),
      distanceCharge: Number(distanceCharge.toFixed(2)),
      totalDeliveryFee: Number(totalDeliveryFee.toFixed(2)),
      emergencySurge: Number(surge.toFixed(2)),
      totalAmount: Number(totalAmount.toFixed(2))
    };
  }
};
