import React, { createContext, useContext, useState, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in local storage
    const storedUser = ipcRenderer.sendSync('get-user');
    if (storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // In a real app, you would validate credentials here
    // For demo purposes, we'll just create a simple user object
    const userData = {
      id: '1',
      email,
      name: email.split('@')[0]
    };
    
    ipcRenderer.send('save-user', userData);
    setUser(userData);
    return userData;
  };

  const register = async (email, password) => {
    // In a real app, you would create a new user account here
    // For demo purposes, we'll just create a simple user object
    const userData = {
      id: '1',
      email,
      name: email.split('@')[0]
    };
    
    ipcRenderer.send('save-user', userData);
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    ipcRenderer.send('clear-user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading
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