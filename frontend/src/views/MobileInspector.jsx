import React, { useState } from 'react';
import { Smartphone, QrCode, ShieldAlert, CheckCircle2, MapPin, Camera, AlertTriangle } from 'lucide-react';
import './MobileInspector.css';

export default function MobileInspector() {
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [violationLogged, setViolationLogged] = useState(false);

  const handleScanSimulate = () => {
    setScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setScanning(false);
      setScanResult({
        id: 'VV-2024-001',
        name: 'Ramesh Kumar',
        zone: 'Zone A - Market Sq',
        status: 'VALID PERMIT',
        category: 'Perishable Produce'
      });
    }, 1200);
  };

  const handleLogViolation = (e) => {
    e.preventDefault();
    setViolationLogged(true);
    setTimeout(() => setViolationLogged(false), 3500);
  };

  return (
    <div className="inspector-container">
      <div className="mobile-frame">
        
        <div className="mobile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Smartphone size={18} color="#3b82f6" />
            <h3>Inspector Field App</h3>
          </div>
          <span className="status-badge approved">GPS Active</span>
        </div>

        {/* Scanner Simulation */}
        <div className="scanner-box" onClick={handleScanSimulate}>
          <QrCode size={42} color={scanning ? '#ff9933' : '#3b82f6'} />
          <strong style={{ fontSize: '0.9rem', color: '#f8fafc' }}>
            {scanning ? 'Scanning QR Code...' : 'Tap to Scan Vendor QR Code'}
          </strong>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Verifies permit authenticity & zone clearance
          </span>
        </div>

        {/* Scan Result Details */}
        {scanResult && (
          <div className="scan-result-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <CheckCircle2 size={18} color="#10b981" />
              <strong style={{ color: '#34d399', fontSize: '0.9rem' }}>{scanResult.status}</strong>
            </div>
            <p style={{ fontSize: '0.85rem', color: '#f8fafc' }}><strong>Vendor:</strong> {scanResult.name} ({scanResult.id})</p>
            <p style={{ fontSize: '0.825rem', color: '#94a3b8' }}><strong>Zone:</strong> {scanResult.zone}</p>
          </div>
        )}

        {/* Log Geotagged Violation Form */}
        <form className="violation-form" onSubmit={handleLogViolation}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <ShieldAlert size={16} color="#ef4444" />
            <strong style={{ fontSize: '0.85rem', color: '#f8fafc' }}>Log Field Violation</strong>
          </div>

          {violationLogged && (
            <div className="status-msg success">
              <CheckCircle2 size={14} />
              <span>Violation geotagged & uploaded!</span>
            </div>
          )}

          <div>
            <label>Violation Type</label>
            <select className="select-filter" style={{ width: '100%', marginTop: '4px' }}>
              <option>Encroachment outside designated stall boundary</option>
              <option>Unauthorized vendor (No permit)</option>
              <option>Operating outside permitted hours</option>
              <option>Sanitation & waste disposal breach</option>
            </select>
          </div>

          <div>
            <label>Geotagged Location</label>
            <div className="input-container" style={{ marginTop: '4px' }}>
              <MapPin size={16} className="input-icon" />
              <input 
                type="text" 
                readOnly 
                value="21.1275° N, 79.0530° E (Nagpur Sq)" 
                className="form-input" 
                style={{ fontSize: '0.8rem' }} 
              />
            </div>
          </div>

          <button type="submit" className="submit-btn" style={{ background: '#ef4444', marginTop: '4px' }}>
            <Camera size={16} />
            <span>Submit Geotagged Report</span>
          </button>
        </form>

      </div>
    </div>
  );
}
