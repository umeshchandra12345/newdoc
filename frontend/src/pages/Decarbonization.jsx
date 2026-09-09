import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingDown,
  Plus,
  Sliders,
  CheckCircle2,
  DollarSign,
  Target,
  ArrowRight,
  Info,
  X,
  Check,
  BarChart3
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
import api from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Decarbonization = () => {
  const [scenario, setScenario] = useState('current'); // 'current' or 'accelerated'
  const [scenarioData, setScenarioData] = useState(null);
  const [initiatives, setInitiatives] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add initiative modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newInit, setNewInit] = useState({
    name: '',
    reduction: '',
    investment: '',
    roi: '',
    status: 'In Progress'
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchScenarioData = async (scen) => {
    try {
      const res = await api.get(`/api/reduction/scenarios?scenario=${scen}`);
      setScenarioData(res.data);
    } catch (err) {
      console.error('Failed to load scenario data', err);
    }
  };

  const fetchInitiatives = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/reduction');
      setInitiatives(res.data);
    } catch (err) {
      console.error('Failed to load reduction initiatives', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitiatives();
  }, []);

  useEffect(() => {
    fetchScenarioData(scenario);
  }, [scenario]);

  const maccChartData = useMemo(() => {
    if (!initiatives.length) return null;
    const sorted = [...initiatives].sort((a, b) => b.reduction - a.reduction);
    return {
      labels: sorted.map((init) => init.name),
      datasets: [
        {
          label: 'Abatement Potential (tCO₂e)',
          data: sorted.map((init) => init.reduction),
          backgroundColor: '#34C759',
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 38
        }
      ]
    };
  }, [initiatives]);

  const handleCreateInitiative = async (e) => {
    e.preventDefault();
    if (!newInit.name || !newInit.reduction || !newInit.investment || !newInit.roi) {
      setError('Please fill in all fields.');
      return;
    }
    try {
      setSaving(true);
      setError('');
      await api.post('/api/reduction', {
        name: newInit.name,
        reduction: parseFloat(newInit.reduction),
        investment: newInit.investment,
        roi: parseFloat(newInit.roi),
        status: newInit.status
      });
      setIsModalOpen(false);
      setNewInit({ name: '', reduction: '', investment: '', roi: '', status: 'In Progress' });
      fetchInitiatives();
    } catch (err) {
      setError('Failed to add initiative.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
            Decarbonization Planner & Marginal Abatement
          </h2>
          <p className="page-subtitle">
            Model emission reduction interventions, forecast scenario roadmaps, and track CapEx payback.
          </p>
        </div>

        <button className="btn btn-emerald" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} />
          <span>Add Initiative</span>
        </button>
      </div>

      {/* Scenario Selector Banner */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-light)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '28px',
        boxShadow: 'var(--shadow-card)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-emerald)', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              SCENARIO SIMULATION ENGINE (PROJECTION ONLY)
            </span>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px', fontFamily: "'Outfit', sans-serif" }}>
              Strategic Transition Roadmap Selector
            </h3>
          </div>

          <div className="toggle-group">
            <button
              className={`toggle-btn ${scenario === 'current' ? 'active' : ''}`}
              onClick={() => setScenario('current')}
            >
              Current Path (Committed)
            </button>
            <button
              className={`toggle-btn ${scenario === 'accelerated' ? 'active' : ''}`}
              onClick={() => setScenario('accelerated')}
            >
              Accelerated Reduction (1.5°C)
            </button>
          </div>
        </div>

        {scenarioData && (
          <div>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              {scenarioData.description}
            </p>

            {/* Scenario Dynamic KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Projected Footprint</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
                  {Number(scenarioData.projected_emissions).toLocaleString()} <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>tCO₂e</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-emerald)', fontWeight: 600, marginTop: '2px' }}>
                  Baseline: {Number(scenarioData.baseline_emissions).toLocaleString()} t
                </div>
              </div>

              <div style={{ background: 'var(--color-emerald-light)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0, 245, 160, 0.25)' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-emerald)', fontWeight: 700, textTransform: 'uppercase' }}>Total Modeled Cut</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--color-emerald)', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
                  -{scenarioData.reduction_pct}%
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-emerald)', fontWeight: 600, marginTop: '2px' }}>
                  {Number(scenarioData.total_reduction).toLocaleString()} tCO₂e abated
                </div>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>CapEx Required</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--text-main)', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
                  {scenarioData.investment_required}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Blended ROI: 26.4%</div>
              </div>

              <div style={{ background: 'var(--bg-muted)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>2030 Target Realized</div>
                <div style={{ fontSize: '24px', fontWeight: 900, color: scenario === 'accelerated' ? 'var(--color-emerald)' : 'var(--color-amber)', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
                  {scenarioData.target_achievement_pct}%
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: scenario === 'accelerated' ? '#047857' : '#D97706' }}>
                  {scenarioData.status}
                </div>
              </div>
            </div>

            {/* Key Levers in this scenario */}
            <div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', marginBottom: '8px' }}>
                Key Decarbonization Levers Enabled in this Scenario:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {scenarioData.key_actions.map((act, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#334155' }}>
                    <CheckCircle2 size={16} color="#10B981" />
                    <span>{act}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Interactive MACC Visualization Card */}
      {maccChartData && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Marginal Abatement Cost Curve (MACC) Simulation</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Initiative decarbonization volume ranked by carbon ROI
              </span>
            </div>
            <span className="badge badge-verified">Active Decarbonization Pipeline</span>
          </div>

          <div style={{ height: '260px' }}>
            <Bar
              data={maccChartData}
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
                    padding: 12,
                    cornerRadius: 12,
                    callbacks: {
                      label: (ctx) => ` Abatement: -${Number(ctx.raw).toLocaleString()} tCO₂e`
                    }
                  }
                },
                scales: {
                  y: {
                    grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                    ticks: { color: '#86868B', font: { size: 11 }, callback: (v) => `${(v / 1000).toFixed(0)}k` }
                  },
                  x: {
                    grid: { display: false, drawBorder: false },
                    ticks: { color: '#6E6E73', font: { size: 11, weight: '600' } }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Initiatives Pipeline Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Marginal Abatement Decarbonization Pipeline</div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Real-time initiative registry</span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Initiative Name</th>
                <th>Potential Reduction (tCO₂e)</th>
                <th>Investment Required</th>
                <th>Internal ROI (%)</th>
                <th>Implementation Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    Loading initiatives...
                  </td>
                </tr>
              ) : (
                initiatives.map((init) => (
                  <tr key={init.id}>
                    <td style={{ fontWeight: 600 }}>{init.name}</td>
                    <td style={{ fontWeight: 700, color: '#047857' }}>
                      -{Number(init.reduction).toLocaleString()} tCO₂e
                    </td>
                    <td>{init.investment}</td>
                    <td style={{ fontWeight: 600 }}>{init.roi}%</td>
                    <td>
                      <span className={`badge ${
                        init.status === 'Completed' ? 'badge-verified' :
                        init.status === 'In Progress' ? 'badge-info' : 'badge-pending'
                      }`}>
                        {init.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Initiative Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Add Decarbonization Initiative</h3>
              <button className="icon-button" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateInitiative}>
              <div className="modal-body">
                {error && (
                  <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                    {error}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Initiative Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. On-site 5MW Wind Turbine Installation"
                    value={newInit.name}
                    onChange={(e) => setNewInit({ ...newInit, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Potential Reduction (tCO₂e) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 8400"
                      value={newInit.reduction}
                      onChange={(e) => setNewInit({ ...newInit, reduction: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Investment Required *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ₹6.5 Cr"
                      value={newInit.investment}
                      onChange={(e) => setNewInit({ ...newInit, investment: e.target.value })}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Internal ROI (%) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 21.5"
                      value={newInit.roi}
                      onChange={(e) => setNewInit({ ...newInit, roi: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={newInit.status}
                      onChange={(e) => setNewInit({ ...newInit, status: e.target.value })}
                    >
                      <option value="In Progress">In Progress</option>
                      <option value="Planned">Planned</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-emerald" disabled={saving}>
                  <Check size={16} />
                  <span>{saving ? 'Adding...' : 'Save Initiative'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Decarbonization;
