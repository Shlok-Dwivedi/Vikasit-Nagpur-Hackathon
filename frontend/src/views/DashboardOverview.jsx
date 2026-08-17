import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/Map/LeafletMap';
import { 
  Users, 
  MapPin, 
  CheckCircle2, 
  IndianRupee, 
  AlertTriangle, 
  PlusCircle, 
  FileCheck, 
  ShieldAlert 
} from 'lucide-react';
import './DashboardOverview.css';

export default function DashboardOverview({ onNavigate, backendUrl }) {
  const [stats, setStats] = useState({
    total_vendors: 14290,
    active_zones: 42,
    compliance_rate: 94.2,
    disbursed_amount: '₹1.28 Cr'
  });
  const [alerts, setAlerts] = useState([]);
  const [vendors, setVendors] = useState([]);

  // Fetch dynamic stats, alerts, and vendors from Render FastAPI backend
  useEffect(() => {
    fetch(`${backendUrl}/api/stats`)
      .then((res) => res.json())
      .then((data) => {
        if (data.total_vendors) setStats(data);
      })
      .catch((err) => console.log('Stats fetch note:', err));

    fetch(`${backendUrl}/api/alerts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.alerts) setAlerts(data.alerts);
      })
      .catch((err) => console.log('Alerts fetch note:', err));

    fetch(`${backendUrl}/api/vendors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vendors) setVendors(data.vendors);
      })
      .catch((err) => console.log('Vendors fetch note:', err));
  }, [backendUrl]);

  return (
    <div className="dashboard-container">
      
      {/* Top Stat KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon saffron">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats.total_vendors?.toLocaleString()}</h3>
            <p>Registered Vendors</p>
            <div className="kpi-trend positive">↑ Dynamic REST Engine</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <MapPin size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats.active_zones}</h3>
            <p>Designated Vending Zones</p>
            <div className="kpi-trend positive">3 AI Optimized</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats.compliance_rate}%</h3>
            <p>Compliance Rate</p>
            <div className="kpi-trend positive">↑ Live Calculated</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats.disbursed_amount}</h3>
            <p>PM SVANidhi Disbursed</p>
            <div className="kpi-trend neutral">4,890 Beneficiaries</div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Dynamic Leaflet GIS Map + Live Alerts */}
      <div className="dashboard-split">
        
        {/* Left Column: Interactive GIS Map */}
        <div className="map-section">
          <div className="section-header">
            <h2>Live GIS Civic Vending Map</h2>
            <span className="sub-header-tag">Nagpur Municipal Zone A & B</span>
          </div>

          <LeafletMap height="460px" showZones={true} vendors={vendors} />
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
              <span className="sub-header-tag">Live API Feed</span>
            </div>

            <div className="alert-list">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div key={alert.id} className={`alert-item ${alert.type}`}>
                    {alert.type === 'warning' && <AlertTriangle size={18} color="#f59e0b" />}
                    {alert.type === 'success' && <CheckCircle2 size={18} color="#10b981" />}
                    {alert.type === 'danger' && <ShieldAlert size={18} color="#ef4444" />}
                    {alert.type === 'info' && <PlusCircle size={18} color="#3b82f6" />}
                    <div className="alert-content">
                      <h4>{alert.title}</h4>
                      <p>{alert.message}</p>
                      <div className="alert-time">{alert.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading live feed...</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
