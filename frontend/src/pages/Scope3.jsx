import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Globe, ArrowUpRight, Info, CheckCircle, HelpCircle, X } from 'lucide-react';
import api from '../services/api';

const Scope3 = () => {
  const { reportingYear } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState(null);

  useEffect(() => {
    const fetchScope3 = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/emissions/scopes/scope3-stats?year=${reportingYear}`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load scope 3 data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchScope3();
  }, [reportingYear]);

  if (loading || !stats) {
    return <div style={{ padding: '40px', color: '#64748B' }}>Loading Scope 3 Value Chain Categories...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Scope 3 Value Chain Emissions
          </h2>
          <p className="page-subtitle">
            Comprehensive GHG Protocol Corporate Value Chain standard covering upstream supply chain and downstream product use.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.6px' }}>TOTAL VALUE CHAIN FOOTPRINT</div>
          <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            {Number(stats.total_scope3).toLocaleString()} <span style={{ fontSize: '14px', color: 'var(--text-muted)' }}>tCO₂e</span>
          </div>
        </div>
      </div>

      {/* Categories Grid (All 15 GHG Protocol categories) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        {stats.categories.map((cat, idx) => (
          <div
            key={cat.id || idx}
            onClick={() => setSelectedCat(cat)}
            className="liquid-glass-card"
            style={{
              padding: '22px',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {cat.category.split(':')[0]}
                </span>
                <span className={`badge ${
                  cat.data_quality === 'High' ? 'badge-verified' :
                  cat.data_quality === 'Medium' ? 'badge-pending' : 'badge-review'
                }`}>
                  {cat.data_quality} Quality
                </span>
              </div>

              <div style={{ fontSize: '15px', fontWeight: 700, color: '#0F172A', lineHeight: 1.3 }}>
                {cat.category.split(':').length > 1 ? cat.category.split(':')[1].trim() : cat.category}
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#0F2E22' }}>
                  {Number(cat.emissions).toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>tCO₂e</span>
                </span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0D9488' }}>
                  {cat.pct_of_scope3}%
                </span>
              </div>

              <div className="progress-track" style={{ height: '6px' }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${Math.min(100, Math.max(3, cat.pct_of_scope3))}%`,
                    background: cat.emissions > 30000 ? '#10B981' : '#0D9488'
                  }}
                ></div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', color: '#64748B' }}>
                <span>Method: {cat.source}</span>
                <span style={{ color: '#0D9488', fontWeight: 600 }}>Click for details →</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scope 3 Category Detail Modal */}
      {selectedCat && (
        <div className="modal-overlay" onClick={() => setSelectedCat(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe size={22} color="#0D9488" />
                <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Scope 3 Category Specification</h3>
              </div>
              <button className="icon-button" onClick={() => setSelectedCat(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>GHG PROTOCOL VALUE CHAIN INVENTORY</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: '#0F2E22', marginTop: '4px' }}>
                  {selectedCat.category}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: '#ECFDF5', padding: '14px', borderRadius: '10px', border: '1px solid #A7F3D0' }}>
                  <div style={{ fontSize: '11px', color: '#065F46', fontWeight: 600, textTransform: 'uppercase' }}>Reported Emissions</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#065F46', marginTop: '4px' }}>
                    {Number(selectedCat.emissions).toLocaleString()} tCO₂e
                  </div>
                </div>

                <div style={{ background: '#EFF6FF', padding: '14px', borderRadius: '10px', border: '1px solid #BFDBFE' }}>
                  <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 600, textTransform: 'uppercase' }}>Scope 3 Contribution</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#1E40AF', marginTop: '4px' }}>
                    {selectedCat.pct_of_scope3}%
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div>
                  <strong>Data Quality Tier:</strong> {selectedCat.data_quality}
                  <p style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                    {selectedCat.data_quality === 'High' ? 'Direct primary activity data collected via ERP and audited supplier bills.' :
                     selectedCat.data_quality === 'Medium' ? 'Hybrid method using spend data combined with DEFRA / Exiobase input-output emission factors.' :
                     'Secondary industry average proxies pending Tier-2 supplier questionnaire completion.'}
                  </p>
                </div>

                <div>
                  <strong>Calculation Methodology:</strong> {selectedCat.source}
                </div>

                <div>
                  <strong>Reporting Boundary:</strong> Global consolidated operations under operational control criteria.
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedCat(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scope3;
