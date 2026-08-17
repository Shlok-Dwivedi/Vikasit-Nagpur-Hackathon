import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  FileCheck, 
  Smartphone, 
  BarChart3, 
  Building2, 
  Mic,
  ShieldAlert
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar({ activeModule, setActiveModule, currentUser, onOpenVoiceModal }) {
  const isOfficer = currentUser?.role === 'authority';

  // Base items visible to everyone (Citizens & Officers)
  const citizenItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'zone_optimizer', label: 'AI Zone Optimizer', icon: Map, badge: 'AI Live' },
    { id: 'certificate_management', label: 'My Certificate', icon: FileCheck },
  ];

  // Officer / Admin Only items
  const officerItems = [
    { id: 'vendor_management', label: 'Vendor Management', icon: Users, adminOnly: true },
    { id: 'mobile_inspector', label: 'Mobile Inspector', icon: Smartphone, adminOnly: true },
    { id: 'impact_reports', label: 'Executive Analytics', icon: BarChart3, adminOnly: true },
  ];

  const menuItems = isOfficer 
    ? [
        { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
        { id: 'zone_optimizer', label: 'AI Zone Optimizer', icon: Map, badge: 'AI Live' },
        { id: 'vendor_management', label: 'Vendor Management', icon: Users, adminOnly: true },
        { id: 'certificate_management', label: 'Certificate Portal', icon: FileCheck },
        { id: 'mobile_inspector', label: 'Mobile Inspector', icon: Smartphone, adminOnly: true },
        { id: 'impact_reports', label: 'Livelihood Impact', icon: BarChart3, adminOnly: true },
      ]
    : citizenItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Building2 size={22} />
        </div>
        <div className="brand-info">
          <h2>Viksit Vyapari</h2>
          <p>{isOfficer ? 'OFFICER ADMIN PORTAL' : 'CITIZEN CIVIC PORTAL'}</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-section-label">
          {isOfficer ? 'Admin & Governance' : 'Public Services'}
        </div>

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
              {item.adminOnly && <span className="nav-badge" style={{ background: 'rgba(5, 150, 105, 0.2)', color: '#34d399' }}>ADMIN</span>}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sarvam-widget" style={{ cursor: 'pointer' }} onClick={onOpenVoiceModal}>
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
  );
}
