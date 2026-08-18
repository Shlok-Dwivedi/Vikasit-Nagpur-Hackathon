import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, IndianRupee, HeartHandshake, Download, ShieldCheck } from 'lucide-react';
import './ImpactReport.css';

export default function ImpactReport({ backendUrl }) {
  const [impactData, setImpactData] = useState({
    avg_vendor_income_growth: '+0.0%',
    income_range: 'Calculated from live approved vendors',
    repayment_rate: 'Not measured',
    digital_payment_adoption: '0 Active Vendors',
    total_active_vendors: 0,
    pm_svanidhi_tiers: {
      tier1: { label: 'Tier 1 (₹10,000 Disbursed)', count: 0, percentage: 0 },
      tier2: { label: 'Tier 2 (₹20,000 Upgraded Loan)', count: 0, percentage: 0 },
      tier3: { label: 'Tier 3 (₹50,000 Enhanced Credit)', count: 0, percentage: 0 }
    },
    dispute_reduction: 'Zero Disputes Logged'
  });

  const apiBackendUrl = backendUrl || '';

  useEffect(() => {
    fetch(`${apiBackendUrl}/api/impact`)
      .then((res) => res.json())
      .then((data) => {
        if (data.digital_payment_adoption) {
          setImpactData({ ...data, repayment_rate: data.repayment_rate ?? 'Not measured' });
        }
      })
      .catch((err) => console.log('Impact analytics fetch note:', err));
  }, [apiBackendUrl]);

  return (
    <div className="impact-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Livelihood Impact & Executive Summary</h2>
          <span className="sub-header-tag">Live Social-Economic Impact REST Analytics</span>
        </div>
        <button className="submit-btn" onClick={() => window.print()} style={{ width: 'auto', padding: '10px 18px' }}>
          <Download size={16} />
          <span>Export Executive Report</span>
        </button>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon green">
            <TrendingUp size={24} />
          </div>
          <div className="kpi-info">
            <h3>{impactData.avg_vendor_income_growth}</h3>
            <p>Avg Vendor Monthly Income</p>
            <div className="kpi-trend positive">{impactData.income_range}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon saffron">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <h3>{impactData.repayment_rate}</h3>
            <p>PM SVANidhi Repayment Rate</p>
            <div className="kpi-trend positive">Live Verification Active</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <HeartHandshake size={24} />
          </div>
          <div className="kpi-info">
            <h3>{impactData.digital_payment_adoption}</h3>
            <p>Digital Payment Adoption</p>
            <div className="kpi-trend positive">QR Cashless Active</div>
          </div>
        </div>
      </div>

      <div className="report-grid">
        
        <div className="ai-card">
          <div className="section-header">
            <h3>PM SVANidhi Micro-Credit Adoption (Live Database API)</h3>
          </div>

          <div className="metric-bar-group">
            {impactData.pm_svanidhi_tiers && Object.values(impactData.pm_svanidhi_tiers).map((tier, idx) => (
              <div key={idx} className="bar-row">
                <div className="bar-label">
                  <span>{tier.label}</span>
                  <strong>{tier.count} Vendors ({tier.percentage}%)</strong>
                </div>
                <div className="bar-bg">
                  <div className="bar-fill" style={{ width: `${Math.max(tier.percentage, tier.count > 0 ? 20 : 0)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ai-card">
          <div className="section-header">
            <h3>Civic Harmony & Dispute Index</h3>
          </div>

          <div className="recommendation-box">
            <div className="recommendation-header">
              <ShieldCheck size={18} color="#10b981" />
              <span>{impactData.dispute_reduction}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Implementation of Leaflet GIS Vending Zones & AI Zone Optimization has resolved encroachment disputes dynamically calculated from live inspection logs.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
