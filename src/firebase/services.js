import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from './config';
import { mockStore } from './mockStore';
import { SAMPLE_USERS, SAMPLE_PARTNERS, SAMPLE_REQUESTS, SAMPLE_ORDERS, SAMPLE_REVIEWS, SAMPLE_SERVICE_AREAS } from './seedData';

// Helper to ensure asynchronous cloud calls never hang the browser UI indefinitely
const withTimeout = (promise, ms = 2500) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firebase network operation timed out")), ms)
    )
  ]);
};

export const MAIN_ADMIN_EMAIL = 'ddk115070@gmail.com';

// ----------------------------------------------------
// AUTH SERVICE
// ----------------------------------------------------
export const authService = {
  login: async (email, password) => {
    const cleanEmail = email.trim().toLowerCase();
    const isMainAdmin = cleanEmail === MAIN_ADMIN_EMAIL;

    if (isFirebaseConfigured && auth) {
      try {
        const userCredential = await withTimeout(signInWithEmailAndPassword(auth, email, password), 3500);
        let userData = null;
        if (db) {
          try {
            const userDocRef = doc(db, 'users', userCredential.user.uid);
            const userSnap = await withTimeout(getDoc(userDocRef), 2000);
            if (userSnap.exists()) {
              userData = userSnap.data();
            }
          } catch (e) {
            console.warn("User doc lookup timed out, using auth metadata:", e);
          }
        }

        // If this is the main admin, guarantee they have ADMIN role and adminAccessApproved
        if (isMainAdmin) {
          const mainAdminData = {
            uid: userCredential.user.uid,
            id: userCredential.user.uid,
            name: userData?.name || "Main Administrator",
            email: MAIN_ADMIN_EMAIL,
            phone: userData?.phone || "+91 99000 11223",
            role: 'ADMIN',
            isMainAdmin: true,
            adminAccessApproved: true,
            isActive: true,
            photoURL: userData?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
            createdAt: userData?.createdAt || new Date().toISOString()
          };
          if (db && (!userData || userData.role !== 'ADMIN' || !userData.adminAccessApproved || !userData.isMainAdmin)) {
            setDoc(doc(db, 'users', userCredential.user.uid), mainAdminData, { merge: true }).catch(() => {});
          }
          mockStore.saveUser(mainAdminData);
          mockStore.setSession(mainAdminData);
          return mainAdminData;
        }

        if (userData) {
          if (!userData.isActive) throw new Error("Account has been deactivated. Please contact support.");
          const userObj = { uid: userCredential.user.uid, id: userCredential.user.uid, ...userData };
          mockStore.setSession(userObj);
          return userObj;
        }

        const fallbackUser = { 
          uid: userCredential.user.uid, 
          id: userCredential.user.uid,
          email: userCredential.user.email, 
          role: cleanEmail.includes('partner') ? 'DELIVERY_PARTNER' : 'CUSTOMER',
          adminAccessApproved: false
        };
        mockStore.setSession(fallbackUser);
        return fallbackUser;
      } catch (err) {
        console.warn("Firebase Auth login failed, checking local credentials:", err.message);
        let user = mockStore.getUserById(cleanEmail);
        if (!user && isMainAdmin) {
          user = {
            id: "usr_admin_001",
            name: "Main Administrator",
            email: MAIN_ADMIN_EMAIL,
            phone: "+91 99000 11223",
            role: "ADMIN",
            isMainAdmin: true,
            adminAccessApproved: true,
            isActive: true,
            createdAt: new Date().toISOString()
          };
          mockStore.saveUser(user);
        }
        if (user) {
          if (!user.isActive && !isMainAdmin) throw new Error("Account has been deactivated. Please contact support.");
          mockStore.setSession(user);
          return user;
        }
        throw err;
      }
    } else {
      // Prototype mode login
      let user = mockStore.getUserById(cleanEmail);
      if (!user && isMainAdmin) {
        user = {
          id: "usr_admin_001",
          name: "Main Administrator",
          email: MAIN_ADMIN_EMAIL,
          phone: "+91 99000 11223",
          role: "ADMIN",
          isMainAdmin: true,
          adminAccessApproved: true,
          isActive: true,
          createdAt: new Date().toISOString()
        };
        mockStore.saveUser(user);
      }
      if (user) {
        if (!user.isActive && !isMainAdmin) throw new Error("Account has been deactivated. Please contact support.");
        mockStore.setSession(user);
        return user;
      }
      throw new Error("Invalid credentials. Please verify your email or create an account.");
    }
  },

  register: async ({ name, email, password, phone, role, vehicleDetails }) => {
    const cleanEmail = email.trim().toLowerCase();
    const isMainAdmin = cleanEmail === MAIN_ADMIN_EMAIL;
    const finalRole = isMainAdmin ? 'ADMIN' : (role || 'CUSTOMER');
    const adminAccessApproved = isMainAdmin ? true : false;

    if (isFirebaseConfigured && auth && db) {
      try {
        const userCredential = await withTimeout(createUserWithEmailAndPassword(auth, email, password), 4000);
        try {
          await updateProfile(userCredential.user, { displayName: name });
        } catch (e) {}

        const userData = {
          name,
          email: cleanEmail,
          phone: phone || "",
          role: finalRole,
          isMainAdmin,
          adminAccessApproved,
          photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
          createdAt: new Date().toISOString(),
          isActive: true
        };

        try {
          await withTimeout(setDoc(doc(db, 'users', userCredential.user.uid), userData), 2500);

          if (finalRole === 'DELIVERY_PARTNER' && vehicleDetails) {
            const partnerData = {
              userId: userCredential.user.uid,
              name,
              phone: phone || "",
              email: cleanEmail,
              vehicleType: vehicleDetails.vehicleType || "Rapid Assist Motorcycle",
              vehicleNumber: vehicleDetails.vehicleNumber || "KA-01-XX-0000",
              latitude: vehicleDetails.latitude || 12.9716,
              longitude: vehicleDetails.longitude || 77.5946,
              serviceArea: vehicleDetails.serviceArea || "Central Bengaluru Zone",
              availability: "OFFLINE",
              verificationStatus: "PENDING",
              rating: 5.0,
              totalDeliveries: 0,
              todayDeliveries: 0,
              todayEarnings: 0,
              totalEarnings: 0,
              createdAt: new Date().toISOString()
            };
            await withTimeout(setDoc(doc(db, 'partners', userCredential.user.uid), partnerData), 2500);
          }
        } catch (e) {
          console.warn("Firestore document write timed out, saved to prototype storage:", e);
        }

        mockStore.saveUser(userData);
        mockStore.setSession(userData);
        return { uid: userCredential.user.uid, id: userCredential.user.uid, ...userData };
      } catch (err) {
        console.warn("Firebase Auth registration failed, using prototype registration:", err.message);
      }
    }

    // Prototype Registration
    const existing = mockStore.getUserById(cleanEmail);
    if (existing) throw new Error("A user with this email already exists.");

    const userId = `usr_${Date.now()}`;
    const userData = {
      id: userId,
      name,
      email: cleanEmail,
      phone: phone || "",
      role: finalRole,
      isMainAdmin,
      adminAccessApproved,
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      createdAt: new Date().toISOString(),
      isActive: true
    };
    mockStore.saveUser(userData);

    if (finalRole === 'DELIVERY_PARTNER') {
      const partnerData = {
        id: `part_${Date.now()}`,
        userId: userId,
        name,
        phone: phone || "",
        email: cleanEmail,
        vehicleType: vehicleDetails?.vehicleType || "Rapid Assist Motorcycle",
        vehicleNumber: vehicleDetails?.vehicleNumber || "KA-01-XX-0000",
        latitude: vehicleDetails?.latitude || 12.9716,
        longitude: vehicleDetails?.longitude || 77.5946,
        serviceArea: vehicleDetails?.serviceArea || "Central Bengaluru Zone",
        availability: "OFFLINE",
        verificationStatus: "PENDING",
        rating: 5.0,
        totalDeliveries: 0,
        todayDeliveries: 0,
        todayEarnings: 0,
        totalEarnings: 0,
        createdAt: new Date().toISOString()
      };
      mockStore.savePartner(partnerData);
    }

    mockStore.setSession(userData);
    return userData;
  },

  logout: async () => {
    if (isFirebaseConfigured && auth) {
      try {
        await withTimeout(signOut(auth), 2000);
      } catch (e) {}
    }
    mockStore.setSession(null);
  },

  resetPassword: async (email) => {
    if (isFirebaseConfigured && auth) {
      try {
        await withTimeout(sendPasswordResetEmail(auth, email), 3000);
      } catch (e) {}
    }
    return true;
  }
};

