import React from 'react';
import { Search, Bell, LogOut, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ activeModule, currentUser, onLogout }) {
  const titles = {
    dashboard: 'Dashboard Overview',
    zone_optimizer: 'AI Zone Optimizer',
    vendor_management: 'Vendor & Gov Management',
    certificate_management: 'Digital Certificate Portal',
    mobile_inspector: 'Mobile Inspector Portal',
    impact_reports: 'Livelihood & Executive Impact'
  };

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{titles[activeModule] || 'Viksit Vyapari System'}</h1>
        <span className="module-tag">
          {currentUser?.role === 'authority' ? 'OFFICER ACCESS' : 'PUBLIC CIVIC PORTAL'}
        </span>
      </div>

      <div className="navbar-actions">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search vendor, zone ID, permit..." 
            className="search-input"
          />
        </div>

        <button className="action-icon-btn" title="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-profile-badge">
          <div className="profile-avatar">
            {currentUser?.role === 'authority' ? <Shield size={14} /> : 'U'}
          </div>
          <div className="profile-info">
            <span className="profile-name">{currentUser?.name || currentUser?.email || 'Municipal Officer'}</span>
            <span className="profile-role">{currentUser?.department || currentUser?.role?.toUpperCase() || 'CIVIC ADMIN'}</span>
          </div>
        </div>

        <button className="logout-btn-header" onClick={onLogout} title="Sign Out">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
