import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  FileCheck,
  ExternalLink,
  X,
  CheckCircle2,
  AlertTriangle,
  Download,
  BarChart3,
  Award,
  TrendingUp,
  Scale,
  Sparkles
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import api, { downloadCsv } from '../services/api';
import Sparkline from '../components/Sparkline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Regulatory = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchRegulatory = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/regulatory');
        setReports(res.data);
      } catch (err) {
        console.error('Failed to load regulatory data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegulatory();
  }, []);

  const frameworkDescriptions = {
    'CSRD / ESRS': 'European Corporate Sustainability Reporting Directive. Comprehensive double materiality, ESRS E1 climate standards, and Scope 1-3 assurance.',
    'CBAM': 'EU Carbon Border Adjustment Mechanism. Quarterly embedded emissions declarations for exported metals and machinery entering the EU.',
    'TCFD': 'Task Force on Climate-related Financial Disclosures. Governance, climate strategy, risk management, metrics and targets.',
    'EU Taxonomy': 'Technical screening criteria for climate change mitigation and DNSH (Do No Significant Harm) compliance of capital activities.',
    'SEC Climate Disclosures': 'US SEC climate rules for material Scope 1 and Scope 2 GHG disclosure and climate risk governance.',
    'CDP Climate Change': 'Global disclosure standard for investors, supply chain buyers, and climate transition scorecard scoring.'
  };

  const avgCompletion = useMemo(() => {
    if (!reports.length) return 0;
    const sum = reports.reduce((acc, r) => acc + (r.completion || 0), 0);
    return Math.round(sum / reports.length);
  }, [reports]);

  const compliantCount = useMemo(() => {
    return reports.filter((r) => r.status === 'Compliant' || r.status === 'On Track').length;
  }, [reports]);

  const readinessChartData = useMemo(() => {
    if (!reports.length) return null;
    return {
      labels: reports.map((r) => r.framework),
      datasets: [
        {
          label: 'Disclosure Readiness (%)',
          data: reports.map((r) => r.completion),
          backgroundColor: reports.map((r) => r.completion >= 85 ? '#34C759' : r.completion >= 70 ? '#0071E3' : '#FF9500'),
          borderRadius: 8,
          maxBarThickness: 32,
        }
      ]
    };
  }, [reports]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
            Regulatory Compliance & Global Disclosures
          </h2>
          <p className="page-subtitle">
            Automated alignment with CSRD, EU CBAM, TCFD, EU Taxonomy, SEC, and CDP reporting standards.
          </p>
        </div>
      </div>

      {/* Top Compliance KPI Cards with Sparklines */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Tracked Frameworks</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {reports.length}
              <span className="kpi-unit">standards</span>
            </div>
            <Sparkline data={[4, 5, 5, 6, reports.length || 6]} color="#0071E3" width={95} height={34} />
          </div>
          <div className="kpi-change neutral">EU & US SEC Scope</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Mean Readiness</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {avgCompletion}%
              <span className="kpi-unit">complete</span>
            </div>
            <Sparkline data={[72, 76, 80, 82, avgCompletion]} color="#248A3D" width={95} height={34} />
          </div>
          <div className="kpi-change positive">
            <TrendingUp size={14} />
            <span>+12.8% vs last quarter</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Audit Assurance</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0, fontSize: '24px' }}>
              {compliantCount} / {reports.length}
              <span className="kpi-unit">pass</span>
            </div>
            <Sparkline data={[3, 4, 4, 5, compliantCount]} color="#34C759" width={95} height={34} />
          </div>
          <div className="kpi-change positive">
            <ShieldCheck size={14} />
            <span>Limited Assurance Ready</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Standard Alignment</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0, fontSize: '20px' }}>
              ISAE 3000
            </div>
            <Sparkline data={[80, 85, 90, 94, 98]} color="#0071E3" width={95} height={34} />
          </div>
          <div className="kpi-change neutral">
            <span>Third-Party Verifiable</span>
          </div>
        </div>
      </div>

      {/* Global Framework Readiness Matrix Visualizer */}
      {readinessChartData && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Global ESG Framework Readiness Matrix</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Disclosure readiness percentage calibrated across international climate frameworks
              </span>
            </div>
            <span className="badge badge-verified">
              <Scale size={13} style={{ marginRight: '4px' }} />
              Active Assurance Cycle
            </span>
          </div>

          <div style={{ height: '240px', marginTop: '8px' }}>
            <Bar
              data={readinessChartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    backgroundColor: 'rgba(255, 255, 255, 0.92)',
                    titleColor: '#1D1D1F',
                    bodyColor: '#424245',
                    borderColor: 'rgba(255, 255, 255, 0.95)',
                    borderWidth: 1.5,
                    padding: 10,
                    cornerRadius: 10,
                    callbacks: {
                      label: (ctx) => ` Disclosure Readiness: ${ctx.raw}%`
                    }
                  }
                },
                scales: {
                  x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#6E6E73', font: { size: 11, weight: '600' } }
                  },
                  y: {
                    min: 0,
                    max: 100,
                    grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                    ticks: {
                      color: '#86868B',
                      font: { size: 11 },
                      callback: (v) => `${v}%`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Framework Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {loading ? (
          <div style={{ padding: '40px', color: '#64748B' }}>Loading compliance framework statuses...</div>
        ) : (
          reports.map((item) => (
            <div
              key={item.id}
              className="card"
              style={{
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      backgroundColor: '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#047857'
                    }}>
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F2E22' }}>
                        {item.framework}
                      </h3>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
                        Reporting Year: {item.year}
                      </div>
                    </div>
                  </div>

                  <span className={`badge ${
                    item.status === 'Compliant' ? 'badge-verified' :
                    item.status === 'On Track' ? 'badge-info' : 'badge-review'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.5, marginBottom: '20px' }}>
                  {frameworkDescriptions[item.framework] || 'Official ESG reporting framework compliance standard.'}
                </p>

                {/* Completion Progress Bar */}
                <div style={{ marginBottom: '18px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 700, marginBottom: '6px' }}>
                    <span style={{ color: '#475569' }}>Disclosure Readiness:</span>
                    <span style={{ color: '#10B981' }}>{item.completion}%</span>
                  </div>
                  <div className="progress-track" style={{ height: '8px' }}>
                    <div
                      className="progress-bar"
                      style={{
                        width: `${item.completion}%`,
                        background: item.completion > 75 ? '#10B981' : item.completion > 60 ? '#0D9488' : '#F59E0B'
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setSelectedReport(item)}
                >
                  <span>View Report</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* View Report Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  STATUTORY FRAMEWORK REPORT
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2E22' }}>
                  {selectedReport.framework} Compliance Package
                </h3>
              </div>
              <button className="icon-button" onClick={() => setSelectedReport(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{
                background: '#F8FAFC',
                padding: '16px',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>CURRENT READINESS</div>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: '#0F2E22' }}>
                    {selectedReport.completion}% Complete
                  </div>
                </div>
                <span className={`badge ${selectedReport.status === 'Compliant' ? 'badge-verified' : 'badge-info'}`}>
                  {selectedReport.status}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '13px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span><strong>Scope 1 & 2 GHG inventory:</strong> Disclosed and verified under ISO 14064.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span><strong>Double Materiality Assessment:</strong> Completed for physical & transition risks.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle2 size={16} color="#10B981" />
                  <span><strong>Decarbonization Transition Plan:</strong> Validated for 42% cut by 2030.</span>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <AlertTriangle size={16} color="#F59E0B" />
                  <span><strong>Scope 3 Upstream Data Quality:</strong> 12 Tier-1 supplier surveys awaiting final audit.</span>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-emerald"
                onClick={() => downloadCsv('csrd-esrs').catch((err) => console.error('Failed to download report', err))}
              >
                <Download size={16} />
                <span>Download Report CSV</span>
              </button>
              <button className="btn btn-outline" onClick={() => setSelectedReport(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Regulatory;
