import React, { useState, useEffect } from 'react';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';

import DashboardOverview from './views/DashboardOverview';
import VendorProfile from './views/VendorProfile';
import AIZoneOptimizer from './views/AIZoneOptimizer';
import VendorManagement from './views/VendorManagement';
import CertificateManagement from './views/CertificateManagement';
import MobileInspector from './views/MobileInspector';
import ImpactReport from './views/ImpactReport';
import Login from './components/Login';
import SarvamVoiceModal from './components/SarvamAI/SarvamVoiceModal';

import './App.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://vikasit-nagpur-hackathon.onrender.com';

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  
  // Login Session State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vv_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Sarvam Voice Modal State
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  // Live Render Backend Health Status
  const [backendStatus, setBackendStatus] = useState({ online: false, loading: true });

  useEffect(() => {
    fetch(`${BACKEND_URL}/`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'online') {
          setBackendStatus({ online: true, loading: false });
        }
      })
      .catch((err) => {
        console.warn('Backend connection note:', err);
        setBackendStatus({ online: false, loading: false });
      });
  }, []);

  const handleLoginSuccess = (userData) => {
    setCurrentUser(userData);
    localStorage.setItem('vv_user_session', JSON.stringify(userData));
    setActiveModule('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vv_user_session');
    localStorage.clear();
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Guard against citizens accessing admin-only modules
  const isOfficer = currentUser.role === 'authority';
  const isModuleAllowed = isOfficer || ['dashboard', 'vendor_profile', 'zone_optimizer', 'certificate_management'].includes(activeModule);
  const safeActiveModule = isModuleAllowed ? activeModule : 'dashboard';

  return (
    <div className="app-layout">
      {/* Sidebar Navigation with Role Filtering */}
      <Sidebar 
        activeModule={safeActiveModule} 
        setActiveModule={setActiveModule} 
        currentUser={currentUser}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar 
          activeModule={safeActiveModule} 
          currentUser={currentUser} 
          onLogout={handleLogout}
          backendStatus={backendStatus}
        />

        <main className="view-viewport animate-fade-in-up" key={safeActiveModule}>
          {safeActiveModule === 'dashboard' && (
            <DashboardOverview onNavigate={setActiveModule} backendUrl={BACKEND_URL} currentUser={currentUser} />
          )}
          {safeActiveModule === 'vendor_profile' && (
            <VendorProfile currentUser={currentUser} backendUrl={BACKEND_URL} />
          )}
          {safeActiveModule === 'zone_optimizer' && (
            <AIZoneOptimizer backendUrl={BACKEND_URL} currentUser={currentUser} />
          )}
          {safeActiveModule === 'certificate_management' && (
            <CertificateManagement backendUrl={BACKEND_URL} currentUser={currentUser} />
          )}

          {/* Admin / Officer Only Views */}
          {isOfficer && safeActiveModule === 'vendor_management' && (
            <VendorManagement backendUrl={BACKEND_URL} />
          )}
          {isOfficer && safeActiveModule === 'mobile_inspector' && (
            <MobileInspector backendUrl={BACKEND_URL} />
          )}
          {isOfficer && safeActiveModule === 'impact_reports' && (
            <ImpactReport backendUrl={BACKEND_URL} />
          )}
        </main>
      </div>

      {/* Multilingual Voice Assistant Modal */}
      <SarvamVoiceModal 
        isOpen={voiceModalOpen} 
        onClose={() => setVoiceModalOpen(false)}
        backendUrl={BACKEND_URL}
      />
    </div>
  );
}
