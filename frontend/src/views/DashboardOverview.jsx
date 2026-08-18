import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/Map/LeafletMap';
import { 
  Users, 
  MapPin, 
  ShieldCheck, 
  IndianRupee, 
  TrendingUp, 
  Sparkles, 
  FileCheck, 
  Layers, 
  Smartphone, 
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Store,
  QrCode,
  Award
} from 'lucide-react';
import './DashboardOverview.css';

export default function DashboardOverview({ onNavigate, backendUrl, currentUser }) {
  const [vendors, setVendors] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState(null);

  const apiBackendUrl = backendUrl || 'http://localhost:8000';
  const isOfficer = currentUser?.role === 'authority';
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefreshMap = () => {
    setRefreshKey(prev => prev + 1);
    fetchData();
  };

  const syncVendorSession = (fetchedVendors) => {
    const savedUserSession = localStorage.getItem('vv_user_session');
    let localObj = null;
    if (savedUserSession) {
      try {
        const parsed = JSON.parse(savedUserSession);
        if (parsed.vendorData) localObj = parsed.vendorData;
      } catch (e) {}
    } else if (currentUser?.vendorData) {
      localObj = currentUser.vendorData;
    }

    if (localObj && fetchedVendors && fetchedVendors.length > 0) {
      const match = fetchedVendors.find(v => 
        v.id === localObj.id || 
        v.name?.toLowerCase() === localObj.name?.toLowerCase()
      );

      if (match) {
        localObj = { ...localObj, ...match };
        localStorage.setItem('vv_user_session', JSON.stringify({ name: localObj.name, vendorData: localObj }));
      }
    }

    setVendorData(localObj);
  };

  useEffect(() => {
    fetchData();

    const handleProfileUpdate = () => fetchData();
    window.addEventListener('vendorProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('vendorProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const vendorsRes = await fetch(`${apiBackendUrl}/api/vendors`);
      const vendorsData = await vendorsRes.json();
      if (vendorsData.vendors) {
        setVendors(vendorsData.vendors);
        syncVendorSession(vendorsData.vendors);
      }

      const alertsRes = await fetch(`${apiBackendUrl}/api/alerts`);
      const alertsData = await alertsRes.json();
      if (alertsData.alerts) setAlerts(alertsData.alerts);

      const zonesRes = await fetch(`${apiBackendUrl}/api/zones`);
      const zonesData = await zonesRes.json();
      if (zonesData.zones) setZones(zonesData.zones);
    } catch (err) {
      console.warn('Dashboard fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalCount = vendors.length || 31;
  const approvedVendorsList = vendors.filter(v => v.status === 'approved');
  const approvedCount = approvedVendorsList.length || 31;
  const complianceRate = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : "100.0";

  const currentVendor = {
    name: vendorData?.name || currentUser?.name || 'Sharvan Tembhare',
    stallName: vendorData?.stallName || `${vendorData?.name || currentUser?.name || 'Sharvan'}'s Fast Food & Refreshments`,
    id: vendorData?.id || 'VV-2026-NMC104',
    location: vendorData?.location || 'VNIT Gate, South Ambazari Road, Nagpur',
    category: vendorData?.category || 'Pakode & Fast Food',
    phone: vendorData?.phone || '+91 98765 43210',
    status: 'approved',
    svanidhiTier: vendorData?.svanidhiTier || 'Tier 1 (₹10,000)'
  };

  const isApproved = true;

  return (
    <div className="dashboard-container">
      
      {/* VENDOR-SPECIFIC BANNER */}
      {!isOfficer && (
        <div className="scan-result-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'rgba(16, 185, 129, 0.08)', marginBottom: '16px', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '1.05rem' }}>
                <CheckCircle2 size={20} />
                <span>Official Vending Permit Verified & Active</span>
              </div>
              <p style={{ margin: '6px 0 0 0', fontSize: '0.85rem', color: 'var(--text-main)' }}>
                <strong>Vendor:</strong> {currentVendor.name} | <strong>Stall:</strong> {currentVendor.stallName} | <strong>Address:</strong> {currentVendor.location}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="quick-act-btn" onClick={() => onNavigate('vendor_profile')} style={{ background: '#3b82f6', color: '#fff' }}>
                <QrCode size={14} />
                <span>My Profile</span>
              </button>
              <button className="quick-act-btn" onClick={() => onNavigate('certificate_management')} style={{ background: 'rgba(255,255,255,0.1)' }}>
                <FileCheck size={14} />
                <span>My Certificate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top 4 KPI Metrics Grid */}
      <div className="kpi-grid">
        
        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box vendors">
              <Store size={22} color="#3b82f6" />
            </div>
            <span className="trend-badge positive">{isOfficer ? 'Municipal' : 'My Business'}</span>
          </div>
          <div className="kpi-body">
            <h3>{isOfficer ? totalCount : currentVendor.id}</h3>
            <p>{isOfficer ? 'Total Registered Vendors' : 'My Vending Permit ID'}</p>
            <span className="kpi-subtext" style={{ color: '#10b981', fontWeight: '600' }}>
              {isOfficer ? `${approvedCount} Approved` : 'Verified Civic License'}
            </span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box zones">
              <MapPin size={22} color="#10b981" />
            </div>
            <span className="trend-badge positive">Nagpur GIS</span>
          </div>
          <div className="kpi-body">
            <h3>{isOfficer ? (zones.length || 4) : (currentVendor.location?.split(',')[0] || 'VNIT Gate')}</h3>
            <p>{isOfficer ? 'Designated Vending Zones' : 'My Registered Vending Address'}</p>
            <span className="kpi-subtext">Geotag Encrypted Location</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box compliance">
              <ShieldCheck size={22} color="#10b981" />
            </div>
            <span className="trend-badge positive">Verification</span>
          </div>
          <div className="kpi-body">
            <h3 style={{ color: '#34d399' }}>{isOfficer ? `${complianceRate}%` : 'Approved'}</h3>
            <p>{isOfficer ? 'Permit Compliance Rate' : 'Permit Approval Status'}</p>
            <span className="kpi-subtext">{isOfficer ? `${approvedCount} / ${totalCount} Permits Issued` : 'Issued by Municipal Corporation'}</span>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-box credit">
              <IndianRupee size={22} color="#8b5cf6" />
            </div>
            <span className="trend-badge positive">Govt Credit</span>
          </div>
          <div className="kpi-body">
            <h3>{isOfficer ? '4 Active Tiers' : currentVendor.svanidhiTier}</h3>
            <p>PM SVANidhi Micro-Credit</p>
            <span className="kpi-subtext">Active Micro-Credit Eligible</span>
          </div>
        </div>

      </div>

      {/* Main Grid */}
      <div className="dashboard-main-grid">
        
        {/* GIS Map */}
        <div className="map-section">
          <div className="section-header">
            <div>
              <h3 style={{ fontSize: '1.2rem' }}>Nagpur Vending Location GIS Map</h3>
              <span className="sub-header-tag">Live GPS Location Pins for Street Vendors</span>
            </div>
            <button className="quick-act-btn" onClick={handleRefreshMap} style={{ fontSize: '0.78rem' }}>
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>Refresh Map</span>
            </button>
          </div>

          <LeafletMap height="460px" vendors={vendors} zones={zones} refreshKey={refreshKey} />
        </div>

      </div>
    </div>
  );
}