// ----------------------------------------------------
// FUEL REQUEST SERVICE
// ----------------------------------------------------
export const requestService = {
  create: async (requestData) => {
    const newReq = {
      ...requestData,
      id: `req_${Date.now()}`,
      status: 'PENDING',
      deliveryOtp: requestData.deliveryOtp || Math.floor(1000 + Math.random() * 9000).toString(),
      createdAt: new Date().toISOString(),
      acceptedAt: null,
      completedAt: null
    };

    if (isFirebaseConfigured && db) {
      try {
        const docRef = await withTimeout(addDoc(collection(db, 'fuelRequests'), newReq), 2500);
        newReq.id = docRef.id;
        await withTimeout(updateDoc(docRef, { id: docRef.id }), 2000);
      } catch (e) {
        console.warn("Firestore write error or timeout, saved to prototype store:", e);
      }
    }
    mockStore.saveRequest(newReq);
    return newReq;
  },

  getAll: async () => {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'fuelRequests'), orderBy('createdAt', 'desc'));
        const snap = await withTimeout(getDocs(q), 2500);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        // Fall back seamlessly to mockStore without hanging
      }
    }
    return mockStore.getRequests();
  },

  getById: async (id) => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await withTimeout(getDoc(doc(db, 'fuelRequests', id)), 2000);
        if (snap.exists()) return { id: snap.id, ...snap.data() };
      } catch (e) {}
    }
    return mockStore.getRequestById(id);
  },

  getByUser: async (userId) => {
    const all = await requestService.getAll();
    return all.filter(r => r.userId === userId);
  },

  getByPartner: async (partnerId) => {
    const all = await requestService.getAll();
    return all.filter(r => r.partnerId === partnerId);
  },

  updateStatus: async (requestId, status, extraFields = {}) => {
    const patch = {
      status,
      ...extraFields
    };
    if (status === 'ACCEPTED') patch.acceptedAt = new Date().toISOString();
    if (status === 'COMPLETED') patch.completedAt = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(updateDoc(doc(db, 'fuelRequests', requestId), patch), 2500);
      } catch (e) {
        console.warn("Firestore update timeout, synced locally:", e);
      }
    }
    
    // Always sync prototype mock store
    const existing = mockStore.getRequestById(requestId);
    if (existing) {
      const updated = { ...existing, ...patch };
      mockStore.saveRequest(updated);
      return updated;
    }
    return patch;
  },

  // Live listener for active tracking
  subscribeToRequest: (requestId, callback) => {
    if (isFirebaseConfigured && db) {
      try {
        const unsub = onSnapshot(doc(db, 'fuelRequests', requestId), (snap) => {
          if (snap.exists()) {
            callback({ id: snap.id, ...snap.data() });
          }
        });
        return unsub;
      } catch (e) {}
    }
    // Prototype fallback interval polling
    const interval = setInterval(() => {
      const req = mockStore.getRequestById(requestId);
      if (req) callback(req);
    }, 1500);
    return () => clearInterval(interval);
  }
};

