// Persistent local storage layer for FuelRescue
// Guarantees that admin additions, edits, and deletions persist across refreshes and tab reloads
import { 
  SAMPLE_USERS, 
  SAMPLE_PARTNERS, 
  SAMPLE_REQUESTS, 
  SAMPLE_ORDERS, 
  SAMPLE_REVIEWS, 
  SAMPLE_SERVICE_AREAS 
} from './seedData';

const STORAGE_KEYS = {
  INITIALIZED: 'fuelrescue_initialized_v2',
  USERS: 'fuelrescue_users',
  PARTNERS: 'fuelrescue_partners',
  REQUESTS: 'fuelrescue_requests',
  ORDERS: 'fuelrescue_orders',
  REVIEWS: 'fuelrescue_reviews',
  SERVICE_AREAS: 'fuelrescue_service_areas',
  PRICING: 'fuelrescue_platform_pricing',
  CURRENT_USER: 'fuelrescue_active_session',
  DELETED_USERS: 'fuelrescue_deleted_users',
  DELETED_PARTNERS: 'fuelrescue_deleted_partners',
  DELETED_REQUESTS: 'fuelrescue_deleted_requests'
};

function ensureInitialized() {
  try {
    const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
    if (!isInit) {
      if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SAMPLE_USERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.PARTNERS)) {
        localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(SAMPLE_PARTNERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.REQUESTS)) {
        localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SAMPLE_REQUESTS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.ORDERS)) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SAMPLE_ORDERS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.REVIEWS)) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SAMPLE_REVIEWS));
      }
      if (!localStorage.getItem(STORAGE_KEYS.SERVICE_AREAS)) {
        localStorage.setItem(STORAGE_KEYS.SERVICE_AREAS, JSON.stringify(SAMPLE_SERVICE_AREAS));
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    }
  } catch (e) {
    console.error("Storage init check error:", e);
  }
}

// Run initialization check immediately
ensureInitialized();

function getLocal(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (item === null || item === undefined || item === 'undefined' || item === 'null') {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(item);
    // Note: Do NOT overwrite with defaultData if parsed is empty array! Empty array is a valid state (e.g. all deleted)
    if (parsed === null || parsed === undefined) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    return parsed;
  } catch (e) {
    console.error("Local storage read error:", e);
    return defaultData;
  }
}

function setLocal(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error("Local storage write error:", e);
  }
}

