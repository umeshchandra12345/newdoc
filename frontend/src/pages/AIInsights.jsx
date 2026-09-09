import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  TrendingDown,
  Users,
  LineChart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Info
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AIInsights = () => {
  const insights = [
    {
      id: 'anomaly',
      type: 'Emission Anomaly',
      title: 'Electricity Surge Detected at Hyderabad Plant',
      description: 'Electricity emissions at Hyderabad Plant are 18% higher than the historical seasonal average, primarily driven by baseline HVAC chiller loads during peak hours.',
      status: 'Medium',
      badgeClass: 'badge-pending',
      metricLabel: 'Impact Deviation',
      metricValue: '+6,390 tCO₂e',
      recommendation: 'Deploy automated VFD controls and perform refrigerant charge leak inspection.',
      actionLink: '/scope-2',
      actionText: 'Review Scope 2 Data',
      icon: AlertTriangle,
      color: '#F59E0B',
      bgColor: '#FEF3C7'
    },
    {
      id: 'reduction',
      type: 'Reduction Opportunity',
      title: 'Low-Carbon Recycled Steel Sourcing',
      description: 'Switching selected structural materials for DX-100 and DX-500 products to lower-carbon recycled steel could reduce product emissions by approximately 14%.',
      status: 'High Impact',
      badgeClass: 'badge-verified',
      metricLabel: 'Potential Reduction',
      metricValue: '12,400 tCO₂e',
      recommendation: 'Engage GreenSteel certified suppliers to substitute 42kg/unit virgin steel components.',
      actionLink: '/products',
      actionText: 'Simulate Material PCF',
      icon: TrendingDown,
      color: '#10B981',
      bgColor: '#D1FAE5'
    },
    {
      id: 'supplier-risk',
      type: 'Supplier Risk',
      title: 'Scope 3 Supply Chain Primary Data Gaps',
      description: '12 suppliers have incomplete emissions data and missing Scope 2 market certificates, which may affect Scope 3 reporting accuracy and CBAM quarterly filings.',
      status: 'Action Required',
      badgeClass: 'badge-review',
      metricLabel: 'Data Uncertainty',
      metricValue: '± 16.4%',
      recommendation: 'Dispatch standardized GHG protocol digital questionnaires with automatic evidence upload verification.',
      actionLink: '/suppliers',
      actionText: 'Open Supplier Registry',
      icon: Users,
      color: '#EF4444',
      bgColor: '#FEE2E2'
    },
    {
      id: 'forecast',
      type: 'Trajectory Forecast',
      title: '2030 Business-As-Usual (BAU) Emission Trajectory',
      description: 'Based on the current production trajectory and planned capacity expansions, total emissions may reach 510,000 tCO₂e by 2030 without intervention.',
      status: 'Long-term',
      badgeClass: 'badge-info',
      metricLabel: 'Projected 2030 BAU',
      metricValue: '510,000 tCO₂e',
      recommendation: 'Accelerate corporate renewable power purchase agreements (PPAs) and heat pump electrification.',
      actionLink: '/decarbonization',
      actionText: 'View Decarbonization Planner',
      icon: LineChart,
      color: '#3B82F6',
      bgColor: '#DBEAFE'
    }
  ];

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#0D9488', fontWeight: 700, fontSize: '12px', textTransform: 'uppercase', marginBottom: '4px' }}>
            <Sparkles size={16} />
            <span>Environmental Intelligence Heuristics</span>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F2E22', letterSpacing: '-0.4px' }}>
            AI Climate Insights
          </h2>
          <p className="page-subtitle">
            Automated anomaly detection, decarbonization opportunity ranking, and regulatory risk screening derived from telemetry data.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F8FAFC', padding: '8px 14px', borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '12px', color: '#64748B' }}>
          <Info size={16} />
          <span>Rule-based statistical models calculated on active ledger records</span>
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))',
        gap: '24px'
      }}>
        {insights.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.id}
              className="card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                borderLeft: `4px solid ${card.color}`,
                margin: 0
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: card.bgColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: card.color
                    }}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                        {card.type}
                      </div>
                      <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                        {card.title}
                      </h3>
                    </div>
                  </div>
                  <span className={`badge ${card.badgeClass}`}>
                    {card.status}
                  </span>
                </div>

                <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.6, marginBottom: '20px' }}>
                  {card.description}
                </p>

                <div style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '14px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748B' }}>{card.metricLabel}</span>
                  <span style={{ fontSize: '20px', fontWeight: 800, color: card.color }}>{card.metricValue}</span>
                </div>

                <div style={{ fontSize: '13px', color: '#334155', marginBottom: '16px' }}>
                  <strong>Recommended Action:</strong> {card.recommendation}
                </div>
              </div>

              <div style={{
                paddingTop: '16px',
                borderTop: '1px solid #E2E8F0',
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <Link to={card.actionLink} className="btn btn-outline btn-sm">
                  <span>{card.actionText}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AIInsights;
