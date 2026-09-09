import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Flame, Factory, TrendingDown, Truck, AlertTriangle } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import api from '../services/api';

const Scope1 = () => {
  const { reportingYear } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/emissions/scopes/scope1-stats?year=${reportingYear}`);
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load scope 1 stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [reportingYear]);

  if (loading || !stats) {
    return <div style={{ padding: '40px', color: '#64748B' }}>Loading Scope 1 data...</div>;
  }

  const chartData = {
    labels: stats.monthly.map((m) => m.month),
    datasets: [
      {
        label: 'Scope 1 Monthly Emissions (tCO₂e)',
        data: stats.monthly.map((m) => m.emissions),
        backgroundColor: '#0071E3',
        borderRadius: 10,
        borderSkipped: false,
        maxBarThickness: 36
      }
    ]
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Scope 1 Direct Emissions
          </h2>
          <p className="page-subtitle">
            Direct greenhouse gas emissions from company-owned furnaces, stationary generators, mobile plant equipment, and fleet.
          </p>
        </div>
      </div>

      {/* Top Cards */}
      <div className="kpi-grid">
        <div className="kpi-card scope1">
          <div className="kpi-label">
            <span>Total Scope 1</span>
            <Flame size={18} color="#3B82F6" />
          </div>
          <div className="kpi-value">
            {Number(stats.total_scope1).toLocaleString()}
            <span className="kpi-unit">tCO₂e</span>
          </div>
          <div className="kpi-change positive">
            <span>↓ {Math.abs(stats.yoy_change_pct)}% YoY reduction</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Highest Emitting Facility</div>
          <div className="kpi-value" style={{ fontSize: '20px' }}>
            {stats.highest_facility.name}
          </div>
          <div className="kpi-change neutral">
            <span>{Number(stats.highest_facility.emissions).toLocaleString()} tCO₂e direct</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Stationary Combustion</div>
          <div className="kpi-value">
            {Number(stats.categories.stationary).toLocaleString()}
            <span className="kpi-unit">tCO₂e</span>
          </div>
          <div className="kpi-change neutral">Natural gas boilers & furnaces</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Fleet & Mobile</div>
          <div className="kpi-value">
            {Number(stats.categories.mobile + stats.categories.fleet).toLocaleString()}
            <span className="kpi-unit">tCO₂e</span>
          </div>
          <div className="kpi-change neutral">Logistics fleet & internal trucks</div>
        </div>
      </div>

      {/* Monthly Emissions Chart */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Scope 1 Monthly Emissions Profile ({reportingYear})</div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Values in tCO₂e</span>
        </div>
        <div style={{ height: '270px' }}>
          <Bar
            data={chartData}
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
                    label: (ctx) => ` ${Number(ctx.raw).toLocaleString()} tCO₂e`
                  }
                }
              },
              scales: {
                y: {
                  grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                  ticks: { color: '#86868B', font: { size: 11 } }
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

      {/* Scope 1 Detailed Sources Table */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">Scope 1 Direct Emission Sources</div>
          <span style={{ fontSize: '12px', color: '#64748B' }}>Continuous Fuel & Fugitive Ledger</span>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Source</th>
                <th>Category</th>
                <th>Activity Data</th>
                <th>Emissions (tCO₂e)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.records.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 600 }}>{r.facility}</td>
                  <td>{r.source}</td>
                  <td>
                    <span className="badge badge-info">{r.category}</span>
                  </td>
                  <td>{r.activity}</td>
                  <td style={{ fontWeight: 700 }}>{Number(r.emissions).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge-${r.status.toLowerCase()}`}>{r.status}</span>
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

export default Scope1;
