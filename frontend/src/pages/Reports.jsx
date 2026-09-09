import React, { useState, useEffect } from 'react';
import { FileText, Download, Eye, CheckCircle2, X } from 'lucide-react';
import api, { downloadCsv } from '../services/api';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingReport, setViewingReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const res = await api.get('/api/regulatory/reports');
        setReports(res.data);
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  const handleDownload = async (id) => {
    try {
      await downloadCsv(id);
    } catch (err) {
      console.error('Failed to download report', err);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F2E22', letterSpacing: '-0.4px' }}>
            Environmental Reports & Assurance Packages
          </h2>
          <p className="page-subtitle">
            Export audit-ready CSV disclosures and GHG Protocol inventories for external assurance.
          </p>
        </div>
      </div>

      <div className="card">
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report Title</th>
                <th>Standard Aligned</th>
                <th>Reporting Year</th>
                <th>Status</th>
                <th>Last Updated</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
                    Loading reports list...
                  </td>
                </tr>
              ) : (
                reports.map((rep) => (
                  <tr key={rep.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#ECFDF5',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#047857'
                        }}>
                          <FileText size={16} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{rep.name}</div>
                          <div style={{ fontSize: '11px', color: '#64748B' }}>{rep.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{rep.standard}</td>
                    <td>{rep.year}</td>
                    <td>
                      <span className="badge badge-verified">
                        {rep.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748B' }}>{rep.last_updated}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => setViewingReport(rep)}
                        >
                          <Eye size={14} />
                          <span>View</span>
                        </button>
                        <button
                          className="btn btn-emerald btn-sm"
                          onClick={() => handleDownload(rep.id)}
                        >
                          <Download size={14} />
                          <span>Download CSV</span>
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

      {/* View Modal */}
      {viewingReport && (
        <div className="modal-overlay" onClick={() => setViewingReport(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>
                {viewingReport.name}
              </h3>
              <button className="icon-button" onClick={() => setViewingReport(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>ACCOUNTING STANDARD</div>
                <div style={{ fontSize: '16px', fontWeight: 700, color: '#0F2E22', marginTop: '2px' }}>
                  {viewingReport.standard}
                </div>
              </div>

              <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '16px' }}>
                {viewingReport.summary}
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                <div><strong>Reporting Period:</strong> CY {viewingReport.year}</div>
                <div><strong>Assurance Level:</strong> Limited Assurance (ISO 14064-3)</div>
                <div><strong>File Format:</strong> RFC 4180 Standard CSV</div>
                <div><strong>Status:</strong> {viewingReport.status}</div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setViewingReport(null)}>
                Close
              </button>
              <button
                className="btn btn-emerald"
                onClick={() => {
                  handleDownload(viewingReport.id);
                  setViewingReport(null);
                }}
              >
                <Download size={16} />
                <span>Download Report CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
