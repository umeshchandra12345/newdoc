import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Radio } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { brandName } = useTheme();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-app)',
        color: 'var(--text-main)',
        gap: '16px'
      }}>
        <div style={{
          width: '52px',
          height: '52px',
          borderRadius: '14px',
          background: 'var(--grad-brand)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#05080E',
          boxShadow: '0 4px 20px var(--color-brand-glow)'
        }}>
          <Radio size={24} style={{ animation: 'pulseBeacon 1.5s infinite' }} />
        </div>
        <div style={{ fontWeight: 800, fontSize: '16px', letterSpacing: '-0.3px', fontFamily: "'Outfit', sans-serif" }}>
          Initializing {brandName}...
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Establishing encrypted environmental ledger connection
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
