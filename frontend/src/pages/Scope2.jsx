import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Zap, SunMedium, Activity, ToggleLeft, ToggleRight, Info } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';

const Scope2 = () => {
  const { reportingYear } = useOutletContext();
  const [method, setMethod] = useState('location'); // 'location' or 'market'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/emissions/scopes/scope2-stats?year=${reportingYear}&method=${method}`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load Scope 2 data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [reportingYear, method]);

  if (loading || !stats) {
    return <div style={{ padding: '40px', color: '#64748B' }}>Loading Scope 2 energy data...</div>;
  }

  const facilityLabels = stats.facilities.map((f) => f.facility);
  const chartData = {
    labels: facilityLabels,
    datasets: [
      {
        label: 'Location-Based (Grid Average)',
        data: stats.facilities.map((f) => f.location_emissions),
        backgroundColor: '#0071E3',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 32
      },
      {
        label: 'Market-Based (With PPA / RECs)',
        data: stats.facilities.map((f) => f.market_emissions),
        backgroundColor: '#34C759',
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 32
      }
    ]
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Scope 2 Purchased Energy
          </h2>
          <p className="page-subtitle">
            Indirect GHG emissions associated with grid electricity and captive steam consumption across facilities.
          </p>
        </div>

        {/* Location vs Market Method Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#475569' }}>Accounting Method:</span>
          <div className="toggle-group">
            <button
              className={`toggle-btn ${method === 'location' ? 'active' : ''}`}
              onClick={() => setMethod('location')}
            >
              Location-Based
            </button>
            <button
              className={`toggle-btn ${method === 'market' ? 'active' : ''}`}
              onClick={() => setMethod('market')}
            >
              Market-Based
            </button>
          </div>
        </div>
      </div>

      {/* Method explanation banner */}
      <div style={{
        background: method === 'market' ? '#ECFDF5' : '#EFF6FF',
        border: `1px solid ${method === 'market' ? '#A7F3D0' : '#BFDBFE'}`,
        borderRadius: '10px',
        padding: '12px 18px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '13px',
        color: method === 'market' ? '#065F46' : '#1E40AF'
      }}>
        <Info size={18} />
        <div>
          {method === 'market' ? (
            <span>
              <strong>Market-Based Mode:</strong> Reflects emissions from electricity that your organization has purposefully chosen (contractual Solar PPAs and EACs, delivering a 28.5% zero-emissions credit).
            </span>
          ) : (
            <span>
              <strong>Location-Based Mode:</strong> Reflects average emission intensity of the regional grid where energy consumption occurs (CEA India National Grid Average: 0.72 kgCO₂e/kWh).
            </span>
          )}
        </div>
      </div>

      {/* Top Cards */}
      <div className="kpi-grid">
        <div className="kpi-card scope2">
          <div className="kpi-label">
            <span>Scope 2 ({method === 'market' ? 'Market' : 'Location'})</span>
            <Zap size={18} color="#10B981" />
          </div>
          <div className="kpi-value">
            {Number(stats.total_emissions).toLocaleString(undefined, { maximumFractionDigits: 1 })}
            <span className="kpi-unit">tCO₂e</span>
          </div>
          <div className="kpi-change positive">
            <span>{method === 'market' ? '29,307 t avoided via Solar PPA' : 'National Grid Factor Applied'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Total Electricity Consumption</div>
          <div className="kpi-value">
            {(stats.total_electricity_kwh / 1000000).toFixed(1)}
            <span className="kpi-unit">Million kWh</span>
          </div>
          <div className="kpi-change neutral">
            <span>{Number(stats.total_electricity_kwh).toLocaleString()} kWh total</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Grid Emission Factor</div>
          <div className="kpi-value">
            {stats.grid_emission_factor}
            <span className="kpi-unit">kgCO₂e/kWh</span>
          </div>
          <div className="kpi-change neutral">
            <span>Central Electricity Authority 2026</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Renewable Energy Share</span>
            <SunMedium size={18} color="#10B981" />
          </div>
          <div className="kpi-value">
            {stats.renewable_energy_pct}%
          </div>
          <div className="kpi-change positive">
            <span>Captive solar + Open-access PPA</span>
          </div>
        </div>
      </div>

      {/* Facility Comparison Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Facility Scope 2 Comparison: Location vs. Market Based</div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Values in tCO₂e</span>
        </div>
        <div style={{ height: '280px' }}>
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                  align: 'end',
                  labels: {
                    boxWidth: 10,
                    boxHeight: 10,
                    usePointStyle: true,
                    pointStyle: 'circle',
                    font: { size: 12, weight: '600' },
                    color: '#6E6E73'
                  }
                },
                tooltip: {
                  backgroundColor: 'rgba(255, 255, 255, 0.92)',
                  titleColor: '#1D1D1F',
                  bodyColor: '#424245',
                  borderColor: 'rgba(255, 255, 255, 0.95)',
                  borderWidth: 1.5,
                  padding: 12,
                  cornerRadius: 12,
                  callbacks: {
                    label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} tCO₂e`
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

      {/* Facility Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Facility Electricity Breakdown & Tariffs</div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Consumption (kWh)</th>
                <th>Location-Based (tCO₂e)</th>
                <th>Market-Based (tCO₂e)</th>
                <th>Renewable Share</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.facilities.map((fac, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{fac.facility}</td>
                  <td>{Number(fac.consumption_kwh).toLocaleString()} kWh</td>
                  <td style={{ fontWeight: 600, color: '#3B82F6' }}>
                    {Number(fac.location_emissions).toLocaleString()}
                  </td>
                  <td style={{ fontWeight: 700, color: '#10B981' }}>
                    {Number(fac.market_emissions).toLocaleString()}
                  </td>
                  <td>
                    <span className="badge badge-verified">{fac.renewable_pct}% Solar</span>
                  </td>
                  <td>
                    <span className="badge badge-verified">Verified</span>
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

export default Scope2;
