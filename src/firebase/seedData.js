// Sample realistic data for FuelRescue Academic Prototype
// Used for seeding Cloud Firestore or initializing Local Prototype Store

export const SAMPLE_USERS = [
  {
    id: "usr_cust_001",
    name: "Alex Mercer",
    email: "customer@fuelrescue.com",
    phone: "+91 98765 43210",
    role: "CUSTOMER",
    photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    isActive: true
  },
  {
    id: "usr_cust_002",
    name: "Sarah Jenkins",
    email: "sarah.j@example.com",
    phone: "+91 98765 87654",
    role: "CUSTOMER",
    photoURL: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    isActive: true
  },
  {
    id: "usr_part_001",
    name: "Rajesh Kumar (Authorized Dispatcher)",
    email: "partner@fuelrescue.com",
    phone: "+91 98111 22334",
    role: "DELIVERY_PARTNER",
    photoURL: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    isActive: true
  },
  {
    id: "usr_part_002",
    name: "Vikram Singh (Highway Rapid Assist)",
    email: "vikram.s@fuelrescue.com",
    phone: "+91 98222 33445",
    role: "DELIVERY_PARTNER",
    photoURL: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
    isActive: true
  },
  {
    id: "usr_part_003",
    name: "Pooja Patel (Urban QuickFuel)",
    email: "pooja.p@fuelrescue.com",
    phone: "+91 98333 44556",
    role: "DELIVERY_PARTNER",
    photoURL: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    isActive: true
  },
  {
    id: "usr_admin_001",
    name: "Main Administrator",
    email: "ddk115070@gmail.com",
    phone: "+91 99000 11223",
    role: "ADMIN",
    isMainAdmin: true,
    adminAccessApproved: true,
    photoURL: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
    isActive: true
  }
];

