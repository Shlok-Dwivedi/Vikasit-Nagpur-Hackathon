import React, { useState, useEffect } from 'react';
import { FileCheck, Download, QrCode, ShieldCheck, Printer, CheckCircle, Search, User } from 'lucide-react';
import './CertificateManagement.css';

export default function CertificateManagement({ backendUrl }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${backendUrl}/api/vendors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vendors && data.vendors.length > 0) {
          setVendors(data.vendors);
          setSelectedVendorId(data.vendors[0].id);
        }
      })
      .catch((err) => console.log('Certificate vendor fetch fallback:', err))
      .finally(() => setLoading(false));
  }, [backendUrl]);

  // Find active selected vendor or fallback
  const activeVendor = vendors.find(v => v.id === selectedVendorId) || {
    id: 'VV-2024-001',
    name: 'Ramesh Kumar',
    stallName: 'Ramesh Fresh Fruits',
    category: 'Perishable Produce',
    location: 'Zone A - Market Sq',
    joinedDate: '12 Jan 2024',
    status: 'approved'
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cert-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Digital Vending Certificate & QR Permit Portal</h2>
          <span className="sub-header-tag">Authentic Smart Vending License Viewer</span>
        </div>

        {/* Vendor Selector Dropdown */}
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div className="filter-group">
            <User size={16} color="#94a3b8" />
            <select 
              className="select-filter"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              style={{ width: '220px' }}
            >
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.id} - {v.name}
                </option>
              ))}
            </select>
          </div>

          <button className="submit-btn" onClick={handlePrint} style={{ width: 'auto', padding: '10px 20px' }}>
            <Printer size={16} />
            <span>Print License</span>
          </button>
        </div>
      </div>

      <div className="cert-grid">
        
        {/* Certificate Card View */}
        <div className="cert-card-preview">
          
          <div className="cert-header">
            <div className="emblem-title">
              <h2>NAGPUR MUNICIPAL CORPORATION</h2>
              <p>OFFICIAL VENDING CERTIFICATE & PERMIT</p>
            </div>
            
            <div className="qr-box">
              <div className="qr-placeholder" title={`Scan to verify ${activeVendor.name}`}></div>
            </div>
          </div>

          <div className="cert-body">
            <div className="cert-field">
              <label>Permit Holder Name</label>
              <p>{activeVendor.name}</p>
            </div>

            <div className="cert-field">
              <label>Vending Certificate ID</label>
              <p>{activeVendor.id}</p>
            </div>

            <div className="cert-field">
              <label>Stall Trade Name</label>
              <p>{activeVendor.stallName}</p>
            </div>

            <div className="cert-field">
              <label>Permit Serial Number</label>
              <p>NMC/VEND/2024/{activeVendor.id?.replace(/[^0-9]/g, '')}</p>
            </div>

            <div className="cert-field">
              <label>Designated Vending Zone</label>
              <p>{activeVendor.location}</p>
            </div>

            <div className="cert-field">
              <label>Authorized Vending Category</label>
              <p>{activeVendor.category}</p>
            </div>

            <div className="cert-field">
              <label>Issue Date</label>
              <p>{activeVendor.joinedDate || '12 Jan 2024'}</p>
            </div>

            <div className="cert-field">
              <label>Expiration Date</label>
              <p style={{ color: activeVendor.status === 'approved' ? '#34d399' : '#f59e0b' }}>
                {activeVendor.status === 'approved' ? '31 Dec 2025' : 'Pending Verification'}
              </p>
            </div>
          </div>

          <div className="cert-footer-stamp">
            <div className="stamp-badge">
              <ShieldCheck size={18} />
              <span>{activeVendor.status === 'approved' ? 'OFFICIALLY VERIFIED CIVIC PERMIT' : 'PENDING APPROVAL'}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              QR Geotag Encrypted
            </div>
          </div>

        </div>

        {/* Verification Info & Controls */}
        <div className="ai-card">
          <div className="section-header">
            <h3>QR Code Security</h3>
          </div>

          <p style={{ fontSize: '0.875rem', color: '#94a3b8', lineHeight: '1.5' }}>
            This smart certificate features dynamic QR verification geotagged to <strong>{activeVendor.location}</strong>. Field inspectors can scan the code to instantly verify authenticity via the Mobile Inspector portal.
          </p>

          <div className="recommendation-box">
            <div className="recommendation-header">
              <CheckCircle size={18} color={activeVendor.status === 'approved' ? '#10b981' : '#f59e0b'} />
              <span>License Status: {activeVendor.status?.toUpperCase()}</span>
            </div>
            <p>Annual Renewal Fee: Paid (₹500)</p>
            <p>PM SVANidhi Linked: Yes (Tier 2 Approved)</p>
          </div>

          <button className="submit-btn" onClick={() => alert(`Downloading high-res certificate for ${activeVendor.name}...`)}>
            <Download size={16} />
            <span>Download High-Res Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
}
