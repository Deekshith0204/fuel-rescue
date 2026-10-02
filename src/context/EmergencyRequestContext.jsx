import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { requestService } from '../firebase/services';
import { dispatchService } from '../services/dispatchService';
import { useNotifications } from './NotificationContext';
import { useAuth } from './AuthContext';

const EmergencyRequestContext = createContext();

export function EmergencyRequestProvider({ children }) {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();
  const [activeRequest, setActiveRequest] = useState(null);
  const [loadingActive, setLoadingActive] = useState(true);

  // Sync active request on load or user change
  const fetchActiveRequest = useCallback(async () => {
    if (!currentUser) {
      setActiveRequest(null);
      setLoadingActive(false);
      return;
    }
    try {
      const all = await requestService.getAll();
      // Find latest non-completed/non-cancelled request for this user/partner
      let current = null;
      if (currentUser.role === 'CUSTOMER') {
        current = all.find(r => r.userId === currentUser.id || r.userId === currentUser.uid);
      } else if (currentUser.role === 'DELIVERY_PARTNER') {
        current = all.find(r => 
          (r.partnerId === currentUser.id || r.partnerId === currentUser.uid) && 
          r.status !== 'COMPLETED' && r.status !== 'CANCELLED'
        );
      }
      setActiveRequest(current || null);
    } catch (e) {
      console.warn("Error fetching active request:", e);
    } finally {
      setLoadingActive(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchActiveRequest();
  }, [fetchActiveRequest]);

  // Real-time updates subscription when an active request exists
  useEffect(() => {
    if (!activeRequest?.id) return;
    const unsub = requestService.subscribeToRequest(activeRequest.id, (updated) => {
      // Check for status progression notifications
      if (updated.status !== activeRequest.status) {
        if (updated.status === 'ASSIGNED') {
          addNotification({
            type: 'emergency',
            title: 'Delivery Partner Assigned',
            message: `${updated.partnerName} has been assigned to your location.`
          });
        } else if (updated.status === 'ACCEPTED') {
          addNotification({
            type: 'info',
            title: 'Request Accepted',
            message: `${updated.partnerName} accepted your request and is preparing equipment.`
          });
        } else if (updated.status === 'ON_THE_WAY') {
          addNotification({
            type: 'info',
            title: 'Partner On The Way',
            message: `${updated.partnerName} is en route. ETA: ~${updated.estimatedTimeMinutes} mins.`
          });
        } else if (updated.status === 'ARRIVED') {
          addNotification({
            type: 'emergency',
            title: 'Partner Has Arrived!',
            message: `${updated.partnerName} is at your vehicle. Look out for safety hazard lights.`
          });
        } else if (updated.status === 'COMPLETED') {
          addNotification({
            type: 'success',
            title: 'Emergency Fuel Delivered',
            message: `Fuel dispensing completed safely. Please submit your service rating.`
          });
        }
      }
      setActiveRequest(updated);
    });

    return () => unsub && unsub();
  }, [activeRequest?.id, activeRequest?.status, addNotification]);

  // Submit emergency fuel request
  const submitEmergencyRequest = async (formData) => {
    const newReq = await requestService.create({
      ...formData,
      userId: currentUser?.id || currentUser?.uid,
      customerName: currentUser?.name || "Customer",
      customerPhone: currentUser?.phone || "+91 98765 43210"
    });

    setActiveRequest(newReq);

    addNotification({
      type: 'emergency',
      title: 'Emergency Request Created',
      message: 'Searching for nearest certified rapid-response partner...',
      duration: 6000
    });

    // Automatically trigger nearest-partner proximity dispatch
    try {
      setTimeout(async () => {
        const dispatchResult = await dispatchService.assignNearestPartner(
          newReq.id,
          newReq.latitude,
          newReq.longitude
        );
        if (dispatchResult?.partner) {
          addNotification({
            type: 'info',
            title: 'Partner Assigned!',
            message: `${dispatchResult.partner.name} is ${dispatchResult.partner.distanceKm} km away.`
          });
        }
      }, 2500);
    } catch (err) {
      console.warn("Proximity dispatch fallback", err);
    }

    return newReq;
  };

  const updateStatus = async (status, extra = {}) => {
    if (!activeRequest?.id) return;
    const updated = await requestService.updateStatus(activeRequest.id, status, extra);
    setActiveRequest(prev => ({ ...prev, ...updated, status }));
    return updated;
  };

  const cancelRequest = async () => {
    if (!activeRequest?.id) return;
    await updateStatus('CANCELLED');
    addNotification({
      type: 'error',
      title: 'Request Cancelled',
      message: 'Your emergency fuel request has been cancelled.'
    });
  };

  return (
    <EmergencyRequestContext.Provider
      value={{
        activeRequest,
        loadingActive,
        submitEmergencyRequest,
        updateStatus,
        cancelRequest,
        refreshActiveRequest: fetchActiveRequest
      }}
    >
      {children}
    </EmergencyRequestContext.Provider>
  );
}

export function useEmergencyRequest() {
  const context = useContext(EmergencyRequestContext);
  if (!context) throw new Error('useEmergencyRequest must be used within EmergencyRequestProvider');
  return context;
}
