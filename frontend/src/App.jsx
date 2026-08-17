import React, { useState, useEffect } from 'react';
import Sidebar from './components/Navigation/Sidebar';
import Navbar from './components/Navigation/Navbar';
import Login from './components/Login';

// Import Views
import DashboardOverview from './views/DashboardOverview';
import AIZoneOptimizer from './views/AIZoneOptimizer';
import VendorManagement from './views/VendorManagement';
import CertificateManagement from './views/CertificateManagement';
import MobileInspector from './views/MobileInspector';
import ImpactReport from './views/ImpactReport';

import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://vikasit-nagpur-hackathon.onrender.com';

export default function App() {
  // Check for saved user session in localStorage or start at null (login page)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('vv_user_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeModule, setActiveModule] = useState('dashboard');
  const [backendStatus, setBackendStatus] = useState({ loading: true, online: false });

  // Test live connection to Render FastAPI backend
  useEffect(() => {
    fetch(`${BACKEND_URL}/`)
      .then((res) => {
        if (!res.ok) throw new Error('API offline');
        return res.json();
      })
      .then((data) => {
        setBackendStatus({ loading: false, online: true, data });
      })
      .catch(() => {
        setBackendStatus({ loading: false, online: false });
      });
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('vv_user_session', JSON.stringify(user));
    } catch (e) {
      console.warn('Session save failed:', e);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('vv_user_session');
    } catch (e) {
      console.warn('Session clear failed:', e);
    }
  };

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview onNavigate={(mod) => setActiveModule(mod)} backendUrl={BACKEND_URL} currentUser={currentUser} />;
      case 'zone_optimizer':
        return <AIZoneOptimizer backendUrl={BACKEND_URL} currentUser={currentUser} />;
      case 'vendor_management':
        return <VendorManagement backendUrl={BACKEND_URL} currentUser={currentUser} />;
      case 'certificate_management':
        return <CertificateManagement backendUrl={BACKEND_URL} currentUser={currentUser} />;
      case 'mobile_inspector':
        return <MobileInspector backendUrl={BACKEND_URL} currentUser={currentUser} />;
      case 'impact_reports':
        return <ImpactReport backendUrl={BACKEND_URL} currentUser={currentUser} />;
      default:
        return <DashboardOverview onNavigate={(mod) => setActiveModule(mod)} backendUrl={BACKEND_URL} currentUser={currentUser} />;
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        currentUser={currentUser}
      />
      
      <div className="app-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar 
          activeModule={activeModule} 
          currentUser={currentUser} 
          onLogout={handleLogout} 
          backendStatus={backendStatus}
        />
        
        <main className="module-content" style={{ flex: 1, overflowY: 'auto' }}>
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
