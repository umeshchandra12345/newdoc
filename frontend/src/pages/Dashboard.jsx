import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  TrendingDown,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
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
  Compass,
  MapPin,
  Sun,
  Cpu,
  Filter,
  Info,
  X,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Factory,
  Truck
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Primary Telemetry Datasets
  const [kpis, setKpis] = useState([]);
  const [trendData, setTrendData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [scope3Data, setScope3Data] = useState(null);
  const [facilitiesData, setFacilitiesData] = useState(null);
  const [energyData, setEnergyData] = useState(null);
  const [supplierMatrix, setSupplierMatrix] = useState(null);
  const [insights, setInsights] = useState([]);

  // Interactive View Controls
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'monthly', 'scope3', 'facilities', 'energy', 'suppliers', 'insights'
  const [trendView, setTrendView] = useState('total'); // 'total', 'stacked', 'scope1', 'scope2_market', 'scope2_location', 'scope3', 'intensity'
  const [monthlyMetric, setMonthlyMetric] = useState('emissions_total'); // 'emissions_total', 'electricity_kwh', 'solar_ppa_kwh', 'intensity_per_unit'
  const [selectedCategory, setSelectedCategory] = useState(null); // Category drilldown drawer
  const [showLineageModal, setShowLineageModal] = useState(false);

  // Fetch all enterprise analytics concurrently
  const fetchEnterpriseData = async () => {
    try {
      setLoading(true);
      setError('');

      const [kpiRes, trendRes, monthlyRes, s3Res, facRes, energyRes, suppRes, insRes] = await Promise.all([
        api.get(`/api/analytics/dashboard-executive?year=${reportingYear}`).catch(() => ({ data: { kpis: [] } })),
        api.get(`/api/analytics/emissions-trend?year=${reportingYear}`).catch(() => ({ data: null })),
        api.get(`/api/analytics/monthly?year=${reportingYear}`).catch(() => ({ data: null })),
        api.get(`/api/analytics/scope3-hotspots?year=${reportingYear}`).catch(() => ({ data: null })),
        api.get(`/api/analytics/facilities-deep?year=${reportingYear}`).catch(() => ({ data: null })),
        api.get(`/api/analytics/energy-intelligence?year=${reportingYear}`).catch(() => ({ data: null })),
        api.get(`/api/analytics/supplier-risk-matrix`).catch(() => ({ data: null })),
        api.get(`/api/analytics/ai-insights?year=${reportingYear}`).catch(() => ({ data: { insights: [] } }))
      ]);

      setKpis(kpiRes.data.kpis || []);
      setTrendData(trendRes.data);
      setMonthlyData(monthlyRes.data);
      setScope3Data(s3Res.data);
      setFacilitiesData(facRes.data);
      setEnergyData(energyRes.data);
      setSupplierMatrix(suppRes.data);
      setInsights(insRes.data.insights || []);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load enterprise telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnterpriseData();
  }, [reportingYear]);

  // Common Apple Liquid Glass Tooltip Configuration
  const appleTooltipOptions = {
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    titleColor: '#1D1D1F',
    titleFont: { size: 12.5, weight: 'bold', family: '-apple-system, sans-serif' },
    bodyColor: '#424245',
    bodyFont: { size: 11.5, weight: '500', family: '-apple-system, sans-serif' },
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    padding: 12,
    cornerRadius: 12,
    usePointStyle: true,
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowBlur: 16
  };

  // 1. Multi-Year Emissions Trend Chart Data (2022 -> 2026)
  const multiYearChartData = useMemo(() => {
    if (!trendData?.historical) return null;
    const labels = trendData.historical.map((h) => h.year.toString());

    if (trendView === 'stacked') {
      return {
        labels,
        datasets: [
          {
            label: 'Scope 1 Direct',
            data: trendData.historical.map((h) => h.scope1),
            borderColor: '#0071E3',
            backgroundColor: 'rgba(0, 113, 227, 0.28)',
            fill: true,
            tension: 0.38,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#FFFFFF',
            pointBorderWidth: 2.5
          },
          {
            label: 'Scope 2 (Market)',
            data: trendData.historical.map((h) => h.scope2_market),
            borderColor: '#34C759',
            backgroundColor: 'rgba(52, 199, 89, 0.25)',
            fill: true,
            tension: 0.38,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#FFFFFF',
            pointBorderWidth: 2.5
          },
          {
            label: 'Scope 3 Value Chain',
            data: trendData.historical.map((h) => h.scope3),
            borderColor: '#FF9500',
            backgroundColor: 'rgba(255, 149, 0, 0.22)',
            fill: true,
            tension: 0.38,
            pointRadius: 4,
            pointHoverRadius: 7,
            pointBackgroundColor: '#FFFFFF',
            pointBorderWidth: 2.5
          }
        ]
      };
    }

    let primaryDataset = {};
    if (trendView === 'scope1') {
      primaryDataset = {
        label: 'Scope 1 Direct (tCO₂e)',
        data: trendData.historical.map((h) => h.scope1),
        borderColor: '#0071E3',
        backgroundColor: 'rgba(0, 113, 227, 0.18)',
        fill: true,
        tension: 0.4
      };
    } else if (trendView === 'scope2_market') {
      primaryDataset = {
        label: 'Scope 2 Market-Based (tCO₂e)',
        data: trendData.historical.map((h) => h.scope2_market),
        borderColor: '#34C759',
        backgroundColor: 'rgba(52, 199, 89, 0.18)',
        fill: true,
        tension: 0.4
      };
    } else if (trendView === 'scope2_location') {
      primaryDataset = {
        label: 'Scope 2 Location-Based (tCO₂e)',
        data: trendData.historical.map((h) => h.scope2_location),
        borderColor: '#30B0C7',
        backgroundColor: 'rgba(48, 176, 199, 0.18)',
        fill: true,
        tension: 0.4
      };
    } else if (trendView === 'scope3') {
      primaryDataset = {
        label: 'Scope 3 Value Chain (tCO₂e)',
        data: trendData.historical.map((h) => h.scope3),
        borderColor: '#FF9500',
        backgroundColor: 'rgba(255, 149, 0, 0.18)',
        fill: true,
        tension: 0.4
      };
    } else if (trendView === 'intensity') {
      primaryDataset = {
        label: 'Emissions Intensity (tCO₂e / $M Rev)',
        data: trendData.historical.map((h) => h.intensity),
        borderColor: '#AF52DE',
        backgroundColor: 'rgba(175, 82, 222, 0.18)',
        fill: true,
        tension: 0.4
      };
    } else {
      // Default: Total Gross with 2030 target trajectory line & 2022 baseline line
      primaryDataset = {
        label: 'Gross GHG Emissions (tCO₂e)',
        data: trendData.historical.map((h) => h.total),
        borderColor: '#0071E3',
        backgroundColor: 'rgba(0, 113, 227, 0.16)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#FFFFFF',
        pointBorderWidth: 2.5
      };
    }

    const datasets = [
      {
        ...primaryDataset,
        pointRadius: 5,
        pointHoverRadius: 8,
        pointBackgroundColor: '#FFFFFF',
        pointBorderWidth: 2.5
      }
    ];

    // Add Baseline and SBTi Target Trajectory lines when in total view
    if (trendView === 'total') {
      datasets.push({
        label: 'SBTi 1.5°C Paris Trajectory',
        data: trendData.historical.map((h) => h.target_pathway),
        borderColor: '#34C759',
        borderDash: [5, 5],
        borderWidth: 2,
        fill: false,
        pointRadius: 3,
        tension: 0.2
      });
      datasets.push({
        label: '2022 Baseline Reference',
        data: trendData.historical.map(() => trendData.baseline_emissions),
        borderColor: '#FF3B30',
        borderDash: [3, 4],
        borderWidth: 1.5,
        fill: false,
        pointRadius: 0
      });
    }

    return { labels, datasets };
  }, [trendData, trendView]);

  // 2. Continuous 12-Month Telemetry Chart Data
  const monthlyChartData = useMemo(() => {
    if (!monthlyData?.months) return null;
    const labels = monthlyData.months.map((m) => m.month);

    let metricLabel = 'Emissions (tCO₂e)';
    let metricData = monthlyData.months.map((m) => m.emissions_total);
    let color = '#0071E3';

    if (monthlyMetric === 'electricity_kwh') {
      metricLabel = 'Electricity Consumption (kWh)';
      metricData = monthlyData.months.map((m) => m.electricity_kwh);
      color = '#34C759';
    } else if (monthlyMetric === 'solar_ppa_kwh') {
      metricLabel = 'Solar PPA Generation (kWh)';
      metricData = monthlyData.months.map((m) => m.solar_ppa_kwh);
      color = '#FF9500';
    } else if (monthlyMetric === 'intensity_per_unit') {
      metricLabel = 'Emissions Intensity (tCO₂e / unit)';
      metricData = monthlyData.months.map((m) => m.intensity_per_unit);
      color = '#AF52DE';
    }

    return {
      labels,
      datasets: [
        {
          label: metricLabel,
          data: metricData,
          backgroundColor: color,
          borderRadius: 8,
          maxBarThickness: 32
        }
      ]
    };
  }, [monthlyData, monthlyMetric]);

  // 3. Scope 3 15-Category Horizontal Ranking Bars
  const scope3RankingChartData = useMemo(() => {
    if (!scope3Data?.categories) return null;
    return {
      labels: scope3Data.categories.map((c) => `Cat ${c.category_num}: ${c.name.split(':')[0].substring(0, 22)}`),
      datasets: [
        {
          label: 'Emissions (tCO₂e)',
          data: scope3Data.categories.map((c) => c.emissions),
          backgroundColor: scope3Data.categories.map((c, i) =>
            i === 0 ? '#0071E3' : i === 1 ? '#30B0C7' : i === 2 ? '#32ADE6' : i < 6 ? '#5856D6' : '#FF9500'
          ),
          borderRadius: 6,
          maxBarThickness: 18
        }
      ]
    };
  }, [scope3Data]);

  // 4. Facility Stacked Scope Comparison Chart Data
  const facilityChartData = useMemo(() => {
    if (!facilitiesData?.facilities) return null;
    return {
      labels: facilitiesData.facilities.map((f) => f.name.replace(' Manufacturing Unit', ' Mfg Unit').replace(' Technology Campus', ' Campus')),
      datasets: [
        {
          label: 'Scope 1 Direct',
          data: facilitiesData.facilities.map((f) => f.scope1),
          backgroundColor: '#0071E3',
          borderRadius: 6,
          maxBarThickness: 32
        },
        {
          label: 'Scope 2 Electricity',
          data: facilitiesData.facilities.map((f) => f.scope2),
          backgroundColor: '#34C759',
          borderRadius: 6,
          maxBarThickness: 32
        },
        {
          label: 'Scope 3 Value Chain',
          data: facilitiesData.facilities.map((f) => f.scope3),
          backgroundColor: '#FF9500',
          borderRadius: 6,
          maxBarThickness: 32
        }
      ]
    };
  }, [facilitiesData]);

  // 5. Energy Mix Doughnut Chart Data
  const energyMixChartData = useMemo(() => {
    if (!energyData?.sources) return null;
    return {
      labels: energyData.sources.map((s) => s.source),
      datasets: [
        {
          data: energyData.sources.map((s) => s.mwh),
          backgroundColor: ['#34C759', '#64748B', '#0071E3'],
          borderWidth: 2,
          borderColor: '#FFFFFF',
          borderRadius: 4
        }
      ]
    };
  }, [energyData]);

  // 6. Proportional Scope Breakdown Doughnut
  const scopeDonutData = useMemo(() => {
    return {
      labels: ['Scope 1 Direct (15.4%)', 'Scope 2 Electricity (21.3%)', 'Scope 3 Value Chain (63.3%)'],
      datasets: [
        {
          data: [74210.0, 102830.0, 305600.0],
          backgroundColor: ['#0071E3', '#34C759', '#FF9500'],
          borderWidth: 2.5,
          borderColor: '#FFFFFF',
          borderRadius: 6,
          spacing: 3
        }
      ]
    };
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '80px 40px', textAlign: 'center', color: 'var(--text-muted)' }}>
        <div style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.85)',
          border: '1px solid rgba(255, 255, 255, 0.95)',
          boxShadow: 'var(--shadow-liquid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
          color: 'var(--color-apple-blue)'
        }}>
          <Sparkles size={24} style={{ animation: 'pulseBeacon 1.5s infinite' }} />
        </div>
        <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
          Rendering Enterprise Environmental Intelligence Platform...
        </div>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '6px' }}>
          Aggregating 5-year multi-facility telemetry, 15 Scope 3 hotspots & SBTi 1.5°C trajectory pathways
        </p>
      </div>
    );
  }

  if (error && kpis.length === 0) {
    return (
      <div className="card" style={{ padding: '36px', background: 'var(--color-rose-light)', border: '1px solid rgba(255, 59, 48, 0.3)' }}>
        <AlertCircle size={28} color="var(--color-rose)" />
        <div style={{ fontWeight: 800, fontSize: '18px', marginTop: '10px', color: 'var(--color-rose)' }}>
          Unable to Load Telemetry Matrix
        </div>
        <p style={{ color: 'var(--text-muted)', marginTop: '4px' }}>{error}</p>
        <button className="btn btn-outline btn-sm" style={{ marginTop: '16px' }} onClick={fetchEnterpriseData}>
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* 1. Header with Enterprise Assurance Badges */}
      <div className="page-header" style={{ marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--color-apple-blue)' }}>
              EXECUTIVE GHG TELEMETRY & STRATEGIC DECOUPLING
            </span>
          </div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.6px', fontFamily: "'Outfit', sans-serif" }}>
            Enterprise Environmental Intelligence
          </h2>
          <p className="page-subtitle">
            Continuous multi-dimensional accounting, Science-Based Targets (SBTi 1.5°C), and operational decarbonization for FY {reportingYear}.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
            onClick={() => setShowLineageModal(true)}
          >
            <ShieldCheck size={16} color="#0071E3" />
            <span>Audit Calculation Lineage</span>
          </button>
          <span className="badge badge-verified" style={{ padding: '8px 14px', fontSize: '12px' }}>
            <Activity size={14} style={{ marginRight: '4px' }} />
            ISO 14064-1 Assured
          </span>
        </div>
      </div>

      {/* 2. Executive 5-Question Visualizer Banner (Instant Business Answers) */}
      <div className="exec-summary-banner">
        <div className="exec-summary-card">
          <div className="exec-question">1. Gross Footprint</div>
          <div className="exec-answer-highlight">482,640 tCO₂e</div>
          <div className="exec-context">
            <span style={{ color: 'var(--color-emerald-dark)', fontWeight: 700 }}>↓ 8.4% YoY</span> across corporate operations
          </div>
        </div>

        <div className="exec-summary-card">
          <div className="exec-question">2. Primary Origin</div>
          <div className="exec-answer-highlight" style={{ color: '#FF9500' }}>Scope 3 (63.3%)</div>
          <div className="exec-context">
            Purchased materials & upstream freight comprise 55.4%
          </div>
        </div>

        <div className="exec-summary-card">
          <div className="exec-question">3. Revenue Decoupling</div>
          <div className="exec-answer-highlight" style={{ color: '#248A3D' }}>Decoupled (-14.2%)</div>
          <div className="exec-context">
            Intensity dropped to 1,149 tCO₂e / $M while revenue grew 7.2%
          </div>
        </div>

        <div className="exec-summary-card">
          <div className="exec-question">4. High-Priority Lever</div>
          <div className="exec-answer-highlight" style={{ color: '#0071E3' }}>Furnace & Steel Scrap</div>
          <div className="exec-context">
            Hyderabad furnaces & recycled steel offer 32,900 t potential
          </div>
        </div>

        <div className="exec-summary-card">
          <div className="exec-question">5. 2030 SBTi Trajectory</div>
          <div className="exec-answer-highlight" style={{ color: '#34C759' }}>73.8% On Track</div>
          <div className="exec-context">
            31% / 42% reduction achieved vs. 2022 baseline
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Layer (12 Multi-Dimensional Metrics) */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
            Executive Performance Telemetry (12 Core Sustainability Indicators)
          </h3>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Real-time feed from ERP, IoT energy meters & supplier disclosures
          </span>
        </div>

        <div className="kpi-grid-enterprise">
          {kpis.map((kpi) => (
            <div key={kpi.id} className="kpi-card" style={{ padding: '18px' }}>
              <div className="kpi-label">
                <span>{kpi.title}</span>
                {kpi.trend === 'down' ? (
                  <TrendingDown size={16} color={kpi.status === 'positive' ? 'var(--color-emerald-dark)' : 'var(--color-rose)'} />
                ) : (
                  <TrendingUp size={16} color={kpi.status === 'positive' ? 'var(--color-emerald-dark)' : 'var(--color-rose)'} />
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
                <div>
                  <div className="kpi-value" style={{ fontSize: '24px', marginTop: 0 }}>
                    {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
                    <span className="kpi-unit" style={{ fontSize: '11.5px' }}>{kpi.unit}</span>
                  </div>
                </div>
                {kpi.sparkline && (
                  <Sparkline
                    data={kpi.sparkline}
                    color={kpi.status === 'positive' ? '#248A3D' : '#0071E3'}
                    width={85}
                    height={30}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                <span className={`kpi-change ${kpi.status}`}>
                  {kpi.trend === 'down' ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}
                  <span>{Math.abs(kpi.change_pct)}% YoY</span>
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 600 }}>
                  Prev: {typeof kpi.prev_value === 'number' ? kpi.prev_value.toLocaleString() : kpi.prev_value}
                </span>
              </div>

              <div style={{
                marginTop: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(0,0,0,0.04)',
                fontSize: '11px',
                color: 'var(--text-muted)',
                display: 'flex',
                justifyContent: 'space-between'
              }}>
                <span>{kpi.context}</span>
                <span style={{ fontWeight: 700, color: '#0071E3' }}>{kpi.benchmark}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Navigation Tab Switcher for Enterprise Sub-Systems */}
      <div className="toggle-group" style={{ marginBottom: '24px', width: '100%', display: 'flex', overflowX: 'auto' }}>
        <button
          className={`toggle-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={15} style={{ marginRight: '6px' }} />
          Multi-Year Trajectory & Scopes
        </button>
        <button
          className={`toggle-btn ${activeTab === 'monthly' ? 'active' : ''}`}
          onClick={() => setActiveTab('monthly')}
        >
          <Clock size={15} style={{ marginRight: '6px' }} />
          12-Month Operational Telemetry
        </button>
        <button
          className={`toggle-btn ${activeTab === 'scope3' ? 'active' : ''}`}
          onClick={() => setActiveTab('scope3')}
        >
          <Layers size={15} style={{ marginRight: '6px' }} />
          Scope 3 (All 15 Categories)
        </button>
        <button
          className={`toggle-btn ${activeTab === 'facilities' ? 'active' : ''}`}
          onClick={() => setActiveTab('facilities')}
        >
          <Building2 size={15} style={{ marginRight: '6px' }} />
          Facilities & Regional Footprint
        </button>
        <button
          className={`toggle-btn ${activeTab === 'energy' ? 'active' : ''}`}
          onClick={() => setActiveTab('energy')}
        >
          <Zap size={15} style={{ marginRight: '6px' }} />
          Energy Intelligence & Fuels
        </button>
        <button
          className={`toggle-btn ${activeTab === 'suppliers' ? 'active' : ''}`}
          onClick={() => setActiveTab('suppliers')}
        >
          <Scale size={15} style={{ marginRight: '6px' }} />
          Supplier 2x2 Risk Matrix
        </button>
        <button
          className={`toggle-btn ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          <Sparkles size={15} style={{ marginRight: '6px' }} />
          AI Analytical Insights ({insights.length})
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: MULTI-YEAR EMISSIONS ANALYTICS & SCOPE CONTRIBUTION */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <>
          <div className="charts-grid-2">
            {/* Multi-Year Trend Chart with Segmented Control */}
            <div className="card">
              <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
                <div>
                  <div className="card-title">Corporate Emissions Trajectory (2022 - 2026)</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Actual performance calibrated against 2022 baseline and 2030 SBTi 1.5°C target line
                  </span>
                </div>

                {/* Apple Segmented Control */}
                <div className="toggle-group" style={{ fontSize: '12px' }}>
                  <button
                    className={`toggle-btn ${trendView === 'total' ? 'active' : ''}`}
                    onClick={() => setTrendView('total')}
                  >
                    Total Gross
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
                    className={`toggle-btn ${trendView === 'scope2_market' ? 'active' : ''}`}
                    onClick={() => setTrendView('scope2_market')}
                  >
                    Scope 2 (Market)
                  </button>
                  <button
                    className={`toggle-btn ${trendView === 'scope2_location' ? 'active' : ''}`}
                    onClick={() => setTrendView('scope2_location')}
                  >
                    Scope 2 (Location)
                  </button>
                  <button
                    className={`toggle-btn ${trendView === 'scope3' ? 'active' : ''}`}
                    onClick={() => setTrendView('scope3')}
                  >
                    Scope 3
                  </button>
                  <button
                    className={`toggle-btn ${trendView === 'intensity' ? 'active' : ''}`}
                    onClick={() => setTrendView('intensity')}
                  >
                    Intensity
                  </button>
                </div>
              </div>

              <div style={{ height: '310px', marginTop: '8px' }}>
                {multiYearChartData && (
                  <Line
                    data={multiYearChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      interaction: { mode: 'index', intersect: false },
                      plugins: {
                        legend: {
                          position: 'top',
                          align: 'end',
                          labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, pointStyle: 'circle', font: { size: 11, weight: '600' } }
                        },
                        tooltip: appleTooltipOptions
                      },
                      scales: {
                        y: {
                          stacked: trendView === 'stacked',
                          grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                          ticks: {
                            color: '#86868B',
                            font: { size: 11 },
                            callback: (v) => trendView === 'intensity' ? `${v}` : `${(v / 1000).toFixed(0)}k t`
                          }
                        },
                        x: {
                          grid: { display: false, drawBorder: false },
                          ticks: { color: '#6E6E73', font: { size: 11, weight: '600' } }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Scope Contribution Doughnut & Target Progress */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header">
                  <div>
                    <div className="card-title">Scope Contribution Analysis</div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Share of gross emissions across Scopes 1, 2, and 3
                    </span>
                  </div>
                  <span className="badge badge-info">FY {reportingYear}</span>
                </div>

                <div style={{ position: 'relative', height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {scopeDonutData && (
                    <Doughnut
                      data={scopeDonutData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                          tooltip: appleTooltipOptions
                        },
                        cutout: '74%'
                      }}
                    />
                  )}

                  <div style={{
                    position: 'absolute',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '9.5px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', fontWeight: 700 }}>
                      TOTAL GROSS
                    </span>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
                      482,640
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600 }}>
                      tCO₂e
                    </span>
                  </div>
                </div>

                {/* Interactive Legend Pills */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginTop: '14px' }}>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(0, 113, 227, 0.08)', border: '1px solid rgba(0, 113, 227, 0.2)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 700 }}>Scope 1 Direct</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D1D1F' }}>74,210 t</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>15.4%</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(52, 199, 89, 0.08)', border: '1px solid rgba(52, 199, 89, 0.2)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: 'var(--color-emerald-dark)', fontWeight: 700 }}>Scope 2 Power</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D1D1F' }}>102,830 t</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>21.3%</div>
                  </div>
                  <div style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255, 149, 0, 0.08)', border: '1px solid rgba(255, 149, 0, 0.2)', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#B26700', fontWeight: 700 }}>Scope 3 Supply</div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#1D1D1F' }}>305,600 t</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>63.3%</div>
                  </div>
                </div>
              </div>

              {/* Apple Activity Ring SBTi 2030 Target Integration */}
              <div style={{ marginTop: '18px', paddingTop: '14px', borderTop: '1px solid rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ position: 'relative', width: '64px', height: '64px', flexShrink: 0 }}>
                  <svg width="64" height="64" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(0, 0, 0, 0.06)" strokeWidth="6" />
                    <circle
                      cx="32"
                      cy="32"
                      r="26"
                      fill="none"
                      stroke="#34C759"
                      strokeWidth="6"
                      strokeDasharray="163.3"
                      strokeDashoffset={163.3 * (1 - 0.738)}
                      strokeLinecap="round"
                      transform="rotate(-90 32 32)"
                    />
                  </svg>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                    <span style={{ fontSize: '12px', fontWeight: 900, color: 'var(--text-main)' }}>74%</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>2030 SCIENCE-BASED TARGET</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                    31% cut achieved of 42% goal
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--color-emerald-dark)', fontWeight: 600 }}>
                    Target 349,914 tCO₂e by FY 2030 (1.5°C Paris aligned)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: CONTINUOUS 12-MONTH OPERATIONAL TELEMETRY */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="card">
          <div className="card-header" style={{ flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div className="card-title">Continuous Monthly Operational Telemetry (Jan - Dec {reportingYear})</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Continuous data reflecting real-time seasonal grid variations, heatwaves, and industrial production cycles
              </span>
            </div>

            <div className="toggle-group">
              <button
                className={`toggle-btn ${monthlyMetric === 'emissions_total' ? 'active' : ''}`}
                onClick={() => setMonthlyMetric('emissions_total')}
              >
                Emissions (tCO₂e)
              </button>
              <button
                className={`toggle-btn ${monthlyMetric === 'electricity_kwh' ? 'active' : ''}`}
                onClick={() => setMonthlyMetric('electricity_kwh')}
              >
                Electricity (kWh)
              </button>
              <button
                className={`toggle-btn ${monthlyMetric === 'solar_ppa_kwh' ? 'active' : ''}`}
                onClick={() => setMonthlyMetric('solar_ppa_kwh')}
              >
                Solar PPA (kWh)
              </button>
              <button
                className={`toggle-btn ${monthlyMetric === 'intensity_per_unit' ? 'active' : ''}`}
                onClick={() => setMonthlyMetric('intensity_per_unit')}
              >
                Intensity / Unit
              </button>
            </div>
          </div>

          <div style={{ height: '300px', marginTop: '10px' }}>
            {monthlyChartData && (
              <Bar
                data={monthlyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: appleTooltipOptions
                  },
                  scales: {
                    x: {
                      grid: { display: false, drawBorder: false },
                      ticks: { color: '#6E6E73', font: { size: 11, weight: '600' } }
                    },
                    y: {
                      grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                      ticks: {
                        color: '#86868B',
                        font: { size: 11 },
                        callback: (v) => monthlyMetric.includes('kwh') ? `${(v / 1000000).toFixed(1)}M` : `${v}`
                      }
                    }
                  }
                }}
              />
            )}
          </div>

          {/* Monthly Operational Metrics Table */}
          <div style={{ marginTop: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '12px', color: 'var(--text-main)' }}>
              Operational Data Breakdown by Month
            </h4>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Gross Emissions</th>
                    <th>Scope 1</th>
                    <th>Scope 2</th>
                    <th>Scope 3</th>
                    <th>Electricity (kWh)</th>
                    <th>Solar PPA (kWh)</th>
                    <th>Renewable %</th>
                    <th>Production Units</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData?.months?.map((m) => (
                    <tr key={m.month}>
                      <td style={{ fontWeight: 700 }}>{m.month}</td>
                      <td style={{ fontWeight: 800, color: '#0071E3' }}>{Number(m.emissions_total).toLocaleString()} t</td>
                      <td>{Number(m.scope1).toLocaleString()} t</td>
                      <td>{Number(m.scope2).toLocaleString()} t</td>
                      <td>{Number(m.scope3).toLocaleString()} t</td>
                      <td style={{ fontFamily: 'monospace' }}>{(m.electricity_kwh / 1000000).toFixed(2)}M</td>
                      <td style={{ fontFamily: 'monospace', color: 'var(--color-emerald-dark)' }}>{(m.solar_ppa_kwh / 1000000).toFixed(2)}M</td>
                      <td>
                        <span className="badge badge-verified" style={{ padding: '3px 8px' }}>
                          {m.renewable_pct}%
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{Number(m.production_units).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: SCOPE 3 HOTSPOT ANALYSIS (ALL 15 CATEGORIES) */}
      {/* ========================================================================= */}
      {activeTab === 'scope3' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Scope 3 Hotspot Analysis across All 15 GHG Protocol Categories</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Ranked by carbon volume in tCO₂e. Click any category row or bar to inspect supplier activity data & reduction levers.
              </span>
            </div>
            <span className="badge badge-info">305,600 tCO₂e Total Scope 3</span>
          </div>

          <div style={{ height: '360px', marginTop: '12px' }}>
            {scope3RankingChartData && (
              <Bar
                data={scope3RankingChartData}
                options={{
                  indexAxis: 'y',
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false },
                    tooltip: appleTooltipOptions
                  },
                  scales: {
                    x: {
                      grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                      ticks: {
                        color: '#86868B',
                        font: { size: 10.5 },
                        callback: (v) => `${(v / 1000).toFixed(0)}k t`
                      }
                    },
                    y: {
                      grid: { display: false, drawBorder: false },
                      ticks: { color: '#1D1D1F', font: { size: 11, weight: '600' } }
                    }
                  }
                }}
              />
            )}
          </div>

          {/* Detailed All-15 Categories Table with Click-to-Inspect */}
          <div style={{ marginTop: '24px' }}>
            <div className="table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>GHG Protocol Category</th>
                    <th>Emissions (tCO₂e)</th>
                    <th>Share %</th>
                    <th>YoY Trend</th>
                    <th>Data Quality</th>
                    <th>Primary Activity Driver</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {scope3Data?.categories?.map((cat) => (
                    <tr
                      key={cat.category_num}
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedCategory(cat)}
                    >
                      <td style={{ fontWeight: 800 }}>#{cat.rank}</td>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                        Cat {cat.category_num}: {cat.name}
                      </td>
                      <td style={{ fontWeight: 800, color: '#0071E3' }}>
                        {Number(cat.emissions).toLocaleString()} t
                      </td>
                      <td>
                        <span style={{ fontWeight: 700 }}>{cat.share_pct}%</span>
                      </td>
                      <td>
                        <span style={{ color: cat.yoy_change_pct < 0 ? 'var(--color-emerald-dark)' : 'var(--color-rose)', fontWeight: 600 }}>
                          {cat.yoy_change_pct < 0 ? '↓' : '↑'} {Math.abs(cat.yoy_change_pct)}%
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${cat.data_quality.includes('High') ? 'badge-verified' : 'badge-info'}`}>
                          {cat.data_quality}
                        </span>
                      </td>
                      <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{cat.primary_driver}</td>
                      <td>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(cat);
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: FACILITY-LEVEL ANALYTICS & REGIONAL FOOTPRINT */}
      {/* ========================================================================= */}
      {activeTab === 'facilities' && (
        <>
          <div className="charts-grid-2">
            {/* Facility Stacked Scope Comparison Chart */}
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Facility Scope Distribution (tCO₂e)</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Physical asset emissions segmented by Scope 1, Scope 2, and Scope 3
                  </span>
                </div>
                <span className="badge badge-info">{facilitiesData?.facility_count || 5} Active Sites</span>
              </div>

              <div style={{ height: '280px', marginTop: '10px' }}>
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
                          labels: { boxWidth: 8, boxHeight: 8, usePointStyle: true, font: { size: 11, weight: '600' } }
                        },
                        tooltip: appleTooltipOptions
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
                            callback: (v) => `${(v / 1000).toFixed(0)}k t`
                          }
                        }
                      }
                    }}
                  />
                )}
              </div>
            </div>

            {/* Facility Leaderboard & Operational Health */}
            <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div className="card-header">
                  <div>
                    <div className="card-title">Facility Operational Decarbonization Matrix</div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Ranked by footprint contribution & renewable transition
                    </span>
                  </div>
                  <span className="badge badge-verified">ISO 14064 Verified</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
                  {facilitiesData?.facilities?.map((fac, idx) => (
                    <div
                      key={fac.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.7)',
                        border: '1px solid rgba(0, 0, 0, 0.06)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: 800, width: '20px', height: '20px', borderRadius: '50%', background: idx === 0 ? 'rgba(0, 113, 227, 0.12)' : 'rgba(0,0,0,0.05)', color: idx === 0 ? '#0071E3' : '#6E6E73', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {idx + 1}
                            </span>
                            <span style={{ fontSize: '13.5px', fontWeight: 800, color: 'var(--text-main)' }}>{fac.name}</span>
                            {fac.high_emission_alert && (
                              <span style={{ fontSize: '9.5px', background: 'rgba(255, 59, 48, 0.12)', color: 'var(--color-rose)', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
                                Primary Hotspot
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {fac.type} • {fac.state} ({fac.headcount} workforce)
                          </div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '14.5px', fontWeight: 900, color: 'var(--text-main)' }}>
                            {Number(fac.total_emissions).toLocaleString()} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>tCO₂e</span>
                          </div>
                          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-emerald-dark)' }}>
                            ↓ {Math.abs(fac.yoy_change_pct)}% YoY • {fac.renewable_pct}% Solar
                          </div>
                        </div>
                      </div>

                      <div className="progress-track" style={{ height: '5px', marginTop: '6px' }}>
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min(fac.share_pct * 2, 100)}%`,
                            background: idx === 0 ? '#0071E3' : idx === 1 ? '#34C759' : '#FF9500'
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: '14px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0, 113, 227, 0.06)', border: '1px solid rgba(0, 113, 227, 0.2)', fontSize: '12px', color: '#0071E3', fontWeight: 600 }}>
                Enterprise Facility Energy Transition: 58.4% blended renewable electricity across all 5 operational facilities.
              </div>
            </div>
          </div>

          {/* Geographical Regional Comparison Cards */}
          <div className="card" style={{ marginTop: '24px' }}>
            <div className="card-header">
              <div>
                <div className="card-title">Geographical Regional Environmental Overview</div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  State-by-state emissions intensity, facility count, and grid mix
                </span>
              </div>
              <span className="badge badge-verified">
                <MapPin size={13} style={{ marginRight: '4px' }} />
                India Operations
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '10px' }}>
              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>STATE: TELANGANA</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>186,420 tCO₂e</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>1 Heavy Plant • 58.2k MWh</div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-emerald-dark)', fontWeight: 700, marginTop: '8px' }}>62.5% Renewable PPA</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>STATE: MAHARASHTRA</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>162,140 tCO₂e</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>1 Precision Unit • 49.5k MWh</div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-emerald-dark)', fontWeight: 700, marginTop: '8px' }}>48.0% Renewable PPA</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>STATE: KARNATAKA</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>68,420 tCO₂e</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>1 R&D Campus • 18.2k MWh</div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-emerald-dark)', fontWeight: 700, marginTop: '8px' }}>84.5% Net Zero Scope 2</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>STATE: TAMIL NADU</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>39,660 tCO₂e</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>1 Logistics Hub • 16.9k MWh</div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-emerald-dark)', fontWeight: 700, marginTop: '8px' }}>70.0% Rooftop Solar</div>
              </div>

              <div style={{ padding: '16px', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.65)', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>STATE: GUJARAT</div>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>26,000 tCO₂e</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>1 Foundry Site • 14.2k MWh</div>
                <div style={{ fontSize: '11.5px', color: '#B26700', fontWeight: 700, marginTop: '8px' }}>42.0% Renewable PPA</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ENERGY INTELLIGENCE & FUEL TRANSITION */}
      {/* ========================================================================= */}
      {activeTab === 'energy' && (
        <>
          <div className="charts-grid-2">
            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Corporate Electricity Source Allocation</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Total consumption: 157,020 MWh • 58.4% Renewable PPA
                  </span>
                </div>
                <span className="badge badge-verified">
                  <Sun size={13} style={{ marginRight: '4px' }} />
                  91,700 MWh Clean Solar
                </span>
              </div>

              <div style={{ position: 'relative', height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {energyMixChartData && (
                  <Doughnut
                    data={energyMixChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 11 } } }, tooltip: appleTooltipOptions },
                      cutout: '70%'
                    }}
                  />
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginTop: '16px' }}>
                <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(52, 199, 89, 0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--color-emerald-dark)', fontWeight: 700 }}>Offsite Solar PPA</div>
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>68,400 MWh</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>43.6% Share</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(100, 116, 139, 0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700 }}>State Grid Mix</div>
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>65,320 MWh</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>41.6% Share</div>
                </div>
                <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0, 113, 227, 0.1)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#0071E3', fontWeight: 700 }}>Rooftop Solar PV</div>
                  <div style={{ fontSize: '15px', fontWeight: 800 }}>23,300 MWh</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>14.8% Share</div>
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <div>
                  <div className="card-title">Fossil Fuel Decarbonization Targets</div>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    Stationary combustion & mobile diesel replacement pathways
                  </span>
                </div>
                <span className="badge badge-info">Scope 1 Levers</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
                {energyData?.fuels?.map((fuel) => (
                  <div
                    key={fuel.fuel}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      border: '1px solid rgba(0, 0, 0, 0.06)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-main)' }}>{fuel.fuel}</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#FF3B30' }}>
                        {Number(fuel.emissions).toLocaleString()} tCO₂e
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      <span>Consumption: {fuel.consumption}</span>
                      <span style={{ color: '#0071E3', fontWeight: 700 }}>Shift: {fuel.clean_alternative}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* TAB 6: SUPPLIER 2x2 RISK MATRIX */}
      {/* ========================================================================= */}
      {activeTab === 'suppliers' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Supplier Carbon & Engagement 2x2 Risk Matrix</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                X-Axis: Emissions Volume (tCO₂e) • Y-Axis: Data Quality & Engagement Score (0-100)
              </span>
            </div>
            <span className="badge badge-info">
              {supplierMatrix?.total_suppliers || 8} Audited Suppliers
            </span>
          </div>

          <div className="risk-matrix-grid" style={{ marginTop: '14px' }}>
            {/* Quadrant 1: Critical Risk */}
            <div className="risk-quadrant critical">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#B91C1C' }}>CRITICAL RISK QUADRANT</span>
                  <span className="badge badge-danger">Immediate Action</span>
                </div>
                <div style={{ fontSize: '11px', color: '#991B1B', marginTop: '2px' }}>
                  High Carbon Volume + Low Data Quality / Low Engagement
                </div>
                <div style={{ marginTop: '10px' }}>
                  {supplierMatrix?.suppliers?.filter((s) => s.risk === 'Critical').map((s) => (
                    <div key={s.id} style={{ padding: '8px 10px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(255, 59, 48, 0.3)', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#1D1D1F' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: '#6E6E73' }}>
                        {Number(s.emissions).toLocaleString()} tCO₂e • Score: {s.engagement}% ({s.reduction_status})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#991B1B', fontWeight: 700 }}>Priority: Issue ISO audit ultimatum</div>
            </div>

            {/* Quadrant 2: High Risk */}
            <div className="risk-quadrant high">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#C2410C' }}>HIGH RISK QUADRANT</span>
                  <span className="badge badge-warning">Review Needed</span>
                </div>
                <div style={{ fontSize: '11px', color: '#9A3412', marginTop: '2px' }}>
                  Medium Volume + Intermediate Engagement
                </div>
                <div style={{ marginTop: '10px' }}>
                  {supplierMatrix?.suppliers?.filter((s) => s.risk === 'High').map((s) => (
                    <div key={s.id} style={{ padding: '8px 10px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(255, 149, 0, 0.3)', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#1D1D1F' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: '#6E6E73' }}>
                        {Number(s.emissions).toLocaleString()} tCO₂e • Score: {s.engagement}% ({s.reduction_status})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#9A3412', fontWeight: 700 }}>Priority: Conduct technical energy audit</div>
            </div>

            {/* Quadrant 3: Medium Risk */}
            <div className="risk-quadrant medium">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#1D4ED8' }}>MEDIUM RISK / COLLABORATIVE</span>
                  <span className="badge badge-info">Active Plan</span>
                </div>
                <div style={{ fontSize: '11px', color: '#1E40AF', marginTop: '2px' }}>
                  High Volume + High Engagement & Verified Data
                </div>
                <div style={{ marginTop: '10px' }}>
                  {supplierMatrix?.suppliers?.filter((s) => s.risk === 'Medium').slice(0, 2).map((s) => (
                    <div key={s.id} style={{ padding: '8px 10px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(0, 113, 227, 0.25)', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#1D1D1F' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: '#6E6E73' }}>
                        {Number(s.emissions).toLocaleString()} tCO₂e • Score: {s.engagement}% ({s.reduction_status})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: 700 }}>Priority: Joint Power Purchase Agreements</div>
            </div>

            {/* Quadrant 4: Low Risk */}
            <div className="risk-quadrant low">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#15803D' }}>LOW RISK / BENCHMARK</span>
                  <span className="badge badge-verified">Best in Class</span>
                </div>
                <div style={{ fontSize: '11px', color: '#166534', marginTop: '2px' }}>
                  High Quality Data + High Engagement
                </div>
                <div style={{ marginTop: '10px' }}>
                  {supplierMatrix?.suppliers?.filter((s) => s.risk === 'Low').map((s) => (
                    <div key={s.id} style={{ padding: '8px 10px', borderRadius: '8px', background: '#FFFFFF', border: '1px solid rgba(52, 199, 89, 0.25)', marginBottom: '6px' }}>
                      <div style={{ fontWeight: 800, fontSize: '12.5px', color: '#1D1D1F' }}>{s.name}</div>
                      <div style={{ fontSize: '11px', color: '#6E6E73' }}>
                        {Number(s.emissions).toLocaleString()} tCO₂e • Score: {s.engagement}% ({s.reduction_status})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ fontSize: '11px', color: '#166534', fontWeight: 700 }}>Priority: Long-term supplier contract extension</div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 7: AI / ANALYTICAL INSIGHTS PANEL */}
      {/* ========================================================================= */}
      {activeTab === 'insights' && (
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">AI / Analytical Insights & Telemetry Alerts</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Automated rule-based environmental diagnostics derived from company GHG telemetry
              </span>
            </div>
            <span className="badge badge-verified">
              <Sparkles size={13} style={{ marginRight: '4px' }} />
              Active Intelligence Feed
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
            {insights.map((ins) => (
              <div
                key={ins.id}
                style={{
                  padding: '18px 20px',
                  borderRadius: '14px',
                  background: ins.severity === 'critical' ? 'rgba(255, 59, 48, 0.05)' : ins.severity === 'high' ? 'rgba(255, 149, 0, 0.05)' : 'rgba(0, 113, 227, 0.05)',
                  border: `1px solid ${ins.severity === 'critical' ? 'rgba(255, 59, 48, 0.25)' : ins.severity === 'high' ? 'rgba(255, 149, 0, 0.25)' : 'rgba(0, 113, 227, 0.2)'}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                      background: ins.severity === 'critical' ? 'rgba(255, 59, 48, 0.15)' : ins.severity === 'high' ? 'rgba(255, 149, 0, 0.15)' : 'rgba(0, 113, 227, 0.15)',
                      color: ins.severity === 'critical' ? '#B91C1C' : ins.severity === 'high' ? '#C2410C' : '#1D4ED8'
                    }}>
                      {ins.severity}
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)' }}>{ins.title}</span>
                  </div>
                  <span className="badge badge-info">{ins.badge}</span>
                </div>

                <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, margin: '8px 0' }}>
                  {ins.explanation}
                </p>

                <div style={{
                  marginTop: '10px',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.06)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12.5px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={16} color="#0071E3" />
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Action: {ins.recommended_action}</span>
                  </div>
                  <span style={{ fontWeight: 800, color: 'var(--color-emerald-dark)' }}>Impact: {ins.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CATEGORY DETAIL DRILL-DOWN DRAWER */}
      {/* ========================================================================= */}
      {selectedCategory && (
        <div className="modal-overlay" onClick={() => setSelectedCategory(null)}>
          <div className="modal-content" style={{ maxWidth: '640px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, textTransform: 'uppercase' }}>
                  GHG Protocol Category {selectedCategory.category_num} • Rank #{selectedCategory.rank}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  {selectedCategory.name}
                </h3>
              </div>
              <button className="icon-button" onClick={() => setSelectedCategory(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0, 113, 227, 0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>EMISSIONS</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0071E3' }}>
                    {Number(selectedCategory.emissions).toLocaleString()} t
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(52, 199, 89, 0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>SHARE OF SCOPE 3</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-emerald-dark)' }}>
                    {selectedCategory.share_pct}%
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(255, 149, 0, 0.08)', textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>COVERAGE</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#FF9500' }}>
                    {selectedCategory.activity_coverage_pct}%
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>PRIMARY EMISSION DRIVERS:</div>
                <p style={{ fontSize: '13px', color: 'var(--text-main)', background: 'rgba(0,0,0,0.03)', padding: '10px 12px', borderRadius: '8px' }}>
                  {selectedCategory.primary_driver}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>DATA QUALITY AUDIT SCORE:</div>
                <div style={{ fontSize: '13px', color: '#0071E3', fontWeight: 700 }}>
                  {selectedCategory.data_quality}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '4px' }}>DECARBONIZATION LEVER & OPPORTUNITY:</div>
                <div style={{ fontSize: '13px', color: 'var(--color-emerald-dark)', fontWeight: 700, background: 'rgba(52, 199, 89, 0.1)', padding: '10px 12px', borderRadius: '8px' }}>
                  {selectedCategory.reduction_potential}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedCategory(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: AUDIT & CALCULATION LINEAGE VISUALIZER */}
      {/* ========================================================================= */}
      {showLineageModal && (
        <div className="modal-overlay" onClick={() => setShowLineageModal(false)}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '11px', color: '#0071E3', fontWeight: 800, textTransform: 'uppercase' }}>
                  ISO 14064-1 & GHG Protocol Assurance Lineage
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-main)', marginTop: '2px' }}>
                  Audit Calculation Traceability Chain
                </h3>
              </div>
              <button className="icon-button" onClick={() => setShowLineageModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '18px' }}>
                Every corporate emission entry maintains an unbroken, third-party verifiable calculation lineage:
              </p>

              <div className="lineage-step">
                <FileTextIcon />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>1. PRIMARY DATA SOURCE</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>Smart Sub-Meter #MTR-HYD-42 (IoT Telemetry)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Verified via utility grid statement #APCPDCL-982341</div>
                </div>
              </div>

              <div className="lineage-arrow">↓</div>

              <div className="lineage-step">
                <ActivityIcon />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>2. ACTIVITY DATA QUANTUM</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>58,200,000 kWh (58.2 GWh)</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Period: FY 2026 Annual Cumulative Billing Cycle</div>
                </div>
              </div>

              <div className="lineage-arrow">↓</div>

              <div className="lineage-step">
                <ScaleIcon />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>3. EMISSION FACTOR LIBRARY</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-main)' }}>India National CEA v19.0 Grid Factor: 0.72 kgCO₂e / kWh</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Central Electricity Authority Baseline Database</div>
                </div>
              </div>

              <div className="lineage-arrow">↓</div>

              <div className="lineage-step">
                <CpuIcon />
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 700 }}>4. CALCULATION ENGINE FORMULA</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0071E3' }}>
                    58,200,000 kWh × 0.72 kgCO₂e/kWh ÷ 1,000 = 41,904.0 tCO₂e
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Engine Version: DecarbX Formula Core v2.4 (Deterministic)</div>
                </div>
              </div>

              <div className="lineage-arrow">↓</div>

              <div className="lineage-step" style={{ background: 'rgba(52, 199, 89, 0.1)', borderColor: 'rgba(52, 199, 89, 0.3)' }}>
                <CheckCircle2 size={24} color="#248A3D" />
                <div>
                  <div style={{ fontSize: '11px', color: '#15803D', fontWeight: 700 }}>5. ASSURANCE & AUDIT STATUS</div>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--color-emerald-dark)' }}>
                    Approved • Limited Assurance Ready (ISAE 3000)
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Timestamp: 2026-09-08 14:22:00 IST by Lead Auditor</div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowLineageModal(false)}>
                Close Lineage
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Mini SVG Icon Helpers for Lineage Modal
const FileTextIcon = () => (
  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(0, 113, 227, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0071E3', flexShrink: 0 }}>
    <Clock size={18} />
  </div>
);

const ActivityIcon = () => (
  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(52, 199, 89, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34C759', flexShrink: 0 }}>
    <Activity size={18} />
  </div>
);

const ScaleIcon = () => (
  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(255, 149, 0, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9500', flexShrink: 0 }}>
    <Scale size={18} />
  </div>
);

const CpuIcon = () => (
  <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(175, 82, 222, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#AF52DE', flexShrink: 0 }}>
    <Cpu size={18} />
  </div>
);

export default Dashboard;
