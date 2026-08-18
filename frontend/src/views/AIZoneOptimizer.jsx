import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Activity, ArrowRight, ChevronDown, Clock3, MapPin, Navigation, Route, Scale, ShieldCheck, Sparkles, Store, Users, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './AIZoneOptimizer.css';

const DESIGNATED_ZONE = {
  name: 'Zone B – VNIT Gate', status: 'ACTIVE', capacity: 35, slot: 18,
  validUntil: '17 Aug 2027', operatingHours: '7:00 AM – 9:00 PM',
  area: 'VNIT Main Gate vending bay, South Ambazari Road, Nagpur',
  center: [21.1237, 79.0516],
  boundary: [[21.12445, 79.05065], [21.1245, 79.0525], [21.12305, 79.05265], [21.12285, 79.05085]],
  rules: [
    'Operate only inside the marked zone boundary.',
    'Keep the pedestrian path and VNIT gate access clear.',
    'Display your active vending certificate during operating hours.',
    'Use only assigned Slot #18 and leave the area clean at closing time.'
  ]
};

const makeMarker = (className, label) => L.divIcon({
  className: '', html: `<div class="${className}"><span>${label}</span></div>`,
  iconSize: className.includes('zone') ? [180, 52] : [34, 34],
  iconAnchor: className.includes('zone') ? [90, 26] : [17, 17]
});
const zoneMarker = makeMarker('locator-zone-marker', 'Your Designated Zone');
const locationMarker = makeMarker('locator-location-marker', '');

const pointInsidePolygon = ([lat, lng], polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    if (((lngI > lng) !== (lngJ > lng)) && (lat < ((latJ - latI) * (lng - lngI)) / (lngJ - lngI) + latI)) inside = !inside;
  }
  return inside;
};

const CCTV_ZONE_MAP = [
  { id: 'ZONE_A', name: 'ZONE_A → Traffic Park' },
  { id: 'ZONE_B', name: 'ZONE_B → VNIT Gate' },
  { id: 'ZONE_C', name: 'ZONE_C → Civil Lines' },
  { id: 'ZONE_D', name: 'ZONE_D → Ramnagar' },
];

