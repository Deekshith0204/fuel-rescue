// Local prototype storage layer to ensure zero-crash execution 
// during final-year academic demonstrations and evaluative reviews.
import { 
  SAMPLE_USERS, 
  SAMPLE_PARTNERS, 
  SAMPLE_REQUESTS, 
  SAMPLE_ORDERS, 
  SAMPLE_REVIEWS, 
  SAMPLE_SERVICE_AREAS 
} from './seedData';

const STORAGE_KEYS = {
  USERS: 'fuelrescue_users',
  PARTNERS: 'fuelrescue_partners',
  REQUESTS: 'fuelrescue_requests',
  ORDERS: 'fuelrescue_orders',
  REVIEWS: 'fuelrescue_reviews',
  SERVICE_AREAS: 'fuelrescue_service_areas',
  PRICING: 'fuelrescue_platform_pricing',
  CURRENT_USER: 'fuelrescue_active_session'
};

function getLocal(key, defaultData) {
  try {
    const item = localStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    const parsed = JSON.parse(item);
    if (parsed === null || parsed === undefined) {
      localStorage.setItem(key, JSON.stringify(defaultData));
      return defaultData;
    }
    if (Array.isArray(defaultData) && (!Array.isArray(parsed) || parsed.length === 0)) {
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
    return true;
  },

  // Users
  getUsers: () => {
    const data = getLocal(STORAGE_KEYS.USERS, SAMPLE_USERS);
    return Array.isArray(data) && data.length > 0 ? data : SAMPLE_USERS;
  },
  getUserById: (id) => {
    const users = getLocal(STORAGE_KEYS.USERS, SAMPLE_USERS);
    if (!id) return null;
    const cleanId = String(id).toLowerCase();
    return users.find(u => u.id === id || u.email?.toLowerCase() === cleanId) || null;
  },
  saveUser: (user) => {
    const users = getLocal(STORAGE_KEYS.USERS, SAMPLE_USERS);
    const index = users.findIndex(u => u.id === user.id);
    if (index >= 0) {
      users[index] = { ...users[index], ...user };
    } else {
      users.push(user);
    }
    setLocal(STORAGE_KEYS.USERS, users);
    return user;
  },
  deleteUser: (userId) => {
    let users = getLocal(STORAGE_KEYS.USERS, SAMPLE_USERS);
    users = users.filter(u => u.id !== userId && u.email?.toLowerCase() !== String(userId).toLowerCase());
    setLocal(STORAGE_KEYS.USERS, users);
    return true;
  },

  // Partners
  getPartners: () => getLocal(STORAGE_KEYS.PARTNERS, SAMPLE_PARTNERS),
  getPartnerByUserId: (userId) => {
    const partners = getLocal(STORAGE_KEYS.PARTNERS, SAMPLE_PARTNERS);
    return partners.find(p => p.userId === userId || p.id === userId) || null;
  },
  savePartner: (partner) => {
    const partners = getLocal(STORAGE_KEYS.PARTNERS, SAMPLE_PARTNERS);
    const index = partners.findIndex(p => p.id === partner.id);
    if (index >= 0) {
      partners[index] = { ...partners[index], ...partner };
    } else {
      partners.push(partner);
    }
    setLocal(STORAGE_KEYS.PARTNERS, partners);
    return partner;
  },
  deletePartner: (partnerId) => {
    let partners = getLocal(STORAGE_KEYS.PARTNERS, SAMPLE_PARTNERS);
    partners = partners.filter(p => p.id !== partnerId && p.userId !== partnerId);
    setLocal(STORAGE_KEYS.PARTNERS, partners);
    return true;
  },

  // Requests
  getRequests: () => getLocal(STORAGE_KEYS.REQUESTS, SAMPLE_REQUESTS),
  getRequestById: (id) => {
    const requests = getLocal(STORAGE_KEYS.REQUESTS, SAMPLE_REQUESTS);
    return requests.find(r => r.id === id) || null;
  },
  saveRequest: (req) => {
    const requests = getLocal(STORAGE_KEYS.REQUESTS, SAMPLE_REQUESTS);
    const index = requests.findIndex(r => r.id === req.id);
    if (index >= 0) {
      requests[index] = { ...requests[index], ...req };
    } else {
      requests.unshift(req);
    }
    setLocal(STORAGE_KEYS.REQUESTS, requests);
    return req;
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
