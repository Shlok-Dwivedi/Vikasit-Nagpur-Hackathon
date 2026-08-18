import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, CheckCircle2, XCircle, Plus, ShieldCheck, RefreshCw, Award, Clock } from 'lucide-react';
import './VendorManagement.css';

export default function VendorManagement({ backendUrl }) {
  const [vendors, setVendors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);

  const apiBackendUrl = backendUrl || '';

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBackendUrl}/api/vendors`);
      const data = await res.json();
      if (data.vendors) setVendors(data.vendors);
    } catch (err) {
      console.warn('Vendor management fetch note:', err);
    } finally {
      setLoading(false);
    }
  };

  // OFFICER APPROVAL WORKFLOW: Approve Vendor Application & Issue Certificate
  const handleApproveVendor = async (vendorId) => {
    try {
      const res = await fetch(`${apiBackendUrl}/api/vendors/${vendorId}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${sessionStorage.getItem('vv_officer_token') || ''}` }
      });

      if (res.ok) {
        const result = await res.json();
        setVendors(prev => prev.map(v => v.id === vendorId ? result.vendor : v));
        
        // Update local storage session if currently logged-in vendor matches
        const saved = localStorage.getItem('vv_user_session');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (parsed.vendorData?.id === vendorId) {
              parsed.vendorData = result.vendor;
              localStorage.setItem('vv_user_session', JSON.stringify(parsed));
            }
          } catch (e) {}
        }

        // Broadcast global live event so Vendor views update immediately
        window.dispatchEvent(new Event('vendorProfileUpdated'));

        setActionMsg({ type: 'success', text: `Official Certificate & Permit Granted for ${vendorId}!` });
        setTimeout(() => setActionMsg(null), 4000);
      } else {
        setActionMsg({ type: 'error', text: 'Approval failed: officer authorization is missing or expired.' });
      }
    } catch (err) {
      console.error('Approve vendor error:', err);
    }
  };

  const filteredVendors = vendors.filter(vendor => {
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          vendor.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || vendor.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || vendor.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="vm-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>Municipal Officer Vendor Directory & Permit Issuance</h2>
          <span className="sub-header-tag">Officer Portal for Approving Vending Applications & Issuing Certificates</span>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="quick-act-btn" onClick={fetchVendors} style={{ padding: '8px 14px' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh List</span>
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className={`status-msg ${actionMsg.type}`}>
          <CheckCircle2 size={16} />
          <span>{actionMsg.text}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search vendor name, ID, or custom address..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-options">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-filter">
            <option value="all">All Approval Statuses</option>
            <option value="pending">Pending Officer Approval</option>
            <option value="approved">Approved & Issued</option>
          </select>
        </div>
      </div>

      {/* Vendor Table */}
      <div className="table-responsive">
        <table className="vendor-table">
          <thead>
            <tr>
              <th>Vendor ID</th>
              <th>Vendor Name & Stall</th>
              <th>Trade Category</th>
              <th>Vending Stall Address</th>
              <th>Approval Status</th>
              <th>Action (Officer Approval)</th>
            </tr>
          </thead>
          <tbody>
            {filteredVendors.length > 0 ? (
              filteredVendors.map((vendor) => (
                <tr key={vendor.id}>
                  <td className="vendor-id">{vendor.id}</td>
                  <td>
                    <strong>{vendor.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{vendor.stallName || vendor.name}</div>
                  </td>
                  <td>{vendor.category}</td>
                  <td>{vendor.location}</td>
                  <td>
                    <span className={`status-badge ${vendor.status}`}>
                      {vendor.status === 'approved' ? <><CheckCircle2 size={12} /> Approved & Issued</> : <><Clock size={12} /> Pending Approval</>}
                    </span>
                  </td>
                  <td>
                    {vendor.status !== 'approved' ? (
                      <button 
                        className="submit-btn" 
                        style={{ padding: '6px 14px', fontSize: '0.78rem', background: '#10b981', width: 'auto' }}
                        onClick={() => handleApproveVendor(vendor.id)}
                      >
                        <Award size={14} />
                        <span>Approve & Issue Certificate</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>
                        Certificate Active
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                  No vendor applications found. Registered vendor applications will stream live here.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
