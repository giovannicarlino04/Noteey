import React, { createContext, useContext, useEffect } from 'react';
const { ipcRenderer } = window.require('electron');

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = React.useState(false);

  useEffect(() => {
    // Load saved theme on startup
    const savedTheme = ipcRenderer.sendSync('get-theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }

    // Listen for theme changes
    ipcRenderer.on('theme-changed', (event, theme) => {
      setDarkMode(theme === 'dark');
    });

    return () => {
      ipcRenderer.removeAllListeners('theme-changed');
    };
  }, []);

  const toggleTheme = () => {
    const newTheme = darkMode ? 'light' : 'dark';
    ipcRenderer.send('toggle-theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 