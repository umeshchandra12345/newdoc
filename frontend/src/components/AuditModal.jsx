import React from 'react';
import { X, ShieldCheck, FileCheck2, Database, Calendar, Award } from 'lucide-react';

const AuditModal = ({ emission, isOpen, onClose }) => {
  if (!isOpen || !emission) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldCheck size={22} color="#10B981" />
            <h3 style={{ fontSize: '17px', fontWeight: 700 }}>Calculation Evidence & Audit Trail</h3>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <div style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>RECORD ID #{emission.id}</span>
              <span className={`badge badge-${emission.status?.toLowerCase() || 'verified'}`}>
                {emission.status || 'Verified'}
              </span>
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>
              {emission.source} - {emission.facility_name}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
              {emission.scope} | {emission.category}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Database size={18} color="#0D9488" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>ACTIVITY DATA</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {Number(emission.activity).toLocaleString()} {emission.unit}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Award size={18} color="#0D9488" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>EMISSION FACTOR APPLIED</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>
                  {emission.unit === 'kWh' ? 'India National CEA Grid Factor 2026 (0.72 kgCO2e/kWh)' :
                   emission.unit === 'm³' ? 'Natural Gas Stoichiometric Factor (2.02 kgCO2e/m³)' :
                   emission.unit === 'Liters' ? 'High Speed Diesel Direct Factor (2.68 kgCO2e/L)' :
                   'GHG Protocol Standard Activity Conversion'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <FileCheck2 size={18} color="#0D9488" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>ACCOUNTING METHODOLOGY</div>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  Activity Data × Emission Factor × Global Warming Potential (IPCC AR5 100-year GWP)
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Calendar size={18} color="#0D9488" style={{ marginTop: '3px' }} />
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>VERIFICATION ASSURANCE</div>
                <div style={{ fontSize: '13px', color: '#334155' }}>
                  Limited Assurance under ISO 14064-3. Last approved: Sep 08, 2026 by SGS Environmental Audit Bureau.
                </div>
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '12px 16px',
            background: '#ECFDF5',
            border: '1px solid #A7F3D0',
            borderRadius: '8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#065F46' }}>Calculated Total Emissions:</span>
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#065F46' }}>
              {Number(emission.emissions).toLocaleString()} tCO₂e
            </span>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuditModal;
