import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut, Shield, Server, Sun, Moon, Globe } from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext.jsx';
import './Navbar.css';

export default function Navbar({ activeModule, currentUser, onLogout, backendStatus }) {
  const { t, language, setLanguage } = useLanguage();
  const [langOpen, setLangOpen] = useState(false);

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
    dashboard: t('Dashboard Overview', 'Dashboard Overview'),
    vendor_profile: t('My Vendor Profile', 'My Vendor Profile & Unique QR'),
    zone_optimizer: t('AI Zone Optimizer', 'AI Zone Optimizer'),
    vendor_management: t('Vendor Directory', 'Vendor & Gov Directory'),
    certificate_management: t('Certificate Portal', 'Digital Certificate Portal'),
    mobile_inspector: t('Mobile Inspector', 'Mobile Inspector Portal'),
    impact_reports: t('Executive Analytics', 'Livelihood & Executive Impact')
  };

  return (
    <header className="navbar">
      <div className="navbar-title">
        <h1>{titles[activeModule] || t('Viksit Vyapari System', 'Viksit Vyapari System')}</h1>
        <span className="module-tag">
          {currentUser?.role === 'authority' ? t('OFFICER ACCESS', 'OFFICER ACCESS') : t('PUBLIC CIVIC PORTAL', 'PUBLIC CIVIC PORTAL')}
        </span>
      </div>

      <div className="navbar-actions">
        {/* Backend API Connection Status Indicator */}
        <div className="tech-pill">
          <Server size={14} color="#60a5fa" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Render API:</span>
          <strong style={{ fontSize: '0.75rem', color: backendStatus?.online ? '#34d399' : '#f87171' }}>
            {backendStatus?.loading ? t('Connecting...', 'Connecting...') : backendStatus?.online ? t('Live Connected', 'Live Connected') : t('Offline', 'Offline')}
          </strong>
        </div>

        {/* Premium Language Switcher Toggle */}
        <div className="lang-dropdown-container">
          <button className="lang-toggle-btn" onClick={() => setLangOpen(!langOpen)} title="Change Language / भाषा बदलें">
            <Globe size={16} color="var(--accent-primary)" />
            <span>{language === 'en' ? 'EN' : language === 'hi' ? 'हिंदी' : 'मराठी'}</span>
          </button>
          
          {langOpen && (
            <div className="lang-dropdown">
              <button 
                type="button"
                className={`lang-option ${language === 'en' ? 'active' : ''}`}
                onClick={() => { setLanguage('en'); setLangOpen(false); }}
              >
                <span>English</span>
                {language === 'en' && <span>✓</span>}
              </button>
              <button 
                type="button"
                className={`lang-option ${language === 'hi' ? 'active' : ''}`}
                onClick={() => { setLanguage('hi'); setLangOpen(false); }}
              >
                <span>हिंदी</span>
                {language === 'hi' && <span>✓</span>}
              </button>
              <button 
                type="button"
                className={`lang-option ${language === 'mr' ? 'active' : ''}`}
                onClick={() => { setLanguage('mr'); setLangOpen(false); }}
              >
                <span>मराठी</span>
                {language === 'mr' && <span>✓</span>}
              </button>
            </div>
          )}
        </div>

        {/* Light / Dark Mode Toggle Button */}
        <button className="action-icon-btn" onClick={toggleTheme} title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}>
          {theme === 'dark' ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#3b82f6" />}
        </button>

        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder={t('Search vendor, zone ID...', 'Search vendor, zone ID...')} 
            className="search-input"
          />
        </div>

        <button className="action-icon-btn" title="Notifications">
          <Bell size={18} />
        </button>

        <div className="user-profile-badge">
          <div className="profile-avatar">
            {currentUser?.role === 'authority' ? <Shield size={14} /> : 'V'}
          </div>
          <div className="profile-info">
            <span className="profile-name">{currentUser?.name || currentUser?.email || 'Municipal User'}</span>
            <span className="profile-role">{currentUser?.department || currentUser?.role?.toUpperCase() || 'CIVIC USER'}</span>
          </div>
        </div>

        <button className="logout-btn-header" onClick={onLogout} title={t('Sign Out', 'Sign Out')}>
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
