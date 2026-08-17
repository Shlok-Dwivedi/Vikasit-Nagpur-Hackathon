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
  ShieldAlert,
  RefreshCw,
  Clock
} from 'lucide-react';
import './DashboardOverview.css';

export default function DashboardOverview({ onNavigate, backendUrl }) {
  const [vendors, setVendors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBackendUrl = backendUrl || 'https://vikasit-nagpur-hackathon.onrender.com';

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [vendorRes, alertRes, statRes] = await Promise.all([
        fetch(`${apiBackendUrl}/api/vendors`).then(r => r.json()),
        fetch(`${apiBackendUrl}/api/alerts`).then(r => r.json()),
        fetch(`${apiBackendUrl}/api/stats`).then(r => r.json())
      ]);

      if (vendorRes.vendors) setVendors(vendorRes.vendors);
      if (alertRes.alerts) setAlerts(alertRes.alerts);
      if (statRes) setStats(statRes);
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [apiBackendUrl]);

  // Dynamically calculate live metrics from vendors array
  const totalCount = vendors.length;
  const approvedVendors = vendors.filter(v => v.status === 'approved').length;
  const pendingVendors = vendors.filter(v => v.status === 'pending').length;
  const complianceRate = totalCount > 0 ? ((approvedVendors / totalCount) * 100).toFixed(1) : '100.0';

  return (
    <div className="dashboard-container">
      
      {/* Top Stat KPIs (Dynamic Data) */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon saffron">
            <Users size={24} />
          </div>
          <div className="kpi-info">
            <h3>{loading ? '...' : totalCount}</h3>
            <p>Total Registered Vendors</p>
            <div className="kpi-trend positive">
              {pendingVendors > 0 ? `(${pendingVendors} Pending Verification)` : 'All Vendors Verified'}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <MapPin size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats?.active_zones || 42}</h3>
            <p>Designated Vending Zones</p>
            <div className="kpi-trend positive">Zone A & B Active</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <h3>{loading ? '...' : `${complianceRate}%`}</h3>
            <p>Permit Compliance Rate</p>
            <div className="kpi-trend positive">{approvedVendors} / {totalCount} Permits Approved</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats?.disbursed_amount || '₹1.28 Cr'}</h3>
            <p>PM SVANidhi Micro-Credit</p>
            <div className="kpi-trend neutral">{approvedVendors} Active Beneficiaries</div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Dynamic Leaflet GIS Map + Live Alerts */}
      <div className="dashboard-split">
        
        {/* Left Column: Interactive GIS Map */}
        <div className="map-section">
          <div className="section-header">
            <h2>Live GIS Civic Vending Map</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="sub-header-tag">Showing {vendors.length} Dynamic Vendor Pins</span>
              <button className="action-icon-btn" onClick={loadDashboardData} title="Refresh Map & Dashboard Data">
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
            </div>
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
              <span className="sub-header-tag">Render API Feed</span>
            </div>

            <div className="alert-list">
              {loading ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading live civic feed...</div>
              ) : alerts.length > 0 ? (
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No recent activity.</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
