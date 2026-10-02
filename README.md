# FuelRescue – Emergency Fuel Delivery and Roadside Assistance Platform
> **B.Tech Computer Science & Engineering Final-Year Capstone Project**  
> An autonomous on-demand roadside assistance prototype connecting stranded motorists with certified rapid-response mobile fuel delivery partners.

---

## 🌟 Executive Summary
**FuelRescue** is a production-style web application built to eliminate the danger, delay, and extortion faced by motorists stranded with an empty tank on highways or city streets. Utilizing **React 18, Vite, Firebase, and Google Maps Platform**, the platform performs automated nearest-partner proximity dispatch using the Haversine spherical distance formula, sub-meter breakdown localization, live route tracking, payment simulation, and multi-role administration.

> ⚠️ **Academic Simulation Notice & PESO Statutory Compliance:**  
> FuelRescue is designed strictly as an academic prototype for university evaluation. In compliance with the **Petroleum Act (1934)** and **Petroleum and Explosives Safety Organization (PESO)** regulations, actual commercial transport and dispensing of Class A (Petrol) and Class B (Diesel) fuels must only be conducted through legally licensed Oil Marketing Companies (OMCs) and certified mobile refuelers.

---

## 🚀 Key Features

### 1. Multi-Role System Architecture
* **Customer Portal:** 1-Click emergency fuel dispatch, Google Places Autocomplete search, draggable marker confirmation, live GPS route radar with ETA, simulated UPI/Card checkout, invoice download, and 1–5 star partner ratings.
* **Delivery Partner Hub:** Real-time Online/Busy/Offline toggle, incoming dispatch alerts with distance & customer notes, Accept/Reject cascade, turn-by-turn Google Maps navigation, step-by-step status transitions (`ACCEPTED` &rarr; `ON_THE_WAY` &rarr; `ARRIVED` &rarr; `COMPLETED`), and payout history.
* **Admin Control Center:** System KPIs (Total Users, Active Partners, Daily Calls, Fulfilled, Cancelled, Revenue), interactive Recharts graphs, user account moderation (activate/deactivate), partner KYC verification, and 1-Click Sample Database Seeding.

### 2. Google Maps Platform Native Integration
* **Google Maps JavaScript API:** Interactive dark-mode emergency radar map.
* **Google Places API / Autocomplete:** Auto-suggest street addresses, highway intersections, and landmarks.
* **Google Directions Service:** Render driving route between partner and stranded motorist.
* **Browser Geolocation API:** 1-Tap GPS pinpointing with error handling for denied permissions.
* **Haversine Proximity Algorithm:** Spherical distance calculation ranking nearest available units.

### 3. Payment Simulation (Ready for Razorpay Integration)
* Support for **Demo UPI**, **Demo Credit/Debit Card**, and **Cash on Dispensing**.
* Generates structured transaction IDs and downloadable tax receipts.
* Modular service layer architected for production Razorpay / Stripe webhook replacement.

---

## 🛠️ Technology Stack
* **Frontend:** React 18.3, Vite 5.4, HTML5, CSS3, Tailwind CSS 3.4
* **Backend:** Firebase (Authentication, Cloud Firestore, Firebase Storage)
* **Maps & Location:** Google Maps Platform (`@googlemaps/js-api-loader`, Places, Directions, Geocoding)
* **Data Visualization:** Recharts 2.12
* **Icons:** Lucide React
* **State Management:** React Context API (`AuthContext`, `EmergencyRequestContext`, `NotificationContext`)

---

