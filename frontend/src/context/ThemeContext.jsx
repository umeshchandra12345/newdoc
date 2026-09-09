import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
  PEARL: 'pearl',         // Rolls-Royce Ghost Pearl & Rare Rabbit Cashmere Gold (Ultra-Attractive Light Default)
  TITANIUM: 'titanium',   // Crisp Modern Executive Ice Light
  CHAMPAGNE: 'champagne', // Rare Rabbit Ecru & Warm Sand Luxury Light
  ROYCE: 'royce',         // Rolls-Royce Midnight Black Badge (Optional Dark)
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Clear any dark theme previously stored so the light theme takes effect immediately
    const saved = localStorage.getItem('app_theme');
    if (saved === 'royce' || saved === 'obsidian' || saved === 'emerald') {
      return THEMES.PEARL;
    }
    return saved || THEMES.PEARL;
  });

  const [brandName, setBrandName] = useState(() => {
    return localStorage.getItem('app_brand_name') || 'Aetheris Bespoke';
  });

  const [brandTagline, setBrandTagline] = useState(() => {
    return localStorage.getItem('app_brand_tagline') || 'QUIET LUXURY ENVIRONMENTAL INTELLIGENCE';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app_brand_name', brandName);
  }, [brandName]);

  useEffect(() => {
    localStorage.setItem('app_brand_tagline', brandTagline);
  }, [brandTagline]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === THEMES.PEARL) return THEMES.TITANIUM;
      if (prev === THEMES.TITANIUM) return THEMES.CHAMPAGNE;
      return THEMES.PEARL;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        brandName,
        setBrandName,
        brandTagline,
        setBrandTagline,
        THEMES,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
