import React, { createContext, useContext, useState, useCallback } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [inbox, setInbox] = useState([
    {
      id: "notif_1",
      title: "System Ready",
      message: "FuelRescue rapid roadside emergency network active.",
      time: "Just now",
      read: false
    }
  ]);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addNotification = useCallback(({ title, message, type = 'info', duration = 5000 }) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    
    // Add to active floating toasts
    setToasts(prev => [...prev, { id, title, message, type }]);

    // Add to persistent notification inbox
    setInbox(prev => [
      {
        id,
        title,
        message,
        type,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: false
      },
      ...prev
    ]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const markAllRead = () => {
    setInbox(prev => prev.map(item => ({ ...item, read: true })));
  };

  const clearInbox = () => {
    setInbox([]);
  };

  return (
    <NotificationContext.Provider value={{ addNotification, inbox, markAllRead, clearInbox }}>
      {children}

      {/* Floating Toast Notification Container */}
      <aside aria-label="Notifications" className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-md w-full px-4 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-2xl border transition-all duration-300 animate-in slide-in-from-bottom-5 ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-100'
                : toast.type === 'emergency'
                ? 'bg-orange-950/90 border-brand-500/60 text-orange-100 emergency-pulse'
                : 'bg-slate-900/90 border-slate-700 text-slate-100'
            }`}
          >
            <div className="shrink-0 mt-0.5">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'emergency' && <Bell className="w-5 h-5 text-brand-400 animate-bounce" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1">
              <h5 className="font-semibold text-sm leading-tight">{toast.title}</h5>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </aside>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}