## 📁 Project Directory Structure
```
fuelrescue/
├── .env.example               # Environment variables template
├── .env                       # Local environment file
├── firestore.rules            # Production Cloud Firestore security rules
├── index.html                 # Main HTML entry with Google fonts
├── package.json               # Project manifest and scripts
├── postcss.config.js          # PostCSS configuration
├── tailwind.config.js         # Tailwind styling with emergency glow palette
├── vite.config.js             # Vite development server config
├── PROJECT_DOCUMENTATION.md   # Complete 20-chapter B.Tech CSE Project thesis
├── src/
│   ├── App.jsx                # Main application routes & role protection
│   ├── main.jsx               # React DOM entry
│   ├── index.css              # Global styles, animations & glassmorphism
│   ├── components/
│   │   ├── common/
│   │   │   ├── Navbar.jsx            # Role-aware nav with 1-click demo switcher
│   │   │   ├── Footer.jsx            # Legal disclaimers & statutory hotline
│   │   │   ├── GoogleMapPicker.jsx   # Interactive map pin picker + Autocomplete
│   │   │   ├── GoogleMapTracker.jsx  # Moving partner vehicle radar on route
│   │   │   ├── StatusTimeline.jsx    # 6-stage emergency progress component
│   │   │   ├── PaymentModal.jsx      # Simulated UPI, Card, and Cash gateway
│   │   │   ├── RatingModal.jsx       # 1-5 star review submission dialog
│   │   │   └── ProtectedRoute.jsx    # Role-based route guard
│   │   └── landing/
│   │       ├── HeroSection.jsx
│   │       ├── HowItWorks.jsx
│   │       ├── FeaturesSection.jsx
│   │       ├── SafetyCompliance.jsx  # PESO safety compliance standards
│   │       ├── ServiceAreasSection.jsx
│   │       └── FAQSection.jsx
│   ├── context/
│   │   ├── AuthContext.jsx           # User session & evaluation role switcher
│   │   ├── EmergencyRequestContext.jsx # Active dispatch lifecycle & listeners
│   │   └── NotificationContext.jsx   # In-app toasts & alert tray
│   ├── firebase/
│   │   ├── config.js          # Resilient Firebase loader with fallback detection
│   │   ├── services.js        # Auth, Firestore CRUD, and live snapshot sync
│   │   ├── mockStore.js       # Local prototype storage engine (zero-crash mode)
│   │   └── seedData.js        # Comprehensive Bangalore urban test records
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── auth/
│   │   │   ├── LoginPage.jsx         # Includes 1-Click Fast-Track Demo Logins
│   │   │   ├── RegisterPage.jsx      # Customer & Delivery Partner registration
│   │   │   └── ForgotPasswordPage.jsx
│   │   ├── customer/
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── EmergencyRequestPage.jsx
│   │   │   ├── RequestTrackingPage.jsx
│   │   │   ├── OrderHistoryPage.jsx
│   │   │   └── HelpSupportPage.jsx
│   │   ├── partner/
│   │   │   ├── PartnerDashboard.jsx
│   │   │   ├── ActiveDeliveryPage.jsx
│   │   │   └── PartnerHistoryPage.jsx
│   │   └── admin/
│   │       ├── AdminDashboard.jsx
│   │       ├── UserManagementPage.jsx
│   │       ├── PartnerManagementPage.jsx
│   │       ├── RequestManagementPage.jsx
│   │       └── AdminSettingsPage.jsx
│   └── services/
│       ├── mapsService.js     # Google Maps loader, Places, Haversine formula
│       ├── dispatchService.js # Proximity discovery, nearest-neighbor matching
│       └── paymentService.js  # Transaction tokenization & receipt simulation
```

---

