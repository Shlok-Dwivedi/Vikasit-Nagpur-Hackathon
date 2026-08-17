import React, { useState } from 'react';
import { FileCheck, Download, QrCode, ShieldCheck, Printer, CheckCircle } from 'lucide-react';
import './CertificateManagement.css';

export default function CertificateManagement() {
  const [selectedVendor, setSelectedVendor] = useState({
    id: 'VV-2024-001',
    name: 'Ramesh Kumar',
    stallName: 'Ramesh Fresh Fruits',
    category: 'Perishable Produce',
    zone: 'Zone A - Market Sq',
    validUntil: '31 Dec 2025',
    permitNo: 'NMC/VEND/2024/0912',
    issueDate: '12 Jan 2024'
  });

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
        <button className="submit-btn" onClick={handlePrint} style={{ width: 'auto', padding: '10px 20px' }}>
          <Printer size={16} />
          <span>Print / Export PDF</span>
        </button>
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
              <div className="qr-placeholder" title="Scan to verify vendor status online"></div>
            </div>
          </div>

          <div className="cert-body">
            <div className="cert-field">
              <label>Permit Holder Name</label>
              <p>{selectedVendor.name}</p>
            </div>

            <div className="cert-field">
              <label>Vending Certificate ID</label>
              <p>{selectedVendor.id}</p>
            </div>

            <div className="cert-field">
              <label>Stall Trade Name</label>
              <p>{selectedVendor.stallName}</p>
            </div>

            <div className="cert-field">
              <label>Permit Serial Number</label>
              <p>{selectedVendor.permitNo}</p>
            </div>

            <div className="cert-field">
              <label>Designated Vending Zone</label>
              <p>{selectedVendor.zone}</p>
            </div>

            <div className="cert-field">
              <label>Authorized Vending Category</label>
              <p>{selectedVendor.category}</p>
            </div>

            <div className="cert-field">
              <label>Issue Date</label>
              <p>{selectedVendor.issueDate}</p>
            </div>

            <div className="cert-field">
              <label>Expiration Date</label>
              <p style={{ color: '#34d399' }}>{selectedVendor.validUntil}</p>
            </div>
          </div>

          <div className="cert-footer-stamp">
            <div className="stamp-badge">
              <ShieldCheck size={18} />
              <span>OFFICIALLY VERIFIED CIVIC PERMIT</span>
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
            This smart certificate features dynamic QR verification geotagged to <strong>{selectedVendor.zone}</strong>. Field inspectors can scan the code to instantly verify authenticity via the Mobile Inspector portal.
          </p>

          <div className="recommendation-box">
            <div className="recommendation-header">
              <CheckCircle size={18} color="#10b981" />
              <span>Active License Status</span>
            </div>
            <p>Annual Renewal Fee: Paid (₹500)</p>
            <p>PM SVANidhi Linked: Yes (Tier 2 Approved)</p>
          </div>

          <button className="submit-btn" onClick={() => alert("Downloading certificate bundle...")}>
            <Download size={16} />
            <span>Download High-Res Certificate</span>
          </button>
        </div>

      </div>
    </div>
  );
}
