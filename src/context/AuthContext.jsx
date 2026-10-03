import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../firebase/services';
import { mockStore } from '../firebase/mockStore';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => mockStore.getSession() || null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const existing = mockStore.getSession();
    if (existing) {
      setCurrentUser(existing);
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await authService.login(email, password);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setAuthError(null);
    try {
      const user = await authService.register(userData);
      setCurrentUser(user);
      return user;
    } catch (err) {
      setAuthError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updatedFields) => {
    if (!currentUser) return null;
    const targetId = currentUser.id || currentUser.uid;
    const updated = await userService.updateProfile(targetId, updatedFields);
    setCurrentUser(updated);
    return updated;
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  };

  const isRole = (role) => currentUser?.role === role;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        authError,
        login,
        register,
        updateUserProfile,
        logout,
        isRole,
        isAuthenticated: Boolean(currentUser)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
