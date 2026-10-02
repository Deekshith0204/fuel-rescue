import { partnerService, requestService } from '../firebase/services';
import { calculateHaversineDistance } from './mapsService';

/**
 * Dispatch Engine for FuelRescue (Academic Prototype)
 * Implements proximity-based nearest-partner discovery and staged dispatch.
 * Architected to be swappable with a Cloud Functions / Microservice dispatch queue in production.
 */
export const dispatchService = {
  /**
   * Find and rank available, verified delivery partners ordered by proximity.
   */
  findNearestPartners: async (customerLat, customerLng, maxRadiusKm = 25) => {
    const allPartners = await partnerService.getAll();

    // Filter partners who are ONLINE and VERIFIED
    const eligiblePartners = allPartners.filter(p => 
      p.availability === 'ONLINE' && 
      p.verificationStatus === 'VERIFIED'
    );

    // Calculate proximity using Haversine formula
    const rankedPartners = eligiblePartners.map(partner => {
      const distanceKm = calculateHaversineDistance(
        customerLat,
        customerLng,
        partner.latitude,
        partner.longitude
      );
      // Rough urban ETA calculation: 3 minutes base dispatch + 3 mins per km
      const estimatedMinutes = Math.max(5, Math.round(3 + (distanceKm * 2.8)));
      return {
        ...partner,
        distanceKm,
        estimatedMinutes
      };
    })
    .filter(p => p.distanceKm <= maxRadiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm);

    return rankedPartners;
  },

  /**
   * Assign or offer an emergency request to the nearest suitable partner.
   * If rejected or unavailable, it can cascade to rejectedPartnerIds.
   */
  assignNearestPartner: async (requestId, customerLat, customerLng, rejectedPartnerIds = []) => {
    const candidates = await dispatchService.findNearestPartners(customerLat, customerLng);
    
    // Exclude previously rejected partners
    const nextBestPartner = candidates.find(c => !rejectedPartnerIds.includes(c.id) && !rejectedPartnerIds.includes(c.userId));

    if (!nextBestPartner) {
      // No partners available currently
      await requestService.updateStatus(requestId, 'PENDING', {
        dispatchMessage: "All nearby emergency response units are currently dispatched. Searching expanding perimeter..."
      });
      return null;
    }

    // Assign to next best partner
    const updated = await requestService.updateStatus(requestId, 'ASSIGNED', {
      partnerId: nextBestPartner.userId || nextBestPartner.id,
      partnerName: nextBestPartner.name,
      partnerPhone: nextBestPartner.phone,
      partnerVehicle: `${nextBestPartner.vehicleNumber} (${nextBestPartner.vehicleType})`,
      partnerLat: nextBestPartner.latitude,
      partnerLng: nextBestPartner.longitude,
      distanceKm: nextBestPartner.distanceKm,
      estimatedTimeMinutes: nextBestPartner.estimatedMinutes
    });

    return { partner: nextBestPartner, request: updated };
  },

  /**
   * Handles partner rejection: marks the partner rejected for this request and cascades to next nearest.
   */
  handlePartnerRejection: async (requestId, partnerId, customerLat, customerLng, allRejected = []) => {
    const updatedRejected = [...allRejected, partnerId];
    return await dispatchService.assignNearestPartner(requestId, customerLat, customerLng, updatedRejected);
  }
};
