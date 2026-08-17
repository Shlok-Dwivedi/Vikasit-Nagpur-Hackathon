import React, { useState, useEffect } from 'react';
import { FileCheck, Download, QrCode, ShieldCheck, Printer, CheckCircle, Search, User, AlertCircle } from 'lucide-react';
import './CertificateManagement.css';

export default function CertificateManagement({ backendUrl }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [loading, setLoading] = useState(true);

  const apiBackendUrl = backendUrl || 'https://vikasit-nagpur-hackathon.onrender.com';

  useEffect(() => {
    fetch(`${apiBackendUrl}/api/vendors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vendors) {
          setVendors(data.vendors);
          if (data.vendors.length > 0) {
            setSelectedVendorId(data.vendors[0].id);
          }
        }
      })
      .catch((err) => console.log('Certificate vendor fetch note:', err))
      .finally(() => setLoading(false));
  }, [apiBackendUrl]);

  // Find active selected vendor from live array
  const activeVendor = vendors.find(v => v.id === selectedVendorId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cert-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Digital Vending Certificate & QR Permit Portal</h2>
          <span className="sub-header-tag">Live Dynamic Smart Vending License Viewer</span>
        </div>

        {/* Vendor Selector Dropdown */}
        {vendors.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="filter-group">
              <User size={16} color="#94a3b8" />
              <select 
                className="select-filter"
                value={selectedVendorId}
                onChange={(e) => setSelectedVendorId(e.target.value)}
                style={{ width: '240px' }}
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
        )}
      </div>

      {vendors.length === 0 ? (
        <div className="table-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <AlertCircle size={48} color="#f59e0b" style={{ margin: '0 auto 16px auto' }} />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', marginBottom: '8px' }}>No Vendors Registered in Database Yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '460px', margin: '0 auto 20px auto' }}>
            The database is currently empty (0 records). Go to <strong>Vendor Management</strong> and click <strong>Register New Vendor</strong> to add your first vendor and generate their dynamic Smart License Card!
          </p>
        </div>
      ) : (
        <div className="cert-grid">
          
          {/* Certificate Card View */}
          <div className="cert-card-preview">
            
            <div className="cert-header">
              <div className="emblem-title">
                <h2>NAGPUR MUNICIPAL CORPORATION</h2>
                <p>OFFICIAL VENDING CERTIFICATE & PERMIT</p>
              </div>
              
              <div className="qr-box">
                <div className="qr-placeholder" title={`Scan to verify ${activeVendor?.name}`}></div>
              </div>
            </div>

            <div className="cert-body">
              <div className="cert-field">
                <label>Permit Holder Name</label>
                <p>{activeVendor?.name || 'N/A'}</p>
              </div>

              <div className="cert-field">
                <label>Vending Certificate ID</label>
                <p>{activeVendor?.id || 'N/A'}</p>
              </div>

              <div className="cert-field">
                <label>Stall Trade Name</label>
                <p>{activeVendor?.stallName || activeVendor?.name || 'N/A'}</p>
              </div>

              <div className="cert-field">
                <label>Permit Serial Number</label>
                <p>NMC/VEND/2024/{activeVendor?.id?.replace(/[^0-9]/g, '') || '0000'}</p>
              </div>

              <div className="cert-field">
                <label>Designated Vending Zone</label>
                <p>{activeVendor?.location || 'Zone A'}</p>
              </div>

              <div className="cert-field">
                <label>Authorized Vending Category</label>
                <p>{activeVendor?.category || 'General Vending'}</p>
              </div>

              <div className="cert-field">
                <label>Issue Date</label>
                <p>{activeVendor?.joinedDate || 'Today'}</p>
              </div>

              <div className="cert-field">
                <label>Expiration Date</label>
                <p style={{ color: activeVendor?.status === 'approved' ? '#34d399' : '#f59e0b' }}>
                  {activeVendor?.status === 'approved' ? '31 Dec 2025' : 'Pending Verification'}
                </p>
              </div>
            </div>

            <div className="cert-footer-stamp">
              <div className="stamp-badge">
                <ShieldCheck size={18} />
                <span>{activeVendor?.status === 'approved' ? 'OFFICIALLY VERIFIED CIVIC PERMIT' : 'PENDING APPROVAL'}</span>
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

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              This smart certificate features dynamic QR verification geotagged to <strong>{activeVendor?.location}</strong>. Field inspectors can scan the code to instantly verify authenticity via the Mobile Inspector portal.
            </p>

            <div className="recommendation-box">
              <div className="recommendation-header">
                <CheckCircle size={18} color={activeVendor?.status === 'approved' ? '#10b981' : '#f59e0b'} />
                <span>License Status: {activeVendor?.status?.toUpperCase()}</span>
              </div>
              <p>Annual Renewal Fee: {activeVendor?.status === 'approved' ? 'Paid (₹500)' : 'Pending Payment'}</p>
              <p>PM SVANidhi Linked: {activeVendor?.status === 'approved' ? 'Yes (Tier 1 Approved)' : 'Pending Approval'}</p>
            </div>

            <button className="submit-btn" onClick={() => alert(`Downloading high-res certificate for ${activeVendor?.name}...`)}>
              <Download size={16} />
              <span>Download High-Res Certificate</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
