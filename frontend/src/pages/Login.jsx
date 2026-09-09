import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ArrowRight, Lock, Mail, ShieldAlert, Sparkles, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { brandName, brandTagline } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@nexgile.com');
    setPassword('demo123');
    try {
      setLoading(true);
      setError('');
      await login('demo@nexgile.com', 'demo123');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to authenticate demo user.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'grid',
      gridTemplateColumns: '1.1fr 0.9fr',
      background: 'var(--bg-app-mesh)',
      color: 'var(--text-main)',
      padding: '36px',
      gap: '36px',
      alignItems: 'center'
    }}>
      {/* Left Column: Apple Liquid Glass Environmental Showcase */}
      <div className="liquid-glass-card" style={{
        padding: '56px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: '620px',
        borderRadius: '28px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
            <div className="logo-badge" style={{ width: '46px', height: '46px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#1D1D1F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="#1D1D1F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="#1D1D1F" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-main)' }}>
                {brandName}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-apple-blue)', fontWeight: 700, letterSpacing: '0.8px' }}>
                {brandTagline}
              </div>
            </div>
          </div>

          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            background: 'rgba(255, 255, 255, 0.7)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-apple-blue)',
            marginBottom: '20px',
            boxShadow: 'var(--shadow-liquid)'
          }}>
            <Sparkles size={14} />
            <span>macOS & iOS Liquid Glass Architecture</span>
          </div>

          <h2 style={{
            fontSize: '36px',
            lineHeight: 1.2,
            fontWeight: 800,
            letterSpacing: '-0.8px',
            marginBottom: '18px',
            color: 'var(--text-main)'
          }}>
            Decarbonize Enterprise Operations with Certainty.
          </h2>

          <p style={{
            fontSize: '16px',
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            maxWidth: '480px',
            marginBottom: '32px'
          }}>
            Access certified Scope 1-3 greenhouse gas registries, dynamic product footprint simulations, and automated compliance reporting.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: '460px' }}>
            {[
              'Disaggregated Scope 1, 2, & 3 Activity Tracking',
              'Cradle-to-Gate Product Carbon Footprint (ISO 14067)',
              'Marginal Abatement Cost Curves (MACC) Simulation',
              'One-Click Export for CSRD / ESRS & EU CBAM'
            ].map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13.5px', color: 'var(--text-main)' }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: 'var(--color-emerald-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-emerald-dark)',
                  flexShrink: 0
                }}>
                  <CheckCircle2 size={14} />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div style={{
          paddingTop: '20px',
          borderTop: '1px solid rgba(0, 0, 0, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: 'var(--text-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} color="var(--color-emerald-dark)" />
            <span>ISO 14064-1 & GHG Protocol Verified</span>
          </div>
          <span>v2.8 Enterprise</span>
        </div>
      </div>

      {/* Right Column: Apple Liquid Glass Login Card */}
      <div className="liquid-glass-card" style={{
        padding: '48px',
        maxWidth: '460px',
        width: '100%',
        margin: '0 auto',
        borderRadius: '28px'
      }}>
        <div style={{ marginBottom: '28px' }}>
          <h2 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px', color: 'var(--text-main)' }}>
            Sign In to Console
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', marginTop: '4px' }}>
            Enter your credentials to access your organization's workspace.
          </p>
        </div>

        {/* Quick Demo Access Card */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.75)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          borderRadius: '16px',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'var(--shadow-liquid)'
        }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={15} color="var(--color-apple-blue)" />
              Instant Demo Sandbox
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Preloaded with industrial environmental telemetry
            </div>
          </div>
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn btn-primary btn-sm"
            disabled={loading}
            style={{ padding: '6px 14px' }}
          >
            Autofill Demo
          </button>
        </div>

        {error && (
          <div style={{
            background: 'var(--color-rose-light)',
            color: 'var(--color-rose)',
            border: '1px solid rgba(255, 59, 48, 0.3)',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: 600,
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldAlert size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Corporate Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="email"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0 }}>Password</label>
              <a href="#reset" onClick={(e) => { e.preventDefault(); alert('For the demo, click "Autofill Demo" above.'); }} style={{ fontSize: '12px', color: 'var(--color-apple-blue)', textDecoration: 'none', fontWeight: 600 }}>
                Reset Password?
              </a>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
              <input
                type="password"
                className="form-input"
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '10px', padding: '12px' }}
          >
            <span>{loading ? 'Authenticating...' : 'Sign In to Workspace'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '13px', color: 'var(--text-muted)' }}>
          Back to{' '}
          <Link to="/" style={{ color: 'var(--color-apple-blue)', fontWeight: 700, textDecoration: 'none' }}>
            Public Overview
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