// ----------------------------------------------------
// PARTNER SERVICE
// ----------------------------------------------------
export const partnerService = {
  getAll: async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await withTimeout(getDocs(collection(db, 'partners')), 2500);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {}
    }
    return mockStore.getPartners();
  },

  getByUserId: async (userId) => {
    const partners = await partnerService.getAll();
    return partners.find(p => p.userId === userId || p.id === userId) || null;
  },

  updateAvailability: async (partnerId, availability) => {
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(updateDoc(doc(db, 'partners', partnerId), { availability }), 2000);
      } catch (e) {}
    }
    const p = mockStore.getPartners().find(x => x.id === partnerId || x.userId === partnerId);
    if (p) {
      p.availability = availability;
      mockStore.savePartner(p);
    }
    return availability;
  },

  updateLocation: async (partnerId, latitude, longitude) => {
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(updateDoc(doc(db, 'partners', partnerId), { latitude, longitude }), 2000);
      } catch (e) {}
    }
    const p = mockStore.getPartners().find(x => x.id === partnerId || x.userId === partnerId);
    if (p) {
      p.latitude = latitude;
      p.longitude = longitude;
      mockStore.savePartner(p);
    }
  },

  updateVerification: async (partnerId, verificationStatus) => {
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(updateDoc(doc(db, 'partners', partnerId), { verificationStatus }), 2000);
      } catch (e) {
        try {
          const q = query(collection(db, 'partners'), where('userId', '==', partnerId));
          const snap = await withTimeout(getDocs(q), 2000);
          if (!snap.empty) {
            await withTimeout(updateDoc(snap.docs[0].ref, { verificationStatus }), 2000);
          }
        } catch (err) {}
      }
    }
    const p = mockStore.getPartners().find(x => x.id === partnerId || x.userId === partnerId);
    if (p) {
      p.verificationStatus = verificationStatus;
      mockStore.savePartner(p);
    }
    window.dispatchEvent(new CustomEvent('fuelrescue_partner_verified', { 
      detail: { partnerId, verificationStatus } 
    }));
  },

  addPartner: async (partnerData) => {
    const newPartner = {
      ...partnerData,
      id: `part_${Date.now()}`,
      availability: 'ONLINE',
      verificationStatus: 'VERIFIED',
      rating: 5.0,
      totalDeliveries: 0,
      todayDeliveries: 0,
      todayEarnings: 0,
      totalEarnings: 0,
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(setDoc(doc(db, 'partners', newPartner.id), newPartner), 2500);
      } catch (e) {}
    }
    mockStore.savePartner(newPartner);
    return newPartner;
  },

  deletePartner: async (partnerId) => {
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(deleteDoc(doc(db, 'partners', partnerId)), 2500);
      } catch (e) {
        console.warn("Firestore delete partner error:", e);
      }
    }
    mockStore.deletePartner(partnerId);
    return true;
  }
};

