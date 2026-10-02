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
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { useEmergencyRequest } from '../../context/EmergencyRequestContext';

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const { inbox, markAllRead } = useNotifications();
  const { activeRequest } = useEmergencyRequest();
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
    <nav className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-500 flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                <Fuel className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1 font-['Plus_Jakarta_Sans']">
                  Fuel<span className="text-brand-500">Rescue</span>
                </span>
                <span className="block text-[10px] text-slate-400 -mt-1 tracking-wider uppercase font-semibold">
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
                    isActive('/customer') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/customer/emergency"
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition ${
                    isActive('/customer/emergency') 
                      ? 'bg-brand-500 text-white shadow-glow' 
                      : 'bg-brand-500/20 text-brand-400 border border-brand-500/40 hover:bg-brand-500 hover:text-white'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  Request Fuel
                </Link>
                {activeRequest && (
                  <Link
                    to="/customer/tracking"
                    className="relative px-3 py-2 rounded-lg text-sm font-medium text-amber-400 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 transition flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                    Live Tracking
                  </Link>
                )}
                <Link
                  to="/customer/orders"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/orders') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Orders
                </Link>
                <Link
                  to="/customer/help"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/customer/help') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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
                    isActive('/partner') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Partner Dashboard
                </Link>
                <Link
                  to="/partner/active"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/partner/active') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Active Delivery
                </Link>
                <Link
                  to="/partner/history"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/partner/history') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
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
                    isActive('/admin') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Admin Analytics
                </Link>
                <Link
                  to="/admin/users"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/users') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Users
                </Link>
                <Link
                  to="/admin/partners"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/partners') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Partners
                </Link>
                <Link
                  to="/admin/requests"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/requests') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Fuel Requests
                </Link>
                <Link
                  to="/admin/settings"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                    isActive('/admin/settings') ? 'bg-slate-800 text-brand-400' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  Settings
                </Link>
              </>
            )}
          </div>

          {/* Right Header Action Items */}
          <div className="flex items-center gap-3">
            {/* User Account / Role Badge (Read-only, authentic role from auth/database) */}
            {currentUser && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-slate-800 border border-slate-700 text-slate-200">
                  <span className={`w-2 h-2 rounded-full ${
                    currentUser?.role === 'ADMIN' ? 'bg-purple-500' :
                    currentUser?.role === 'DELIVERY_PARTNER' ? 'bg-blue-500' : 'bg-brand-500'
                  }`}></span>
                  <span className="font-bold">
                    {currentUser?.role === 'ADMIN' ? 'Admin' : currentUser?.role === 'DELIVERY_PARTNER' ? 'Partner' : 'Customer'}
                  </span>
                </div>
                <span className="text-xs text-slate-300 font-medium hidden lg:inline truncate max-w-[130px]">
                  {currentUser?.name || currentUser?.email?.split('@')[0]}
                </span>
              </div>
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

            {/* User Profile / Logout */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
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
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900 px-4 pt-2 pb-4 space-y-2">
          {currentUser?.role === 'CUSTOMER' && (
            <>
              <Link to="/customer" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Customer Dashboard</Link>
              <Link to="/customer/emergency" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm font-semibold text-brand-400 bg-brand-500/10">Request Emergency Fuel</Link>
              <Link to="/customer/orders" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Orders</Link>
              <Link to="/customer/help" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Help & Support</Link>
            </>
          )}
          {currentUser?.role === 'DELIVERY_PARTNER' && (
            <>
              <Link to="/partner" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Partner Dashboard</Link>
              <Link to="/partner/active" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Active Delivery</Link>
              <Link to="/partner/history" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Deliveries & Earnings</Link>
            </>
          )}
          {currentUser?.role === 'ADMIN' && (
            <>
              <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Admin Dashboard</Link>
              <Link to="/admin/users" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Users</Link>
              <Link to="/admin/partners" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Partners</Link>
              <Link to="/admin/requests" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Fuel Requests</Link>
              <Link to="/admin/settings" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 rounded-lg text-sm text-slate-200 hover:bg-slate-800">Settings</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
