import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  LayoutDashboard,
  Layers,
  Flame,
  Zap,
  Globe,
  Package,
  Users,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  FileText,
  Settings,
  LogOut,
  Radio
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { brandName, brandTagline } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Carbon Accounting', path: '/carbon-accounting', icon: Layers },
    { label: 'Scope 1', path: '/scope-1', icon: Flame },
    { label: 'Scope 2', path: '/scope-2', icon: Zap },
    { label: 'Scope 3', path: '/scope-3', icon: Globe },
    { label: 'Products', path: '/products', icon: Package },
    { label: 'Suppliers', path: '/suppliers', icon: Users },
    { label: 'AI Insights', path: '/ai-insights', icon: Sparkles },
    { label: 'Decarbonization', path: '/decarbonization', icon: TrendingDown },
    { label: 'Regulatory', path: '/regulatory', icon: ShieldCheck },
    { label: 'Reports', path: '/reports', icon: FileText },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-logo">
        <div className="logo-badge" title={brandName}>
          {/* Futuristic Geometric Prism Mark */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#05080E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 17L12 22L22 17" stroke="#05080E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M2 12L12 17L22 12" stroke="#05080E" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div className="logo-text-title" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {brandName}
          </div>
          <div className="logo-text-sub">{brandTagline}</div>
        </div>
      </div>

      {/* Live System Beacon */}
      <div style={{
        padding: '10px 18px',
        margin: '12px 14px 4px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '11.5px',
        color: '#94A3B8'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
          <Radio size={13} color="var(--color-emerald)" style={{ animation: 'pulseBeacon 2s infinite' }} />
          <span>Telemetry Stream</span>
        </div>
        <span style={{
          fontSize: '10.5px',
          fontWeight: 700,
          color: 'var(--color-emerald)',
          background: 'rgba(0, 245, 160, 0.12)',
          padding: '2px 6px',
          borderRadius: '4px'
        }}>
          99.9%
        </span>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        <div className="nav-section-title">Environmental Intelligence</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout footer */}
      <div className="sidebar-footer">
        <div className="user-profile-widget">
          <div className="user-info-box">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div className="user-name" style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '130px' }}>
                {user?.name || 'Aarav Sharma'}
              </div>
              <div className="user-role">{user?.role || 'Lead Decarbonizer'}</div>
            </div>
          </div>
          <button
            className="btn-logout-icon"
            onClick={handleLogout}
            title="Sign Out"
            aria-label="Logout"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
