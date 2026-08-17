import React, { useState } from 'react';
import LeafletMap from '../components/Map/LeafletMap';
import { Sparkles, Sliders, CheckCircle2, AlertCircle, ArrowUpRight } from 'lucide-react';
import './AIZoneOptimizer.css';

export default function AIZoneOptimizer() {
  const [vendorDensity, setVendorDensity] = useState(65);
  const [trafficWeight, setTrafficWeight] = useState(80);
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
    setTimeout(() => setApplied(false), 4000);
  };

  return (
    <div className="optimizer-container">
      <div className="section-header">
        <div>
          <span className="ai-badge">
            <Sparkles size={14} />
            <span>AI Zone Optimization Engine v2.4</span>
          </span>
          <h2 style={{ fontSize: '1.4rem', marginTop: '6px' }}>Vending Zone Capacity & Foot-Traffic Re-Balancing</h2>
        </div>
      </div>

      <div className="optimizer-grid">
        
        {/* Left Side: Map with Leaflet GIS & AI Heatmaps */}
        <div className="ai-card" style={{ padding: '16px' }}>
          <div className="section-header">
            <h3>Interactive Pedestrian Traffic & Vending Density Map</h3>
            <span className="sub-header-tag">Live Satellite GIS Overlay</span>
          </div>

          <LeafletMap height="500px" showZones={true} />
        </div>

        {/* Right Side: AI Control Panel */}
        <div className="ai-card">
          <div className="section-header">
            <h3><Sliders size={18} inline style={{ marginRight: '8px' }} /> Optimization Controls</h3>
          </div>

          {applied && (
            <div className="status-msg success">
              <CheckCircle2 size={16} />
              <span>AI Re-zoning plan applied! Re-allocated 15 vendors to Zone B.</span>
            </div>
          )}

          <div className="slider-group">
            <div className="slider-label">
              <span>Target Vending Density</span>
              <strong>{vendorDensity}% Capacity</strong>
            </div>
            <input 
              type="range" 
              min="20" 
              max="100" 
              value={vendorDensity} 
              onChange={(e) => setVendorDensity(e.target.value)}
              className="range-input" 
            />
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>Peak Hour Traffic Sensitivity</span>
              <strong>{trafficWeight}% Priority</strong>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={trafficWeight} 
              onChange={(e) => setTrafficWeight(e.target.value)}
              className="range-input" 
            />
          </div>

          <div className="recommendation-box">
            <div className="recommendation-header">
              <Sparkles size={18} />
              <span>AI Smart Re-Zoning Proposal</span>
            </div>
            <p>
              By shifting <strong>15 non-perishable stalls</strong> from Metro Corridor (Zone C) to VNIT Gate Alley (Zone B), peak pedestrian bottleneck will reduce by <strong>34%</strong> while vendor sales volume is projected to increase by <strong>18%</strong>.
            </p>
            <div className="impact-pills">
              <span className="impact-pill">↓ 34% Congestion</span>
              <span className="impact-pill">↑ 18% Vendor Income</span>
              <span className="impact-pill">100% Pedestrian Access</span>
            </div>
          </div>

          <button className="apply-ai-btn" onClick={handleApply}>
            <CheckCircle2 size={18} />
            <span>Approve & Execute AI Re-Zoning Plan</span>
          </button>
        </div>

      </div>
    </div>
  );
}