export default function AIZoneOptimizer({ currentUser, backendUrl }) {
  const apiBackendUrl = backendUrl || 'http://localhost:8000';
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [vendorLocation, setVendorLocation] = useState(null);
  const [selectedZone, setSelectedZone] = useState('');
  const [simulation, setSimulation] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState('');
  const [decisionOpen, setDecisionOpen] = useState(false);
  const [performance, setPerformance] = useState(null);
  const [candidateZones, setCandidateZones] = useState([]);
  const [performanceError, setPerformanceError] = useState('');

  const [cctvData, setCctvData] = useState(null);
  const [cctvLoading, setCctvLoading] = useState(true);
  const [selectedCctvZone, setSelectedCctvZone] = useState('ZONE_B');

  useEffect(() => {
    const fetchCctvAnalytics = async () => {
      try {
        const response = await fetch(`${apiBackendUrl}/api/cctv-analysis`);
        if (!response.ok) throw new Error('CCTV data unavailable');
        const data = await response.json();
        if (data.status === 'success' && data.zones) {
          setCctvData(data.zones);
        } else {
          setCctvData(null);
        }
      } catch (err) {
        setCctvData(null);
      } finally {
        setCctvLoading(false);
      }
    };
    fetchCctvAnalytics();
  }, [apiBackendUrl]);

  useEffect(() => {
    const vendor = currentUser?.vendorData;
    const lat = Number(vendor?.lat);
    const lng = Number(vendor?.lng);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      setVendorLocation([lat, lng]);
      return;
    }
    navigator.geolocation?.getCurrentPosition(
      ({ coords }) => setVendorLocation([coords.latitude, coords.longitude]),
      () => setVendorLocation(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  }, [currentUser]);

  useEffect(() => {
    const loadZonePerformance = async () => {
      try {
        const [performanceResponse, optimizationResponse, zonesResponse] = await Promise.all([
          fetch(`${apiBackendUrl}/api/zones/ZONE-B/performance`),
          fetch(`${apiBackendUrl}/api/pipelines/ai-zone-optimization`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ location_id: 'ZONE-B', target_vendors: 31 })
          }),
          fetch(`${apiBackendUrl}/api/zones`)
        ]);
        if (!performanceResponse.ok || !optimizationResponse.ok || !zonesResponse.ok) throw new Error('Live zone performance is unavailable.');
        const [performanceData, optimizationData, zonesData] = await Promise.all([performanceResponse.json(), optimizationResponse.json(), zonesResponse.json()]);
        if (optimizationData.status !== 'success') throw new Error(optimizationData.error || 'Zone analysis failed.');
        setPerformance({ ...performanceData, optimizer: optimizationData });
        setCandidateZones((zonesData.zones || []).filter((zone) => zone.id !== 'ZONE-B'));
      } catch (error) {
        setPerformanceError(error.message);
      }
    };
    loadZonePerformance();
  }, [apiBackendUrl]);
  const isOutsideZone = vendorLocation ? !pointInsidePolygon(vendorLocation, DESIGNATED_ZONE.boundary) : false;
  const activity = performance?.activity || [];

  const runSimulation = async () => {
    if (!selectedZone) return;
    setSimulationLoading(true);
    setSimulationError('');
    setSimulation(null);
    try {
      const simulationResponse = await fetch(`${apiBackendUrl}/api/pipelines/what-if-simulation`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_zone_id: 'ZONE-B', target_zone_id: selectedZone })
      });
      if (!simulationResponse.ok) throw new Error('The what-if simulation could not be completed.');
      const result = await simulationResponse.json();
      if (result.status !== 'success') throw new Error(result.error || 'The what-if simulation could not be completed.');
      const comparison = result.data.comparison;
      setSimulation({
        zone: comparison.simulated.name, access: comparison.simulated.customerAccess,
        footfall: comparison.simulated.baselineFootfall, capacity: comparison.simulated.capacity,
        livelihood: comparison.simulated.livelihoodPotential,
        accessChange: comparison.customer_access_change_pct,
        confidence: Math.round(result.data.simulation_confidence * 100)
      });
    } catch (error) {
      setSimulationError(error.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  const currentCctv = cctvData ? (cctvData[selectedCctvZone] || cctvData[selectedCctvZone.replace('-', '_').toUpperCase()]) : null;

  return (
    <div className="zone-locator-page">
      {/* Zone Selection & CCTV Analytics Section */}
      <section className="cctv-analytics-section">
        <div className="cctv-header">
          <div>
            <span className="zone-locator-eyebrow">CCTV ANALYTICS</span>
            <h3 style={{ margin: '4px 0 0', color: '#fff', fontSize: '1.1rem' }}>Zone Camera Feed Intelligence</h3>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label htmlFor="cctv-zone-select" style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Zone Selection:</label>
            <select
              id="cctv-zone-select"
              className="cctv-zone-select"
              value={selectedCctvZone}
              onChange={(e) => setSelectedCctvZone(e.target.value)}
            >
              {CCTV_ZONE_MAP.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
        </div>

        {cctvLoading ? (
          <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '12px' }}>Loading CCTV analytics…</div>
        ) : currentCctv ? (
          <div className="cctv-metrics-grid">
            <div className="cctv-metric-card">
              <span>Average Detected People</span>
              <strong>{currentCctv.average_people != null ? currentCctv.average_people : '—'}</strong>
            </div>
            <div className="cctv-metric-card">
              <span>Peak Occupancy</span>
              <strong>{currentCctv.peak_people != null ? currentCctv.peak_people : '—'}</strong>
            </div>
            <div className="cctv-metric-card">
              <span>Average Vehicles</span>
              <strong>{currentCctv.average_vehicles != null ? currentCctv.average_vehicles : '—'}</strong>
            </div>
            <div className="cctv-metric-card">
              <span>Peak Vehicles</span>
              <strong>{currentCctv.peak_vehicles != null ? currentCctv.peak_vehicles : '—'}</strong>
            </div>
            <div className="cctv-metric-card">
              <span>Congestion Score</span>
              <strong style={{ color: currentCctv.congestion_score > 85 ? '#f87171' : '#34d399' }}>
                {currentCctv.congestion_score != null ? currentCctv.congestion_score : '—'}
              </strong>
            </div>
          </div>
        ) : (
          <div className="cctv-unavailable">CCTV data unavailable</div>
        )}
      </section>

      <div className="zone-locator-heading">
        <div>
          <span className="zone-locator-eyebrow">CURRENT DESIGNATED ZONE</span>
          <h2>Where you are authorized to vend</h2>
          <p>Your active zone and assigned vending position are shown below.</p>
        </div>
        <div className="zone-locator-cert"><ShieldCheck size={17} /> Certificate active</div>
      </div>

      <section className="zone-map-shell" aria-label="Current designated vending zone map">
        <MapContainer center={DESIGNATED_ZONE.center} zoom={17} scrollWheelZoom zoomControl={false} className="zone-locator-map">
          <TileLayer attribution='&copy; OpenStreetMap contributors &copy; CARTO' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          <Polygon positions={DESIGNATED_ZONE.boundary} pathOptions={{ color: '#8b5cf6', weight: 4, fillColor: '#6d5dfc', fillOpacity: 0.24 }}>
            <Tooltip sticky>Authorized vending boundary</Tooltip>
          </Polygon>
          {isOutsideZone && <Polyline positions={[vendorLocation, DESIGNATED_ZONE.center]} pathOptions={{ color: '#a5b4fc', weight: 2, dashArray: '7 9', opacity: 0.75 }} />}
          <Marker position={DESIGNATED_ZONE.center} icon={zoneMarker}>
            <Popup>{DESIGNATED_ZONE.name}<br />Assigned Slot #{DESIGNATED_ZONE.slot}</Popup>
          </Marker>
          {vendorLocation && (
            <Marker position={vendorLocation} icon={locationMarker}>
              <Tooltip direction="top" offset={[0, -16]}>Your current location</Tooltip>
            </Marker>
          )}
        </MapContainer>

        <aside className="zone-status-card">
          <span className="zone-card-label">Your Designated Zone</span>
          <h3>{DESIGNATED_ZONE.name}</h3>
          <span className="zone-active-badge">{DESIGNATED_ZONE.status}</span>
          <dl>
            <div><dt>Capacity</dt><dd>{DESIGNATED_ZONE.capacity} vendors</dd></div>
            <div><dt>Your Slot</dt><dd>#{DESIGNATED_ZONE.slot}</dd></div>
            <div><dt>Valid Until</dt><dd>{DESIGNATED_ZONE.validUntil}</dd></div>
          </dl>
        </aside>

        <div className="zone-map-legend" aria-label="Map legend">
          <span><i className="legend-location" />Your Location</span>
          <span><i className="legend-zone" />Your Designated Zone</span>
          <span><i className="legend-boundary" />Zone Boundary</span>
        </div>

        <aside className="zone-summary-card">
          <div className="zone-summary-title">
            <div className="zone-summary-icon"><Store size={21} /></div>
            <div><h3>{DESIGNATED_ZONE.name}</h3><p>Authorized vending zone</p></div>
          </div>
          <div className="zone-summary-stats">
            <div><strong>{DESIGNATED_ZONE.capacity}</strong><span>Available Capacity</span></div>
            <div><strong>{DESIGNATED_ZONE.slot}</strong><span>Your Slot</span></div>
            <div><strong className="active-value">{DESIGNATED_ZONE.status}</strong><span>Certificate Status</span></div>
          </div>
          <button type="button" className="zone-details-button" onClick={() => setDetailsOpen(true)}>View Zone Details <ArrowRight size={17} /></button>
        </aside>
      </section>

      <section className="zone-performance-section">
        <div className="locator-section-heading">
          <div><span className="zone-locator-eyebrow">ZONE PERFORMANCE</span><h2>Understand your zone</h2><p>Understand activity and conditions in your designated zone.</p></div>
          <span className="performance-updated"><span /> Updated today</span>
        </div>

        <div className="performance-metrics">
          <article><Activity size={18} /><span>Pedestrian Footfall</span><strong>{performance ? performance.footfall.toLocaleString() : '—'} <small>/ hr</small></strong></article>
          <article><Users size={18} /><span>Vendor Activity</span><strong>{performance?.activeVendors ?? '—'} <small>/ {performance?.capacity ?? '—'} slots</small></strong></article>
          <article><Route size={18} /><span>Customer Access</span><strong>{performance?.customerAccess ?? '—'} <small>/ 10</small></strong></article>
          <article><Scale size={18} /><span>Zone Balance</span><strong>{performance?.zoneBalance ?? '—'} <small>/ 10</small></strong></article>
        </div>

        {performanceError && <div className="simulation-error">{performanceError}</div>}

        <div className="activity-panel">
          <div className="activity-panel-header">
            <div><h3>7-Day Zone Activity</h3><p>Daily pedestrian movement and active vending slots</p></div>
            <div className="activity-legend"><span><i className="footfall-dot" /> Pedestrian footfall</span><span><i className="vendors-dot" /> Vendor activity</span></div>
          </div>
          <div className="activity-chart" role="img" aria-label="Seven-day pedestrian footfall and vendor activity chart">
            <svg viewBox="0 0 760 230" preserveAspectRatio="none">
              {[35, 80, 125, 170].map((y) => <line key={y} x1="42" y1={y} x2="730" y2={y} className="chart-grid-line" />)}
              <polyline points={activity.map((item, index) => `${55 + index * 110},${190 - ((item.footfall - 1500) / 1100) * 145}`).join(' ')} className="footfall-line" />
              <polyline points={activity.map((item, index) => `${55 + index * 110},${190 - ((item.vendors - 25) / 10) * 145}`).join(' ')} className="vendors-line" />
              {activity.map((item, index) => <circle key={`f-${item.day}`} cx={55 + index * 110} cy={190 - ((item.footfall - 1500) / 1100) * 145} r="4" className="footfall-point" />)}
              {activity.map((item, index) => <circle key={`v-${item.day}`} cx={55 + index * 110} cy={190 - ((item.vendors - 25) / 10) * 145} r="4" className="vendors-point" />)}
            </svg>
            <div className="chart-days">{activity.map((item) => <span key={item.day}>{item.day}</span>)}</div>
          </div>
        </div>

        {performance && <aside className="zone-insight-card"><div><Sparkles size={18} /><strong>AI Zone Insight</strong></div><p>{performance.optimizer.recommendation}</p></aside>}
      </section>

      <section className="what-if-section">
        <div className="locator-section-heading"><div><span className="zone-locator-eyebrow">OPTIONAL SIMULATION</span><h2>What If You Move?</h2><p>Compare your current zone with another possible vending zone.</p></div></div>
        <div className="simulation-builder">
          <article className="current-zone-compare">
            <span className="compare-label">CURRENT ZONE</span><h3>{DESIGNATED_ZONE.name}</h3>
            <dl><div><dt>Customer Access</dt><dd>{performance?.customerAccess ?? '—'}/10</dd></div><div><dt>Footfall</dt><dd>{performance ? performance.footfall.toLocaleString() : '—'}/hr</dd></div><div><dt>Capacity</dt><dd>{performance?.capacity ?? '—'} vendors</dd></div></dl>
          </article>
          <div className="simulation-control">
            <span className="compare-label">SIMULATE ANOTHER ZONE</span>
            <label htmlFor="zone-simulation-select">Select a zone</label>
            <div className="simulation-select-wrap"><select id="zone-simulation-select" value={selectedZone} onChange={(event) => { setSelectedZone(event.target.value); setSimulation(null); }}><option value="">Select a zone</option>{candidateZones.map((zone) => <option key={zone.id} value={zone.id}>{zone.name}</option>)}</select><ChevronDown size={17} /></div>
            <button type="button" className="run-simulation-button" disabled={!selectedZone || simulationLoading} onClick={runSimulation}>{simulationLoading ? 'Running Simulation…' : 'Run What-If Simulation'} <ArrowRight size={17} /></button>
            <p className="simulation-note">This is only a comparison. Your current assigned zone will not change.</p>
          </div>
        </div>

        {simulationError && <div className="simulation-error">{simulationError}</div>}
        {simulation && (
          <div className="simulation-result">
            <div className="simulation-result-header"><div><span className="zone-locator-eyebrow">SIMULATION RESULT</span><h3>Current vs Simulated</h3></div><span>{simulation.zone}</span></div>
            <div className="comparison-table" role="table" aria-label="Current and simulated zone comparison">
              <div className="comparison-row comparison-head" role="row"><span>Metric</span><span>Current</span><span>Simulated</span></div>
              <div className="comparison-row" role="row"><span>Customer Access</span><strong>{performance?.customerAccess}</strong><strong>{simulation.access}</strong></div>
              <div className="comparison-row" role="row"><span>Pedestrian Flow</span><strong>{performance?.footfall.toLocaleString()}/hr</strong><strong>{simulation.footfall.toLocaleString()}/hr</strong></div>
              <div className="comparison-row" role="row"><span>Vendor Capacity</span><strong>{performance?.capacity}</strong><strong>{simulation.capacity}</strong></div>
              <div className="comparison-row" role="row"><span>Livelihood Potential</span><strong>8.1</strong><strong>{simulation.livelihood}</strong></div>
            </div>
            <aside className="simulation-insight"><div><Sparkles size={18} /><strong>AI Simulation Insight</strong></div><p>This zone could provide approximately {simulation.accessChange}% change in customer access based on the recorded zone data.</p><span>Simulation Confidence: {simulation.confidence}%</span></aside>
          </div>
        )}
      </section>

      <section className={`decision-process ${decisionOpen ? 'open' : ''}`}>
        <button type="button" onClick={() => setDecisionOpen((open) => !open)} aria-expanded={decisionOpen}><div><span className="zone-locator-eyebrow">FOR PROJECT REVIEW</span><h2>AI Decision Process</h2></div><ChevronDown size={20} /></button>
        {decisionOpen && <div className="decision-flow">{[
          ['Zone Data', 'Ready'], ['Footfall Fusion', '92% confidence'], ['Zone Optimization', 'Verified'], ['What-If Simulation', simulation ? 'Complete' : 'Ready'], ['Impact Analysis', simulation ? 'Complete' : 'Waiting'], ['Verification', simulation ? 'Verified' : 'Ready']
        ].map(([name, status], index, all) => <React.Fragment key={name}><div className="decision-node"><i>✓</i><strong>{name}</strong><span>{status}</span></div>{index < all.length - 1 && <div className="decision-connector"><span /></div>}</React.Fragment>)}</div>}
      </section>

      {detailsOpen && (
        <div className="zone-detail-backdrop" role="presentation" onMouseDown={() => setDetailsOpen(false)}>
          <section className="zone-detail-panel" role="dialog" aria-modal="true" aria-labelledby="zone-detail-title" onMouseDown={(event) => event.stopPropagation()}>
            <button type="button" className="zone-detail-close" aria-label="Close zone details" onClick={() => setDetailsOpen(false)}><X size={20} /></button>
            <span className="zone-locator-eyebrow">AUTHORIZED ZONE DETAILS</span>
            <h2 id="zone-detail-title">{DESIGNATED_ZONE.name}</h2>
            <span className="zone-active-badge">{DESIGNATED_ZONE.status}</span>
            <div className="zone-detail-grid">
              <div><MapPin size={18} /><span>Exact designated area</span><strong>{DESIGNATED_ZONE.area}</strong></div>
              <div><Clock3 size={18} /><span>Operating hours</span><strong>{DESIGNATED_ZONE.operatingHours}</strong></div>
              <div><Store size={18} /><span>Vendor capacity</span><strong>{DESIGNATED_ZONE.capacity} vendors</strong></div>
              <div><Navigation size={18} /><span>Assigned slot</span><strong>Slot #{DESIGNATED_ZONE.slot}</strong></div>
              <div><ShieldCheck size={18} /><span>Certificate validity</span><strong>Until {DESIGNATED_ZONE.validUntil}</strong></div>
            </div>
            <div className="zone-rules"><h3>Zone rules</h3><ol>{DESIGNATED_ZONE.rules.map((rule) => <li key={rule}>{rule}</li>)}</ol></div>
          </section>
        </div>
      )}
    </div>
  );
}
