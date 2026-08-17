import React, { useState } from 'react';
import { Users, Filter, Plus, CheckCircle, Clock, XCircle, Search, FileText } from 'lucide-react';
import './VendorManagement.css';

export default function VendorManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [vendors, setVendors] = useState([
    {
      id: 'VV-2024-001',
      name: 'Ramesh Kumar',
      stallName: 'Ramesh Fresh Fruits',
      category: 'Perishable Produce',
      location: 'Zone A - Market Sq',
      phone: '+91 98234 11290',
      status: 'approved',
      joinedDate: '12 Jan 2024'
    },
    {
      id: 'VV-2024-042',
      name: 'Sunita Sharma',
      stallName: 'Sunita Fast Food & Snacks',
      category: 'Prepared Food',
      location: 'Zone B - VNIT Gate',
      phone: '+91 97123 88401',
      status: 'approved',
      joinedDate: '18 Feb 2024'
    },
    {
      id: 'VV-2024-089',
      name: 'Anil Patil',
      stallName: 'Nagpur Handloom Corner',
      category: 'Textiles & Goods',
      location: 'Zone C - Metro Corridor',
      phone: '+91 94210 55920',
      status: 'pending',
      joinedDate: '02 Aug 2024'
    },
    {
      id: 'VV-2024-115',
      name: 'Mohd Imran',
      stallName: 'Imran Tea & Refreshments',
      category: 'Beverages',
      location: 'Zone A - Station Rd',
      phone: '+91 99812 33491',
      status: 'pending',
      joinedDate: '10 Aug 2024'
    },
    {
      id: 'VV-2024-130',
      name: 'Kavita Deshmukh',
      stallName: 'Kavita Flower Stall',
      category: 'Perishable Goods',
      location: 'Zone D - Temple Premises',
      phone: '+91 98811 22304',
      status: 'approved',
      joinedDate: '14 Aug 2024'
    }
  ]);

  const handleApprove = (id) => {
    setVendors(vendors.map(v => v.id === id ? { ...v, status: 'approved' } : v));
  };

  const filteredVendors = vendors.filter(v => {
    const matchesSearch = v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          v.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          v.stallName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="vendor-container">
      <div className="table-card">
        
        <div className="section-header">
          <div>
            <h2>Registered Vendor Directory & Verification</h2>
            <span className="sub-header-tag">Manage civic vending permits and approvals</span>
          </div>
          <button className="submit-btn" style={{ padding: '10px 18px', width: 'auto' }}>
            <Plus size={16} />
            <span>Register New Vendor</span>
          </button>
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
                    <strong style={{ color: '#f8fafc' }}>{vendor.name}</strong>
                    <div style={{ fontSize: '0.775rem', color: '#94a3b8' }}>{vendor.stallName}</div>
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

      </div>
    </div>
  );
}
