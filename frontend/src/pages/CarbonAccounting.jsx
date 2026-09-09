import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Plus,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  PieChart,
  Building2,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import api, { downloadCsv } from '../services/api';
import EmissionModal from '../components/EmissionModal';
import AuditModal from '../components/AuditModal';
import Sparkline from '../components/Sparkline';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const CarbonAccounting = () => {
  const { reportingYear, searchTerm: globalSearch } = useOutletContext();
  const [emissions, setEmissions] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedFacility, setSelectedFacility] = useState('All');
  const [selectedScope, setSelectedScope] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [localSearch, setLocalSearch] = useState('');

  // Modals state
  const [isEmissionModalOpen, setIsEmissionModalOpen] = useState(false);
  const [editingEmission, setEditingEmission] = useState(null);
  const [inspectEmission, setInspectEmission] = useState(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [showVisualizer, setShowVisualizer] = useState(true);

  // Fetch facilities
  const fetchFacilities = async () => {
    try {
      const res = await api.get('/api/emissions/facilities');
      setFacilities(res.data);
    } catch (err) {
      console.error('Failed to load facilities', err);
    }
  };

  // Fetch emissions with active filters
  const fetchEmissions = async () => {
    try {
      setLoading(true);
      setError('');
      let url = `/api/emissions?year=${reportingYear}`;
      if (selectedFacility !== 'All') {
        url += `&facility_id=${selectedFacility}`;
      }
      if (selectedScope !== 'All') {
        url += `&scope=${encodeURIComponent(selectedScope)}`;
      }
      if (selectedCategory !== 'All') {
        url += `&category=${encodeURIComponent(selectedCategory)}`;
      }
      const searchEffective = localSearch || globalSearch;
      if (searchEffective) {
        url += `&search=${encodeURIComponent(searchEffective)}`;
      }

      const res = await api.get(url);
      setEmissions(res.data);
    } catch {
      setError('Failed to fetch emission records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  useEffect(() => {
    fetchEmissions();
  }, [reportingYear, selectedFacility, selectedScope, selectedCategory, localSearch, globalSearch]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this emission entry?')) return;
    try {
      await api.delete(`/api/emissions/${id}`);
      fetchEmissions();
    } catch {
      setError('Failed to delete emission record.');
    }
  };

  const handleOpenAudit = (item) => {
    setInspectEmission(item);
    setIsAuditModalOpen(true);
  };

  const handleExportCsv = async () => {
    try {
      await downloadCsv('carbon-accounting');
    } catch {
      setError('Failed to export the carbon accounting report.');
    }
  };

  const handleImportDemo = () => {
    alert('ERP/CSV Data Import: Successfully simulated batch ingestion of 4 IoT energy meters.');
    fetchEmissions();
  };

  // Calculate top summary cards from current list
  const totalEmissions = emissions.reduce((acc, curr) => acc + curr.emissions, 0);
  const scope1Total = emissions.filter((e) => e.scope === 'Scope 1').reduce((acc, curr) => acc + curr.emissions, 0);
  const scope2Total = emissions.filter((e) => e.scope === 'Scope 2').reduce((acc, curr) => acc + curr.emissions, 0);
  const scope3Total = emissions.filter((e) => e.scope === 'Scope 3').reduce((acc, curr) => acc + curr.emissions, 0);

  // Common Apple Liquid Glass Tooltip Configuration
  const appleTooltipOptions = {
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    titleColor: '#1D1D1F',
    titleFont: { size: 12, weight: 'bold', family: '-apple-system, sans-serif' },
    bodyColor: '#424245',
    bodyFont: { size: 11, weight: '500', family: '-apple-system, sans-serif' },
    borderColor: 'rgba(255, 255, 255, 0.95)',
    borderWidth: 1.5,
    padding: 10,
    cornerRadius: 10,
  };

  // Facility aggregation
  const facilityBreakdown = useMemo(() => {
    if (!emissions.length) return [];
    const map = {};
    emissions.forEach((e) => {
      const fName = e.facility_name || 'General Operations';
      if (!map[fName]) {
        map[fName] = { name: fName, scope1: 0, scope2: 0, scope3: 0, total: 0 };
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
          maxBarThickness: 26,
        },
        {
          label: 'Scope 2 Electricity',
          data: facilityBreakdown.map((f) => Math.round(f.scope2)),
          backgroundColor: '#34C759',
          borderRadius: 6,
          maxBarThickness: 26,
        },
        {
          label: 'Scope 3 Value Chain',
          data: facilityBreakdown.map((f) => Math.round(f.scope3)),
          backgroundColor: '#FF9500',
          borderRadius: 6,
          maxBarThickness: 26,
        }
      ]
    };
  }, [facilityBreakdown]);

  // Category aggregation
  const categoryBreakdown = useMemo(() => {
    if (!emissions.length) return [];
    const map = {};
    emissions.forEach((e) => {
      let cat = e.category || 'Other';
      if (cat.includes(':')) {
        cat = cat.split(':')[1].trim();
      }
      map[cat] = (map[cat] || 0) + e.emissions;
    });
    return Object.entries(map)
      .map(([name, val]) => ({ name, value: Math.round(val) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [emissions]);

  const categoryChartData = useMemo(() => {
    if (!categoryBreakdown.length) return null;
    return {
      labels: categoryBreakdown.map((c) => c.name),
      datasets: [
        {
          data: categoryBreakdown.map((c) => c.value),
          backgroundColor: ['#0071E3', '#34C759', '#FF9500', '#5856D6', '#30B0C7'],
          borderWidth: 2,
          borderColor: '#FFFFFF',
          borderRadius: 4,
          spacing: 2
        }
      ]
    };
  }, [categoryBreakdown]);

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
            Carbon Accounting Ledger
          </h2>
          <p className="page-subtitle">
            Activity-level greenhouse gas accounting and audit-ready data ledger for {reportingYear}.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-outline" onClick={handleImportDemo}>
            <Upload size={16} />
            <span>Import Data</span>
          </button>
          <button className="btn btn-outline" onClick={handleExportCsv}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
          <button
            className="btn btn-emerald"
            onClick={() => {
              setEditingEmission(null);
              setIsEmissionModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Add Emission</span>
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '20px',
            padding: '12px 16px',
            border: '1px solid #FECACA',
            borderRadius: '10px',
            background: '#FEF2F2',
            color: '#B91C1C',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Top Cards with Apple Micro-Sparklines */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Filtered Emissions</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(totalEmissions).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={[totalEmissions * 1.12, totalEmissions * 1.08, totalEmissions * 1.04, totalEmissions * 1.01, totalEmissions]} color="#248A3D" width={95} height={34} />
          </div>
          <div className="kpi-change neutral">
            <span>{emissions.length} records in active view</span>
          </div>
        </div>

        <div className="kpi-card scope1">
          <div className="kpi-label">Scope 1 Direct</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(scope1Total).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={[scope1Total * 1.08, scope1Total * 1.05, scope1Total * 1.03, scope1Total * 1.01, scope1Total]} color="#0071E3" width={95} height={34} />
          </div>
          <div className="kpi-change neutral">Stationary & Mobile Combustion</div>
        </div>

        <div className="kpi-card scope2">
          <div className="kpi-label">Scope 2 Electricity</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(scope2Total).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={[scope2Total * 1.15, scope2Total * 1.1, scope2Total * 1.06, scope2Total * 1.02, scope2Total]} color="#34C759" width={95} height={34} />
          </div>
          <div className="kpi-change neutral">Grid & Purchased Power</div>
        </div>

        <div className="kpi-card scope3">
          <div className="kpi-label">Scope 3 Value Chain</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {Number(scope3Total).toLocaleString(undefined, { maximumFractionDigits: 1 })}
              <span className="kpi-unit">tCO₂e</span>
            </div>
            <Sparkline data={[scope3Total * 1.06, scope3Total * 1.04, scope3Total * 1.03, scope3Total * 1.01, scope3Total]} color="#FF9500" width={95} height={34} />
          </div>
          <div className="kpi-change neutral">Supply Chain & Downstream</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="filter-item">
          <Filter size={16} color="#64748B" />
          <label>Facility:</label>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={selectedFacility}
            onChange={(e) => setSelectedFacility(e.target.value)}
          >
            <option value="All">All Facilities</option>
            {facilities.map((f) => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-item">
          <label>Scope:</label>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={selectedScope}
            onChange={(e) => setSelectedScope(e.target.value)}
          >
            <option value="All">All Scopes</option>
            <option value="Scope 1">Scope 1</option>
            <option value="Scope 2">Scope 2</option>
            <option value="Scope 3">Scope 3</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Category:</label>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Combustion">Combustion</option>
            <option value="Electricity">Electricity</option>
            <option value="Fleet">Fleet</option>
            <option value="Purchased">Purchased Goods</option>
            <option value="Transportation">Transportation</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-outline btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            onClick={() => setShowVisualizer(!showVisualizer)}
          >
            <BarChart3 size={14} />
            <span>{showVisualizer ? 'Hide Visuals' : 'Show Visuals'}</span>
          </button>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              type="text"
              placeholder="Search source or category..."
              className="form-input"
              style={{ width: '210px', padding: '6px 10px 6px 32px' }}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
          </div>
          {(selectedFacility !== 'All' || selectedScope !== 'All' || selectedCategory !== 'All' || localSearch) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSelectedFacility('All');
                setSelectedScope('All');
                setSelectedCategory('All');
                setLocalSearch('');
              }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Executive Visualizer Hub (Collapsible via toggle) */}
      {showVisualizer && (
        <div className="charts-grid-2" style={{ marginBottom: '24px' }}>
          {/* Facility Emissions Stacked Bar */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Facility Emissions Allocation</div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Breakdown by Scope 1, Scope 2, and Scope 3
                </span>
              </div>
              <span className="badge badge-info">
                <Building2 size={13} style={{ marginRight: '4px' }} />
                {facilityBreakdown.length} Facilities
              </span>
            </div>

            <div style={{ height: '240px', marginTop: '6px' }}>
              {facilityChartData ? (
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
                        ticks: { color: '#6E6E73', font: { size: 10.5, weight: '600' } }
                      },
                      y: {
                        stacked: true,
                        grid: { color: 'rgba(0, 0, 0, 0.04)', drawBorder: false },
                        ticks: {
                          color: '#86868B',
                          font: { size: 10.5 },
                          callback: (v) => `${(v / 1000).toFixed(0)}k`
                        }
                      }
                    }
                  }}
                />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '13px' }}>
                  No facility data in current filter.
                </div>
              )}
            </div>
          </div>

          {/* Activity Category Doughnut */}
          <div className="card" style={{ margin: 0 }}>
            <div className="card-header">
              <div>
                <div className="card-title">Emissions by Activity Category</div>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Top operational carbon drivers
                </span>
              </div>
              <span className="badge badge-verified">
                <Layers size={13} style={{ marginRight: '4px' }} />
                Top 5 Categories
              </span>
            </div>

            <div style={{ position: 'relative', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {categoryChartData ? (
                <Doughnut
                  data={categoryChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        ...appleTooltipOptions,
                        callbacks: {
                          label: (ctx) => ` ${ctx.label}: ${Number(ctx.raw).toLocaleString()} tCO₂e (${totalEmissions > 0 ? Math.round((ctx.raw / totalEmissions) * 100) : 0}%)`
                        }
                      }
                    },
                    cutout: '72%'
                  }}
                />
              ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>No categories to display.</div>
              )}

              {/* Inset Center Doughnut Gross Label */}
              <div style={{
                position: 'absolute',
                textAlign: 'center',
                pointerEvents: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.8px', color: 'var(--text-dim)', fontWeight: 700 }}>
                  IN VIEW
                </span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.4px' }}>
                  {Number(totalEmissions).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
                <span style={{ fontSize: '9px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  tCO₂e
                </span>
              </div>
            </div>

            {/* Category Legend Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '12px', justifyContent: 'center' }}>
              {categoryBreakdown.map((cat, idx) => {
                const colors = ['#0071E3', '#34C759', '#FF9500', '#5856D6', '#30B0C7'];
                const pct = totalEmissions > 0 ? Math.round((cat.value / totalEmissions) * 100) : 0;
                return (
                  <div
                    key={cat.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '8px',
                      background: 'rgba(0, 0, 0, 0.04)',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--text-main)'
                    }}
                  >
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: colors[idx % colors.length] }} />
                    <span>{cat.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Main Emissions Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Facility</th>
                <th>Source</th>
                <th>Scope</th>
                <th>Activity Data</th>
                <th>Unit</th>
                <th>Emissions (tCO₂e)</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Loading emissions records...
                  </td>
                </tr>
              ) : emissions.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No emission records match the selected filters.
                  </td>
                </tr>
              ) : (
                emissions.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 600 }}>{item.facility_name}</td>
                    <td>{item.source}</td>
                    <td>
                      <span className={`badge ${
                        item.scope === 'Scope 1' ? 'badge-info' :
                        item.scope === 'Scope 2' ? 'badge-verified' : 'badge-pending'
                      }`}>
                        {item.scope}
                      </span>
                    </td>
                    <td>{Number(item.activity).toLocaleString()}</td>
                    <td>{item.unit}</td>
                    <td style={{ fontWeight: 800, color: 'var(--color-emerald)', fontFamily: 'monospace' }}>
                      {Number(item.emissions).toLocaleString(undefined, { maximumFractionDigits: 1 })}
                    </td>
                    <td>
                      <span className={`badge badge-${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          className="icon-button"
                          style={{ width: '30px', height: '30px' }}
                          title="View Audit Trail & Evidence"
                          onClick={() => handleOpenAudit(item)}
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          className="icon-button"
                          style={{ width: '30px', height: '30px' }}
                          title="Edit Record"
                          onClick={() => {
                            setEditingEmission(item);
                            setIsEmissionModalOpen(true);
                          }}
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          className="icon-button"
                          style={{ width: '30px', height: '30px', color: '#EF4444' }}
                          title="Delete Record"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Emission Modal for Add / Edit */}
      <EmissionModal
        isOpen={isEmissionModalOpen}
        onClose={() => setIsEmissionModalOpen(false)}
        onSave={fetchEmissions}
        editingEmission={editingEmission}
        facilities={facilities}
      />

      {/* Calculation Evidence & Audit Trail Modal */}
      <AuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        emission={inspectEmission}
      />
    </div>
  );
};

export default CarbonAccounting;