export const mockStore = {
  // Reset or Seed data
  resetAll: () => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(SAMPLE_USERS));
    localStorage.setItem(STORAGE_KEYS.PARTNERS, JSON.stringify(SAMPLE_PARTNERS));
    localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(SAMPLE_REQUESTS));
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(SAMPLE_ORDERS));
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(SAMPLE_REVIEWS));
    localStorage.setItem(STORAGE_KEYS.SERVICE_AREAS, JSON.stringify(SAMPLE_SERVICE_AREAS));
    localStorage.removeItem(STORAGE_KEYS.DELETED_USERS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_PARTNERS);
    localStorage.removeItem(STORAGE_KEYS.DELETED_REQUESTS);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
    return true;
  },

  // Deleted tracking so remote cloud pulls never resurrect deleted items
  getDeletedUserIds: () => {
    return getLocal(STORAGE_KEYS.DELETED_USERS, []);
  },
  addDeletedUserId: (userId, email) => {
    const list = getLocal(STORAGE_KEYS.DELETED_USERS, []);
    const cleanId = String(userId || '').trim().toLowerCase();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (cleanId && !list.includes(cleanId)) list.push(cleanId);
    if (cleanEmail && !list.includes(cleanEmail)) list.push(cleanEmail);
    setLocal(STORAGE_KEYS.DELETED_USERS, list);
  },
  getDeletedPartnerIds: () => {
    return getLocal(STORAGE_KEYS.DELETED_PARTNERS, []);
  },
  addDeletedPartnerId: (partnerId, userId = null, email = null) => {
    const list = getLocal(STORAGE_KEYS.DELETED_PARTNERS, []);
    [partnerId, userId, email].filter(Boolean).forEach(item => {
      const clean = String(item).trim().toLowerCase();
      if (clean && !list.includes(clean)) list.push(clean);
    });
    setLocal(STORAGE_KEYS.DELETED_PARTNERS, list);
  },
  getDeletedRequestIds: () => {
    return getLocal(STORAGE_KEYS.DELETED_REQUESTS, []);
  },
  addDeletedRequestId: (requestId) => {
    const list = getLocal(STORAGE_KEYS.DELETED_REQUESTS, []);
    const cleanId = String(requestId || '').trim().toLowerCase();
    if (cleanId && !list.includes(cleanId)) list.push(cleanId);
    setLocal(STORAGE_KEYS.DELETED_REQUESTS, list);
  },

  // Users
  getUsers: () => {
    const data = getLocal(STORAGE_KEYS.USERS, []);
    const deleted = mockStore.getDeletedUserIds().map(d => String(d).toLowerCase());
    return Array.isArray(data) 
      ? data.filter(u => {
          if (!u) return false;
          const cleanId = String(u.id || u.uid || '').toLowerCase();
          const cleanEmail = String(u.email || '').toLowerCase();
          return !deleted.includes(cleanId) && (!cleanEmail || !deleted.includes(cleanEmail));
        })
      : [];
  },
  getUserById: (id) => {
    const users = mockStore.getUsers();
    if (!id) return null;
    const cleanId = String(id).toLowerCase();
    return users.find(u => String(u.id || u.uid || '').toLowerCase() === cleanId || String(u.email || '').toLowerCase() === cleanId) || null;
  },
  saveUser: (user) => {
    const users = getLocal(STORAGE_KEYS.USERS, []);
    const cleanId = String(user.id || user.uid || '').toLowerCase();
    const cleanEmail = String(user.email || '').toLowerCase();
    const index = users.findIndex(u => {
      const uid = String(u.id || u.uid || '').toLowerCase();
      const uemail = String(u.email || '').toLowerCase();
      return uid === cleanId || (cleanEmail && uemail === cleanEmail);
    });
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    // If saving user, remove from deleted list
    const deleted = mockStore.getDeletedUserIds().filter(d => {
      const lower = String(d).toLowerCase();
      return lower !== cleanId && (!cleanEmail || lower !== cleanEmail);
    });
    setLocal(STORAGE_KEYS.DELETED_USERS, deleted);
    setLocal(STORAGE_KEYS.USERS, users);
    return user;
  },
  setUsers: (usersList) => {
    setLocal(STORAGE_KEYS.USERS, usersList);
  },
  deleteUser: (userId, userEmail) => {
    mockStore.addDeletedUserId(userId, userEmail);
    let users = getLocal(STORAGE_KEYS.USERS, []);
    const cleanId = String(userId || '').toLowerCase();
    const cleanEmail = String(userEmail || '').toLowerCase();
    users = users.filter(u => {
      const uid = String(u.id || u.uid || '').toLowerCase();
      const uemail = String(u.email || '').toLowerCase();
      return uid !== cleanId && (!cleanEmail || uemail !== cleanEmail) && (!cleanId || uemail !== cleanId);
    });
    setLocal(STORAGE_KEYS.USERS, users);
    // Also delete any linked partner entry
    mockStore.deletePartner(userId);
    if (cleanEmail) {
      mockStore.deletePartner(cleanEmail);
    }
    return true;
  },

  // Partners
  getPartners: () => {
    const data = getLocal(STORAGE_KEYS.PARTNERS, []);
    const deleted = mockStore.getDeletedPartnerIds().map(d => String(d).toLowerCase());
    return Array.isArray(data) 
      ? data.filter(p => {
          if (!p) return false;
          const pid = String(p.id || '').toLowerCase();
          const puid = String(p.userId || '').toLowerCase();
          const pemail = String(p.email || '').toLowerCase();
          return !deleted.includes(pid) && !deleted.includes(puid) && (!pemail || !deleted.includes(pemail));
        })
      : [];
  },
  getPartnerByUserId: (userId) => {
    const partners = mockStore.getPartners();
    if (!userId) return null;
    const clean = String(userId).toLowerCase();
    return partners.find(p => String(p.userId || '').toLowerCase() === clean || String(p.id || '').toLowerCase() === clean) || null;
  },
  savePartner: (partner) => {
    const partners = getLocal(STORAGE_KEYS.PARTNERS, []);
    const cleanId = String(partner.id || '').toLowerCase();
    const cleanEmail = String(partner.email || '').toLowerCase();
    const index = partners.findIndex(p => 
      String(p.id || '').toLowerCase() === cleanId || 
      (cleanEmail && p.email && p.email.toLowerCase() === cleanEmail)
    );
    if (index >= 0) {
      partners[index] = { ...partners[index], ...partner };
    } else {
      partners.unshift(partner);
    }
    // Remove from deleted list
    const cleanUid = String(partner.userId || '').toLowerCase();
    const deleted = mockStore.getDeletedPartnerIds().filter(d => {
      const lower = String(d).toLowerCase();
      return lower !== cleanId && lower !== cleanUid && (!cleanEmail || lower !== cleanEmail);
    });
    setLocal(STORAGE_KEYS.DELETED_PARTNERS, deleted);
    setLocal(STORAGE_KEYS.PARTNERS, partners);
    return partner;
  },
  setPartners: (partnersList) => {
    setLocal(STORAGE_KEYS.PARTNERS, partnersList);
  },
  deletePartner: (partnerId) => {
    const cleanTarget = String(partnerId || '').trim().toLowerCase();
    let partners = getLocal(STORAGE_KEYS.PARTNERS, []);
    const match = partners.find(p => 
      String(p.id || '').toLowerCase() === cleanTarget ||
      String(p.userId || '').toLowerCase() === cleanTarget ||
      (p.email && String(p.email).toLowerCase() === cleanTarget)
    );
    mockStore.addDeletedPartnerId(partnerId, match?.userId, match?.email);
    partners = partners.filter(p => {
      const pid = String(p.id || '').toLowerCase();
      const puid = String(p.userId || '').toLowerCase();
      const pemail = String(p.email || '').toLowerCase();
      return pid !== cleanTarget && puid !== cleanTarget && (!pemail || pemail !== cleanTarget);
    });
    setLocal(STORAGE_KEYS.PARTNERS, partners);
    return true;
  },

  // Requests
  getRequests: () => {
    const data = getLocal(STORAGE_KEYS.REQUESTS, SAMPLE_REQUESTS);
    const deleted = mockStore.getDeletedRequestIds().map(d => String(d).toLowerCase());
    return Array.isArray(data)
      ? data.filter(r => r && !deleted.includes(String(r.id || '').toLowerCase()))
      : [];
  },
  getRequestById: (id) => {
    const requests = mockStore.getRequests();
    if (!id) return null;
    const clean = String(id).toLowerCase();
    return requests.find(r => String(r.id || '').toLowerCase() === clean) || null;
  },
  saveRequest: (req) => {
    const requests = getLocal(STORAGE_KEYS.REQUESTS, SAMPLE_REQUESTS);
    const cleanId = String(req.id || '').toLowerCase();
    const index = requests.findIndex(r => String(r.id || '').toLowerCase() === cleanId);
    if (index >= 0) {
      requests[index] = { ...requests[index], ...req };
    } else {
      requests.unshift(req);
    }
    // Remove from deleted list
    const deleted = mockStore.getDeletedRequestIds().filter(d => String(d).toLowerCase() !== cleanId);
    setLocal(STORAGE_KEYS.DELETED_REQUESTS, deleted);
    setLocal(STORAGE_KEYS.REQUESTS, requests);
    return req;
  },
  setRequests: (requestsList) => {
    setLocal(STORAGE_KEYS.REQUESTS, requestsList);
  },
  deleteRequest: (reqId) => {
    const cleanId = String(reqId || '').trim().toLowerCase();
    mockStore.addDeletedRequestId(cleanId);
    let requests = getLocal(STORAGE_KEYS.REQUESTS, SAMPLE_REQUESTS);
    requests = requests.filter(r => String(r.id || '').toLowerCase() !== cleanId);
    setLocal(STORAGE_KEYS.REQUESTS, requests);
    return true;
  },

  // Orders
  getOrders: () => getLocal(STORAGE_KEYS.ORDERS, SAMPLE_ORDERS),
  saveOrder: (order) => {
    const orders = getLocal(STORAGE_KEYS.ORDERS, SAMPLE_ORDERS);
    const index = orders.findIndex(o => o.id === order.id);
    if (index >= 0) {
      orders[index] = { ...orders[index], ...order };
    } else {
      orders.unshift(order);
    }
    setLocal(STORAGE_KEYS.ORDERS, orders);
    return order;
  },

  // Reviews
  getReviews: () => getLocal(STORAGE_KEYS.REVIEWS, SAMPLE_REVIEWS),
  saveReview: (review) => {
    const reviews = getLocal(STORAGE_KEYS.REVIEWS, SAMPLE_REVIEWS);
    reviews.unshift(review);
    setLocal(STORAGE_KEYS.REVIEWS, reviews);
    return review;
  },

  // Service Areas
  getServiceAreas: () => getLocal(STORAGE_KEYS.SERVICE_AREAS, SAMPLE_SERVICE_AREAS),
  saveServiceArea: (area) => {
    const areas = getLocal(STORAGE_KEYS.SERVICE_AREAS, SAMPLE_SERVICE_AREAS);
    const index = areas.findIndex(a => a.id === area.id);
    if (index >= 0) {
      areas[index] = { ...areas[index], ...area };
    } else {
      areas.push(area);
    }
    setLocal(STORAGE_KEYS.SERVICE_AREAS, areas);
    return area;
  },

  // Platform Pricing
  getPricing: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRICING);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },
  setPricing: (pricing) => {
    setLocal(STORAGE_KEYS.PRICING, pricing);
    return pricing;
  },

  // Session
  getSession: () => {
    try {
      const sess = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return sess ? JSON.parse(sess) : null;
    } catch (e) {
      return null;
    }
  },
  setSession: (user) => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }
};