// ----------------------------------------------------
// ORDER & PAYMENT SERVICE
// ----------------------------------------------------
export const orderService = {
  create: async (orderData) => {
    const newOrder = {
      ...orderData,
      id: `ord_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(setDoc(doc(db, 'orders', newOrder.id), newOrder), 2500);
      } catch (e) {}
    }
    mockStore.saveOrder(newOrder);
    return newOrder;
  },

  getAll: async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await withTimeout(getDocs(collection(db, 'orders')), 2500);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {}
    }
    return mockStore.getOrders();
  },

  getByUser: async (userId) => {
    const all = await orderService.getAll();
    return all.filter(o => o.userId === userId);
  }
};

// ----------------------------------------------------
// REVIEWS SERVICE
// ----------------------------------------------------
export const reviewService = {
  submit: async (reviewData) => {
    const newReview = {
      ...reviewData,
      id: `rev_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(setDoc(doc(db, 'reviews', newReview.id), newReview), 2500);
      } catch (e) {}
    }
    mockStore.saveReview(newReview);
    return newReview;
  },

  getAll: async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await withTimeout(getDocs(collection(db, 'reviews')), 2500);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {}
    }
    return mockStore.getReviews();
  }
};

// ----------------------------------------------------
// SERVICE AREAS
// ----------------------------------------------------
export const serviceAreaService = {
  getAll: async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await withTimeout(getDocs(collection(db, 'serviceAreas')), 2500);
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {}
    }
    return mockStore.getServiceAreas();
  },
  save: async (areaData) => {
    const area = {
      ...areaData,
      id: areaData.id || `area_${Date.now()}`
    };
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(setDoc(doc(db, 'serviceAreas', area.id), area), 2500);
      } catch (e) {}
    }
    mockStore.saveServiceArea(area);
    return area;
  }
};

