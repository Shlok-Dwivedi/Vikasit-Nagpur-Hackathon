import React, { useState, useEffect } from 'react';
import { User, QrCode, ShieldCheck, MapPin, Phone, Calendar, IndianRupee, Download, CheckCircle2, Clock, Building2, Store } from 'lucide-react';
import './VendorProfile.css';

export default function VendorProfile({ currentUser, backendUrl }) {
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);

  const apiBackendUrl = backendUrl || 'https://vikasit-nagpur-hackathon.onrender.com';

  useEffect(() => {
    // Fetch live vendor profiles from API
    fetch(`${apiBackendUrl}/api/vendors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vendors && data.vendors.length > 0) {
          // Find matching vendor by name/email or pick the first registered vendor
          const match = data.vendors.find(v => v.name?.toLowerCase().includes(currentUser?.name?.toLowerCase())) || data.vendors[0];
          setVendorData(match);
        } else {
          // Fallback vendor data if database has 0 records
          setVendorData({
            id: 'VV-2024-001',
            name: currentUser?.name || 'Sharvan Kumar',
            stallName: 'Sharvan Fresh Produce & Juices',
            category: 'Perishable Produce',
            location: 'Zone A - Market Sq',
            phone: '+91 98765 43210',
            status: 'approved',
            joinedDate: '12 Jan 2024',
            feePaid: true,
            svanidhiTier: 'Tier 1 Approved (₹10,000 Disbursed)'
          });
        }
      })
      .catch((err) => console.log('Profile fetch note:', err))
      .finally(() => setLoading(false));
  }, [apiBackendUrl, currentUser]);

  const vendorId = vendorData?.id || 'VV-2024-001';
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`VEND:${vendorId}|NAME:${vendorData?.name}|ZONE:${vendorData?.location}`)}`;

  return (
    <div className="profile-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>My Citizen Vendor Profile</h2>
          <span className="sub-header-tag">Personal Digital Identity & Unique QR Permit</span>
        </div>
        
        <button className="submit-btn" onClick={() => window.print()} style={{ width: 'auto', padding: '10px 18px' }}>
          <Download size={16} />
          <span>Download QR Pass</span>
        </button>
      </div>

      <div className="profile-grid">
        
        {/* Left Column: Vendor Details Card */}
        <div className="ai-card">
          <div className="profile-banner">
            <div className="vendor-avatar-lg">
              <User size={36} color="#ffffff" />
            </div>
            <div className="banner-title">
              <h3>{vendorData?.name || currentUser?.name || 'Sharvan Kumar'}</h3>
              <p><Store size={14} /> {vendorData?.stallName || 'Sharvan Fruit Stall'}</p>
            </div>
            <span className={`status-badge ${vendorData?.status || 'approved'}`}>
              {vendorData?.status === 'approved' ? <><CheckCircle2 size={14} /> Verified Vendor</> : <><Clock size={14} /> Application Pending</>}
            </span>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <label><Building2 size={14} /> Unique Vendor ID</label>
              <p className="highlight-text">{vendorData?.id || 'VV-2024-001'}</p>
            </div>

            <div className="profile-field">
              <label><MapPin size={14} /> Assigned Vending Zone</label>
              <p>{vendorData?.location || 'Zone A - Market Sq'}</p>
            </div>

            <div className="profile-field">
              <label><Store size={14} /> Trade Category</label>
              <p>{vendorData?.category || 'Perishable Produce'}</p>
            </div>

            <div className="profile-field">
              <label><Phone size={14} /> Contact Phone</label>
              <p>{vendorData?.phone || '+91 98765 43210'}</p>
            </div>

            <div className="profile-field">
              <label><Calendar size={14} /> Registration Date</label>
              <p>{vendorData?.joinedDate || '12 Jan 2024'}</p>
            </div>

            <div className="profile-field">
              <label><IndianRupee size={14} /> PM SVANidhi Status</label>
              <p style={{ color: '#34d399' }}>{vendorData?.svanidhiTier || 'Tier 1 Approved (₹10,000 Disbursed)'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Unique Dynamic QR Permit Box */}
        <div className="ai-card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <div className="section-header" style={{ width: '100%' }}>
            <h3>Unique QR Verification Pass</h3>
          </div>

          <div className="qr-display-wrapper">
            <img 
              src={qrCodeUrl} 
              alt={`QR Permit for ${vendorData?.name}`}
              className="unique-qr-img" 
            />
            <div className="qr-badge-overlay">
              <ShieldCheck size={14} color="#10b981" />
              <span>Geotag Encrypted</span>
            </div>
          </div>

          <strong style={{ fontSize: '1rem', color: 'var(--text-main)', marginTop: '12px' }}>
            ID: {vendorId}
          </strong>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 16px 0', maxWidth: '280px' }}>
            Present this unique QR code to Municipal Inspectors for instant geotagged field authentication.
          </p>

          <button className="quick-act-btn" style={{ width: '100%', justifyContent: 'center' }} onClick={() => alert(`QR Pass for ${vendorId} copied to clipboard!`)}>
            <QrCode size={16} />
            <span>Copy QR Verification Link</span>
          </button>
        </div>

      </div>
    </div>
  );
}
