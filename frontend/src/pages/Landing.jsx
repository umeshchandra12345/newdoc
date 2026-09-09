import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Layers,
  Package,
  Users,
  Sparkles,
  TrendingDown,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Globe2,
  Check,
  Moon,
  Sun,
  Zap,
  Sliders,
  Flame,
  Award,
  Radio,
  Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const { brandName, brandTagline, theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Interactive Live Abatement Simulator state
  const [cleanEnergy, setCleanEnergy] = useState(48); // %
  const [fleetEv, setFleetEv] = useState(35); // %
  const [scope3Substitution, setScope3Substitution] = useState(28); // %

  // Dynamic calculations based on slider inputs
  const calculatedAbatement = Math.round((cleanEnergy * 142) + (fleetEv * 88) + (scope3Substitution * 195));
  const calculatedSavings = ((cleanEnergy * 18000) + (fleetEv * 12500) + (scope3Substitution * 24000)).toLocaleString();
  const sbtiProgress = Math.min(100, Math.round((cleanEnergy * 0.45) + (fleetEv * 0.25) + (scope3Substitution * 0.35) + 18));

  const handleCta = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const features = [
    {
      icon: Layers,
      title: 'Precision Carbon Accounting',
      desc: 'Disaggregated activity-based accounting for Scopes 1, 2, and 3 aligned strictly with GHG Protocol Corporate Standard and ISO 14064-1.',
      badge: 'Scopes 1, 2 & 3',
      color: '#00F5A0'
    },
    {
      icon: Package,
      title: 'Product Carbon Footprint (PCF)',
      desc: 'Granular cradle-to-gate LCA modeling per SKU with dynamic material substitution intelligence and ISO 14067 audit certificates.',
      badge: 'ISO 14067 LCA',
      color: '#00D2FF'
    },
    {
      icon: Sparkles,
      title: 'Autonomous Climate AI',
      desc: 'Neural anomaly detection, predictive 2030 trajectory modeling, and high-ROI decarbonization intervention ranking.',
      badge: 'Predictive Intelligence',
      color: '#818CF8'
    },
    {
      icon: Users,
      title: 'Scope 3 Supply Chain Radar',
      desc: 'Automated supplier engagement portals, spend-to-emissions conversion, primary questionnaire ingestion, and ESG scorecards.',
      badge: '15 GHG Categories',
      color: '#FBBF24'
    },
    {
      icon: TrendingDown,
      title: 'MACC Decarbonization Planner',
      desc: 'Marginal Abatement Cost Curves (MACC) simulating CapEx vs OpEx trade-offs to accelerate your SBTi 1.5°C pathway.',
      badge: 'SBTi 1.5°C Aligned',
      color: '#38BDF8'
    },
    {
      icon: ShieldCheck,
      title: 'Audit-Proof Regulatory Engine',
      desc: 'One-click compliance packs for CSRD / ESRS, EU CBAM embedded emissions, BRSR Core, and TCFD with verifiable cryptographic hash.',
      badge: 'CSRD & EU CBAM',
      color: '#F43F5E'
    }
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-app)', minHeight: '100vh', color: 'var(--text-main)', transition: 'all 0.3s ease' }}>
      {/* Top Header */}
      <header style={{
        height: '76px',
        backgroundColor: 'var(--top-nav-bg)',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 48px',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div className="logo-badge">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#05080E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 17L12 22L22 17" stroke="#05080E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M2 12L12 17L22 12" stroke="#05080E" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.4px', fontFamily: "'Outfit', sans-serif" }}>
              {brandName}
            </div>
            <div style={{ fontSize: '10.5px', color: 'var(--color-emerald)', fontWeight: 700, letterSpacing: '1px' }}>
              {brandTagline}
            </div>
          </div>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <a href="#simulator" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
            Live Simulator
          </a>
          <a href="#features" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
            Platform Modules
          </a>
          <a href="#standards" style={{ textDecoration: 'none', color: 'var(--text-muted)', fontSize: '14px', fontWeight: 600 }}>
            Standards & Verification
          </a>

          {/* Theme Switcher */}
          <button
            className="theme-switch-btn"
            onClick={toggleTheme}
            title="Toggle Visual Luxury Theme"
          >
            {theme === THEMES.ROYCE ? <Crown size={14} color="#C8A97E" /> : theme === THEMES.OBSIDIAN ? <Moon size={14} color="#00F5A0" /> : theme === THEMES.TITANIUM ? <Sun size={14} color="#0284C7" /> : <Sparkles size={14} color="#10B981" />}
            <span>{theme === THEMES.ROYCE ? 'Royce Bespoke' : theme === THEMES.OBSIDIAN ? 'Aurora' : theme === THEMES.TITANIUM ? 'Titanium' : 'Matrix'}</span>
          </button>

          <Link
            to="/login"
            className="btn btn-outline btn-sm"
            style={{ padding: '8px 20px', borderRadius: '10px' }}
          >
            Console Login
          </Link>
          <button
            onClick={handleCta}
            className="btn btn-primary btn-sm"
            style={{ padding: '8px 20px', borderRadius: '10px' }}
          >
            Launch Platform
          </button>
        </nav>
      </header>

      {/* Hero Section with Ambient Aura & Interactive Simulator */}
      <section style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '70px 48px 60px',
        position: 'relative'
      }}>
        {/* Glow backdrop */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '800px',
          height: '400px',
          background: 'radial-gradient(ellipse at center, var(--color-brand-glow) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.05fr 0.95fr',
          gap: '50px',
          alignItems: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {/* Hero Left Copy */}
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 16px',
              backgroundColor: 'var(--bg-muted)',
              border: '1px solid var(--border-light)',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              color: 'var(--color-emerald)',
              marginBottom: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Sparkles size={14} />
              <span>Next-Gen ClimateOS • Aligned with ISO 14064-1 & SBTi</span>
            </div>

            <h1 style={{
              fontSize: '52px',
              lineHeight: 1.12,
              fontWeight: 900,
              color: 'var(--text-main)',
              letterSpacing: '-1.5px',
              marginBottom: '22px',
              fontFamily: "'Outfit', sans-serif"
            }}>
              Precision Carbon Accounting & Autonomous Decarbonization
            </h1>

            <p style={{
              fontSize: '18px',
              lineHeight: 1.6,
              color: 'var(--text-muted)',
              marginBottom: '36px',
              maxWidth: '580px'
            }}>
              Unify Scope 1-3 greenhouse gas emissions, simulate cradle-to-gate product carbon footprints, and automate audit-grade CSRD & CBAM disclosures with verifiable precision.
            </p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <button
                onClick={handleCta}
                className="btn btn-primary"
                style={{ padding: '15px 32px', fontSize: '15px', borderRadius: '12px' }}
              >
                <span>Access Decarb Platform</span>
                <ArrowRight size={18} />
              </button>
              <Link
                to="/login"
                className="btn btn-outline"
                style={{ padding: '15px 26px', fontSize: '15px', borderRadius: '12px' }}
              >
                Demo Sandbox
              </Link>
            </div>

            {/* Quick trust metrics */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '20px',
              marginTop: '44px',
              paddingTop: '28px',
              borderTop: '1px solid var(--border-light)'
            }}>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-emerald)', fontFamily: "'Outfit', sans-serif" }}>4.8M+</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>MT CO₂e Tracked</div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--color-teal)', fontFamily: "'Outfit', sans-serif" }}>99.98%</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Audit Confidence</div>
              </div>
              <div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>180+</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Connected ERPs</div>
              </div>
            </div>
          </div>

          {/* Hero Right: Interactive Live Abatement Simulator Widget */}
          <div id="simulator" className="liquid-glass-card" style={{
            borderRadius: '24px',
            padding: '32px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'var(--grad-brand)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#05080E'
                }}>
                  <Sliders size={18} />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)' }}>Interactive Decarbonization Sandbox</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Adjust levers to preview real-time impact</div>
                </div>
              </div>
              <span className="badge badge-verified">Live Telemetry</span>
            </div>

            {/* Slider 1: Clean Energy */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Zap size={14} color="var(--color-emerald)" />
                  Renewable Energy PPA Share (Scope 2)
                </span>
                <span style={{ color: 'var(--color-emerald)', fontFamily: 'monospace' }}>{cleanEnergy}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={cleanEnergy}
                onChange={(e) => setCleanEnergy(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-emerald)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 2: Fleet Electrification */}
            <div style={{ marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Flame size={14} color="var(--color-teal)" />
                  EV Fleet Logistics Conversion (Scope 1)
                </span>
                <span style={{ color: 'var(--color-teal)', fontFamily: 'monospace' }}>{fleetEv}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={fleetEv}
                onChange={(e) => setFleetEv(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-teal)', cursor: 'pointer' }}
              />
            </div>

            {/* Slider 3: Scope 3 Material Abatement */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 700, marginBottom: '6px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe2 size={14} color="var(--color-amber)" />
                  Low-Carbon Material Substitution (Scope 3)
                </span>
                <span style={{ color: 'var(--color-amber)', fontFamily: 'monospace' }}>{scope3Substitution}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={scope3Substitution}
                onChange={(e) => setScope3Substitution(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-amber)', cursor: 'pointer' }}
              />
            </div>

            {/* Live Calculated Results Box */}
            <div style={{
              background: 'rgba(255, 255, 255, 0.65)',
              backdropFilter: 'blur(16px)',
              borderRadius: '16px',
              padding: '18px 20px',
              border: '1px solid rgba(255, 255, 255, 0.9)',
              boxShadow: 'var(--shadow-liquid)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px'
            }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Projected GHG Abatement
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-emerald)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>
                  -{calculatedAbatement.toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>MT CO₂e/yr</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                  Estimated OpEx Savings
                </div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-teal)', fontFamily: "'Outfit', sans-serif", marginTop: '2px' }}>
                  ${calculatedSavings} <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/yr</span>
                </div>
              </div>

              {/* Progress bar to Net-Zero */}
              <div style={{ gridColumn: 'span 2', marginTop: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>
                  <span>SBTi 2030 Interim Target Progress</span>
                  <span style={{ color: 'var(--color-emerald)' }}>{sbtiProgress}% Aligned</span>
                </div>
                <div className="progress-track" style={{ marginTop: '6px', height: '8px' }}>
                  <div className="progress-bar" style={{ width: `${sbtiProgress}%` }} />
                </div>
              </div>
            </div>

            <button
              onClick={handleCta}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '20px', padding: '13px', borderRadius: '12px' }}
            >
              Model Enterprise Scenario in Platform
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Feature Bento Grid */}
      <section id="features" style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '80px 48px 60px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 14px',
            backgroundColor: 'var(--bg-muted)',
            borderRadius: '9999px',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--color-emerald)',
            marginBottom: '14px'
          }}>
            <Layers size={14} />
            <span>Comprehensive Environmental Suite</span>
          </div>
          <h2 style={{ fontSize: '38px', fontWeight: 900, letterSpacing: '-0.8px', fontFamily: "'Outfit', sans-serif" }}>
            Designed for Enterprise ESG & Operations Leaders
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '16px', maxWidth: '640px', margin: '10px auto 0' }}>
            Replace fragmented spreadsheets with an integrated platform providing transparent audit trails and automated analytics.
          </p>
        </div>

        <div className="bento-grid">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="bento-card">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'var(--bg-muted)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: feat.color
                  }}>
                    <Icon size={22} />
                  </div>
                  <span className="badge" style={{ background: 'var(--bg-muted)', color: feat.color, border: `1px solid ${feat.color}40` }}>
                    {feat.badge}
                  </span>
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, marginBottom: '10px', color: 'var(--text-main)' }}>
                  {feat.title}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Standards & Compliance Ribbons */}
      <section id="standards" style={{
        maxWidth: '1360px',
        margin: '0 auto',
        padding: '40px 48px 80px'
      }}>
        <div className="liquid-glass-card" style={{
          borderRadius: '24px',
          padding: '40px 48px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px',
          alignItems: 'center'
        }}>
          <div>
            <div className="badge badge-verified" style={{ marginBottom: '16px' }}>
              Built for Mandatory Disclosures
            </div>
            <h3 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '14px', letterSpacing: '-0.5px' }}>
              Standard-Aligned Climate Intelligence
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: 1.6, marginBottom: '24px' }}>
              Generate third-party audit ready documentation in standardized XBRL and PDF formats complying with the world's most rigorous carbon accounting frameworks.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              {['GHG Protocol Corporate Standard', 'ISO 14064-1 & ISO 14067', 'CSRD / ESRS E1 Disclosures', 'EU CBAM Embedded Carbon', 'BRSR Core (SEBI Mandate)', 'Science Based Targets (SBTi)'].map((std, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 600 }}>
                  <CheckCircle2 size={16} color="var(--color-emerald)" />
                  <span>{std}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.65)',
            backdropFilter: 'blur(16px)',
            borderRadius: '18px',
            padding: '30px',
            border: '1px solid rgba(255, 255, 255, 0.9)',
            boxShadow: 'var(--shadow-liquid)',
            textAlign: 'center'
          }}>
            <Award size={48} color="var(--color-emerald)" style={{ margin: '0 auto 16px' }} />
            <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>Ready to decarbonize with precision?</div>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Experience the full power of {brandName} with real emission metrics, Scope 3 tracking, and AI decarbonization models.
            </p>
            <button
              onClick={handleCta}
              className="btn btn-primary"
              style={{ padding: '13px 28px', borderRadius: '12px' }}
            >
              Enter Intelligence Console
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-light)',
        padding: '32px 48px',
        backgroundColor: 'var(--bg-card)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontSize: '13px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="logo-badge" style={{ width: '28px', height: '28px', borderRadius: '8px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="#05080E" strokeWidth="2.4"/>
            </svg>
          </div>
          <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{brandName}</span>
          <span>• Enterprise Environmental Intelligence Engine</span>
        </div>
        <div>
          © 2026 {brandName}. Verified ISO 14064-1 & SBTi 1.5°C System.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
