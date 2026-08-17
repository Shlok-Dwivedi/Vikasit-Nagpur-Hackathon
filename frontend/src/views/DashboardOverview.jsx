import React from 'react';
import LeafletMap from '../components/Map/LeafletMap';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  IndianRupee, 
  AlertTriangle, 
  TrendingUp, 
  PlusCircle, 
  FileCheck, 
  ShieldAlert 
} from 'lucide-react';
import './DashboardOverview.css';

export default function DashboardOverview({ onNavigate }) {
  return (
    <div className="dashboard-container">
      
      {/* Top Stat KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon saffron">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <h3>14,290</h3>
            <p>Registered Vendors</p>
            <div className="kpi-trend positive">↑ +12% this month</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <MapPin size={24} />
          </div>
          <div className="kpi-info">
            <h3>42</h3>
            <p>Designated Vending Zones</p>
            <div className="kpi-trend positive">3 AI Optimized</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <h3>94.2%</h3>
            <p>Compliance Rate</p>
            <div className="kpi-trend positive">↑ 4.1% YoY</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <h3>₹1.28 Cr</h3>
            <p>PM SVANidhi Disbursed</p>
            <div className="kpi-trend neutral">4,890 Beneficiaries</div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Leaflet GIS Map + Live Alerts & Quick Actions */}
      <div className="dashboard-split">
        
        {/* Left Column: Interactive GIS Map */}
        <div className="map-section">
          <div className="section-header">
            <h2>Live GIS Civic Vending Map</h2>
            <span className="sub-header-tag">Nagpur Municipal Zone A & B</span>
          </div>

          <LeafletMap height="460px" showZones={true} />
        </div>

        {/* Right Column: Live Feed & Quick Actions */}
        <div className="alerts-section">
          
          {/* Quick Actions Panel */}
          <div className="card-panel">
            <div className="section-header">
              <h2>Quick Actions</h2>
            </div>
            <div className="action-btn-grid">
              <button className="quick-act-btn" onClick={() => onNavigate('vendor_management')}>
                <PlusCircle size={16} />
                <span>Add Vendor</span>
              </button>
              <button className="quick-act-btn" onClick={() => onNavigate('certificate_management')}>
                <FileCheck size={16} />
                <span>Issue Certificate</span>
              </button>
              <button className="quick-act-btn" onClick={() => onNavigate('zone_optimizer')}>
                <MapPin size={16} />
                <span>Re-Zone Area</span>
              </button>
              <button className="quick-act-btn" onClick={() => onNavigate('mobile_inspector')}>
                <ShieldAlert size={16} />
                <span>Inspect Field</span>
              </button>
            </div>
          </div>

          {/* Live Alerts Feed */}
          <div className="card-panel">
            <div className="section-header">
              <h2>Recent Civic Activity</h2>
              <span className="sub-header-tag">Live Feed</span>
            </div>

            <div className="alert-list">
              <div className="alert-item warning">
                <AlertTriangle size={18} color="#f59e0b" />
                <div className="alert-content">
                  <h4>High Pedestrian Density Warning</h4>
                  <p>Zone C (Metro Corridor) reached 88% capacity. AI zone optimization recommended.</p>
                  <div className="alert-time">10 mins ago</div>
                </div>
              </div>

              <div className="alert-item success">
                <CheckCircle2 size={18} color="#10b981" />
                <div className="alert-content">
                  <h4>Certificate Renewal Approved</h4>
                  <p>Vendor V-1029 (Ramesh Fruit Stall) renewed 1-year vending permit.</p>
                  <div className="alert-time">25 mins ago</div>
                </div>
              </div>

              <div className="alert-item danger">
                <ShieldAlert size={18} color="#ef4444" />
                <div className="alert-content">
                  <h4>Unauthorized Vending Logged</h4>
                  <p>Inspector Inspector-04 logged 2 non-permitted stalls at Railway Gate #2.</p>
                  <div className="alert-time">1 hour ago</div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
