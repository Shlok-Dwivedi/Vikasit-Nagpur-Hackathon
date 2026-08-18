import React, { useState, useEffect } from 'react';
import { User, ShieldCheck, MapPin, Phone, Calendar, IndianRupee, Download, CheckCircle2, Building2, Store, Edit3, X, Save, FileText } from 'lucide-react';
import './VendorProfile.css';

export default function VendorProfile({ currentUser, backendUrl }) {
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editStallName, setEditStallName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const apiBackendUrl = backendUrl || '';

  const loadVendorData = () => {
    // Priority 1: Read latest updated session from localStorage
    const savedUserSession = localStorage.getItem('vv_user_session');
    if (savedUserSession) {
      try {
        const parsed = JSON.parse(savedUserSession);
        if (parsed.vendorData) {
          initVendor(parsed.vendorData);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }

    // Priority 2: Use currentUser prop
    if (currentUser?.vendorData) {
      initVendor(currentUser.vendorData);
      setLoading(false);
      return;
    }

    // Priority 3: Fetch from database
    fetch(`${apiBackendUrl}/api/vendors`)
      .then((res) => res.json())
      .then((data) => {
        let match = null;
        if (data.vendors && data.vendors.length > 0) {
          match = data.vendors.find(v =>
            v.id === currentUser?.vendorData?.id || v.name?.toLowerCase() === currentUser?.name?.toLowerCase()
          );
        }
        if (match) {
          initVendor(match);
        } else if (data.vendors && data.vendors.length > 0) {
          initVendor(data.vendors[0]);
        }
      })
      .catch((err) => console.log('Profile fetch note:', err))
      .finally(() => setLoading(false));
  };

  const initVendor = (v) => {
    setVendorData(v);
    setEditName(v.name || currentUser?.name || 'Sharvan Tembhare');
    setEditStallName(v.stallName || `${v.name || currentUser?.name || 'Vendor'}'s Business`);
    setEditCategory(v.category || 'Perishable Produce & Snacks');
    setEditLocation(v.location || 'VNIT Gate, South Ambazari Road, Nagpur');
    setEditPhone(v.phone || '+91 98765 43210');
  };

  useEffect(() => {
    loadVendorData();

    const handleProfileUpdate = () => loadVendorData();
    window.addEventListener('vendorProfileUpdated', handleProfileUpdate);
    window.addEventListener('storage', handleProfileUpdate);

    return () => {
      window.removeEventListener('vendorProfileUpdated', handleProfileUpdate);
      window.removeEventListener('storage', handleProfileUpdate);
    };
  }, [apiBackendUrl, currentUser]);

  const handleSaveProfileEdit = (e) => {
    e.preventDefault();
    const updated = {
      ...vendorData,
      name: editName,
      stallName: editStallName,
      category: editCategory,
      location: editLocation,
      phone: editPhone,
      status: 'approved',
      joinedDate: vendorData?.joinedDate || '14 Feb 2026',
      svanidhiTier: 'Tier 1 (₹10,000)'
    };

    setVendorData(updated);

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

  const displayName = vendorData?.name || currentUser?.name || 'Sharvan Tembhare';
  const displayStall = vendorData?.stallName || `${displayName}'s Food & Refreshments`;
  const vendorId = vendorData?.id || 'VV-2026-NMC104';
  const displayLocation = vendorData?.location || 'VNIT Gate, South Ambazari Road, Nagpur';
  const displayCategory = vendorData?.category || 'Pakode & Fast Food';
  const displayPhone = vendorData?.phone || '+91 98765 43210';
  const displayDate = vendorData?.joinedDate || '14 Feb 2026';
  const svanidhiStatus = vendorData?.svanidhiTier || 'Tier 1 (₹10,000)';

  return (
    <div className="profile-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>My Citizen Vendor Profile</h2>
          <span className="sub-header-tag">Manage Vending Permit & Profile Credentials</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="quick-act-btn" 
            onClick={() => setEditModalOpen(true)} 
            style={{ width: 'auto', padding: '10px 16px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.3)' }}
          >
            <Edit3 size={16} />
            <span>Edit Profile Details</span>
          </button>

          <button className="submit-btn" onClick={() => window.print()} style={{ width: 'auto', padding: '10px 18px' }}>
            <Download size={16} />
            <span>Print Official Permit</span>
          </button>
        </div>
      </div>

      <div className="profile-grid">
        
        {/* Left Column: Dynamic Vendor Profile Details */}
        <div className="ai-card">
          <div className="profile-banner">
            <div className="vendor-avatar-lg">
              <User size={36} color="#ffffff" />
            </div>
            <div className="banner-title">
              <h3>{displayName}</h3>
              <p><Store size={14} /> {displayStall}</p>
            </div>
            <span className="status-badge approved">
              <CheckCircle2 size={14} /> Verified Active Vendor
            </span>
          </div>

          <div className="profile-fields-grid">
            <div className="profile-field">
              <label><Building2 size={14} /> Unique Vendor ID</label>
              <p className="highlight-text">{vendorId}</p>
            </div>

            <div className="profile-field">
              <label><MapPin size={14} /> Registered Vending Address</label>
              <p>{displayLocation}</p>
            </div>

            <div className="profile-field">
              <label><Store size={14} /> Trade Category</label>
              <p>{displayCategory}</p>
            </div>

            <div className="profile-field">
              <label><Phone size={14} /> Contact Phone</label>
              <p>{displayPhone}</p>
            </div>

            <div className="profile-field">
              <label><Calendar size={14} /> Registration Date</label>
              <p>{displayDate}</p>
            </div>

            <div className="profile-field">
              <label><IndianRupee size={14} /> PM SVANidhi Status</label>
              <p style={{ color: '#34d399', fontWeight: '700' }}>
                {svanidhiStatus}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column: Official Vending License Pass */}
        <div className="ai-card" style={{ textAlign: 'center', alignItems: 'center' }}>
          <div className="section-header" style={{ width: '100%' }}>
            <h3>Official Vending Permit Pass</h3>
          </div>

          <div className="scan-result-card" style={{ width: '100%', borderColor: 'rgba(16, 185, 129, 0.4)', background: 'var(--input-bg)', margin: '16px 0', padding: '18px', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981', fontWeight: '700', fontSize: '0.95rem' }}>
              <CheckCircle2 size={18} />
              <span>License Status: APPROVED & ACTIVE</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.5' }}>
              Official civic street vending permit issued by <strong>Nagpur Municipal Corporation (NMC)</strong> for vendor <strong>{displayName}</strong>.
            </p>
          </div>

          <strong style={{ fontSize: '1rem', color: 'var(--text-main)', marginTop: '4px' }}>
            Permit ID: {vendorId}
          </strong>
          
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '6px 0 16px 0', maxWidth: '280px' }}>
            Authorized Vending Zone: {displayLocation}
          </p>

          <button className="submit-btn" style={{ width: '100%' }} onClick={() => window.print()}>
            <FileText size={16} />
            <span>Download Official Permit Document</span>
          </button>
        </div>

      </div>

      {/* EDIT PROFILE MODAL */}
      {editModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--text-main)' }}>Edit Vendor Profile Details</h3>
              <button onClick={() => setEditModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Vendor Full Name</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Stall / Business Trade Name</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editStallName} onChange={(e) => setEditStallName(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Vending Category</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editCategory} onChange={(e) => setEditCategory(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Registered Vending Address</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editLocation} onChange={(e) => setEditLocation(e.target.value)} required />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)' }}>Contact Mobile Phone</label>
                <input className="form-input" style={{ width: '100%', marginTop: '4px' }} value={editPhone} onChange={(e) => setEditPhone(e.target.value)} required />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '10px' }}>
                <Save size={16} />
                <span>Save Profile Details</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
