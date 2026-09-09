import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Package,
  Plus,
  Eye,
  ArrowDownRight,
  Layers,
  DollarSign,
  X,
  Check,
  Award,
  TrendingDown,
  ShieldCheck,
  BarChart3,
  Sparkles
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
import api from '../services/api';
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

const Products = () => {
  const { searchTerm: globalSearch } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productDetail, setProductDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: 'Motors',
    carbon_footprint: '',
    change_pct: -5.0,
    status: 'Verified'
  });
  const [addError, setAddError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      let url = '/api/products';
      const searchEffective = localSearch || globalSearch;
      const params = [];
      if (searchEffective) params.push(`search=${encodeURIComponent(searchEffective)}`);
      if (selectedCategory !== 'All') params.push(`category=${encodeURIComponent(selectedCategory)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await api.get(url);
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [localSearch, globalSearch, selectedCategory]);

  const handleOpenDetail = async (prod) => {
    setSelectedProduct(prod);
    try {
      setDetailLoading(true);
      const res = await api.get(`/api/products/${prod.id}`);
      setProductDetail(res.data);
    } catch (err) {
      console.error('Failed to load product detail', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku || !newProduct.carbon_footprint) {
      setAddError('Please fill in all required fields.');
      return;
    }
    try {
      setSaving(true);
      setAddError('');
      await api.post('/api/products', {
        ...newProduct,
        carbon_footprint: parseFloat(newProduct.carbon_footprint),
        change_pct: parseFloat(newProduct.change_pct)
      });
      setIsAddModalOpen(false);
      setNewProduct({ name: '', sku: '', category: 'Motors', carbon_footprint: '', change_pct: -5.0, status: 'Verified' });
      fetchProducts();
    } catch (err) {
      setAddError(err.response?.data?.detail || 'Failed to add product.');
    } finally {
      setSaving(false);
    }
  };

  const avgFootprint = useMemo(() => {
    if (!products.length) return 0;
    const sum = products.reduce((acc, p) => acc + p.carbon_footprint, 0);
    return Math.round((sum / products.length) * 10) / 10;
  }, [products]);

  const bestSku = useMemo(() => {
    if (!products.length) return null;
    return [...products].sort((a, b) => a.carbon_footprint - b.carbon_footprint)[0];
  }, [products]);

  const avgReduction = useMemo(() => {
    if (!products.length) return 0;
    const sum = products.reduce((acc, p) => acc + (p.change_pct || 0), 0);
    return Math.round((sum / products.length) * 10) / 10;
  }, [products]);

  // Product intensity bar chart data
  const pcfBarChartData = useMemo(() => {
    if (!products.length) return null;
    const sorted = [...products].sort((a, b) => b.carbon_footprint - a.carbon_footprint).slice(0, 8);
    return {
      labels: sorted.map((p) => p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name),
      datasets: [
        {
          label: 'Carbon Intensity (kgCO₂e / unit)',
          data: sorted.map((p) => p.carbon_footprint),
          backgroundColor: sorted.map((p) => p.carbon_footprint > 1000 ? '#0071E3' : p.carbon_footprint > 200 ? '#34C759' : '#30B0C7'),
          borderRadius: 8,
          maxBarThickness: 28,
        }
      ]
    };
  }, [products]);

  // Lifecycle breakdown chart for selected product
  const lifecycleChartData = productDetail ? {
    labels: productDetail.lifecycle_breakdown.map((s) => s.stage),
    datasets: [
      {
        data: productDetail.lifecycle_breakdown.map((s) => s.emissions_kg),
        backgroundColor: ['#0071E3', '#34C759', '#FF9500', '#5856D6', '#30B0C7'],
        borderWidth: 2,
        borderColor: '#FFFFFF'
      }
    ]
  } : null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '26px', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px', fontFamily: "'Outfit', sans-serif" }}>
            Product Carbon Footprint (PCF)
          </h2>
          <p className="page-subtitle">
            Cradle-to-gate lifecycle assessment (LCA) across manufactured assemblies and component SKUs.
          </p>
        </div>

        <button className="btn btn-emerald" onClick={() => setIsAddModalOpen(true)}>
          <Plus size={16} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Top PCF KPI Cards with Sparklines */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Catalog SKUs</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {products.length}
              <span className="kpi-unit">models</span>
            </div>
            <Sparkline data={[products.length - 3, products.length - 2, products.length - 1, products.length, products.length]} color="#0071E3" width={95} height={34} />
          </div>
          <div className="kpi-change neutral">ISO 14067 Ingested</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Mean Footprint</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {avgFootprint}
              <span className="kpi-unit">kgCO₂e</span>
            </div>
            <Sparkline data={[avgFootprint * 1.09, avgFootprint * 1.06, avgFootprint * 1.03, avgFootprint * 1.01, avgFootprint]} color="#248A3D" width={95} height={34} />
          </div>
          <div className="kpi-change positive">
            <ArrowDownRight size={14} />
            <span>-5.4% YoY eco-design</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Best-in-Class SKU</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0, fontSize: '24px' }}>
              {bestSku?.carbon_footprint || '0'}
              <span className="kpi-unit">kgCO₂e</span>
            </div>
            <Sparkline data={[24, 21, 18, 16, bestSku?.carbon_footprint || 14]} color="#34C759" width={95} height={34} />
          </div>
          <div className="kpi-change positive">
            <span>{bestSku?.sku || 'N/A'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">Net Decarb Velocity</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: '6px' }}>
            <div className="kpi-value" style={{ marginTop: 0 }}>
              {avgReduction}%
              <span className="kpi-unit">YoY</span>
            </div>
            <Sparkline data={[-2.4, -3.8, -4.5, -5.2, avgReduction]} color="#34C759" width={95} height={34} />
          </div>
          <div className="kpi-change positive">
            <TrendingDown size={14} />
            <span>Exceeds -4.2% Paris Goal</span>
          </div>
        </div>
      </div>

      {/* PCF Intensity Leaderboard Bar Chart */}
      {pcfBarChartData && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <div>
              <div className="card-title">Product Carbon Intensity Leaderboard</div>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Cradle-to-gate embodied carbon per unit across manufactured SKUs
              </span>
            </div>
            <span className="badge badge-verified">
              <ShieldCheck size={13} style={{ marginRight: '4px' }} />
              LCA Verified
            </span>
          </div>

          <div style={{ height: '240px', marginTop: '8px' }}>
            <Bar
              data={pcfBarChartData}
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
                      label: (ctx) => ` ${Number(ctx.raw).toLocaleString()} kgCO₂e / unit`
                    }
                  }
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
                      callback: (v) => `${v} kg`
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Filter bar */}
      <div className="filter-bar">
        <div className="filter-item">
          <label>Category:</label>
          <select
            className="form-select"
            style={{ width: 'auto', padding: '6px 12px' }}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="Motors">Motors</option>
            <option value="Fluid Systems">Fluid Systems</option>
            <option value="Heavy Machinery">Heavy Machinery</option>
            <option value="Electronics">Electronics</option>
            <option value="Valves">Valves</option>
            <option value="Thermal">Thermal</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <input
            type="text"
            placeholder="Search SKU or product..."
            className="form-input"
            style={{ width: '220px', padding: '6px 12px' }}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Product Table */}
      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Carbon Footprint</th>
                <th>YoY Change</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    Loading product footprint data...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id}>
                    <td style={{ fontWeight: 600 }}>{prod.name}</td>
                    <td><code>{prod.sku}</code></td>
                    <td>{prod.category}</td>
                    <td style={{ fontWeight: 700, color: '#0F2E22' }}>
                      {prod.carbon_footprint} <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>kgCO₂e/unit</span>
                    </td>
                    <td>
                      <span style={{
                        color: prod.change_pct < 0 ? '#047857' : '#B91C1C',
                        fontWeight: 600,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '2px'
                      }}>
                        {prod.change_pct < 0 ? '↓' : '↑'} {Math.abs(prod.change_pct)}%
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${prod.status.toLowerCase()}`}>
                        {prod.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleOpenDetail(prod)}
                      >
                        <Eye size={14} />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div className="modal-content" style={{ maxWidth: '780px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase' }}>
                  SKU: {selectedProduct.sku} • {selectedProduct.category}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#0F2E22', marginTop: '2px' }}>
                  {selectedProduct.name}
                </h3>
              </div>
              <button className="icon-button" onClick={() => setSelectedProduct(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {detailLoading || !productDetail ? (
                <div style={{ padding: '30px', textAlign: 'center', color: '#64748B' }}>Loading lifecycle data...</div>
              ) : (
                <>
                  {/* Top Stats Banner */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1.2fr 1fr',
                    gap: '20px',
                    marginBottom: '24px',
                    background: '#F8FAFC',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0'
                  }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>TOTAL CARBON FOOTPRINT</div>
                      <div style={{ fontSize: '32px', fontWeight: 800, color: '#0F2E22', marginTop: '2px' }}>
                        {productDetail.carbon_footprint} <span style={{ fontSize: '16px', color: '#64748B', fontWeight: 500 }}>kgCO₂e / unit</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>
                        Functional Unit: {productDetail.functional_unit}
                      </div>
                    </div>

                    <div style={{ height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {lifecycleChartData && (
                        <Doughnut
                          data={lifecycleChartData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'right', labels: { boxWidth: 10, font: { size: 10 } } } },
                            cutout: '65%'
                          }}
                        />
                      )}
                    </div>
                  </div>

                  {/* Lifecycle Stages Table */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#0F2E22' }}>
                      Cradle-to-Gate Life Cycle Breakdown
                    </h4>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Lifecycle Stage</th>
                            <th>Share %</th>
                            <th>Emissions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productDetail.lifecycle_breakdown.map((s, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{s.stage}</td>
                              <td>{s.percentage}%</td>
                              <td style={{ fontWeight: 700 }}>{s.emissions_kg} kgCO₂e</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bill of Materials Table */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '10px', color: '#0F2E22' }}>
                      Primary Bill of Materials (BOM)
                    </h4>
                    <div className="table-wrapper">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th>Material</th>
                            <th>Supplier</th>
                            <th>Quantity</th>
                            <th>Carbon Intensity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productDetail.materials.map((m, idx) => (
                            <tr key={idx}>
                              <td style={{ fontWeight: 600 }}>{m.material}</td>
                              <td>{m.supplier}</td>
                              <td>{m.quantity}</td>
                              <td><span className="badge badge-info">{m.intensity}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Alternative Material Comparison Simulator */}
                  <div style={{
                    background: '#ECFDF5',
                    border: '1px solid #A7F3D0',
                    borderRadius: '12px',
                    padding: '20px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <Layers size={18} color="#047857" />
                      <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#065F46', margin: 0 }}>
                        Material Substitution Simulation: Low-Carbon Alternative
                      </h4>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                      <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #D1FAE5' }}>
                        <div style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>CURRENT BASELINE</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#0F172A', marginTop: '2px' }}>
                          {productDetail.comparison.current_material.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#0F2E22', marginTop: '4px' }}>
                          Footprint: <strong>{productDetail.comparison.current_material.footprint}</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Cost: {productDetail.comparison.current_material.cost}
                        </div>
                      </div>

                      <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '2px solid #10B981' }}>
                        <div style={{ fontSize: '11px', color: '#047857', fontWeight: 700 }}>SUGGESTED ALTERNATIVE</div>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#047857', marginTop: '2px' }}>
                          {productDetail.comparison.alternative_material.name}
                        </div>
                        <div style={{ fontSize: '13px', color: '#047857', marginTop: '4px' }}>
                          Footprint: <strong>{productDetail.comparison.alternative_material.footprint}</strong>
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748B' }}>
                          Cost: {productDetail.comparison.alternative_material.cost}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#065F46' }}>
                      <span>✓ Carbon Impact: {productDetail.comparison.carbon_reduction}</span>
                      <span>CapEx Impact: {productDetail.comparison.cost_impact}</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setSelectedProduct(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Add Product to Portfolio</h3>
              <button className="icon-button" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddProduct}>
              <div className="modal-body">
                {addError && (
                  <div style={{ background: '#FEE2E2', color: '#B91C1C', padding: '10px', borderRadius: '8px', fontSize: '13px', marginBottom: '14px' }}>
                    {addError}
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Industrial Turbopump"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Product SKU *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. DX-330"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    >
                      <option value="Motors">Motors</option>
                      <option value="Fluid Systems">Fluid Systems</option>
                      <option value="Heavy Machinery">Heavy Machinery</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Valves">Valves</option>
                      <option value="Thermal">Thermal</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Carbon Footprint (kgCO₂e/unit) *</label>
                    <input
                      type="number"
                      step="any"
                      className="form-input"
                      placeholder="e.g. 115.4"
                      value={newProduct.carbon_footprint}
                      onChange={(e) => setNewProduct({ ...newProduct, carbon_footprint: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Verification Status</label>
                    <select
                      className="form-select"
                      value={newProduct.status}
                      onChange={(e) => setNewProduct({ ...newProduct, status: e.target.value })}
                    >
                      <option value="Verified">Verified</option>
                      <option value="Review">Requires Review</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setIsAddModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-emerald" disabled={saving}>
                  <Check size={16} />
                  <span>{saving ? 'Saving...' : 'Create Product'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