// ----------------------------------------------------
// ADMIN OPERATIONS & STATS
// ----------------------------------------------------
export const adminService = {
  getUsers: async () => {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await withTimeout(getDocs(collection(db, 'users')), 2500);
        if (!snap.empty) {
          const list = snap.docs.map(d => {
            const data = d.data() || {};
            return {
              id: d.id,
              ...data,
              email: data.email || "",
              name: data.name || "User",
              role: data.role || "CUSTOMER"
            };
          });
          if (Array.isArray(list) && list.length > 0) return list;
        }
      } catch (e) {
        console.warn("Firestore getUsers error, using local fallback:", e);
      }
    }
    const fallback = mockStore.getUsers();
    return Array.isArray(fallback) && fallback.length > 0 ? fallback : SAMPLE_USERS;
  },

  toggleUserStatus: async (userId, isActive) => {
    const user = mockStore.getUserById(userId);
    if (user?.email === MAIN_ADMIN_EMAIL && !isActive) {
      throw new Error("The Main Administrator account cannot be deactivated.");
    }
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(updateDoc(doc(db, 'users', userId), { isActive }), 2500);
      } catch (e) {}
    }
    if (user) {
      user.isActive = isActive;
      mockStore.saveUser(user);
    }
  },

  updateUserAdminAccess: async (userId, shouldApprove, currentAdminEmail) => {
    const user = mockStore.getUserById(userId);
    if (user?.email === MAIN_ADMIN_EMAIL) {
      throw new Error("The Main Administrator privileges cannot be modified.");
    }

    const updates = {
      role: shouldApprove ? 'ADMIN' : 'CUSTOMER',
      adminAccessApproved: Boolean(shouldApprove),
      adminApprovedBy: shouldApprove ? (currentAdminEmail || MAIN_ADMIN_EMAIL) : null,
      adminApprovedAt: shouldApprove ? new Date().toISOString() : null,
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(updateDoc(doc(db, 'users', userId), updates), 2500);
      } catch (e) {
        console.warn("Firestore updateUserAdminAccess error:", e);
      }
    }

    if (user) {
      Object.assign(user, updates);
      mockStore.saveUser(user);
    }
    return updates;
  },

  deleteUser: async (userId, currentAdminEmail) => {
    // 1. Identify user to protect Main Admin
    const user = mockStore.getUserById(userId);
    if (user?.email?.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase()) {
      throw new Error("The Root Main Administrator account cannot be deleted.");
    }

    // 2. Delete from Cloud Firestore if configured
    if (isFirebaseConfigured && db) {
      try {
        await withTimeout(deleteDoc(doc(db, 'users', userId)), 3000);
      } catch (e) {
        console.warn("Firestore delete user error:", e);
      }

      // If user was a delivery partner, delete partner record as well
      try {
        await withTimeout(deleteDoc(doc(db, 'partners', userId)), 2000);
      } catch (e) {}
    }

    // 3. Delete from mockStore
    mockStore.deleteUser(userId);
    mockStore.deletePartner(userId);

    return { success: true, userId };
  },

  // 1-Click Database Seeding into Cloud Firestore and Prototype Store
  seedDatabase: async () => {
    // 1. Immediately seed the prototype local store so the app is 100% populated instantly
    mockStore.resetAll();

    if (isFirebaseConfigured && db) {
      try {
        // Quick connection test: Try writing 1 sample document with a 3-second timeout
        await withTimeout(
          setDoc(doc(db, 'serviceAreas', SAMPLE_SERVICE_AREAS[0].id), SAMPLE_SERVICE_AREAS[0]), 
          3000
        );

        // If that succeeded, Cloud Firestore is online and accepting writes! Sync all collections in parallel:
        const batchWrites = [
          ...SAMPLE_USERS.map(u => setDoc(doc(db, 'users', u.id), u)),
          ...SAMPLE_PARTNERS.map(p => setDoc(doc(db, 'partners', p.id), p)),
          ...SAMPLE_REQUESTS.map(r => setDoc(doc(db, 'fuelRequests', r.id), r)),
          ...SAMPLE_ORDERS.map(o => setDoc(doc(db, 'orders', o.id), o)),
          ...SAMPLE_REVIEWS.map(rev => setDoc(doc(db, 'reviews', rev.id), rev)),
          ...SAMPLE_SERVICE_AREAS.map(sa => setDoc(doc(db, 'serviceAreas', sa.id), sa))
        ];

        await withTimeout(Promise.all(batchWrites), 6000);
        return { 
          success: true, 
          message: "Cloud Firestore populated successfully with initial platform records!" 
        };
      } catch (e) {
        console.warn("Cloud Firestore write check failed or timed out:", e.message);
        return { 
          success: true, 
          message: "Platform database initialized with records! (To enable Cloud Firestore sync, confirm database status and rules in Firebase Console)." 
        };
      }
    }

    return { 
      success: true, 
      message: "Platform store initialized successfully!" 
    };
  }
};
