import React, { useState, useEffect } from 'react';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';

import DashboardOverview from './views/DashboardOverview';
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
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('vv_user_session');
    localStorage.clear();
  };

  // Complete System Reset to 0
  const handleFullSystemReset = async () => {
    if (!window.confirm("Confirm Full System Reset: This will wipe all vendors, alerts, login sessions, and clear the database to 0.")) return;
    try {
      await fetch(`${BACKEND_URL}/api/reset-database`, { method: 'POST' });
    } catch (e) {
      // Ignore network errors on reset
    }
    handleLogout();
    window.location.reload();
  };

  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="app-layout">
      {/* Sidebar Navigation */}
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        currentUser={currentUser}
        onOpenVoiceModal={() => setVoiceModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar 
          activeModule={activeModule} 
          currentUser={currentUser} 
          onLogout={handleLogout}
          backendStatus={backendStatus}
        />

        <main className="view-viewport">
          {activeModule === 'dashboard' && (
            <DashboardOverview onNavigate={setActiveModule} backendUrl={BACKEND_URL} />
          )}
          {activeModule === 'zone_optimizer' && (
            <AIZoneOptimizer backendUrl={BACKEND_URL} />
          )}
          {activeModule === 'vendor_management' && (
            <VendorManagement backendUrl={BACKEND_URL} />
          )}
          {activeModule === 'certificate_management' && (
            <CertificateManagement backendUrl={BACKEND_URL} />
          )}
          {activeModule === 'mobile_inspector' && (
            <MobileInspector backendUrl={BACKEND_URL} />
          )}
          {activeModule === 'impact_reports' && (
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
