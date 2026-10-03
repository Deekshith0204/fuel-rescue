import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Fuel, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  UserCheck, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  User, 
  Truck, 
  LayoutDashboard, 
  History, 
  HelpCircle,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useEmergencyRequest } from '../../context/EmergencyRequestContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { inbox, markAllRead } = useNotifications();
  const { activeRequest } = useEmergencyRequest();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const unreadCount = inbox.filter(n => !n.read).length;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <Fuel className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1 font-['Plus_Jakarta_Sans']">
                  Fuel<span className="text-brand-500">Rescue</span>
                </span>
                <span className="block text-[10px] text-slate-500 dark:text-slate-400 -mt-1 tracking-wider uppercase font-semibold">
                  Roadside Emergency
                </span>
              </div>
            </Link>

            {/* Network Active Badge */}
            <div className="hidden lg:flex items-center gap-1.5 ml-4 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              24/7 Roadside Network Live
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {currentUser?.role === 'CUSTOMER' && (
              <>
                <Link
                  to="/customer"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/emergency"
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    isActive('/customer/emergency') 
                      ? 'bg-brand-500 text-white shadow-glow' 
                      : 'bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/30 hover:bg-brand-500 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Request Fuel
                </Link>
                {activeRequest && (
                  <Link
                    to="/customer/tracking"
                    className="relative px-3 py-2 rounded-lg text-sm font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Live Tracking
                  </Link>
                )}
                <Link
                  to="/customer/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/orders') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  to="/customer/help"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/help') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Help
                </Link>
              </>
            )}

            {currentUser?.role === 'DELIVERY_PARTNER' && (
              <>
                <Link
                  to="/partner"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/partner') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Partner Dashboard
                </Link>
                <Link
                  to="/partner/active"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/partner/active') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Active Delivery
                </Link>
                <Link
                  to="/partner/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/partner/history') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Deliveries & Earnings
                </Link>
              </>
            )}

            {currentUser?.role === 'ADMIN' && (
              <>
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Admin Analytics
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/users') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/partners"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/partners') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Partners
                </Link>
                <Link
                  to="/admin/requests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/requests') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Fuel Requests
                </Link>
                <Link
                  to="/admin/settings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/settings') ? 'bg-orange-500/10 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  Settings
                </Link>
              </>
            )}
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-3">
            {/* User Account / Role Badge & Profile Link */}
            {currentUser && (
              <Link
                to="/profile"
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:border-brand-500/60 hover:bg-slate-800 transition group"
                title="View & Edit Profile"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center text-xs font-bold text-white group-hover:border-brand-500 transition">
                    {currentUser?.photoURL ? (
                      <img src={currentUser.photoURL} alt={currentUser.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-slate-300 group-hover:text-brand-400" />
                    )}
                  </div>
                  <span className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full ring-2 ring-slate-900 ${
                    currentUser?.role === 'ADMIN' ? 'bg-purple-500' :
                    currentUser?.role === 'DELIVERY_PARTNER' ? 'bg-blue-500' : 'bg-brand-500'
                  }`}></span>
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs text-slate-200 font-bold group-hover:text-brand-400 transition truncate max-w-[110px]">
                    {currentUser?.name || currentUser?.email?.split('@')[0]}
                  </span>
                  <span className="text-[10px] text-slate-400 leading-none">
                    {currentUser?.role === 'ADMIN' ? 'Admin' : currentUser?.role === 'DELIVERY_PARTNER' ? 'Partner' : 'Customer'}
                  </span>
                </div>
              </Link>
            )}

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setNotifDropdownOpen(!notifDropdownOpen);
                  if (!notifDropdownOpen) markAllRead();
                }}
                className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Emergency Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-slate-900"></span>
                )}
              </button>

              {/* Notification Drawer Dropdown */}
              {notifDropdownOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-4 z-50">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                    <h4 className="font-bold text-sm text-white">Notifications</h4>
                    <span className="text-xs text-slate-400">{inbox.length} total</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {inbox.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                    ) : (
                      inbox.slice(0, 6).map((item) => (
                        <div key={item.id} className="p-2.5 rounded-lg bg-slate-800/60 border border-slate-700/50 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{item.title}</span>
                            <span className="text-[10px] text-slate-400">{item.time}</span>
                          </div>
                          <p className="text-slate-300 mt-1">{item.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Light/Dark mode) */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-brand-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-slate-200 dark:border-slate-700/60 flex items-center justify-center shadow-xs"
              title={isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}
              aria-label="Toggle Theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400 hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 hover:-rotate-12 transition-transform" />
              )}
            </button>

            {/* User Profile / Logout */}
            {currentUser ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/profile"
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="My Profile & Garage"
                >
                  <User className="w-5 h-5" />
                </Link>
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-500 hover:bg-brand-600 text-white shadow-glow transition"
              >
                Sign In
              </Link>
            )}

            {/* Mobile hamburger menu toggle */}
            <div className="flex md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-2 pb-4 space-y-2 shadow-lg">
          {/* Mobile Theme Toggle Button */}
          <button
            onClick={() => {
              toggleTheme();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/60 mb-2 transition"
          >
            <span className="flex items-center gap-2">
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
              <span>{isDark ? "Switch to Light Theme" : "Switch to Dark Theme"}</span>
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold">
              {isDark ? "Dark Active" : "Light Active"}
            </span>
          </button>

          {currentUser && (
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold text-brand-500 dark:text-brand-400 bg-brand-500/10 border border-brand-500/20 hover:bg-brand-500/20 transition mb-2"
            >
              <User className="w-4 h-4" />
              <span>My Profile & Garage</span>
            </Link>
          )}
          {currentUser?.role === 'CUSTOMER' && (
            <>
              <Link to="/customer" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Customer Dashboard</Link>
              <Link to="/customer/emergency" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-500 dark:text-brand-400 bg-brand-500/10">Request Emergency Fuel</Link>
              <Link to="/customer/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Orders</Link>
              <Link to="/customer/help" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Help & Support</Link>
            </>
          )}
          {currentUser?.role === 'DELIVERY_PARTNER' && (
            <>
              <Link to="/partner" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Partner Dashboard</Link>
              <Link to="/partner/active" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Active Delivery</Link>
              <Link to="/partner/history" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Deliveries & Earnings</Link>
            </>
          )}
          {currentUser?.role === 'ADMIN' && (
            <>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Admin Dashboard</Link>
              <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Users</Link>
              <Link to="/admin/partners" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Partners</Link>
              <Link to="/admin/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Fuel Requests</Link>
              <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Settings</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
