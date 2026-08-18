import React from 'react';
import { 
  LayoutDashboard, 
  Map, 
  Users, 
  FileCheck, 
  Smartphone, 
  BarChart3, 
  AlertTriangle,
  Building2, 
  UserCheck
} from 'lucide-react';
import { useLanguage } from '../../lib/LanguageContext.jsx';
import './Sidebar.css';

export default function Sidebar({ activeModule, setActiveModule, currentUser }) {
  const { t } = useLanguage();
  const isOfficer = currentUser?.role === 'authority';

  // Base items visible to Citizens & Vendors
  const citizenItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'vendor_profile', label: 'My Vendor Profile', icon: UserCheck, badge: 'QR Live' },
    { id: 'certificate_management', label: 'My Certificate', icon: FileCheck },
    { id: 'zone_optimizer', label: 'Current Zone', icon: Map },
  ];

  // Officer / Admin Access items
  const officerItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'vendor_management', label: 'Vendor Directory', icon: Users, adminOnly: true },
    { id: 'zone_management', label: 'Zone Management', icon: Map, adminOnly: true },
    { id: 'certificate_management', label: 'Certificate Portal', icon: FileCheck },
    { id: 'mobile_inspector', label: 'Mobile Inspector', icon: Smartphone, adminOnly: true },
    { id: 'enforcement_intel', label: 'Enforcement Intel', icon: AlertTriangle, adminOnly: true },
    { id: 'impact_reports', label: 'Executive Analytics', icon: BarChart3, adminOnly: true },
  ];


  const menuItems = isOfficer ? officerItems : citizenItems;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">
          <Building2 size={22} />
        </div>
        <div className="brand-info">
          <h2>{t('Viksit Vyapari', 'Viksit Vyapari')}</h2>
          <p>{isOfficer ? t('OFFICER ADMIN PORTAL', 'OFFICER ADMIN PORTAL') : t('CITIZEN CIVIC PORTAL', 'CITIZEN CIVIC PORTAL')}</p>
        </div>
      </div>

      <nav className="sidebar-menu">
        <div className="menu-section-label">
          {isOfficer ? t('Admin & Governance', 'Admin & Governance') : t('Vendor Services', 'Vendor Services')}
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
              <span>{t(item.label, item.label)}</span>
              {item.adminOnly && <span className="nav-badge" style={{ background: 'rgba(5, 150, 105, 0.2)', color: '#34d399' }}>ADMIN</span>}
              {item.badge && <span className="nav-badge">{t(item.badge, item.badge)}</span>}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