## ⚙️ Configuration & Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` with your Firebase and Google Cloud keys:
```env
# Firebase Cloud Suite (https://console.firebase.google.com)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google Maps Platform (https://console.cloud.google.com)
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### Required Google Maps Platform APIs:
Enable the following APIs in **Google Cloud Console &rarr; APIs & Services &rarr; Library**:
1. **Maps JavaScript API** (Interactive vector map rendering)
2. **Places API** (Places Autocomplete and landmark lookups)
3. **Geocoding API** (Reverse coordinate-to-address translation)
4. **Directions API** (Live routing between partner and motorist)

### Recommended API Key Restrictions:
* **Application Restriction:** HTTP Referrers (`localhost:3000/*` and your production domain).
* **API Restriction:** Restrict strictly to the 4 APIs above to prevent quota abuse.

---

## 🔒 Firebase Cloud Firestore Security Rules
Deploy `firestore.rules` via Firebase CLI:
```bash
firebase deploy --only firestore:rules
```
The rules ensure:
* Public read access to verified partners and operational service areas.
* Users can only read/edit their own profiles and requests.
* Customers **cannot elevate their role to `ADMIN`** from the client application.
* Only assigned partners or administrators can update dispatch lifecycle statuses.

---

## 🔑 Initializing the First Administrator Securely
To set up a verified Administrator:
1. Register a standard account with email: `admin@fuelrescue.demo`.
2. Open the **Firebase Console &rarr; Cloud Firestore &rarr; `users` collection**.
3. Locate the user document and edit: `role: "ADMIN"`.
4. (Optional) Run the Firebase Admin SDK to attach custom claim `{ "role": "ADMIN" }`.

---

## 🚀 Installation & Running Locally

### Prerequisites:
* Node.js v18+ or v20+ LTS
* npm v9+

### Commands:
```bash
# 1. Clone repository
git clone https://github.com/your-username/fuelrescue.git
cd fuelrescue

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open in browser
http://localhost:3000
```

---

## 🎓 1-Click Fast-Track Demo Accounts (For Viva & Evaluation)
For instant evaluative demonstrations, the application includes a **Demo Role Switcher** dropdown in the top navbar and 1-Click sign-in buttons on the `/login` page:

| Role | Demo Email | Access Privileges |
| :--- | :--- | :--- |
| **Customer** | `customer@fuelrescue.demo` | Request fuel, drag map pin, live radar tracking, orders, reviews |
| **Delivery Partner** | `partner@fuelrescue.demo` | Online/Offline toggle, incoming breakdown radar, Google navigation |
| **Administrator** | `admin@fuelrescue.demo` | Telemetry KPIs, Recharts graphs, partner audits, database seeder |

> 💡 **Tip for Evaluators:** Open **Admin &rarr; Settings** and click **"Seed Sample Database Now"** to instantly populate realistic active dispatches, partners, orders, and reviews.

---

## 🧪 Testing Checklist
- [x] **Authentication:** Email/Password registration, login, logout, and password recovery.
- [x] **Role Guarding:** Non-admin accounts blocked from `/admin`; non-partners blocked from `/partner`.
- [x] **Google Maps Picker:** Places Autocomplete, Geolocation detection, draggable marker.
- [x] **Dispatch Engine:** Haversine formula calculates distance; partner auto-assigned within 25km.
- [x] **Live Radar:** Partner vehicle simulation moves along path towards customer.
- [x] **Status Progression:** `PENDING` &rarr; `ASSIGNED` &rarr; `ACCEPTED` &rarr; `ON_THE_WAY` &rarr; `ARRIVED` &rarr; `COMPLETED`.
- [x] **Payment Checkout:** Demo UPI, Card, and Cash flows with receipts.
- [x] **Review System:** 1–5 star rating submission logged to partner profile.

---

## 📈 Future Business Expansion
* **OMC Franchise Partnership:** Integration with Indian Oil, Bharat Petroleum, Shell.
* **OBD-II IoT Integration:** Automatic low-fuel alert before engine stall.
* **Micro-Warehousing:** Fast-dispense battery & fuel lockers in highway toll plazas.
* **Fleet Management API:** Corporate accounts for logistics and commercial transport fleets.

---

## 📜 Authors & Academic Citation
* **Project Team:** Final Year B.Tech Computer Science & Engineering
* **Project Title:** FuelRescue – Emergency Fuel Delivery and Roadside Assistance Platform
* **Academic Year:** 2026
