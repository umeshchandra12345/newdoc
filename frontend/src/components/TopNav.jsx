import React from 'react';
import { Search, Bell, Menu, Moon, Sun, Sparkles, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';

const TopNav = ({ title, searchTerm, onSearchChange, reportingYear, onYearChange, onToggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    if (theme === THEMES.ROYCE) return <Crown size={14} color="#C8A97E" />;
    if (theme === THEMES.OBSIDIAN) return <Moon size={14} color="#00F5A0" />;
    if (theme === THEMES.TITANIUM) return <Sun size={14} color="#0284C7" />;
    return <Sparkles size={14} color="#10B981" />;
  };

  const getThemeLabel = () => {
    if (theme === THEMES.ROYCE) return 'Royce Bespoke';
    if (theme === THEMES.OBSIDIAN) return 'Aurora Cyber';
    if (theme === THEMES.TITANIUM) return 'Titanium Luxe';
    return 'Matrix Emerald';
  };

  return (
    <header className="top-nav">
      <div className="top-nav-left">
        <button
          className="icon-button mobile-only"
          onClick={onToggleSidebar}
          style={{ display: 'none' }}
          aria-label="Toggle menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="page-title">{title}</h1>
        {onSearchChange && (
          <div className="top-nav-search">
            <Search size={16} className="search-icon-pos" />
            <input
              type="text"
              placeholder="Search emissions, scopes, sites..."
              value={searchTerm || ''}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            <span className="search-shortcut-badge">⌘K</span>
          </div>
        )}
      </div>

      <div className="top-nav-right">
        {/* Real-time Carbon Budget Gauge */}
        <div className="telemetry-capsule" title="Calculated live from Scope 1-3 annual emissions vs baseline target">
          <div className="telemetry-dot" />
          <span>Carbon Cap: <strong>82.4%</strong> <span style={{ color: 'var(--color-emerald)', fontSize: '11px', fontWeight: 800 }}>OPTIMAL</span></span>
        </div>

        {/* Theme Switcher Button */}
        <button
          className="theme-switch-btn"
          onClick={toggleTheme}
          title={`Active Aesthetic: ${getThemeLabel()}. Click to switch luxury theme.`}
        >
          {getThemeIcon()}
          <span>{getThemeLabel()}</span>
        </button>

        {/* Organization Badge */}
        <div className="org-indicator">
          <span className="org-name">Nexgile Industrial Systems</span>
          <span className="org-badge">ISO 14064-1 & SBTi 1.5°C</span>
        </div>

        {/* Reporting Year Selector */}
        <div className="year-select-wrap">
          <select
            value={reportingYear || 2026}
            onChange={(e) => onYearChange && onYearChange(Number(e.target.value))}
            aria-label="Reporting Year"
          >
            <option value={2026}>FY 2026</option>
            <option value={2025}>FY 2025</option>
            <option value={2024}>FY 2024</option>
          </select>
        </div>

        <button className="icon-button" title="Environmental Alerts (2 Unread)" aria-label="Notifications">
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
};

export default TopNav;
