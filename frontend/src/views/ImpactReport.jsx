import React from 'react';
import { BarChart3, TrendingUp, IndianRupee, HeartHandshake, Download, ShieldCheck } from 'lucide-react';
import './ImpactReport.css';

export default function ImpactReport() {
  return (
    <div className="impact-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Livelihood Impact & Executive Summary</h2>
          <span className="sub-header-tag">Social-economic impact analytics & scheme utilization</span>
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
            <h3>+28.4%</h3>
            <p>Avg Vendor Monthly Income</p>
            <div className="kpi-trend positive">From ₹12,400 to ₹15,920</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon saffron">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <h3>84.5%</h3>
            <p>PM SVANidhi Repayment Rate</p>
            <div className="kpi-trend positive">Highest in State</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <HeartHandshake size={24} />
          </div>
          <div className="kpi-info">
            <h3>12,100</h3>
            <p>Digital Payment Adoption</p>
            <div className="kpi-trend positive">QR Cashless Active</div>
          </div>
        </div>
      </div>

      <div className="report-grid">
        
        <div className="ai-card">
          <div className="section-header">
            <h3>PM SVANidhi Micro-Credit Adoption</h3>
          </div>

          <div className="metric-bar-group">
            <div className="bar-row">
              <div className="bar-label">
                <span>Tier 1 (₹10,000 Loan Disbursed)</span>
                <strong>9,420 Vendors (66%)</strong>
              </div>
              <div className="bar-bg"><div className="bar-fill" style={{ width: '66%' }}></div></div>
            </div>

            <div className="bar-row">
              <div className="bar-label">
                <span>Tier 2 (₹20,000 Upgraded Loan)</span>
                <strong>4,180 Vendors (29%)</strong>
              </div>
              <div className="bar-bg"><div className="bar-fill" style={{ width: '29%', background: '#3b82f6' }}></div></div>
            </div>

            <div className="bar-row">
              <div className="bar-label">
                <span>Tier 3 (₹50,000 Enhanced Credit)</span>
                <strong>1,290 Vendors (9%)</strong>
              </div>
              <div className="bar-bg"><div className="bar-fill" style={{ width: '9%', background: '#a855f7' }}></div></div>
            </div>
          </div>
        </div>

        <div className="ai-card">
          <div className="section-header">
            <h3>Civic Harmony & Dispute Index</h3>
          </div>

          <div className="recommendation-box">
            <div className="recommendation-header">
              <ShieldCheck size={18} color="#10b981" />
              <span>76% Reduction in Encroachment Disputes</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
              Implementation of Leaflet GIS Vending Zones & AI Zone Optimization has resolved 76% of road encroachment complaints compared to previous municipal year.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