export const SAMPLE_PARTNERS = [
  {
    id: "part_001",
    userId: "usr_part_001",
    name: "Rajesh Kumar",
    phone: "+91 98111 22334",
    email: "partner@fuelrescue.com",
    vehicleType: "Safety Van (PESO Certified Dispenser)",
    vehicleNumber: "KA-01-EQ-9021",
    latitude: 12.9785,
    longitude: 77.5912,
    serviceArea: "Central Bengaluru / MG Road Hub",
    availability: "ONLINE", // ONLINE, OFFLINE, BUSY
    verificationStatus: "VERIFIED", // VERIFIED, PENDING, REJECTED
    rating: 4.9,
    totalDeliveries: 148,
    todayDeliveries: 4,
    todayEarnings: 1840,
    totalEarnings: 42800,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString()
  },
  {
    id: "part_002",
    userId: "usr_part_002",
    name: "Vikram Singh",
    phone: "+91 98222 33445",
    email: "vikram.s@fuelrescue.com",
    vehicleType: "Rapid Assist Motorcycle (Hazmat Cans)",
    vehicleNumber: "KA-04-MB-4412",
    latitude: 12.9352,
    longitude: 77.6245,
    serviceArea: "Koramangala & Indiranagar Sector",
    availability: "ONLINE",
    verificationStatus: "VERIFIED",
    rating: 4.8,
    totalDeliveries: 215,
    todayDeliveries: 3,
    todayEarnings: 1450,
    totalEarnings: 68500,
    createdAt: new Date(Date.now() - 86400000 * 25).toISOString()
  },
  {
    id: "part_003",
    userId: "usr_part_003",
    name: "Pooja Patel",
    phone: "+91 98333 44556",
    email: "pooja.p@fuelrescue.com",
    vehicleType: "Quick-Response EV Van",
    vehicleNumber: "KA-05-EV-1088",
    latitude: 12.9912,
    longitude: 77.6820,
    serviceArea: "Whitefield Tech Corridor",
    availability: "OFFLINE",
    verificationStatus: "VERIFIED",
    rating: 4.95,
    totalDeliveries: 92,
    todayDeliveries: 0,
    todayEarnings: 0,
    totalEarnings: 29400,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

export const SAMPLE_SERVICE_AREAS = [
  {
    id: "area_001",
    name: "Central Bengaluru Zone",
    city: "Bengaluru",
    latitude: 12.9716,
    longitude: 77.5946,
    radiusKm: 12,
    baseDeliveryFee: 150,
    petrolPricePerLitre: 102.86,
    dieselPricePerLitre: 87.92,
    activePartnersCount: 2,
    status: "ACTIVE"
  },
  {
    id: "area_002",
    name: "Whitefield & IT Corridor",
    city: "Bengaluru",
    latitude: 12.9698,
    longitude: 77.7500,
    radiusKm: 15,
    baseDeliveryFee: 180,
    petrolPricePerLitre: 102.86,
    dieselPricePerLitre: 87.92,
    activePartnersCount: 1,
    status: "ACTIVE"
  },
  {
    id: "area_003",
    name: "Electronic City & Silk Board",
    city: "Bengaluru",
    latitude: 12.8452,
    longitude: 77.6602,
    radiusKm: 10,
    baseDeliveryFee: 160,
    petrolPricePerLitre: 102.86,
    dieselPricePerLitre: 87.92,
    activePartnersCount: 1,
    status: "ACTIVE"
  }
];

export const SAMPLE_REQUESTS = [
  {
    id: "req_001",
    userId: "usr_cust_001",
    customerName: "Alex Mercer",
    customerPhone: "+91 98765 43210",
    fuelType: "Petrol",
    quantity: 5,
    vehicleType: "Car (Sedan)",
    latitude: 12.9724,
    longitude: 77.6015,
    address: "Residency Rd, Ashok Nagar, Bengaluru, Karnataka 560025",
    message: "Car stalled right before the junction signal, hazard lights are on.",
    partnerId: "usr_part_001",
    partnerName: "Rajesh Kumar",
    partnerPhone: "+91 98111 22334",
    partnerVehicle: "KA-01-EQ-9021 (Safety Van)",
    partnerLat: 12.9750,
    partnerLng: 77.5960,
    status: "ON_THE_WAY", // PENDING, ASSIGNED, ACCEPTED, ON_THE_WAY, ARRIVED, COMPLETED, CANCELLED
    estimatedTimeMinutes: 8,
    distanceKm: 2.1,
    subtotal: 514.30,
    deliveryFee: 150.00,
    emergencySurge: 50.00,
    totalAmount: 714.30,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    acceptedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    completedAt: null
  },
  {
    id: "req_002",
    userId: "usr_cust_002",
    customerName: "Sarah Jenkins",
    customerPhone: "+91 98765 87654",
    fuelType: "Diesel",
    quantity: 5,
    vehicleType: "Car (SUV)",
    latitude: 12.9340,
    longitude: 77.6101,
    address: "Koramangala 4th Block, 80 Feet Rd, Bengaluru",
    message: "Fuel tank empty on highway exit lane.",
    partnerId: "usr_part_002",
    partnerName: "Vikram Singh",
    partnerPhone: "+91 98222 33445",
    partnerVehicle: "KA-04-MB-4412",
    partnerLat: 12.9340,
    partnerLng: 77.6101,
    status: "COMPLETED",
    estimatedTimeMinutes: 0,
    distanceKm: 3.5,
    subtotal: 439.60,
    deliveryFee: 150.00,
    emergencySurge: 0.00,
    totalAmount: 589.60,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    acceptedAt: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 25).toISOString()
  },
  {
    id: "req_003",
    userId: "usr_cust_001",
    customerName: "Alex Mercer",
    customerPhone: "+91 98765 43210",
    fuelType: "Petrol",
    quantity: 2,
    vehicleType: "Bike",
    latitude: 12.9810,
    longitude: 77.5970,
    address: "Cubbon Park Gate 3, Kasturba Road, Bengaluru",
    message: "Two-wheeler sputtered out of fuel during rain.",
    partnerId: "usr_part_001",
    partnerName: "Rajesh Kumar",
    partnerPhone: "+91 98111 22334",
    partnerVehicle: "KA-01-EQ-9021",
    partnerLat: 12.9810,
    partnerLng: 77.5970,
    status: "COMPLETED",
    estimatedTimeMinutes: 0,
    distanceKm: 1.8,
    subtotal: 205.72,
    deliveryFee: 150.00,
    emergencySurge: 0.00,
    totalAmount: 355.72,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    acceptedAt: new Date(Date.now() - 86400000 * 5 + 1000 * 60 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 5 + 1000 * 60 * 18).toISOString()
  }
];

export const SAMPLE_ORDERS = [
  {
    id: "ord_001",
    requestId: "req_001",
    userId: "usr_cust_001",
    partnerId: "usr_part_001",
    amount: 714.30,
    paymentMethod: "UPI",
    paymentStatus: "PAID", // PENDING, PAID, FAILED, REFUNDED
    transactionId: "UPI-TXN-9843219482",
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  },
  {
    id: "ord_002",
    requestId: "req_002",
    userId: "usr_cust_002",
    partnerId: "usr_part_002",
    amount: 589.60,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    transactionId: "CARD-AUTH-329841",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "ord_003",
    requestId: "req_003",
    userId: "usr_cust_001",
    partnerId: "usr_part_001",
    amount: 355.72,
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    transactionId: "CASH-REC-11223",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

export const SAMPLE_REVIEWS = [
  {
    id: "rev_001",
    requestId: "req_002",
    userId: "usr_cust_002",
    userName: "Sarah Jenkins",
    partnerId: "usr_part_002",
    partnerName: "Vikram Singh",
    rating: 5,
    comment: "Lifesaver! Arrived in under 18 minutes on the highway. Professional safety equipment and dispensing funnel.",
    createdAt: new Date(Date.now() - 86400000 * 2 + 1000 * 60 * 30).toISOString()
  },
  {
    id: "rev_002",
    requestId: "req_003",
    userId: "usr_cust_001",
    userName: "Alex Mercer",
    partnerId: "usr_part_001",
    partnerName: "Rajesh Kumar",
    rating: 5,
    comment: "Prompt roadside service. Highly recommend the app for any stranded motorists.",
    createdAt: new Date(Date.now() - 86400000 * 5 + 1000 * 60 * 25).toISOString()
  }
];
