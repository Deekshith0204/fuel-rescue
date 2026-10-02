import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ShieldX, UserCheck } from 'lucide-react';
import { MAIN_ADMIN_EMAIL } from '../../firebase/services';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Verifying FuelRescue role credentials...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 1. Role mismatch check
  if (allowedRoles.length > 0 && !allowedRoles.includes(currentUser.role)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Access Restricted</h3>
            <p className="text-xs text-slate-400 mt-2">
              Your active account role is <span className="text-brand-400 font-bold">[{currentUser.role}]</span>. You do not possess permissions to access this specialized dashboard.
            </p>
          </div>
          <div className="pt-2">
            <NavigateToRoleDashboard role={currentUser.role} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Specific Admin Approval Verification
  // Only the Main Admin (ddk115070@gmail.com) and admin-approved users can access the Admin Dashboard
  if (allowedRoles.includes('ADMIN') && currentUser.role === 'ADMIN') {
    const isMainAdmin = currentUser.email?.trim().toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase();
    const isApprovedAdmin = currentUser.adminAccessApproved === true || isMainAdmin;

    if (!isApprovedAdmin) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center p-4">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-amber-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto">
              <ShieldX className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">Admin Approval Required</h3>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                Your account is currently pending administrative verification. Only users explicitly approved by the Main Admin (<span className="text-brand-400 font-mono font-semibold">{MAIN_ADMIN_EMAIL}</span>) can access the Administrator Control Center.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/customer"
                className="inline-block px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition"
              >
                Return to Customer Dashboard
              </Link>
            </div>
          </div>
        </div>
      );
    }
  }

  return children;
}

function NavigateToRoleDashboard({ role }) {
  let target = "/customer";
  if (role === 'DELIVERY_PARTNER') target = "/partner";
  if (role === 'ADMIN') target = "/admin";

  return (
    <Link
      to={target}
      className="inline-block px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-glow transition"
    >
      Return to My Dashboard
    </Link>
  );
}
