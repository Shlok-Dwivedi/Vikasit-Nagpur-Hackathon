import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, Shield, Server, Sun, Moon } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ activeModule, currentUser, onLogout, backendStatus }) {
  // Theme state: default to saved theme or 'dark'
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('vv_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('vv_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

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
        {/* Backend API Connection Status Indicator */}
        <div className="tech-pill">
          <Server size={14} color="#60a5fa" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Render API:</span>
          <strong style={{ fontSize: '0.75rem', color: backendStatus?.online ? '#34d399' : '#f87171' }}>
            {backendStatus?.loading ? 'Connecting...' : backendStatus?.online ? 'Live Connected' : 'Offline'}
          </strong>
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button className="action-icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#3b82f6" />}
        </button>

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
