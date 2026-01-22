import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState('all');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const savedBrand = localStorage.getItem('selectedBrand');

    if (savedTheme) {
      setIsDark(savedTheme === 'dark');
    }
    // Sanitize: ensure savedBrand is valid (not 'undefined', 'null', or empty)
    if (savedBrand && savedBrand !== 'undefined' && savedBrand !== 'null') {
      setSelectedBrand(savedBrand);
    } else {
      // Clean up corrupted localStorage
      localStorage.setItem('selectedBrand', 'all');
    }
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const changeBrand = (brandId) => {
    console.log("Changing brand to:", brandId);
    const validId = brandId ? String(brandId) : 'all';
    setSelectedBrand(validId);
    localStorage.setItem('selectedBrand', validId);
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, selectedBrand, changeBrand }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};