import React, { useState } from 'react';
import LeafletMap from '../components/Map/LeafletMap';
import { Sliders, Sparkles, AlertCircle, TrendingUp, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import './AIZoneOptimizer.css';

export default function AIZoneOptimizer({ backendUrl }) {
  const [vendorDensity, setVendorDensity] = useState(50);
  const [trafficWeight, setTrafficWeight] = useState(70);
  const [targetZone, setTargetZone] = useState('Zone B - VNIT Gate');
  
  const [loading, setLoading] = useState(false);
  const [pipeline1Result, setPipeline1Result] = useState(null);
  const [pipeline2Result, setPipeline2Result] = useState(null);

  const apiBackendUrl = backendUrl || 'https://vikasit-nagpur-hackathon.onrender.com';

  // Execute Agentic Pipeline 1 & Pipeline 2
  const handleRunPipelines = async () => {
    setLoading(true);
    try {
      // Trigger Pipeline 1: AI Vending Zone Optimization
      const p1Res = await fetch(`${apiBackendUrl}/api/pipelines/ai-zone-optimization`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ location_id: 'ZONE-A', target_vendors: vendorDensity })
      });
      const p1Data = await p1Res.json();
      setPipeline1Result(p1Data);

      // Trigger Pipeline 2: What-If Impact Simulation
      const p2Res = await fetch(`${apiBackendUrl}/api/pipelines/what-if-simulation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendor_density: vendorDensity, traffic_weight: trafficWeight, target_zone: targetZone })
      });
      const p2Data = await p2Res.json();
      setPipeline2Result(p2Data);
    } catch (err) {
      console.error('Pipeline execution error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="optimizer-container">
      <div className="section-header">
        <div>
          <h2 style={{ fontSize: '1.4rem' }}>AI Zone Optimization & What-If Simulation</h2>
          <span className="sub-header-tag">Executing Agentic Pipeline #1 & Pipeline #2</span>
        </div>
        <span className="ai-badge">
          <Sparkles size={14} /> Agentic Neural Engine Active
        </span>
      </div>

      <div className="optimizer-grid">
        
        {/* Left Column: Interactive GIS Map */}
        <div className="map-section">
          <div className="section-header">
            <h3>Live Density GIS Map</h3>
            <span className="sub-header-tag">Nagpur Zone A & B Boundaries</span>
          </div>

          <LeafletMap height="420px" showZones={true} />
        </div>

        {/* Right Column: Interactive Pipeline Controls */}
        <div className="ai-card">
          <div className="section-header">
            <h3>Pipeline Parameter Sliders</h3>
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>Vendor Concentration Density</span>
              <strong>{vendorDensity} Vendors</strong>
            </div>
            <input 
              type="range" 
              min="10" 
              max="150" 
              value={vendorDensity}
              onChange={(e) => setVendorDensity(Number(e.target.value))}
              className="range-input"
            />
          </div>

          <div className="slider-group">
            <div className="slider-label">
              <span>Pedestrian Footfall Sensitivity</span>
              <strong>{trafficWeight}% Sensitivity</strong>
            </div>
            <input 
              type="range" 
              min="10" 
              max="100" 
              value={trafficWeight}
              onChange={(e) => setTrafficWeight(Number(e.target.value))}
              className="range-input"
            />
          </div>

          <div className="slider-group">
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Target Relocation Zone</label>
            <select 
              className="select-filter" 
              style={{ width: '100%', marginTop: '4px' }}
              value={targetZone}
              onChange={(e) => setTargetZone(e.target.value)}
            >
              <option>Zone B - VNIT Gate</option>
              <option>Zone A - Market Sq</option>
              <option>Zone D - Temple Corridor</option>
            </select>
          </div>

          <button className="apply-ai-btn" onClick={handleRunPipelines} disabled={loading}>
            <Sparkles size={18} className={loading ? 'spin' : ''} />
            <span>{loading ? 'Executing Agentic Pipeline...' : 'Run Agentic Optimization & Simulation'}</span>
          </button>

          {/* Pipeline #1 Result Box */}
          {pipeline1Result && (
            <div className="recommendation-box" style={{ borderColor: 'rgba(59, 130, 246, 0.4)' }}>
              <div className="recommendation-header">
                <CheckCircle2 size={16} color="#3b82f6" />
                <span>Pipeline #1: Zone Optimization Output</span>
              </div>
              <p style={{ fontSize: '0.85rem' }}>{pipeline1Result.recommendation}</p>
              <div className="impact-pills">
                <span className="impact-pill">Optimal Slots: {pipeline1Result.optimal_vendor_slots}</span>
                <span className="impact-pill">Balance Index: {pipeline1Result.balance_index}/100</span>
              </div>
            </div>
          )}

          {/* Pipeline #2 Result Box */}
          {pipeline2Result && (
            <div className="recommendation-box" style={{ borderColor: 'rgba(16, 185, 129, 0.4)', marginTop: '8px' }}>
              <div className="recommendation-header" style={{ color: '#10b981' }}>
                <TrendingUp size={16} color="#10b981" />
                <span>Pipeline #2: What-If Simulation Output</span>
              </div>
              <p style={{ fontSize: '0.85rem' }}>{pipeline2Result.recommendation}</p>
              <div className="impact-pills">
                <span className="impact-pill">Congestion: {pipeline2Result.predictions?.congestion_reduction}</span>
                <span className="impact-pill">Income Growth: {pipeline2Result.predictions?.income_growth}</span>
                <span className="impact-pill">ROI: {pipeline2Result.predictions?.municipal_roi}</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
