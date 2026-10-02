import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  UserCheck, 
  UserX, 
  ShieldCheck, 
  ShieldX, 
  ShieldAlert, 
  Mail, 
  Phone, 
  Calendar, 
  Lock, 
  X, 
  Crown,
  Eye,
  Trash2,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  Copy,
  Check,
  Shield
} from 'lucide-react';
import { adminService, MAIN_ADMIN_EMAIL } from '../../firebase/services';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function UserManagementPage() {
  const { currentUser } = useAuth();
  const { addNotification } = useNotifications();

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null); // When admin asks for user details
  const [userToDelete, setUserToDelete] = useState(null); // When admin wants to delete user
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const u = await adminService.getUsers();
        if (isMounted) {
          setUsers(Array.isArray(u) ? u : []);
        }
      } catch (e) {
        console.warn("Failed to load users:", e);
        if (isMounted) {
          setUsers([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    try {
      navigator.clipboard.writeText(String(text));
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (e) {}
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString();
    } catch (e) {
      return "N/A";
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "Initial System Seed";
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleString();
    } catch (e) {
      return "Initial System Seed";
    }
  };

  const handleToggleActive = async (user) => {
    if (!user) return;
    const userEmail = String(user.email || '').toLowerCase();
    if (userEmail === MAIN_ADMIN_EMAIL.toLowerCase()) {
      alert("The Main Administrator account cannot be deactivated.");
      return;
    }
    const nextState = !user.isActive;
    setActionLoading(true);
    try {
      await adminService.toggleUserStatus(user.id, nextState);
      setUsers(prev => (Array.isArray(prev) ? prev : []).map(u => u.id === user.id ? { ...u, isActive: nextState } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? ({ ...prev, isActive: nextState }) : null);
      }
      addNotification({
        type: nextState ? 'success' : 'emergency',
        title: nextState ? 'Account Activated' : 'Account Suspended',
        message: `${user.name || 'User'} has been ${nextState ? 're-activated' : 'suspended'}.`
      });
    } catch (err) {
      alert(err.message || "Failed to update account status.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleAdminAccess = async (user, shouldApprove) => {
    if (!user) return;
    const userEmail = String(user.email || '').toLowerCase();
    if (userEmail === MAIN_ADMIN_EMAIL.toLowerCase()) {
      alert("The Main Administrator permissions cannot be modified.");
      return;
    }

    setActionLoading(true);
    try {
      const updates = await adminService.updateUserAdminAccess(user.id, shouldApprove, currentUser?.email);
      setUsers(prev => (Array.isArray(prev) ? prev : []).map(u => u.id === user.id ? { ...u, ...updates } : u));
      if (selectedUser?.id === user.id) {
        setSelectedUser(prev => prev ? ({ ...prev, ...updates }) : null);
      }
      addNotification({
        type: shouldApprove ? 'success' : 'info',
        title: shouldApprove ? 'Admin Privilege Granted' : 'Admin Privilege Revoked',
        message: `${user.name || 'User'} ${shouldApprove ? 'can now access the Admin Dashboard.' : 'admin access has been removed.'}`
      });
    } catch (err) {
      alert(err.message || "Failed to update admin permissions.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUserClick = (user) => {
    if (!user) return;
    const userEmail = String(user.email || '').toLowerCase();
    if (userEmail === MAIN_ADMIN_EMAIL.toLowerCase()) {
      alert("Security Violation: The Root Main Administrator account cannot be deleted.");
      return;
    }
    setUserToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    const userEmail = String(userToDelete.email || '').toLowerCase();
    if (userEmail === MAIN_ADMIN_EMAIL.toLowerCase()) {
      alert("Security Violation: The Root Main Administrator account cannot be deleted.");
      setUserToDelete(null);
      return;
    }

    setDeleteLoading(true);
    try {
      await adminService.deleteUser(userToDelete.id, currentUser?.email);
      setUsers(prev => (Array.isArray(prev) ? prev : []).filter(u => u.id !== userToDelete.id));
      if (selectedUser?.id === userToDelete.id) {
        setSelectedUser(null);
      }
      addNotification({
        type: 'emergency',
        title: 'User Permanently Deleted',
        message: `Account for ${userToDelete.name || 'User'} (${userToDelete.email || userToDelete.id}) has been permanently deleted from Cloud Firestore and the platform.`
      });
      setUserToDelete(null);
    } catch (err) {
      alert("Failed to delete user: " + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const userList = Array.isArray(users) ? users : [];
  const queryStr = String(search || '').toLowerCase().trim();

  const filteredUsers = userList.filter(u => {
    if (!u) return false;
    const name = String(u.name || '').toLowerCase();
    const email = String(u.email || '').toLowerCase();
    const id = String(u.id || u.uid || '').toLowerCase();
    const phone = String(u.phone || '');
    const matchesSearch = !queryStr || name.includes(queryStr) || email.includes(queryStr) || id.includes(queryStr) || phone.includes(queryStr);
    
    if (roleFilter === 'APPROVED_ADMINS') {
      return matchesSearch && (u.adminAccessApproved === true || u.role === 'ADMIN');
    }
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Plus_Jakarta_Sans']">
              User Directory & Permissions
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1">
              <Crown className="w-3 h-3 text-amber-400" />
              Main Admin: {MAIN_ADMIN_EMAIL}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Privacy-Protected Directory: Personal details are concealed by default. Click <span className="text-brand-400 font-semibold">"View Details"</span> to inspect an individual user dossier or delete accounts.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ask for user by name, email, UID..."
              className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="ALL">All Roles</option>
            <option value="APPROVED_ADMINS">Approved Admins Only</option>
            <option value="CUSTOMER">Customers</option>
            <option value="DELIVERY_PARTNER">Delivery Partners</option>
            <option value="ADMIN">Administrators</option>
          </select>
        </div>
      </div>

      {/* Privacy Notice Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4" />
          </div>
          <div className="text-xs">
            <p className="font-bold text-white flex items-center gap-2">
              Privacy Protection Active (Confidential Record Access)
            </p>
            <p className="text-slate-400 mt-0.5">
              Personal contact data (verified emails, phone numbers, security hashes) is concealed. Only when the Administrator explicitly requests/asks for user details will the confidential profile be shown.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Encrypted Storage</span>
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-brand-400" />
            <span>Loading user directory...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No users match your query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 border-b border-slate-800">
                  <th className="pb-3 font-semibold">User</th>
                  <th className="pb-3 font-semibold">Personal Details (PII)</th>
                  <th className="pb-3 font-semibold">System Role</th>
                  <th className="pb-3 font-semibold">Admin Access Status</th>
                  <th className="pb-3 font-semibold">Account Status</th>
                  <th className="pb-3 font-semibold text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((u, idx) => {
                  if (!u) return null;
                  const userId = u.id ? String(u.id) : (u.uid ? String(u.uid) : `usr_${idx}`);
                  const userEmail = u.email ? String(u.email) : '';
                  const userName = u.name ? String(u.name) : 'User';
                  const userRole = u.role ? String(u.role) : 'CUSTOMER';
                  const isMainAdmin = userEmail.toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase();
                  const isApprovedAdmin = isMainAdmin || (userRole === 'ADMIN' && u.adminAccessApproved === true);

                  return (
                    <tr key={userId} className="hover:bg-slate-800/40 transition">
                      {/* User Column */}
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <img 
                            src={u.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                            alt={userName}
                            className="w-8 h-8 rounded-xl object-cover border border-slate-700" 
                          />
                          <div>
                            <p className="font-bold text-white flex items-center gap-1.5">
                              {userName}
                              {isMainAdmin && <Crown className="w-3 h-3 text-amber-400 shrink-0" />}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              UID: {userId.length > 6 ? userId.slice(-6) : userId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Confidential Details Column (Concealed by default unless asked) */}
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Lock className="w-3 h-3 text-slate-500" />
                            <span>•••••••••••• (Hidden)</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedUser(u)}
                            className="px-2.5 py-1 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[11px] font-bold transition flex items-center gap-1"
                            title="Ask / View confidential details for this user"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Details</span>
                          </button>
                        </div>
                      </td>

                      {/* System Role */}
                      <td className="py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          userRole === 'ADMIN' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                          userRole === 'DELIVERY_PARTNER' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                        }`}>
                          {userRole}
                        </span>
                      </td>

                      {/* Admin Access Status */}
                      <td className="py-3">
                        {isMainAdmin ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 w-max">
                            <Crown className="w-3 h-3 text-amber-400" />
                            ROOT MAIN ADMIN
                          </span>
                        ) : isApprovedAdmin ? (
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1 w-max">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            ADMIN (APPROVED)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700/60 w-max">
                            NO ADMIN ACCESS
                          </span>
                        )}
                      </td>

                      {/* Account Status */}
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {u.isActive !== false ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>

                      {/* Admin Actions */}
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Admin Access Permission Toggle */}
                          {!isMainAdmin && (
                            isApprovedAdmin ? (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleToggleAdminAccess(u, false)}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold transition"
                                title="Revoke Admin Access"
                              >
                                Revoke
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => handleToggleAdminAccess(u, true)}
                                className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition flex items-center gap-1"
                                title="Grant permission to access Admin Dashboard"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Approve
                              </button>
                            )
                          )}

                          {/* Account Active Toggle */}
                          {!isMainAdmin && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleToggleActive(u)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                                u.isActive !== false
                                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              }`}
                            >
                              {u.isActive !== false ? 'Suspend' : 'Activate'}
                            </button>
                          )}

                          {/* Delete User Button */}
                          {!isMainAdmin ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteUserClick(u)}
                              className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition"
                              title="Permanently Delete User Account"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-400 font-bold px-2 py-1 bg-amber-500/10 rounded-lg border border-amber-500/20">
                              Protected
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. ADMIN ASKS FOR USER DETAILS: CONFIDENTIAL DETAILS DOSSIER   */}
      {/* (Only shown when admin explicitly asks for details; else no)   */}
      {/* ============================================================== */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider">
                      Admin Authorized Dossier
                    </span>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      Live Firestore Verified
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                    <span>User Details & Security Record</span>
                    {String(selectedUser.email || '').toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase() && (
                      <Crown className="w-4 h-4 text-amber-400" />
                    )}
                  </h3>
                </div>
              </div>

              <button 
                onClick={() => setSelectedUser(null)} 
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
                title="Close Dossier"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Avatar & Identity */}
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              <img 
                src={selectedUser.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80"} 
                alt={selectedUser.name || 'User'}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500/40 shadow-glow"
              />
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                  {selectedUser.name || 'User'}
                  {String(selectedUser.email || '').toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase() && (
                    <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-mono border border-amber-500/40">
                      Root Admin
                    </span>
                  )}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedUser.role === 'ADMIN' ? 'bg-purple-500/20 text-purple-300' :
                    selectedUser.role === 'DELIVERY_PARTNER' ? 'bg-blue-500/20 text-blue-300' :
                    'bg-brand-500/20 text-brand-300'
                  }`}>
                    {selectedUser.role || 'CUSTOMER'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    selectedUser.isActive !== false ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {selectedUser.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                  </span>
                </div>
              </div>
            </div>

            {/* Confidential User Information Grid (Revealed only because admin asked) */}
            <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              {/* Verified Email */}
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-brand-400" />
                  Verified Email:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white font-mono">{selectedUser.email || "No email"}</span>
                  {selectedUser.email && (
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedUser.email, 'email')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Copy Email"
                    >
                      {copiedField === 'email' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Verified Phone */}
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-brand-400" />
                  Mobile Contact:
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">{selectedUser.phone || "Not provided"}</span>
                  {selectedUser.phone && (
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedUser.phone, 'phone')}
                      className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                      title="Copy Phone"
                    >
                      {copiedField === 'phone' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Firestore Account ID */}
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Account UID:</span>
                <span className="font-mono text-slate-300 text-[11px]">{selectedUser.id ? String(selectedUser.id) : "N/A"}</span>
              </div>

              {/* Admin Dashboard Access Status */}
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400">Admin Dashboard Access:</span>
                {String(selectedUser.email || '').toLowerCase() === MAIN_ADMIN_EMAIL.toLowerCase() ? (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    Permanent Root Main Admin
                  </span>
                ) : selectedUser.adminAccessApproved || selectedUser.role === 'ADMIN' ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Approved by Administrator
                  </span>
                ) : (
                  <span className="text-slate-400">No Admin Access</span>
                )}
              </div>

              {/* Registration Timestamp */}
              <div className="flex justify-between items-center py-1.5 border-b border-slate-800/60">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Registration Date:
                </span>
                <span className="text-white font-medium">
                  {formatDateTime(selectedUser.createdAt)}
                </span>
              </div>

              {/* Security Status */}
              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-400">Credential Security:</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Firebase Bcrypt Hash Protected
                </span>
              </div>
            </div>

            {/* Management & Delete Controls */}
            <div className="pt-2 border-t border-slate-800 space-y-2.5">
              {String(selectedUser.email || '').toLowerCase() !== MAIN_ADMIN_EMAIL.toLowerCase() ? (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Admin Access Permission Toggle */}
                    {selectedUser.adminAccessApproved || selectedUser.role === 'ADMIN' ? (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleToggleAdminAccess(selectedUser, false)}
                        className="py-2.5 px-3 rounded-xl font-bold text-xs bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldX className="w-4 h-4 text-amber-400" />
                        <span>Revoke Admin</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => handleToggleAdminAccess(selectedUser, true)}
                        className="py-2.5 px-3 rounded-xl font-bold text-xs bg-purple-600 hover:bg-purple-700 text-white shadow-glow transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Approve Admin</span>
                      </button>
                    )}

                    {/* Suspend / Reactivate */}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleToggleActive(selectedUser)}
                      className={`py-2.5 px-3 rounded-xl font-bold text-xs transition ${
                        selectedUser.isActive !== false
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                          : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                      }`}
                    >
                      {selectedUser.isActive !== false ? 'Suspend Account' : 'Re-Activate Account'}
                    </button>
                  </div>

                  {/* Permanently Delete User Action */}
                  <button
                    type="button"
                    onClick={() => handleDeleteUserClick(selectedUser)}
                    className="w-full py-2.5 rounded-xl font-bold text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-4 h-4 text-rose-400" />
                    <span>Permanently Delete User Account</span>
                  </button>
                </>
              ) : (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs text-center font-semibold flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Default Root Main Administrator is immutable and protected from deletion.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. CONFIRM USER PERMANENT DELETION MODAL                       */}
      {/* ============================================================== */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  Permanently Delete User?
                </h3>
                <p className="text-xs text-rose-400 font-semibold">
                  This action is irreversible
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
              <p className="text-slate-300">
                Are you sure you want to permanently delete user account:
              </p>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-white">
                <div className="font-bold text-xs">{userToDelete.name || 'User'}</div>
                <div className="text-[11px] text-slate-400">{userToDelete.email || userToDelete.id}</div>
                <div className="text-[10px] text-brand-400 mt-0.5">Role: {userToDelete.role || 'CUSTOMER'}</div>
              </div>
              <p className="text-[11px] text-slate-400">
                This will delete their user record, Firestore documents, and platform authentication credentials permanently.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                disabled={deleteLoading}
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteLoading}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Yes, Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
