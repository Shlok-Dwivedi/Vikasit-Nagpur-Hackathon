import React, { useState, useEffect } from 'react';
import { Users, Filter, Plus, CheckCircle, Clock, Search, FileText, X, RefreshCw, Trash2, AlertCircle } from 'lucide-react';
import './VendorManagement.css';

export default function VendorManagement({ backendUrl }) {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Vendor Form State
  const [newName, setNewName] = useState('');
  const [newStall, setNewStall] = useState('');
  const [newCategory, setNewCategory] = useState('Perishable Produce');
  const [newZone, setNewZone] = useState('Zone A - Market Sq');
  const [newPhone, setNewPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const apiBackendUrl = backendUrl || 'https://vikasit-nagpur-hackathon.onrender.com';

  // Fetch vendors dynamically from backend REST API
  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBackendUrl}/api/vendors`);
      const data = await res.json();
      if (data.vendors) {
        setVendors(data.vendors);
      }
    } catch (err) {
      console.error('Failed to fetch dynamic vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, [apiBackendUrl]);

  // Wipe / Reset Database completely to 0
  const handleResetDatabase = async () => {
    if (!window.confirm("Are you sure you want to wipe all vendor records in the database to 0?")) return;
    setLoading(true);
    try {
      await fetch(`${apiBackendUrl}/api/reset-database`, { method: 'POST' });
      setVendors([]);
    } catch (err) {
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic API call to approve vendor
  const handleApprove = async (id) => {
    try {
      const res = await fetch(`${apiBackendUrl}/api/vendors/${id}/approve`, {
        method: 'PUT'
      });
      const data = await res.json();
      if (data.status === 'success') {
        setVendors(vendors.map(v => v.id === id ? { ...v, status: 'approved' } : v));
      }
    } catch (err) {
      setVendors(vendors.map(v => v.id === id ? { ...v, status: 'approved' } : v));
    }
  };

  // Dynamic API call to create vendor
  const handleCreateVendor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      name: newName,
      stallName: newStall,
      category: newCategory,
      location: newZone,
      phone: newPhone || '+91 98000 00000'
    };

    try {
      const res = await fetch(`${apiBackendUrl}/api/vendors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.vendor) {
        setVendors([data.vendor, ...vendors]);
      }
    } catch (err) {
      const fallbackObj = {
        id: `VV-2024-${Math.floor(100 + Math.random() * 900)}`,
        ...payload,
        status: 'pending',
        joinedDate: 'Today'
      };
      setVendors([fallbackObj, ...vendors]);
    } finally {
      setSubmitting(false);
      setShowAddModal(false);
      setNewName('');
      setNewStall('');
      setNewPhone('');
    }
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.stallName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vendor-container">
      <div className="table-card">
        
        <div className="section-header">
          <div>
            <h2>Registered Vendor Directory & Verification</h2>
            <span className="sub-header-tag">Dynamic Database Count: {vendors.length} Vendors</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="quick-act-btn" style={{ color: '#f87171' }} onClick={handleResetDatabase} title="Wipe Database to 0">
              <Trash2 size={16} />
              <span>Wipe DB to 0</span>
            </button>
            <button className="quick-act-btn" onClick={fetchVendors} title="Refresh Live Data">
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              <span>Refresh</span>
            </button>
            <button className="submit-btn" style={{ padding: '10px 18px', width: 'auto' }} onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>Register New Vendor</span>
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="table-controls">
          <div className="search-box">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search vendor name, ID, stall..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
              style={{ width: '280px' }}
            />
          </div>

          <div className="filter-group">
            <Filter size={16} color="#94a3b8" />
            <select 
              className="select-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Permit Statuses</option>
              <option value="approved">Verified / Approved</option>
              <option value="pending">Pending Approval</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            Fetching dynamic database records...
          </div>
        ) : vendors.length === 0 ? (
          <div style={{ padding: '48px 20px', textAlign: 'center' }}>
            <AlertCircle size={40} color="#f59e0b" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '6px' }}>Database is Empty (0 Vendors)</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Click <strong>Register New Vendor</strong> above to create your first dynamic vendor record and see the Leaflet map and dashboard populate live!
            </p>
            <button className="submit-btn" style={{ width: 'auto', padding: '10px 24px', margin: '0 auto' }} onClick={() => setShowAddModal(true)}>
              <Plus size={16} />
              <span>Register First Vendor Now</span>
            </button>
          </div>
        ) : (
          <table className="vendor-table">
            <thead>
              <tr>
                <th>Vendor ID</th>
                <th>Vendor & Stall Name</th>
                <th>Category</th>
                <th>Assigned Zone</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td><strong>{vendor.id}</strong></td>
                  <td>
                    <div>
                      <strong style={{ color: 'var(--text-main)' }}>{vendor.name}</strong>
                      <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>{vendor.stallName}</div>
                    </div>
                  </td>
                  <td>{vendor.category}</td>
                  <td>{vendor.location}</td>
                  <td>{vendor.phone}</td>
                  <td>
                    <span className={`status-badge ${vendor.status}`}>
                      {vendor.status === 'approved' ? (
                        <><CheckCircle size={12} /> Approved</>
                      ) : (
                        <><Clock size={12} /> Pending Verification</>
                      )}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      {vendor.status === 'pending' && (
                        <button className="btn-sm btn-approve" onClick={() => handleApprove(vendor.id)}>
                          <CheckCircle size={14} /> Approve
                        </button>
                      )}
                      <button className="btn-sm btn-view">
                        <FileText size={14} /> Details
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

      </div>

      {/* Add Vendor Modal */}
      {showAddModal && (
        <div className="voice-modal-overlay">
          <div className="voice-modal-card" style={{ maxWidth: '520px' }}>
            <div className="voice-modal-header">
              <h3>Register New Civic Vendor</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVendor} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label>Vendor Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Ramesh Kumar"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Stall / Business Trade Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Ramesh Fresh Fruits"
                  value={newStall}
                  onChange={(e) => setNewStall(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <div className="form-group">
                <label>Vending Category</label>
                <select 
                  value={newCategory} 
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="select-filter"
                  style={{ width: '100%' }}
                >
                  <option>Perishable Produce</option>
                  <option>Prepared Food & Snacks</option>
                  <option>Textiles & Goods</option>
                  <option>Beverages</option>
                  <option>Artisanal Handicrafts</option>
                </select>
              </div>

              <div className="form-group">
                <label>Preferred Vending Zone</label>
                <select 
                  value={newZone} 
                  onChange={(e) => setNewZone(e.target.value)}
                  className="select-filter"
                  style={{ width: '100%' }}
                >
                  <option>Zone A - Market Sq</option>
                  <option>Zone B - VNIT Gate</option>
                  <option>Zone C - Metro Corridor</option>
                  <option>Zone D - Temple Premises</option>
                </select>
              </div>

              <div className="form-group">
                <label>Mobile Contact Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '10px' }} disabled={submitting}>
                <CheckCircle size={18} />
                <span>{submitting ? 'Registering in Database...' : 'Submit & Create Dynamic Vendor'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
