import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Users, ShieldCheck, FileText, CheckCircle2, AlertCircle, Eye, X, Award, BarChart2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import api from '../services/api';

const Suppliers = () => {
  const { searchTerm: globalSearch } = useOutletContext();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [dataQualityFilter, setDataQualityFilter] = useState('All');

  // Supplier Detail Drawer / Modal
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, emissions, questionnaire, evidence, scorecard

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      let url = '/api/suppliers';
      const searchEffective = localSearch || globalSearch;
      const params = [];
      if (searchEffective) params.push(`search=${encodeURIComponent(searchEffective)}`);
      if (dataQualityFilter !== 'All') params.push(`data_quality=${encodeURIComponent(dataQualityFilter)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      console.error('Failed to load suppliers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [localSearch, globalSearch, dataQualityFilter]);

  const handleOpenDetail = async (supp) => {
    try {
      setDetailLoading(true);
      setActiveTab('overview');
      const res = await api.get(`/api/suppliers/${supp.id}`);
      setSelectedSupplier(res.data);
    } catch (err) {
      console.error('Failed to load supplier detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  // Supplier YoY chart
  const yoyChartData = selectedSupplier ? {
    labels: selectedSupplier.yoy_trend.map((t) => t.year.toString()),
    datasets: [
      {
        label: 'Emissions (tCO₂e)',
        data: selectedSupplier.yoy_trend.map((t) => t.emissions),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        tension: 0.3,
        fill: true,
        pointRadius: 5
      }
    ]
  } : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F2E22', letterSpacing: '-0.4px' }}>
            Supplier Intelligence & Scope 3 Decarbonization
          </h2>
          <p className="page-subtitle">
            Manage Tier-1 supplier ESG questionnaires, primary emissions primary accounting, and engagement scorecards.
          </p>
        </div>
      </div>

      {/* Top Cards */}
      {data && (
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">
              <span>Total Strategic Suppliers</span>
              <Users size={18} color="#64748B" />
            </div>
            <div className="kpi-value">{data.stats.total_suppliers}</div>
            <div className="kpi-change neutral">Tracked in registry</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Suppliers Engaged</div>
            <div className="kpi-value">{data.stats.suppliers_engaged_pct}%</div>
            <div className="kpi-change positive">Active response rate</div>
          </div>

          <div className="kpi-card">
            <div className="kpi-label">Primary Data Coverage</div>
            <div className="kpi-value">{data.stats.primary_data_coverage_pct}%</div>
            <div className="kpi-change positive">High-fidelity primary data</div>
          </div>

          <div className="kpi-card warning">
            <div className="kpi-label">High-Emission Suppliers</div>
            <div className="kpi-value" style={{ color: '#DC2626' }}>
              {data.stats.high_emission_suppliers}
            </div>
            <div className="kpi-change negative">&gt; 20,000 tCO₂e annual footprint</div>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-item">
          <label>Data Quality:</label>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={dataQualityFilter}
            onChange={(e) => setDataQualityFilter(e.target.value)}
          >
            <option value="All">All Tiers</option>
            <option value="High">High Quality (Verified)</option>
            <option value="Medium">Medium Quality</option>
            <option value="Low">Low / Unverified</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder="Search supplier, region, sector..."
            className="form-input"
            style={{ width: '240px', padding: '6px 12px' }}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Suppliers Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Region</th>
                <th>Category</th>
                <th>Emissions (tCO₂e)</th>
                <th>Data Quality</th>
                <th>Engagement</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading || !data ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Loading supplier intelligence...
                  </td>
                </tr>
              ) : (
                data.suppliers.map((supp) => (
                  <tr key={supp.id}>
                    <td style={{ fontWeight: 600 }}>{supp.name}</td>
                    <td>{supp.region}</td>
                    <td>{supp.category}</td>
                    <td style={{ fontWeight: 700, color: '#0F2E22' }}>
                      {Number(supp.emissions).toLocaleString()}
                    </td>
                    <td>
                      <span className={`badge badge-${supp.data_quality.toLowerCase()}`}>
                        {supp.data_quality}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div className="progress-track" style={{ width: '60px', height: '6px', margin: 0 }}>
                          <div className="progress-bar" style={{ width: `${supp.engagement}%` }}></div>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>{supp.engagement}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${supp.status === 'Active' ? 'badge-verified' : 'badge-review'}`}>
                        {supp.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => handleOpenDetail(supp)}>
                        <Eye size={14} />
                        <span>Scorecard</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Detail Drawer / Modal */}
      {selectedSupplier && (
        <div className="modal-overlay" onClick={() => setSelectedSupplier(null)}>
          <div className="modal-content" style={{ maxWidth: '800px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  {selectedSupplier.category} • {selectedSupplier.region}
                </div>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2E22', marginTop: '2px' }}>
                  {selectedSupplier.name}
                </h3>
              </div>
              <button className="icon-button" onClick={() => setSelectedSupplier(null)}>
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #E2E8F0',
              padding: '0 24px',
              gap: '20px',
              backgroundColor: '#F8FAFC'
            }}>
              {['overview', 'emissions', 'questionnaire', 'evidence', 'scorecard'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    padding: '12px 0',
                    border: 'none',
                    background: 'transparent',
                    fontSize: '13px',
                    fontWeight: 600,
                    textTransform: 'capitalize',
                    color: activeTab === tab ? '#10B981' : '#64748B',
                    borderBottom: activeTab === tab ? '2px solid #10B981' : '2px solid transparent',
                    cursor: 'pointer'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="modal-body">
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '20px' }}>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ANNUAL EMISSIONS</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F2E22', marginTop: '4px' }}>
                        {Number(selectedSupplier.emissions).toLocaleString()} tCO₂e
                      </div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>DATA QUALITY</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#047857', marginTop: '4px' }}>
                        {selectedSupplier.data_quality}
                      </div>
                    </div>
                    <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                      <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>ENGAGEMENT SCORE</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0D9488', marginTop: '4px' }}>
                        {selectedSupplier.engagement}%
                      </div>
                    </div>
                  </div>

                  <div style={{ fontSize: '13px', color: '#334155', lineHeight: 1.6 }}>
                    <p>
                      <strong>Strategic Partnership Summary:</strong> {selectedSupplier.name} is a key Tier-1 partner based in {selectedSupplier.region}. They have completed comprehensive Scope 1 and Scope 2 disclosures and provide verified third-party Life Cycle Assessments (LCAs) for manufactured components.
                    </p>
                  </div>
                </div>
              )}

              {/* Tab 2: YoY Emissions */}
              {activeTab === 'emissions' && (
                <div>
                  <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 700 }}>
                    Year-over-Year Historical Emissions (2023 - 2026)
                  </div>
                  <div style={{ height: '240px' }}>
                    {yoyChartData && (
                      <Line
                        data={yoyChartData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: { y: { grid: { color: '#F1F5F9' } }, x: { grid: { display: false } } }
                        }}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Tab 3: Questionnaire */}
              {activeTab === 'questionnaire' && (
                <div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>GHG / ESG Questionnaire Item</th>
                          <th>Supplier Response</th>
                          <th>Audit Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSupplier.questionnaire.map((q, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{q.question}</td>
                            <td>{q.answer}</td>
                            <td>
                              <span className={`badge ${q.status === 'Compliant' ? 'badge-verified' : 'badge-pending'}`}>
                                {q.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 4: Evidence */}
              {activeTab === 'evidence' && (
                <div>
                  <div className="table-wrapper">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Document / Certificate</th>
                          <th>Type</th>
                          <th>Assurance Agency</th>
                          <th>Audit Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedSupplier.evidence.map((ev, idx) => (
                          <tr key={idx}>
                            <td style={{ fontWeight: 600 }}>{ev.document}</td>
                            <td><span className="badge badge-info">{ev.type}</span></td>
                            <td>{ev.verifier}</td>
                            <td style={{ color: '#64748B' }}>{ev.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Tab 5: Scorecard */}
              {activeTab === 'scorecard' && (
                <div>
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '20px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '12px', color: '#065F46', fontWeight: 700 }}>OVERALL SUPPLIER ESG TIER</div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: '#065F46', marginTop: '2px' }}>
                          {selectedSupplier.scorecard.supplier_engagement_tier}
                        </div>
                      </div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: '#065F46' }}>
                        {selectedSupplier.scorecard.overall_score}/100
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                        <span>Climate Governance & Targets:</span>
                        <span>{selectedSupplier.scorecard.climate_governance}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-bar" style={{ width: `${selectedSupplier.scorecard.climate_governance}%` }}></div></div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                        <span>Emissions Transparency & Data Quality:</span>
                        <span>{selectedSupplier.scorecard.emissions_transparency}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-bar" style={{ width: `${selectedSupplier.scorecard.emissions_transparency}%` }}></div></div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600 }}>
                        <span>Renewable Energy Adoption:</span>
                        <span>{selectedSupplier.scorecard.renewable_energy}%</span>
                      </div>
                      <div className="progress-track"><div className="progress-bar" style={{ width: `${selectedSupplier.scorecard.renewable_energy}%` }}></div></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedSupplier(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Suppliers;
