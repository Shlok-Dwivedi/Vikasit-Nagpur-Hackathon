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
import EnforcementIntel from './views/EnforcementIntel';
import Login from './components/Login';

import './App.css';
import { supabase, getBackendUrl } from './lib/supabase';

const BACKEND_URL = getBackendUrl();

export default function App() {
  const [activeModule, setActiveModule] = useState('dashboard');
  
  // Login Session State
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('vv_user_session');
    return saved ? JSON.parse(saved) : null;
  });

  // Live Render Backend Health Status
  const [backendStatus, setBackendStatus] = useState({ online: false, loading: true });

  // Supabase Google OAuth & Auth Session Listener
  useEffect(() => {
    if (!supabase) return;

    const applySession = (session) => {
      if (!session?.user) return;
      const meta = session.user.user_metadata || {};
      const userData = {
        email: session.user.email,
        role: meta.role || 'citizen',
        name: meta.full_name || meta.name || session.user.email.split('@')[0],
        department: meta.department || 'Citizen Vendor',
        token: session.access_token
      };
      handleLoginSuccess(userData);
    };

    // Restore session if returning from Google OAuth redirect
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && !currentUser) applySession(session);
    });

    // Listen to Google OAuth popup/redirect completion
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) applySession(session);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // Backend Health Status Check
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
    if (supabase) {
      supabase.auth.signOut().catch(e => console.warn('Supabase signout note:', e));
    }
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
          {isOfficer && safeActiveModule === 'enforcement_intel' && (
            <EnforcementIntel backendUrl={BACKEND_URL} />
          )}
        </main>
      </div>
    </div>
  );
}
