import React, { useState, useEffect } from 'react';
import { FileCheck, Download, QrCode, ShieldCheck, Printer, CheckCircle, Search, User, AlertCircle } from 'lucide-react';
import { useLanguage } from '../lib/LanguageContext.jsx';
import './CertificateManagement.css';

export default function CertificateManagement({ backendUrl, currentUser }) {
  const { t } = useLanguage();
  const [vendors, setVendors] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState('');
  const [loading, setLoading] = useState(true);

  const isOfficer = currentUser?.role === 'authority';
  const apiBackendUrl = backendUrl || 'https://vikasit-nagpur-hackathon.onrender.com';

  useEffect(() => {
    fetch(`${apiBackendUrl}/api/vendors`)
      .then((res) => res.json())
      .then((data) => {
        if (data.vendors) {
          setVendors(data.vendors);
          if (data.vendors.length > 0) {
            if (!isOfficer && currentUser?.name) {
              const match = data.vendors.find(v => 
                v.name?.toLowerCase().includes(currentUser.name.toLowerCase())
              );
              if (match) {
                setSelectedVendorId(match.id);
                return;
              }
            }
            setSelectedVendorId(data.vendors[0].id);
          }
        }
      })
      .catch((err) => console.log('Certificate vendor fetch note:', err))
      .finally(() => setLoading(false));
  }, [apiBackendUrl, currentUser, isOfficer]);

  // Find active selected vendor from live array
  const dbVendor = vendors.find(v => v.id === selectedVendorId);
  const activeVendor = dbVendor || (isOfficer ? null : {
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="cert-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>
            {isOfficer ? t('Digital Vending Certificate & QR Permit Portal', 'Digital Vending Certificate & QR Permit Portal') : t('My Digital Vending Permit', 'My Digital Vending Permit')}
          </h2>
          <span className="sub-header-tag">
            {isOfficer ? t('Live Dynamic Smart Vending License Viewer', 'Live Dynamic Smart Vending License Viewer') : t('Your Official Smart Vending License Card', 'Your Official Smart Vending License Card')}
          </span>
        </div>

        {/* Vendor Selector Dropdown - Officer Only */}
        {isOfficer && vendors.length > 0 && (
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
              <span>{t('Print License', 'Print License')}</span>
            </button>
          </div>
        )}

        {/* Simple Print Button - Citizen Only */}
        {!isOfficer && activeVendor && (
          <button className="submit-btn" onClick={handlePrint} style={{ width: 'auto', padding: '10px 20px' }}>
            <Printer size={16} />
            <span>{t('Print Permit', 'Print Permit')}</span>
          </button>
        )}
      </div>

      {!activeVendor && vendors.length === 0 ? (
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
          <div className="cert-card-preview animate-fade-in-up">
            
            <div className="cert-header">
              <div className="emblem-title">
                <h2>{t('NAGPUR MUNICIPAL CORPORATION', 'NAGPUR MUNICIPAL CORPORATION')}</h2>
                <p>{t('OFFICIAL VENDING CERTIFICATE & PERMIT', 'OFFICIAL VENDING CERTIFICATE & PERMIT')}</p>
              </div>
              
              <div className="qr-box">
                <div className="qr-placeholder" title={`Scan to verify ${activeVendor?.name}`}></div>
              </div>
            </div>

            <div className="cert-body">
              <div className="cert-field">
                <label>{t('Permit Holder Name', 'Permit Holder Name')}</label>
                <p>{activeVendor?.name || 'N/A'}</p>
              </div>

              <div className="cert-field">
                <label>{t('Vending Certificate ID', 'Vending Certificate ID')}</label>
                <p>{activeVendor?.id || 'N/A'}</p>
              </div>

              <div className="cert-field">
                <label>{t('Stall Trade Name', 'Stall Trade Name')}</label>
                <p>{activeVendor?.stallName || activeVendor?.name || 'N/A'}</p>
              </div>

              <div className="cert-field">
                <label>{t('Permit Serial Number', 'Permit Serial Number')}</label>
                <p>NMC/VEND/2024/{activeVendor?.id?.replace(/[^0-9]/g, '') || '0000'}</p>
              </div>

              <div className="cert-field">
                <label>{t('Designated Vending Zone', 'Designated Vending Zone')}</label>
                <p>{activeVendor?.location || 'Zone A'}</p>
              </div>

              <div className="cert-field">
                <label>{t('Authorized Vending Category', 'Authorized Vending Category')}</label>
                <p>{activeVendor?.category || 'General Vending'}</p>
              </div>

              <div className="cert-field">
                <label>{t('Issue Date', 'Issue Date')}</label>
                <p>{activeVendor?.joinedDate || 'Today'}</p>
              </div>

              <div className="cert-field">
                <label>{t('Expiration Date', 'Expiration Date')}</label>
                <p style={{ color: activeVendor?.status === 'approved' ? '#34d399' : '#f59e0b' }}>
                  {activeVendor?.status === 'approved' ? '31 Dec 2025' : t('Pending Verification', 'Pending Verification')}
                </p>
              </div>
            </div>

            <div className="cert-footer-stamp">
              <div className="stamp-badge">
                <ShieldCheck size={18} />
                <span>{activeVendor?.status === 'approved' ? t('OFFICIALLY VERIFIED CIVIC PERMIT', 'OFFICIALLY VERIFIED CIVIC PERMIT') : t('PENDING APPROVAL', 'PENDING APPROVAL')}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', zIndex: 2 }}>
                QR Geotag Encrypted
              </div>
            </div>

          </div>

          {/* Verification Info & Controls */}
          <div className="ai-card">
            <div className="section-header">
              <h3>{t('QR Code Security', 'QR Code Security')}</h3>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
              This smart certificate features dynamic QR verification geotagged to <strong>{activeVendor?.location}</strong>. Field inspectors can scan the code to instantly verify authenticity via the Mobile Inspector portal.
            </p>

            <div className="recommendation-box">
              <div className="recommendation-header">
                <CheckCircle size={18} color={activeVendor?.status === 'approved' ? '#10b981' : '#f59e0b'} />
                <span>{t('License Status', 'License Status')}: {activeVendor?.status?.toUpperCase()}</span>
              </div>
              <p>{t('Annual Renewal Fee', 'Annual Renewal Fee')}: {activeVendor?.status === 'approved' ? `${t('Paid', 'Paid')} (₹500)` : t('Pending Payment', 'Pending Payment')}</p>
              <p>{t('PM SVANidhi Linked', 'PM SVANidhi Linked')}: {activeVendor?.status === 'approved' ? t('Yes (Tier 1 Approved)', 'Yes (Tier 1 Approved)') : t('Pending Approval', 'Pending Approval')}</p>
            </div>

            <button className="submit-btn" onClick={() => alert(`Downloading high-res certificate for ${activeVendor?.name}...`)}>
              <Download size={16} />
              <span>{t('Download High-Res Certificate', 'Download High-Res Certificate')}</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
