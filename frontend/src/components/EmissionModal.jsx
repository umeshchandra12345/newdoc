import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import api from '../services/api';

const EmissionModal = ({ isOpen, onClose, onSave, editingEmission, facilities }) => {
  const [formData, setFormData] = useState({
    facility_id: '',
    source: '',
    scope: 'Scope 1',
    category: 'Stationary Combustion',
    activity: '',
    unit: 'm³',
    emissions: '',
    year: 2026,
    status: 'Verified'
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editingEmission) {
      setFormData({
        facility_id: editingEmission.facility_id || (facilities[0]?.id || 1),
        source: editingEmission.source || '',
        scope: editingEmission.scope || 'Scope 1',
        category: editingEmission.category || 'Stationary Combustion',
        activity: editingEmission.activity || '',
        unit: editingEmission.unit || 'm³',
        emissions: editingEmission.emissions || '',
        year: editingEmission.year || 2026,
        status: editingEmission.status || 'Verified'
      });
    } else {
      setFormData({
        facility_id: facilities[0]?.id || 1,
        source: '',
        scope: 'Scope 1',
        category: 'Stationary Combustion',
        activity: '',
        unit: 'm³',
        emissions: '',
        year: 2026,
        status: 'Verified'
      });
    }
    setError('');
  }, [editingEmission, facilities, isOpen]);

  // Auto-calculate emissions if activity changes
  const handleActivityChange = (val) => {
    const act = parseFloat(val);
    let autoEmissions = formData.emissions;
    if (!isNaN(act)) {
      if (formData.unit === 'kWh') {
        autoEmissions = (act * 0.00072).toFixed(1); // 0.72 kg/kWh => 0.00072 t/kWh
      } else if (formData.unit === 'm³') {
        autoEmissions = (act * 0.00202).toFixed(1);
      } else if (formData.unit === 'Liters') {
        autoEmissions = (act * 0.00268).toFixed(1);
      } else if (formData.unit === 'tCO2e') {
        autoEmissions = act.toFixed(1);
      }
    }
    setFormData((prev) => ({ ...prev, activity: val, emissions: autoEmissions }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.source || !formData.activity || !formData.emissions) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      const payload = {
        facility_id: Number(formData.facility_id),
        source: formData.source,
        scope: formData.scope,
        category: formData.category,
        activity: parseFloat(formData.activity),
        unit: formData.unit,
        emissions: parseFloat(formData.emissions),
        year: Number(formData.year),
        status: formData.status
      };

      if (editingEmission) {
        await api.put(`/api/emissions/${editingEmission.id}`, payload);
      } else {
        await api.post('/api/emissions', payload);
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save emission record.');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
            {editingEmission ? 'Edit Emission Record' : 'Add New Emission Activity'}
          </h3>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div style={{
                background: '#FEE2E2',
                color: '#B91C1C',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                marginBottom: '16px',
                fontWeight: 500
              }}>
                {error}
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Facility *</label>
                <select
                  className="form-select"
                  value={formData.facility_id}
                  onChange={(e) => setFormData({ ...formData, facility_id: e.target.value })}
                >
                  {facilities.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({f.location})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">GHG Scope *</label>
                <select
                  className="form-select"
                  value={formData.scope}
                  onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                >
                  <option value="Scope 1">Scope 1 (Direct)</option>
                  <option value="Scope 2">Scope 2 (Electricity/Energy)</option>
                  <option value="Scope 3">Scope 3 (Value Chain)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Emission Source *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Natural Gas Furnaces, Grid Power"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Stationary Combustion, Grid Electricity"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Activity Value *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 4821200"
                  value={formData.activity}
                  onChange={(e) => handleActivityChange(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Unit of Measure *</label>
                <select
                  className="form-select"
                  value={formData.unit}
                  onChange={(e) => {
                    setFormData({ ...formData, unit: e.target.value });
                    handleActivityChange(formData.activity);
                  }}
                >
                  <option value="kWh">kWh (Electricity)</option>
                  <option value="m³">m³ (Natural Gas)</option>
                  <option value="Liters">Liters (Diesel/Fuel)</option>
                  <option value="tCO2e">tCO₂e (Direct Carbon)</option>
                  <option value="kg">kg (Chemical/Refrigerant)</option>
                  <option value="tonnes">tonnes (Freight/Material)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Calculated Emissions (tCO₂e) *</label>
                <input
                  type="number"
                  step="any"
                  className="form-input"
                  placeholder="e.g. 3471.0"
                  value={formData.emissions}
                  onChange={(e) => setFormData({ ...formData, emissions: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Reporting Year</label>
                <select
                  className="form-select"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Verification Status</label>
              <select
                className="form-select"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Verified">Verified</option>
                <option value="Pending">Pending Review</option>
                <option value="Review">Requires Audit Review</option>
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-emerald" disabled={saving}>
              <Check size={16} />
              {saving ? 'Saving...' : editingEmission ? 'Save Changes' : 'Record Emission'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmissionModal;
