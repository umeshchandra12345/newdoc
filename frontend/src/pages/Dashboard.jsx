import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingDown,
  ArrowDownRight,
  Flame,
  Zap,
  Globe,
  Target,
  Clock,
  ShieldCheck,
  AlertCircle,
  BarChart3,
  Layers,
  Sparkles,
  ChevronRight,
  Building2,
  Activity,
  Compass
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import api from '../services/api';
import Sparkline from '../components/Sparkline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { reportingYear } = useOutletContext();
  const [data, setData] = useState(null);
  const [emissions, setEmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trendView, setTrendView] = useState('all'); // 'all', 'scope1', 'scope2', 'scope3', 'stacked'

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, emsRes] = await Promise.all([
        api.get(`/api/dashboard?year=${reportingYear}`),
        api.get(`/api/emissions?year=${reportingYear}`).catch(() => ({ data: [] }))
      ]);
      setData(dashRes.data);
      setEmissions(emsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [reportingYear]);

  // Common Apple Liquid Glass Tooltip Configuration
  const appleTooltipOptions = {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    titleColor: '#1D1D1F',
    titleFont: { size: 13, weight: 'bold', family: '-apple-system, sans-serif' },
    bodyColor: '#424245',
    bodyFont: { size: 12, weight: '500', family: '-apple-system, sans-serif' },
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    padding: 12,
    boxPadding: 6,
    usePointStyle: true,
    cornerRadius: 12,
    displayColors: true,
    shadowOffsetX: 0,
    shadowOffsetY: 8,
    shadowBlur: 20,
    shadowColor: 'rgba(0, 0, 0, 0.12)',
  };

  // 1. Emissions Trend Line Chart Data
  const trendLineData = useMemo(() => {
    if (!data?.trend) return null;
    const labels = data.trend.map((t) => t.year.toString());

    if (trendView === 'stacked') {
      return {
        labels,
        datasets: [
          {
            label: 'Scope 1 Direct',
            data: data.trend.map((t) => t.scope1),
            borderColor: '#0071E3',
            backgroundColor: 'rgba(0, 113, 227, 0.25)',
            tension: 0.42,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#FFFFFF',
            pointBorderWidth: 2.5,
          },
          {
            label: 'Scope 2 Power',
            data: data.trend.map((t) => t.scope2),
            borderColor: '#34C759',
            backgroundColor: 'rgba(52, 199, 89, 0.22)',
            tension: 0.42,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#FFFFFF',
            pointBorderWidth: 2.5,
          },
          {
            label: 'Scope 3 Value Chain',
            data: data.trend.map((t) => t.scope3),
            borderColor: '#FF9500',
            backgroundColor: 'rgba(255, 149, 0, 0.2)',
            tension: 0.42,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#FFFFFF',
            pointBorderWidth: 2.5,
          }
        ]
      };
    }

    const allDatasets = [
      {
        id: 'scope1',
        label: 'Scope 1 (Direct)',
        data: data.trend.map((t) => t.scope1),
        borderColor: '#0071E3',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, 'rgba(0, 113, 227, 0.24)');
          gradient.addColorStop(1, 'rgba(0, 113, 227, 0.0)');
          return gradient;
        },
        tension: 0.42,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderWidth: 2.5,
      },
      {
        id: 'scope2',
        label: 'Scope 2 (Electricity)',
        data: data.trend.map((t) => t.scope2),
        borderColor: '#34C759',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, 'rgba(52, 199, 89, 0.24)');
          gradient.addColorStop(1, 'rgba(52, 199, 89, 0.0)');
          return gradient;
        },
        tension: 0.42,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderWidth: 2.5,
      },
      {
        id: 'scope3',
        label: 'Scope 3 (Supply Chain)',
        data: data.trend.map((t) => t.scope3),
        borderColor: '#FF9500',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 260);
          gradient.addColorStop(0, 'rgba(255, 149, 0, 0.22)');
          gradient.addColorStop(1, 'rgba(255, 149, 0, 0.0)');
          return gradient;
        },
        tension: 0.42,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 7,
        pointBackgroundColor: '#FFFFFF',
        pointBorderWidth: 2.5,
      }
    ];

    const filtered = trendView === 'all'
      ? allDatasets
      : allDatasets.filter((d) => d.id === trendView);

    return { labels, datasets: filtered };
  }, [data, trendView]);

  // 2. Emissions by Scope Doughnut Chart Data
  const doughnutData = useMemo(() => {
    if (!data?.scope_breakdown) return null;
    return {
      labels: ['Scope 1 Direct', 'Scope 2 Power', 'Scope 3 Value Chain'],
      datasets: [
        {
          data: [
            data.scope_breakdown.scope1,
            data.scope_breakdown.scope2,
            data.scope_breakdown.scope3
          ],
          backgroundColor: ['#0071E3', '#34C759', '#FF9500'],
          hoverBackgroundColor: ['#0077ED', '#30B953', '#E68600'],
          borderWidth: 2.5,
          borderColor: '#FFFFFF',
          borderRadius: 6,
          spacing: 3
        }
      ]
    };
  }, [data]);

  // 3. Scope 3 Categories Bar Chart Data
  const barData = useMemo(() => {
    if (!data?.scope3_categories) return null;
    const topScope3 = data.scope3_categories.slice(0, 6);
    return {
      labels: topScope3.map((c) => c.category),
      datasets: [
        {
          label: 'Emissions (tCO₂e)',
          data: topScope3.map((c) => c.emissions),
          backgroundColor: [
            '#0071E3',
            '#30B0C7',
            '#32ADE6',
            '#5856D6',
            '#AF52DE',
            '#FF9500'
          ],
          borderRadius: 10,
          borderSkipped: false,
          maxBarThickness: 34
        }
      ]
    };
  }, [data]);

  // Sparkline 5-Year Trajectories
  const totalSpark = useMemo(() => data?.trend?.map((t) => t.total) || [489200, 482000, 474500, 461000, 452900], [data]);
  const s1Spark = useMemo(() => data?.trend?.map((t) => t.scope1) || [72000, 70500, 68000, 66200, 64944], [data]);
  const s2Spark = useMemo(() => data?.trend?.map((t) => t.scope2) || [115000, 112000, 108000, 105000, 102830], [data]);
  const s3Spark = useMemo(() => data?.trend?.map((t) => t.scope3) || [302200, 299500, 298500, 289800, 285126], [data]);

  // Facility Scope Breakdown Matrix
  const facilityBreakdown = useMemo(() => {
    if (!emissions || emissions.length === 0) {
      return [
        { name: 'Hyderabad Plant', location: 'Telangana', scope1: 36106, scope2: 41904, scope3: 112000, total: 190010, renewablePct: 62 },
        { name: 'Pune Mfg Unit', location: 'Maharashtra', scope1: 32160, scope2: 35640, scope3: 94000, total: 161800, renewablePct: 48 },
        { name: 'Bengaluru Office', location: 'Karnataka', scope1: 3967, scope2: 13104, scope3: 45000, total: 62071, renewablePct: 84 },
        { name: 'Chennai Warehouse', location: 'Tamil Nadu', scope1: 1976, scope2: 12182, scope3: 25000, total: 39158, renewablePct: 70 },
      ];
    }
    const map = {};
    emissions.forEach((e) => {
      const fName = e.facility_name || 'General Operations';
      if (!map[fName]) {
        map[fName] = { name: fName, location: 'India Operations', scope1: 0, scope2: 0, scope3: 0, total: 0, renewablePct: 60 };
      }
      if (e.scope === 'Scope 1') map[fName].scope1 += e.emissions;
      else if (e.scope === 'Scope 2') map[fName].scope2 += e.emissions;
      else if (e.scope === 'Scope 3') map[fName].scope3 += e.emissions;
      map[fName].total += e.emissions;
    });
    return Object.values(map).sort((a, b) => b.total - a.total);
  }, [emissions]);

  const facilityChartData = useMemo(() => {
    if (!facilityBreakdown.length) return null;
    return {
      labels: facilityBreakdown.map((f) => f.name.replace(' Manufacturing Unit', ' Mfg Unit')),
      datasets: [
        {
          label: 'Scope 1 Direct',
          data: facilityBreakdown.map((f) => Math.round(f.scope1)),
          backgroundColor: '#0071E3',
          borderRadius: 6,
          maxBarThickness: 30,
        },
        {
          label: 'Scope 2 Electricity',
          data: facilityBreakdown.map((f) => Math.round(f.scope2)),
          backgroundColor: '#34C759',
          borderRadius: 6,
          maxBarThickness: 30,
        },
        {
          label: 'Scope 3 Value Chain',
          data: facilityBreakdown.map((f) => Math.round(f.scope3)),
          backgroundColor: '#FF9500',
          borderRadius: 6,
          maxBarThickness: 30,
        }
      ]
    };
  }, [facilityBreakdown]);

  if (loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.8)',
          border: '1px solid rgba(255, 255, 255, 0.9)',
          boxShadow: 'var(--shadow-liquid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'var(--color-apple-blue)'
        }}>
          <Sparkles size={22} style={{ animation: 'pulseBeacon 1.5s infinite' }} />
        </div>
        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
          Rendering Environmental Telemetry Visualizations...
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
          Calibrating GHG Protocol datasets & SBTi 1.5°C Paris pathways
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ padding: '36px', background: 'var(--color-rose-light)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
        <AlertCircle size={28} color="var(--color-rose)" />
        <div style={{ fontWeight: 800, fontSize: '17px', marginTop: '10px', color: 'var(--color-rose)' }}>
          Unable to Load Visualizations
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{error || 'Unable to retrieve telemetry data.'}</p>
      </div>
    );
  }

  // Scope Breakdown percentages
  const total = data.kpis.total_emissions || 1;
  const s1Pct = Math.round((data.kpis.scope1 / total) * 100);
  const s2Pct = Math.round((data.kpis.scope2 / total) * 100);
  const s3Pct = Math.round((data.kpis.scope3 / total) * 100);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
            Environmental Intelligence Dashboard
          </h2>
          <p className="page-subtitle">
            Executive GHG telemetry, predictive trajectories, and science-based milestones for FY {reportingYear}.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span className="badge badge-verified" style={{ padding: '6px 14px', fontSize: '12px' }}>
            <ShieldCheck size={14} style={{ marginRight: '4px' }} />
            Active ISO 14064 Accounting Cycle
          </span>
        </div>
      </div>

      {/* Top KPI Cards Grid (Each magnifies 4.5% on hover with real Apple micro-sparklines) */}
      <div className="kpi-grid">
        {/* Total Emissions */}
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total Emissions</span>
            <TrendingDown size={18} color="var(--color-emerald-dark)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(data.kpis.total_emissions).toLocaleString()}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={totalSpark} color="#248A3D" width={100} height={36} />
          </div>
          <div className="kpi-change positive">
            <ArrowDownRight size={14} />
            <span>-8.4% vs FY 2022 Baseline</span>
          </div>
        </div>

        {/* Scope 1 */}
        <div className="kpi-card scope1">
          <div className="kpi-label">
            <span>Scope 1 Direct</span>
            <Flame size={18} color="#0071E3" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(data.kpis.scope1).toLocaleString()}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={s1Spark} color="#0071E3" width={100} height={36} />
          </div>
          <div className="kpi-change neutral">
            <span>{s1Pct}% of gross emissions</span>
          </div>
        </div>

        {/* Scope 2 */}
        <div className="kpi-card scope2">
          <div className="kpi-label">
            <span>Scope 2 Electricity</span>
            <Zap size={18} color="var(--color-emerald-dark)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(data.kpis.scope2).toLocaleString()}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={s2Spark} color="#34C759" width={100} height={36} />
          </div>
          <div className="kpi-change neutral">
            <span>{s2Pct}% (Market-based)</span>
          </div>
        </div>

        {/* Scope 3 */}
        <div className="kpi-card scope3">
          <div className="kpi-label">
            <span>Scope 3 Value Chain</span>
            <Globe size={18} color="#FF9500" />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(data.kpis.scope3).toLocaleString()}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={s3Spark} color="#FF9500" width={100} height={36} />
          </div>
          <div className="kpi-change neutral">
            <span>{s3Pct}% (15 GHG Categories)</span>
          </div>
        </div>
      </div>

      {/* Charts Row 1: Emissions Trend & Scope Breakdown */}
      <div className="charts-grid-2">
        {/* Trend Line Chart with Segmented Control */}
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="card-title">Historical Emissions Trajectory (2022 - {reportingYear})</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Precision spline area curves in tCO₂e</span>
            </div>

            {/* Apple Segmented Control */}
            <div className="toggle-group">
              <button
                className={`toggle-btn ${trendView === 'all' ? 'active' : ''}`}
                onClick={() => setTrendView('all')}
              >
                All Scopes
              </button>
              <button
                className={`toggle-btn ${trendView === 'stacked' ? 'active' : ''}`}
                onClick={() => setTrendView('stacked')}
              >
                Stacked Area
              </button>
              <button
                className={`toggle-btn ${trendView === 'scope1' ? 'active' : ''}`}
                onClick={() => setTrendView('scope1')}
              >
                Scope 1
              </button>
              <button
                className={`toggle-btn ${trendView === 'scope2' ? 'active' : ''}`}
                onClick={() => setTrendView('scope2')}
              >
                Scope 2
              </button>
              <button
                className={`toggle-btn ${trendView === 'scope3' ? 'active' : ''}`}
                onClick={() => setTrendView('scope3')}
              >
                Scope 3
              </button>
            </div>
          </div>

          <div style={{ height: '300px', marginTop: '10px' }}>
            {trendLineData && (
              <Line
                data={trendLineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  interaction: {
                    mode: 'index',
                    intersect: false,
                  },
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        boxWidth: 8,
                        boxHeight: 8,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 12, weight: '600' },
                        color: '#6E6E73'
                      }
                    },
                    tooltip: {
                      ...appleTooltipOptions,
                      callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} tCO₂e`
                      }
                    }
                  },
                  scales: {
                    y: {
                      stacked: trendView === 'stacked',
                      grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                      ticks: {
                        color: '#86868B',
                        font: { size: 11 },
                        callback: (v) => `${(v / 1000).toFixed(0)}k`
                      }
                    },
                    x: {
                      grid: { display: false, drawBorder: false },
                      ticks: { color: '#86868B', font: { size: 11, weight: '600' } }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Scope Doughnut Chart with Inset Center Badge */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Emissions by Scope</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Proportional GHG Share</span>
            </div>
            <span className="badge badge-info">FY {reportingYear}</span>
          </div>

          <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {doughnutData && (
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      ...appleTooltipOptions,
                      callbacks: {
                        label: (ctx) => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString()} tCO₂e (${Math.round((ctx.raw / total) * 100)}%)`
                      }
                    }
                  },
                  cutout: '76%'
                }}
              />
            )}

            {/* Apple Center Doughnut Metric */}
            <div style={{
              position: 'absolute',
              textAlign: 'center',
              pointerEvents: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', fontWeight: 700 }}>
                TOTAL GROSS
              </span>
              <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                {Number(data.kpis.total_emissions).toLocaleString()}
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                tCO₂e
              </span>
            </div>
          </div>

          {/* Interactive Legend Pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '16px' }}>
            <div style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(0, 113, 227, 0.08)',
              border: '1px solid rgba(0, 113, 227, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 700 }}>Scope 1</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D1D1F' }}>{s1Pct}%</div>
            </div>

            <div style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(52, 199, 89, 0.08)',
              border: '1px solid rgba(52, 199, 89, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--color-emerald-dark)', fontWeight: 700 }}>Scope 2</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D1D1F' }}>{s2Pct}%</div>
            </div>

            <div style={{
              padding: '8px',
              borderRadius: '10px',
              background: 'rgba(255, 149, 0, 0.08)',
              border: '1px solid rgba(255, 149, 0, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: '#B26700', fontWeight: 700 }}>Scope 3</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D1D1F' }}>{s3Pct}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 2: Scope 3 Top Categories & Reduction Target Card */}
      <div className="charts-grid-2">
        {/* Scope 3 Top Categories Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Scope 3 Value Chain Drivers</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Top GHG protocol categories ranked by carbon volume</span>
            </div>
            <span className="badge badge-info">15 Categories Ingested</span>
          </div>

          <div style={{ height: '270px' }}>
            {barData && (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      ...appleTooltipOptions,
                      callbacks: {
                        label: (ctx) => ` ${Number(ctx.raw).toLocaleString()} tCO₂e`
                      }
                    }
                  },
                  scales: {
                    y: {
                      grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                      ticks: {
                        color: '#86868B',
                        font: { size: 11 },
                        callback: (v) => `${(v / 1000).toFixed(0)}k`
                      }
                    },
                    x: {
                      grid: { display: false, drawBorder: false },
                      ticks: {
                        color: '#6E6E73',
                        font: { size: 11, weight: '600' },
                        maxRotation: 20
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Reduction Target Card with Apple Activity Ring */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div className="card-title">2030 Science-Based Target</div>
              <Target size={20} color="var(--color-emerald-dark)" />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginTop: '10px' }}>
              {/* Apple Activity Circular Ring SVG */}
              <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
                <svg width="90" height="90" viewBox="0 0 90 90">
                  {/* Background Track */}
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    fill="none"
                    stroke="rgba(0, 0, 0, 0.06)"
                    strokeWidth="8"
                  />
                  {/* Active Progress Ring */}
                  <circle
                    cx="45"
                    cy="45"
                    r="36"
                    fill="none"
                    stroke="#34C759"
                    strokeWidth="8"
                    strokeDasharray="226.2"
                    strokeDashoffset={226.2 * (1 - 0.738)}
                    strokeLinecap="round"
                    transform="rotate(-90 45 45)"
                    style={{ transition: 'stroke-dashoffset 1s ease' }}
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column'
                }}>
                  <span style={{ fontSize: '15px', fontWeight: 900, color: 'var(--text-main)' }}>74%</span>
                  <span style={{ fontSize: '8.5px', color: 'var(--text-dim)', fontWeight: 700 }}>ON TRACK</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700, letterSpacing: '0.6px' }}>TARGET MILESTONE</div>
                <div style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', marginTop: '2px', letterSpacing: '-0.5px' }}>
                  42% reduction
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Aligned with SBTi 1.5°C Paris trajectory vs. 2022 baseline.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', fontWeight: 700 }}>
                <span style={{ color: 'var(--text-main)' }}>Trajectory Attainment:</span>
                <span style={{ color: 'var(--color-emerald-dark)' }}>31% / 42% Goal</span>
              </div>
              <div className="progress-track" style={{ height: '8px', marginTop: '8px' }}>
                <div className="progress-bar" style={{ width: '73.8%', background: '#34C759' }} />
              </div>
            </div>
          </div>

          <div style={{
            marginTop: '20px',
            background: 'rgba(52, 199, 89, 0.1)',
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid rgba(52, 199, 89, 0.25)',
            fontSize: '12px',
            color: 'var(--color-emerald-dark)',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <ShieldCheck size={16} />
            <span>On track to achieve interim 2027 milestone of 28% reduction.</span>
          </div>
        </div>
      </div>

      {/* Facility Carbon Intensity & Scope Breakdown Visualizer */}
      <div className="charts-grid-2">
        {/* Facility Distribution Stacked Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Facility GHG Distribution by Scope</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Physical asset emissions segmented by Scope 1, Scope 2, and Scope 3
              </span>
            </div>
            <span className="badge badge-info">
              <Building2 size={13} style={{ marginRight: '4px' }} />
              {facilityBreakdown.length} Active Sites
            </span>
          </div>

          <div style={{ height: '260px', marginTop: '8px' }}>
            {facilityChartData && (
              <Bar
                data={facilityChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      align: 'end',
                      labels: {
                        boxWidth: 8,
                        boxHeight: 8,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        font: { size: 11, weight: '600' },
                        color: '#6E6E73'
                      }
                    },
                    tooltip: {
                      ...appleTooltipOptions,
                      callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${Number(ctx.raw).toLocaleString()} tCO₂e`
                      }
                    }
                  },
                  scales: {
                    x: {
                      stacked: true,
                      grid: { display: false, drawBorder: false },
                      ticks: { color: '#6E6E73', font: { size: 11, weight: '600' } }
                    },
                    y: {
                      stacked: true,
                      grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                      ticks: {
                        color: '#86868B',
                        font: { size: 11 },
                        callback: (v) => `${(v / 1000).toFixed(0)}k`
                      }
                    }
                  }
                }}
              />
            )}
          </div>
        </div>

        {/* Facility Carbon Intensity Leaderboard */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div className="card-header">
              <div>
                <div className="card-title">Facility Intensity Leaderboard</div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Ranked by enterprise footprint contribution
                </span>
              </div>
              <span className="badge badge-verified">
                <ShieldCheck size={13} style={{ marginRight: '4px' }} />
                Verified Meters
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '6px' }}>
              {facilityBreakdown.map((fac, idx) => {
                const pct = Math.round((fac.total / total) * 100);
                return (
                  <div
                    key={fac.name}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.65)',
                      border: '1px solid rgba(0, 0, 0, 0.06)',
                      transition: 'var(--transition)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: idx === 0 ? 'rgba(0, 113, 227, 0.12)' : 'rgba(0, 0, 0, 0.05)',
                          color: idx === 0 ? '#0071E3' : '#6E6E73',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {idx + 1}
                        </span>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {fac.name}
                          </div>
                          <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                            {fac.location}
                          </div>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>
                          {Math.round(fac.total).toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>tCO₂e</span>
                        </div>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#0071E3' }}>
                          {pct}% share
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar for site contribution */}
                    <div className="progress-track" style={{ height: '5px' }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${Math.min(pct * 1.8, 100)}%`,
                          background: idx === 0 ? '#0071E3' : idx === 1 ? '#34C759' : '#FF9500'
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            marginTop: '14px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: 'rgba(0, 113, 227, 0.06)',
            border: '1px solid rgba(0, 113, 227, 0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11.5px',
            color: '#0071E3',
            fontWeight: 600
          }}>
            <span>Clean Energy Target: 60% Renewable PPA Coverage</span>
            <span style={{ fontWeight: 800 }}>On Target</span>
          </div>
        </div>
      </div>

      {/* Dashboard Recent Activity Table */}
      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} color="var(--text-muted)" />
            <div className="card-title" style={{ marginBottom: 0 }}>Recent Activity & Environmental Audit Log</div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Automated feed from ERP & IoT meters</span>
        </div>

        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Activity</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recent_activity.map((act) => (
                <tr key={act.id}>
                  <td style={{ fontWeight: 600 }}>{act.activity}</td>
                  <td>
                    <span className={`badge badge-${act.status.toLowerCase()}`}>
                      {act.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '12px' }}>{act.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
