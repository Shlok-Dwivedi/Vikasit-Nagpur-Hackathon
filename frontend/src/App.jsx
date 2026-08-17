import React, { useState } from 'react';
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

export default function App() {
  const [currentUser, setCurrentUser] = useState({
    name: 'Officer Deshmukh',
    role: 'authority',
    department: 'Nagpur Municipal Corp'
  });
  const [activeModule, setActiveModule] = useState('dashboard');

  const renderModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <DashboardOverview onNavigate={(mod) => setActiveModule(mod)} />;
      case 'zone_optimizer':
        return <AIZoneOptimizer />;
      case 'vendor_management':
        return <VendorManagement />;
      case 'certificate_management':
        return <CertificateManagement />;
      case 'mobile_inspector':
        return <MobileInspector />;
      case 'impact_reports':
        return <ImpactReport />;
      default:
        return <DashboardOverview onNavigate={(mod) => setActiveModule(mod)} />;
    }
  };

  if (!currentUser) {
    return <Login onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      <div className="app-content-wrapper" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Navbar 
          activeModule={activeModule} 
          currentUser={currentUser} 
          onLogout={() => setCurrentUser(null)} 
        />
        
        <main className="module-content" style={{ flex: 1, overflowY: 'auto' }}>
          {renderModule()}
        </main>
      </div>
    </div>
  );
}
