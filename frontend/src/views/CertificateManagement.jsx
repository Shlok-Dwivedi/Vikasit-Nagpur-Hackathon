import React, { useState, useEffect } from 'react';
import { Award, Printer, Download, CheckCircle2, ShieldCheck, QrCode, Store, MapPin, Edit3, X, Save, Clock, Search, UserCheck } from 'lucide-react';
import './CertificateManagement.css';

export default function CertificateManagement({ currentUser, backendUrl }) {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Editable Form Fields (For Vendors)
  const [editName, setEditName] = useState('');
  const [editStallName, setEditStallName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const apiBackendUrl = backendUrl || '';
  const isOfficer = currentUser?.role === 'authority';

  useEffect(() => {
    fetchVendors();

    const handleProfileUpdate = () => fetchVendors();
    window.addEventListener('vendorProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('vendorProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [apiBackendUrl, currentUser]);

  const fetchVendors = async () => {
    try {
      const res = await fetch(`${apiBackendUrl}/api/vendors`);
      const data = await res.json();
      const list = data.vendors || [];
      setVendors(list);

      if (!isOfficer) {
        // VENDOR VIEW: Check localStorage or currentUser
        const saved = localStorage.getItem('vv_user_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.vendorData) {
              initVendorData(parsed.vendorData);
              return;
            }
          } catch (e) {}
        }

        if (currentUser?.vendorData) {
          initVendorData(currentUser.vendorData);
          return;
        }

        const match = list.find(v => v.name?.toLowerCase().includes(currentUser?.name?.toLowerCase())) || list[0];
        if (match) initVendorData(match);
      } else {
        // OFFICER VIEW: Select current vendor or first vendor in list
        if (selectedVendor) {
          const updatedMatch = list.find(v => v.id === selectedVendor.id);
          if (updatedMatch) setSelectedVendor(updatedMatch);
        } else if (list.length > 0) {
          setSelectedVendor(list[0]);
        }
      }
    } catch (err) {
      console.warn('Certificate fetch note:', err);
    }
  };

  const initVendorData = (v) => {
    setSelectedVendor(v);
    setEditName(v.name || '');
    setEditStallName(v.stallName || '');
    setEditCategory(v.category || '');
    setEditLocation(v.location || '');
    setEditPhone(v.phone || '');
  };

  const handleSavePermitEdit = (e) => {
    e.preventDefault();
    const updated = {
      ...selectedVendor,
      name: editName,
      stallName: editStallName,
      category: editCategory,
      location: editLocation,
      phone: editPhone
    };

    setSelectedVendor(updated);

    const savedUserSession = localStorage.getItem('vv_user_session');
    if (savedUserSession) {
      try {
        const parsed = JSON.parse(savedUserSession);
        parsed.name = editName;
        parsed.vendorData = updated;
        localStorage.setItem('vv_user_session', JSON.stringify(parsed));
      } catch (err) {}
    } else {
      localStorage.setItem('vv_user_session', JSON.stringify({ name: editName, vendorData: updated }));
    }

    window.dispatchEvent(new Event('vendorProfileUpdated'));

    fetch(`${apiBackendUrl}/api/vendors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        stallName: editStallName,
        category: editCategory,
        location: editLocation,
        phone: editPhone
      })
    }).catch(err => console.warn('Edit save backend sync note:', err));

    setEditModalOpen(false);
  };

  // Officer action is committed only after backend authorization succeeds.
  const handleOfficerApprove = async () => {
    if (!selectedVendor?.id) return;
    const targetId = selectedVendor.id;
    try {
      const token = sessionStorage.getItem('vv_officer_token');
      const response = await fetch(`${apiBackendUrl}/api/vendors/${targetId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token || ''}` }
      });
      if (!response.ok) throw new Error('Officer authorization expired or approval failed');
      const result = await response.json();
      const approvedVendor = result.vendor;
      setSelectedVendor(approvedVendor);
      setVendors(prev => prev.map(v => v.id === targetId ? approvedVendor : v));
      window.dispatchEvent(new Event('vendorProfileUpdated'));
      setActionSuccess(`Permit approved for ${approvedVendor.name} (${targetId}).`);
    } catch (e) {
      setActionSuccess(e.message);
    }
  };

  const targetVendor = selectedVendor || {};
  const vendorId = targetVendor.id || 'VV-2026-NMC001';
  const serialNo = `NMC/VEND/${new Date().getFullYear()}/${vendorId.replace(/[^0-9A-Z]/gi, '')}`;

  const filteredVendorOptions = vendors.filter(v => 
    (v.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (v.id || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="certificate-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>
            {isOfficer ? 'Municipal Officer Certificate Management Portal' : 'Digital Certificate Portal'}
          </h2>
          <span className="sub-header-tag">
            {isOfficer ? 'Search and Issue Official Street Vending Certificates for Registered Vendors' : 'Official Municipal Vending License Generator'}
          </span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          {!isOfficer ? (
            <button className="quick-act-btn" onClick={() => setEditModalOpen(true)} style={{ width: 'auto', padding: '10px 16px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}>
              <Edit3 size={16} />
              <span>Edit Application Details</span>
            </button>
          ) : (
            <button className="submit-btn" onClick={() => window.print()} style={{ width: 'auto', padding: '10px 18px' }}>
              <Printer size={16} />
              <span>Print Official License</span>
            </button>
          )}
        </div>
      </div>

      {/* ACTION SUCCESS BANNER */}
      {actionSuccess && (
        <div className="status-msg success" style={{ marginBottom: '16px', fontSize: '0.9rem', padding: '14px' }}>
          <CheckCircle2 size={18} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* OFFICER VENDOR SEARCH & SELECTOR BAR */}
      {isOfficer && (
        <div className="filter-bar" style={{ marginBottom: '16px' }}>
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search Vendor Name or ID to view/issue certificate..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <select 
            className="select-filter" 
            value={targetVendor.id || ''} 
            onChange={(e) => {
              const match = vendors.find(v => v.id === e.target.value);
              if (match) setSelectedVendor(match);
            }}
          >
            {filteredVendorOptions.map(v => (
              <option key={v.id} value={v.id}>
                {v.id} - {v.name} (Approved)
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="certificate-grid">
        
        {/* Left Column: Official License Card Preview */}
        <div className="certificate-card" style={{ opacity: 1 }}>
          <div className="cert-watermark">NMC</div>

          <div className="cert-header-box">
            <div className="cert-emblem">
              <Award size={32} color="#ff9933" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#60a5fa', fontWeight: '800' }}>NAGPUR MUNICIPAL CORPORATION</h3>
              <p style={{ margin: '2px 0 0 0', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: '600' }}>OFFICIAL STREET VENDING CERTIFICATE & PERMIT</p>
            </div>
          </div>

          <div className="cert-details-grid">
            <div className="cert-field">
              <label>Permit Holder Name</label>
              <p className="cert-value">{targetVendor.name}</p>
            </div>

            <div className="cert-field">
              <label>Vending Application ID</label>
              <p className="cert-value highlight">{vendorId}</p>
            </div>

            <div className="cert-field">
              <label>Stall Trade Name</label>
              <p className="cert-value">{targetVendor.stallName || targetVendor.name}</p>
            </div>

            <div className="cert-field">
              <label>Permit Serial Number</label>
              <p className="cert-value" style={{ color: '#34d399' }}>
                {serialNo}
              </p>
            </div>

            <div className="cert-field">
              <label>Registered Vending Location</label>
              <p className="cert-value">{targetVendor.location}</p>
            </div>

            <div className="cert-field">
              <label>Authorized Trade Category</label>
              <p className="cert-value">{targetVendor.category}</p>
            </div>

            <div className="cert-field">
              <label>Application Date</label>
              <p className="cert-value">{targetVendor.joinedDate || '12 Jan 2024'}</p>
            </div>

            <div className="cert-field">
              <label>Approval Status</label>
              <p className="cert-value" style={{ color: '#10b981' }}>
                APPROVED BY MUNICIPAL CORPORATION
              </p>
            </div>
          </div>

          <div className="cert-footer-box">
            <div className="cert-stamp" style={{ borderColor: 'rgba(16, 185, 129, 0.3)', color: '#34d399', background: 'rgba(16, 185, 129, 0.12)' }}>
              <ShieldCheck size={18} />
              <span>OFFICIALLY VERIFIED CIVIC PERMIT</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Geotag Encrypted</span>
          </div>
        </div>

        {/* Right Column: Dynamic Security & Download Card */}
        <div className="ai-card">
          <div className="section-header">
            <h3>Official Vending Permit Pass</h3>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Official digital street vending license issued for <strong>{targetVendor.name || 'Vendor'}</strong> registered at <strong>{targetVendor.location || 'Nagpur City Vending Zone'}</strong>.
          </p>

          <div className="scan-result-card" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', background: 'var(--input-bg)', margin: '16px 0', padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '0.9rem' }}>
              <CheckCircle2 size={18} />
              <span>License Status: APPROVED & ACTIVE</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Fee status: Paid | PM SVANidhi Tier: {targetVendor.svanidhiTier || 'Tier 1 (₹10,000)'}
            </p>
          </div>

          <button className="submit-btn" style={{ width: '100%', marginTop: '16px' }} onClick={() => window.print()}>
            <Download size={16} />
            <span>Download Official Certificate</span>
          </button>
        </div>

      </div>

      {/* EDIT PERMIT MODAL WITH PERMANENT PERSISTENCE (For Vendors) */}
      {editModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>Edit Application Details</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePermitEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Permit Holder Name</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Stall Trade Name</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editStallName} onChange={(e) => setEditStallName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Vending Category</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Registered Vending Location / Address</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editLocation} onChange={(e) => setEditLocation(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Contact Mobile Phone</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
                <Save size={16} />
                <span>Save & Sync Profile Changes</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
