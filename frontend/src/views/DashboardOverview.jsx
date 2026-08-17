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
  Clock,
  Mic,
  UserPlus
} from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext.jsx';
import './DashboardOverview.css';

export default function DashboardOverview({ onNavigate, backendUrl, currentUser }) {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const isOfficer = currentUser?.role === 'authority';
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
            <p>{t('Total Registered Vendors', 'Total Registered Vendors')}</p>
            <div className="kpi-trend positive">
              {pendingVendors > 0 ? `(${pendingVendors} Pending Verification)` : t('All Vendors Verified', 'All Vendors Verified')}
            </div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon green">
            <MapPin size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats?.active_zones || 42}</h3>
            <p>{t('Designated Vending Zones', 'Designated Vending Zones')}</p>
            <div className="kpi-trend positive">{t('Zone A & B Active', 'Zone A & B Active')}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon blue">
            <CheckCircle2 size={24} />
          </div>
          <div className="kpi-info">
            <h3>{loading ? '...' : `${complianceRate}%`}</h3>
            <p>{t('Permit Compliance Rate', 'Permit Compliance Rate')}</p>
            <div className="kpi-trend positive">{approvedVendors} / {totalCount} {t('Permits Approved', 'Permits Approved')}</div>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-icon purple">
            <IndianRupee size={24} />
          </div>
          <div className="kpi-info">
            <h3>{stats?.disbursed_amount || '₹0.00 Cr'}</h3>
            <p>{t('PM SVANidhi Micro-Credit', 'PM SVANidhi Micro-Credit')}</p>
            <div className="kpi-trend neutral">{approvedVendors} {t('Active Beneficiaries', 'Active Beneficiaries')}</div>
          </div>
        </div>
      </div>

      {/* Main Content Split: Dynamic Leaflet GIS Map + Live Alerts */}
      <div className="dashboard-split">
        
        {/* Left Column: Interactive GIS Map */}
        <div className="map-section">
          <div className="section-header">
            <h2>{t('Live GIS Civic Vending Map', 'Live GIS Civic Vending Map')}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="sub-header-tag">{t('Showing', 'Showing')} {vendors.length} {t('Dynamic Vendor Pins', 'Dynamic Vendor Pins')}</span>
              <button className="action-icon-btn" onClick={loadDashboardData} title={t("Refresh Map & Dashboard Data", "Refresh Map & Dashboard Data")}>
                <RefreshCw size={14} className={loading ? 'spin' : ''} />
              </button>
            </div>
          </div>

          <LeafletMap height="460px" showZones={true} vendors={vendors} />
        </div>

        {/* Right Column: Live Feed & Quick Actions */}
        <div className="alerts-section">
          
          {/* Quick Actions Panel - Role Specific */}
          <div className="card-panel">
            <div className="section-header">
              <h2>{t('Quick Actions', 'Quick Actions')} ({isOfficer ? t('Officer Controls', 'Officer Controls') : t('Citizen Services', 'Citizen Services')})</h2>
            </div>
            
            <div className="action-btn-grid">
              {isOfficer ? (
                <>
                  <button className="quick-act-btn" onClick={() => onNavigate('vendor_management')}>
                    <Users size={16} />
                    <span>{t('Vendor Directory', 'Vendor Directory')}</span>
                  </button>
                  <button className="quick-act-btn" onClick={() => onNavigate('certificate_management')}>
                    <FileCheck size={16} />
                    <span>{t('Issue Certificate', 'Issue Certificate')}</span>
                  </button>
                  <button className="quick-act-btn" onClick={() => onNavigate('zone_optimizer')}>
                    <MapPin size={16} />
                    <span>{t('Re-Zone Area', 'Re-Zone Area')}</span>
                  </button>
                  <button className="quick-act-btn" onClick={() => onNavigate('mobile_inspector')}>
                    <ShieldAlert size={16} />
                    <span>{t('Inspect Field', 'Inspect Field')}</span>
                  </button>
                </>
              ) : (
                <>
                  <button className="quick-act-btn" onClick={() => onNavigate('certificate_management')}>
                    <FileCheck size={16} />
                    <span>{t('My Certificate', 'My Certificate')}</span>
                  </button>
                  <button className="quick-act-btn" onClick={() => onNavigate('zone_optimizer')}>
                    <MapPin size={16} />
                    <span>{t('Designated Zones', 'View Zones')}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Live Alerts Feed */}
          <div className="card-panel">
            <div className="section-header">
              <h2>{t('Recent Civic Activity', 'Recent Civic Activity')}</h2>
              <span className="sub-header-tag">{t('Render API Feed', 'Render API Feed')}</span>
            </div>

            <div className="alert-list">
              {loading ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('Loading live civic feed...', 'Loading live civic feed...')}</div>
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
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('No recent activity.', 'No recent activity.')}</div>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
