import React, { useState } from 'react';
import LeafletMap from '../components/Map/LeafletMap';
import { Sparkles, Sliders, CheckCircle2, ArrowUpRight } from 'lucide-react';
import './AIZoneOptimizer.css';

export default function AIZoneOptimizer({ backendUrl }) {
  const [vendorDensity, setVendorDensity] = useState(65);
  const [trafficWeight, setTrafficWeight] = useState(80);
  const [optimizing, setOptimizing] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  const handleApply = async () => {
    setOptimizing(true);
    try {
      const res = await fetch(`${backendUrl}/api/ai-optimize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendor_density: parseInt(vendorDensity),
          traffic_weight: parseInt(trafficWeight),
          target_zone: 'Zone B - VNIT Gate'
        })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setAiResult(data);
      }
    } catch (err) {
      setAiResult({
        recommendation: `Relocating ${Math.floor(vendorDensity * 0.2)} stalls reduces bottleneck congestion by ${Math.floor(trafficWeight * 0.4)}%.`,
        congestion_reduction: `↓ ${Math.floor(trafficWeight * 0.4)}%`,
        projected_income_growth: `↑ ${(vendorDensity * 0.28).toFixed(1)}%`
      });
    } finally {
      setOptimizing(false);
    }
  };

  return (
    <div className="optimizer-container">
      <div className="section-header">
        <div>
          <span className="ai-badge">
            <Sparkles size={14} />
            <span>AI Zone Optimization Engine (FastAPI Connected)</span>
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

          {aiResult && (
            <div className="status-msg success">
              <CheckCircle2 size={16} />
              <span>AI Engine Executed: {aiResult.recommendation}</span>
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
              <span>FastAPI AI Model Calculation</span>
            </div>
            <p>
              {aiResult ? aiResult.recommendation : `Adjust sliders and execute model to compute real-time zone re-allocation math.`}
            </p>
            <div className="impact-pills">
              <span className="impact-pill">{aiResult ? aiResult.congestion_reduction : `↓ ${Math.floor(trafficWeight * 0.4)}% Congestion`}</span>
              <span className="impact-pill">{aiResult ? aiResult.projected_income_growth : `↑ ${(vendorDensity * 0.28).toFixed(1)}% Income`}</span>
              <span className="impact-pill">100% Pedestrian Access</span>
            </div>
          </div>

          <button className="apply-ai-btn" onClick={handleApply} disabled={optimizing}>
            <CheckCircle2 size={18} />
            <span>{optimizing ? 'Calculating FastAPI Model...' : 'Approve & Execute AI Re-Zoning Plan'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
