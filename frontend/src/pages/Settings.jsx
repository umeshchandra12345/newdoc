import React, { useState } from 'react';
import { Building, User, Sliders, Database, CheckCircle2, AlertCircle, Save, Palette, Moon, Sun, Sparkles, RefreshCw, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme, THEMES } from '../context/ThemeContext';

const Settings = () => {
  const { user } = useAuth();
  const { theme, setTheme, brandName, setBrandName, brandTagline, setBrandTagline } = useTheme();

  // Local state for demo settings
  const [localBrandName, setLocalBrandName] = useState(brandName);
  const [localTagline, setLocalTagline] = useState(brandTagline);
  const [orgName, setOrgName] = useState('Nexgile Industrial Systems');
  const [baseYear, setBaseYear] = useState('2022');
  const [reportingYear, setReportingYear] = useState('2026');
  const [currency, setCurrency] = useState('INR (₹)');
  const [savedMessage, setSavedMessage] = useState('');

  const integrations = [
    { name: 'SAP S/4HANA ERP', type: 'Enterprise Resource Planning', status: 'Connected', lastSync: '12 mins ago', color: 'var(--color-emerald)' },
    { name: 'Oracle Fusion Cloud', type: 'Procurement & Invoicing', status: 'Not Connected', lastSync: 'N/A', color: 'var(--text-muted)' },
    { name: 'IoT Energy Smart Meters', type: 'Facility Power Telemetry', status: 'Connected', lastSync: 'Live streaming', color: 'var(--color-emerald)' },
    { name: 'Supplier Decarb Portal', type: 'Vendor ESG Questionnaires', status: 'Connected', lastSync: '2 hours ago', color: 'var(--color-emerald)' },
    { name: 'Emission Factor Library (IPCC/CEA)', type: 'Factors & GWP Database', status: 'Connected', lastSync: 'Sep 06, 2026', color: 'var(--color-emerald)' },
  ];

  const handleSaveAll = (e) => {
    e?.preventDefault();
    setBrandName(localBrandName);
    setBrandTagline(localTagline);
    setSavedMessage('Configuration & Visual Preferences successfully applied!');
    setTimeout(() => setSavedMessage(''), 3500);
  };

  const themeOptions = [
    {
      id: THEMES.ROYCE,
      name: 'Rolls-Royce & Rare Rabbit',
      subtitle: 'Bespoke Black Badge & Champagne Gold (Crowning Luxury)',
      icon: Crown,
      colors: ['#08090C', '#0E1017', '#C8A97E', '#F4E5CF'],
      desc: 'Inspired by Rolls-Royce Black Badge and Rare Rabbit luxury: deep phantom onyx with liquid champagne gold and brushed cashmere platinum.'
    },
    {
      id: THEMES.OBSIDIAN,
      name: 'Aurora Obsidian',
      subtitle: 'Cyber-Luxe Dark Tech',
      icon: Moon,
      colors: ['#080C14', '#0F172A', '#00F5A0', '#00D2FF'],
      desc: 'Deep obsidian cosmic surfaces with glowing electric neon mint & cyan auras.'
    },
    {
      id: THEMES.TITANIUM,
      name: 'Titanium Clean Luxe',
      subtitle: 'Executive High-Contrast Light',
      icon: Sun,
      colors: ['#F1F5F9', '#FFFFFF', '#059669', '#0284C7'],
      desc: 'Crisp polar-slate backdrop with deep obsidian text and sapphire accents.'
    },
    {
      id: THEMES.EMERALD,
      name: 'Bioluminescent Matrix',
      subtitle: 'Deep Emerald Noir',
      icon: Sparkles,
      colors: ['#030E08', '#081B12', '#10B981', '#22D3EE'],
      desc: 'Bioluminescent emerald grid with vivid luminous telemetry accents.'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
            Platform Customization & Settings
          </h2>
          <p className="page-subtitle">
            Customize visual themes, platform branding, reporting baselines, and enterprise ERP integrations.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          className="btn btn-primary"
        >
          <Save size={16} />
          <span>Save All Settings</span>
        </button>
      </div>

      {savedMessage && (
        <div style={{
          background: 'var(--color-emerald-light)',
          color: 'var(--color-emerald)',
          border: '1px solid var(--border-glow)',
          padding: '14px 18px',
          borderRadius: '12px',
          fontWeight: 700,
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <CheckCircle2 size={18} />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Visual Identity & Multi-Theme Customizer Suite */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Palette size={22} color="var(--color-emerald)" />
            <div>
              <div className="card-title" style={{ marginBottom: 0 }}>Visual Appearance & Bespoke Branding</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Change your active visual theme and customize the platform name across the entire app
              </span>
            </div>
          </div>
        </div>

        {/* Theme Picker Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '18px',
          marginBottom: '26px'
        }}>
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setTheme(opt.id)}
                style={{
                  border: isSelected ? '2px solid var(--color-emerald)' : '1px solid var(--border-light)',
                  background: isSelected ? 'var(--bg-card-hover)' : 'var(--bg-muted)',
                  borderRadius: '16px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  boxShadow: isSelected ? 'var(--shadow-glow)' : 'none'
                }}
              >
                {isSelected && (
                  <span className="badge badge-verified" style={{ position: 'absolute', top: '14px', right: '14px' }}>
                    Active
                  </span>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-emerald)'
                  }}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: 'var(--text-main)' }}>{opt.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{opt.subtitle}</div>
                  </div>
                </div>

                {/* Color Swatch palette dots */}
                <div style={{ display: 'flex', gap: '8px', margin: '14px 0 10px' }}>
                  {opt.colors.map((c, idx) => (
                    <div
                      key={idx}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: c,
                        border: '2px solid rgba(255, 255, 255, 0.2)'
                      }}
                      title={c}
                    />
                  ))}
                </div>

                <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  {opt.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Custom Brand Identity Inputs */}
        <div style={{
          background: 'var(--bg-muted)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{ fontWeight: 800, fontSize: '14px', marginBottom: '14px', color: 'var(--text-main)' }}>
            Personalize Platform Brand & Tenant Title
          </div>
          <div className="form-row">
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Platform Name (appears in Sidebar & Header)</label>
              <input
                type="text"
                className="form-input"
                value={localBrandName}
                onChange={(e) => setLocalBrandName(e.target.value)}
                placeholder="e.g. Aetheris ClimateOS or Umesh DecarbX"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label">Platform Subtitle / Tagline</label>
              <input
                type="text"
                className="form-input"
                value={localTagline}
                onChange={(e) => setLocalTagline(e.target.value)}
                placeholder="e.g. ENVIRONMENTAL INTELLIGENCE"
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => {
                setLocalBrandName('Aetheris ClimateOS');
                setLocalTagline('ENVIRONMENTAL INTELLIGENCE');
                setBrandName('Aetheris ClimateOS');
                setBrandTagline('ENVIRONMENTAL INTELLIGENCE');
              }}
            >
              <RefreshCw size={13} />
              <span>Reset Brand Default</span>
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleSaveAll}
            >
              Apply Brand Updates
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Organization Profile & User Info */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '26px', marginBottom: '28px' }}>
        {/* Organization Settings */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Building size={20} color="var(--color-emerald)" />
              <div className="card-title" style={{ marginBottom: 0 }}>Organization Profile & GHG Baselines</div>
            </div>
          </div>

          <form onSubmit={handleSaveAll}>
            <div className="form-group">
              <label className="form-label">Organization Legal Entity</label>
              <input
                type="text"
                className="form-input"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">GHG Baseline Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={baseYear}
                  onChange={(e) => setBaseYear(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Reporting Cycle</label>
                <input
                  type="number"
                  className="form-input"
                  value={reportingYear}
                  onChange={(e) => setReportingYear(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Currency Unit for MACC Abatement</label>
              <select className="form-select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="INR (₹)">Indian Rupee (INR ₹)</option>
                <option value="USD ($)">US Dollar (USD $)</option>
                <option value="EUR (€)">Euro (EUR €)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-outline" style={{ marginTop: '8px' }}>
              <Save size={15} />
              <span>Update Baseline Targets</span>
            </button>
          </form>
        </div>

        {/* User Profile */}
        <div className="card" style={{ margin: 0 }}>
          <div className="card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <User size={20} color="var(--color-emerald)" />
              <div className="card-title" style={{ marginBottom: 0 }}>Lead Auditor Profile & Credentials</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '22px' }}>
            <div className="user-avatar" style={{ width: '60px', height: '60px', fontSize: '24px', borderRadius: '16px' }}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: 'var(--text-main)' }}>
                {user?.name || 'Aarav Sharma'}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {user?.email || 'demo@nexgile.com'}
              </div>
              <span className="badge badge-verified" style={{ marginTop: '6px' }}>
                {user?.role || 'Head of Decarbonization & ESG'}
              </span>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '18px', fontSize: '13px', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Permission Clearance:</strong> Full Environmental Superuser (Scopes 1-3, PCF Lifecycle, ESG Sign-off)
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Cryptographic Verification:</strong> SHA-256 Ledger Audit Log Active
            </div>
            <div>
              <strong style={{ color: 'var(--text-main)' }}>Audit Certification:</strong> Authorized signatory for ISO 14064-1 & CSRD E1 declarations.
            </div>
          </div>
        </div>
      </div>

      {/* Connected Data Sources & Integrations */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} color="var(--color-emerald)" />
            <div>
              <div className="card-title" style={{ marginBottom: 0 }}>Connected Enterprise Systems & IoT Telemetry</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Real-time API connector status and telemetry pipelines
              </span>
            </div>
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Integration Pipeline</th>
                <th>Enterprise Category</th>
                <th>Health Status</th>
                <th>Last Synchronized</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {integrations.map((integ, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{integ.name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{integ.type}</td>
                  <td>
                    <span className={`badge ${integ.status === 'Connected' ? 'badge-verified' : 'badge-pending'}`}>
                      {integ.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>{integ.lastSync}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => alert(`Connector Ping: ${integ.name} is ${integ.status}. Latency: 42ms.`)}
                    >
                      {integ.status === 'Connected' ? 'Test Heartbeat' : 'Configure'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Settings;
