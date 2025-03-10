import React, { createContext, useContext, useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing user in local storage
    const checkUser = async () => {
      try {
        const storedUser = await ipcRenderer.invoke('get-user');
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        console.error('Error checking user:', err);
      } finally {
        setLoading(false);
      }
    };

    checkUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const userData = await ipcRenderer.invoke('login', { email, password });
      await ipcRenderer.invoke('set-current-user', userData);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (email, password) => {
    try {
      setError(null);
      const userData = await ipcRenderer.invoke('register', { email, password });
      await ipcRenderer.invoke('set-current-user', userData);
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await ipcRenderer.invoke('logout');
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
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