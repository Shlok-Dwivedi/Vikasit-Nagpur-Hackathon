import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  FileCheck, 
  Smartphone, 
  BarChart3, 
  Building2, 
  Mic 
} from 'lucide-react';
import SarvamVoiceModal from '../SarvamAI/SarvamVoiceModal';
import './Sidebar.css';

export default function Sidebar({ activeModule, setActiveModule }) {
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'zone_optimizer', label: 'AI Zone Optimizer', icon: Map, badge: 'AI Live' },
    { id: 'vendor_management', label: 'Vendor Management', icon: Users },
    { id: 'certificate_management', label: 'Certificate Portal', icon: FileCheck },
    { id: 'mobile_inspector', label: 'Mobile Inspector', icon: Smartphone },
    { id: 'impact_reports', label: 'Livelihood & Executive', icon: BarChart3 },
  ];

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Building2 size={22} />
          </div>
          <div className="brand-info">
            <h2>Viksit Vyapari</h2>
            <p>CIVIC MANAGEMENT</p>
          </div>
        </div>

        <nav className="sidebar-menu">
          <div className="menu-section-label">Core Systems</div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveModule(item.id)}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="sarvam-widget" style={{ cursor: 'pointer' }} onClick={() => setVoiceModalOpen(true)}>
            <div className="sarvam-icon">
              <Mic size={16} />
            </div>
            <div className="sarvam-text">
              <p>Sarvam AI Voice</p>
              <span>Tap for Multilingual Voice</span>
            </div>
          </div>
        </div>
      </aside>

      <SarvamVoiceModal 
        isOpen={voiceModalOpen} 
        onClose={() => setVoiceModalOpen(false)} 
      />
    </>
  );
}
