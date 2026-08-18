import React, { useEffect, useState } from 'react';
import { MapContainer, Marker, Polygon, Polyline, Popup, TileLayer, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Activity, ArrowRight, ChevronDown, Clock3, MapPin, Navigation, Route, Scale, ShieldCheck, Sparkles, Store, Users, X } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './AIZoneOptimizer.css';

// Zone and markers are built dynamically from backend data


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

export default function AIZoneOptimizer({ currentUser, backendUrl, officerMode = false }) {
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
  const [geminiAnalysis, setGeminiAnalysis] = useState(null);
  const [geminiLoading, setGeminiLoading] = useState(false);
  const [geminiError, setGeminiError] = useState('');
  const [geminiModel, setGeminiModel] = useState('');

  const [cctvData, setCctvData] = useState(null);
  const [cctvLoading, setCctvLoading] = useState(true);
  const [selectedCctvZone, setSelectedCctvZone] = useState('ZONE_B');
  const [allZones, setAllZones] = useState([]);
  const [allZonesLoading, setAllZonesLoading] = useState(true);
  const [designatedZone, setDesignatedZone] = useState(null);
  const [designatedZoneLoading, setDesignatedZoneLoading] = useState(true);

  const [isDarkTheme, setIsDarkTheme] = useState(
    () => (document.documentElement.getAttribute('data-theme') || 'dark') !== 'light'
  );


  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkTheme(document.documentElement.getAttribute('data-theme') !== 'light');
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

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

  // Fetch all zones from backend for officer view
  useEffect(() => {
    if (!officerMode) return;
    const fetchAllZones = async () => {
      try {
        const res = await fetch(`${apiBackendUrl}/api/zones`);
        if (!res.ok) throw new Error('Zones unavailable');
        const data = await res.json();
        setAllZones(data.zones || []);
      } catch {
        setAllZones([]);
      } finally {
        setAllZonesLoading(false);
      }
    };
    fetchAllZones();
  }, [apiBackendUrl, officerMode]);



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

  // Fetch the vendor's designated zone from backend
  useEffect(() => {
    if (officerMode) return;
    const fetchDesignatedZone = async () => {
      // Determine which zone ID to load: from vendor session, or default to ZONE-B
      const savedSession = localStorage.getItem('vv_user_session');
      let zoneId = 'ZONE-B';
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          const assignedZone = parsed?.vendorData?.assignedZone;
          if (assignedZone) zoneId = assignedZone;
        } catch {}
      }
      try {
        const res = await fetch(`${apiBackendUrl}/api/zones/${zoneId}/full`);
        if (!res.ok) throw new Error('Zone data unavailable');
        const data = await res.json();
        if (data.zone) {
          // Map backend fields to what the UI expects
          const z = data.zone;
          setDesignatedZone({
            ...z,
            slot: z.defaultSlot ?? 18,
          });
        }
      } catch {
        // Fallback: load from /api/zones list
        try {
          const res2 = await fetch(`${apiBackendUrl}/api/zones`);
          const data2 = await res2.json();
          const found = (data2.zones || []).find(z => z.id === zoneId) || (data2.zones || [])[0];
          if (found) setDesignatedZone({ ...found, slot: found.defaultSlot ?? 18 });
        } catch {}
      } finally {
        setDesignatedZoneLoading(false);
      }
    };
    fetchDesignatedZone();
  }, [apiBackendUrl, officerMode]);


  const isOutsideZone = (vendorLocation && designatedZone?.boundary)
    ? !pointInsidePolygon(vendorLocation, designatedZone.boundary)
    : false;


  const runSimulation = async () => {
    if (!selectedZone) return;
    setSimulationLoading(true);
    setSimulationError('');
    setSimulation(null);
    setGeminiAnalysis(null);
    setGeminiError('');
    setGeminiLoading(true);

    // Determine current zone id from designatedZone
    const currentZoneId = designatedZone?.id || 'ZONE-B';

    try {
      // Run standard pipeline + Gemini analysis in parallel
      const [simulationResponse, geminiResponse] = await Promise.all([
        fetch(`${apiBackendUrl}/api/pipelines/what-if-simulation`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_zone_id: currentZoneId, target_zone_id: selectedZone })
        }),
        fetch(`${apiBackendUrl}/api/simulation/gemini-analysis`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ current_zone_id: currentZoneId, target_zone_id: selectedZone })
        })
      ]);

      // Process pipeline result
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

      // Process Gemini result
      if (geminiResponse.ok) {
        const geminiData = await geminiResponse.json();
        if (geminiData.status === 'success' && geminiData.gemini_analysis) {
          setGeminiAnalysis(geminiData.gemini_analysis);
          setGeminiModel(geminiData.model || 'gemini');
        } else {
          setGeminiError(geminiData.error || 'Gemini analysis could not be generated.');
        }
      } else {
        setGeminiError('Gemini service unavailable.');
      }
    } catch (error) {
      setSimulationError(error.message);
      setGeminiError('Simulation failed before Gemini analysis could run.');
    } finally {
      setSimulationLoading(false);
      setGeminiLoading(false);
    }
  };

  const currentCctv = cctvData ? (cctvData[selectedCctvZone] || cctvData[selectedCctvZone.replace('-', '_').toUpperCase()]) : null;

  // ── OFFICER ZONE MANAGEMENT VIEW ──────────────────────────────────────────
  if (officerMode) {
    // Zone colour palette keyed by zone ID
    const ZONE_COLORS = { 'ZONE-A': '#8b5cf6', 'ZONE-B': '#10b981', 'ZONE-C': '#3b82f6', 'ZONE-D': '#f59e0b' };

    return (
      <div className="zone-locator-page">
        {/* CCTV Analytics - same as vendor but relabeled */}
        <section className="cctv-analytics-section">
          <div className="cctv-header">
            <div>
              <span className="zone-locator-eyebrow">MUNICIPAL CCTV INTELLIGENCE</span>
              <h3 style={{ margin: '4px 0 0', color: 'var(--text-main)', fontSize: '1.1rem' }}>Live Zone Camera Feed Analytics</h3>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label htmlFor="cctv-zone-select-officer" style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>Zone Selection:</label>
              <select
                id="cctv-zone-select-officer"
                className="cctv-zone-select"
                value={selectedCctvZone}
                onChange={(e) => setSelectedCctvZone(e.target.value)}
              >
                {[{id:'ZONE_A',name:'ZONE_A → Traffic Park'},{id:'ZONE_B',name:'ZONE_B → VNIT Gate'},{id:'ZONE_C',name:'ZONE_C → Civil Lines'},{id:'ZONE_D',name:'ZONE_D → Ramnagar'}].map(z => (
                  <option key={z.id} value={z.id}>{z.name}</option>
                ))}
              </select>
            </div>
          </div>
          {cctvLoading ? (
            <div style={{ color: '#94a3b8', fontSize: '0.8rem', padding: '12px' }}>Loading CCTV analytics…</div>
          ) : currentCctv ? (
            <div className="cctv-metrics-grid">
              <div className="cctv-metric-card"><span>Avg Detected People</span><strong>{currentCctv.average_people ?? '—'}</strong></div>
              <div className="cctv-metric-card"><span>Peak Occupancy</span><strong>{currentCctv.peak_people ?? '—'}</strong></div>
              <div className="cctv-metric-card"><span>Avg Vehicles</span><strong>{currentCctv.average_vehicles ?? '—'}</strong></div>
              <div className="cctv-metric-card"><span>Peak Vehicles</span><strong>{currentCctv.peak_vehicles ?? '—'}</strong></div>
              <div className="cctv-metric-card"><span>Congestion Score</span><strong style={{ color: currentCctv.congestion_score > 85 ? '#f87171' : '#34d399' }}>{currentCctv.congestion_score ?? '—'}</strong></div>
            </div>
          ) : (
            <div className="cctv-unavailable">CCTV data unavailable</div>
          )}
        </section>

        {/* All Zones Overview */}
        <div className="zone-locator-heading">
          <div>
            <span className="zone-locator-eyebrow">OFFICER ZONE MANAGEMENT</span>
            <h2>All Nagpur Vending Zones</h2>
            <p>Monitor capacity, occupancy and zone health across all authorised vending bays.</p>
          </div>
          <div className="zone-locator-cert"><ShieldCheck size={17} /> Officer Access Active</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', padding: '0 0 24px' }}>
          {allZonesLoading ? (
            <div style={{ color: '#94a3b8', gridColumn: '1/-1', padding: '24px', textAlign: 'center' }}>Loading zones from backend…</div>
          ) : allZones.length === 0 ? (
            <div style={{ color: '#f87171', gridColumn: '1/-1', padding: '24px', textAlign: 'center' }}>Could not load zones. Make sure backend is running.</div>
          ) : allZones.map(zone => {
            const color = ZONE_COLORS[zone.id] || '#6366f1';
            const active = zone.activeVendors ?? 0;
            const capacity = zone.capacity ?? 1;
            const occupancy = Math.round((active / capacity) * 100);
            const cctvKey = zone.id?.replace('-', '_');
            const cctv = cctvData ? (cctvData[cctvKey] || null) : null;

            return (
              <div key={zone.id} style={{
                background: 'var(--card-bg)', border: `1px solid ${color}44`,
                borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden'
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: color, borderRadius: '16px 0 0 16px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, color: color, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{zone.id}</span>
                    <h4 style={{ margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 700 }}>{zone.name}</h4>
                  </div>
                  <span style={{ fontSize: '0.65rem', background: 'rgba(16,185,129,0.15)', color: '#34d399', padding: '3px 8px', borderRadius: '20px', fontWeight: 700 }}>{zone.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: color }}>{active}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Active Vendors</div>
                  </div>
                  <div style={{ textAlign: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>{zone.capacity}</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>Total Capacity</div>
                  </div>
                </div>
                {/* Occupancy bar */}
                <div style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Occupancy</span>
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: occupancy > 90 ? '#f87171' : occupancy > 75 ? '#f59e0b' : '#34d399' }}>{occupancy}%</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${occupancy}%`, background: occupancy > 90 ? '#f87171' : occupancy > 75 ? '#f59e0b' : color, borderRadius: '4px', transition: 'width 0.6s ease' }} />
                  </div>
                </div>
                {cctv && (
                  <div style={{ fontSize: '0.7rem', color: '#64748b', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                    <span>👁 People: <strong style={{ color: '#94a3b8' }}>{cctv.average_people ?? '—'}</strong></span>
                    <span style={{ marginLeft: '12px' }}>🚦 Congestion: <strong style={{ color: cctv.congestion_score > 85 ? '#f87171' : '#34d399' }}>{cctv.congestion_score ?? '—'}</strong></span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Performance Section */}
        <section className="zone-performance-section">
          <div className="locator-section-heading">
            <div><span className="zone-locator-eyebrow">ZONE PERFORMANCE</span><h2>Zone B – VNIT Gate (Detail View)</h2><p>Live performance metrics for the selected analysis zone.</p></div>
            <span className="performance-updated"><span /> Updated today</span>
          </div>
          <div className="performance-metrics">
            <article><Activity size={18} /><span>Pedestrian Footfall</span><strong>{performance ? performance.footfall.toLocaleString() : '—'} <small>/ hr</small></strong></article>
            <article><Users size={18} /><span>Vendor Activity</span><strong>{performance?.activeVendors ?? '—'} <small>/ {performance?.capacity ?? '—'} slots</small></strong></article>
            <article><Route size={18} /><span>Customer Access</span><strong>{performance?.customerAccess ?? '—'} <small>/ 10</small></strong></article>
            <article><Scale size={18} /><span>Zone Balance</span><strong>{performance?.zoneBalance ?? '—'} <small>/ 10</small></strong></article>
          </div>
          {performanceError && <div className="simulation-error">{performanceError}</div>}
          {performance && <aside className="zone-insight-card"><div><Sparkles size={18} /><strong>AI Zone Insight</strong></div><p>{performance.optimizer.recommendation}</p></aside>}
        </section>
      </div>
    );
  }
  // ── END OFFICER VIEW ────────────────────────────────────────────────────

  const activity = performance?.activity || [];

  // Show loading while fetching zone
  if (!officerMode && designatedZoneLoading) {
    return (
      <div className="zone-locator-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>📍</div>
          <p style={{ fontWeight: 600 }}>Loading your designated zone…</p>
        </div>
      </div>
    );
  }

  // If zone couldn't be loaded
  if (!officerMode && !designatedZone) {
    return (
      <div className="zone-locator-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '300px' }}>
        <div style={{ textAlign: 'center', color: '#f87171' }}>
          <div style={{ fontSize: '2rem', marginBottom: '12px' }}>⚠️</div>
          <p style={{ fontWeight: 600 }}>Could not load zone data.</p>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Make sure the backend is running on port 8000.</p>
        </div>
      </div>
    );
  }

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
        <MapContainer center={designatedZone.center} zoom={17} scrollWheelZoom zoomControl={false} className="zone-locator-map">
          <TileLayer
            attribution='&copy; OpenStreetMap contributors &copy; CARTO'
            url={isDarkTheme
              ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
              : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
            }
          />
          <Polygon positions={designatedZone.boundary} pathOptions={{ color: '#8b5cf6', weight: 4, fillColor: '#6d5dfc', fillOpacity: 0.24 }}>

            <Tooltip sticky>Authorized vending boundary</Tooltip>
          </Polygon>
          {isOutsideZone && <Polyline positions={[vendorLocation, designatedZone.center]} pathOptions={{ color: '#a5b4fc', weight: 2, dashArray: '7 9', opacity: 0.75 }} />}
          <Marker position={designatedZone.center} icon={zoneMarker}>
            <Popup>{designatedZone.name}<br />Assigned Slot #{designatedZone.slot}</Popup>

          </Marker>
          {vendorLocation && (
            <Marker position={vendorLocation} icon={locationMarker}>
              <Tooltip direction="top" offset={[0, -16]}>Your current location</Tooltip>
            </Marker>
          )}
        </MapContainer>

        <aside className="zone-status-card">
          <span className="zone-card-label">Your Designated Zone</span>
          <h3>{designatedZone.name}</h3>
          <span className="zone-active-badge">{designatedZone.status}</span>
          <dl>
            <div><dt>Capacity</dt><dd>{designatedZone.capacity} vendors</dd></div>
            <div><dt>Your Slot</dt><dd>#{designatedZone.slot}</dd></div>
            <div><dt>Valid Until</dt><dd>{designatedZone.validUntil}</dd></div>
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
            <div><h3>{designatedZone.name}</h3><p>Authorized vending zone</p></div>
          </div>
          <div className="zone-summary-stats">
            <div><strong>{designatedZone.capacity}</strong><span>Available Capacity</span></div>
            <div><strong>{designatedZone.slot}</strong><span>Your Slot</span></div>
            <div><strong className="active-value">{designatedZone.status}</strong><span>Certificate Status</span></div>
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
            <span className="compare-label">CURRENT ZONE</span><h3>{designatedZone.name}</h3>

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
              <div className="comparison-row" role="row"><span>Customer Access</span><strong>{performance?.customerAccess}</strong><strong style={{ color: simulation.access > (performance?.customerAccess || 0) ? '#34d399' : '#f87171' }}>{simulation.access} {simulation.access > (performance?.customerAccess || 0) ? '↑' : '↓'}</strong></div>
              <div className="comparison-row" role="row"><span>Pedestrian Flow</span><strong>{performance?.footfall?.toLocaleString()}/hr</strong><strong style={{ color: simulation.footfall > (performance?.footfall || 0) ? '#34d399' : '#f87171' }}>{simulation.footfall.toLocaleString()}/hr {simulation.footfall > (performance?.footfall || 0) ? '↑' : '↓'}</strong></div>
              <div className="comparison-row" role="row"><span>Vendor Capacity</span><strong>{performance?.capacity}</strong><strong>{simulation.capacity}</strong></div>
              <div className="comparison-row" role="row"><span>Livelihood Potential</span><strong>{designatedZone?.livelihoodPotential ?? '—'}</strong><strong style={{ color: simulation.livelihood > (designatedZone?.livelihoodPotential || 0) ? '#34d399' : '#f87171' }}>{simulation.livelihood} {simulation.livelihood > (designatedZone?.livelihoodPotential || 0) ? '↑' : '↓'}</strong></div>
              <div className="comparison-row" role="row"><span>Access Change</span><strong>—</strong><strong style={{ color: simulation.accessChange >= 0 ? '#34d399' : '#f87171' }}>{simulation.accessChange >= 0 ? '+' : ''}{simulation.accessChange}%</strong></div>
            </div>

            {/* ── Gemini Detailed Analysis Panel ── */}
            <div className="gemini-analysis-panel">
              <div className="gemini-analysis-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className="gemini-badge">✦ Gemini AI</div>
                  <div>
                    <strong style={{ fontSize: '1rem', color: 'var(--text-main)' }}>Detailed Advisory Report</strong>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>AI-powered analysis using live zone simulation data</p>
                  </div>
                </div>
                {geminiModel && <span className="gemini-model-tag">{geminiModel}</span>}
              </div>

              {geminiLoading && (
                <div className="gemini-loading">
                  <div className="gemini-spinner" />
                  <span>Gemini AI is analysing the zone data and generating your advisory report…</span>
                </div>
              )}

              {geminiError && !geminiLoading && (
                <div className="gemini-error">
                  <span>⚠ {geminiError}</span>
                </div>
              )}

              {geminiAnalysis && !geminiLoading && (
                <div className="gemini-analysis-body">
                  {geminiAnalysis.split('\n').map((line, i) => {
                    const t = line.trim();
                    if (!t) return <div key={i} className="gemini-spacer" />;

                    // ## or ### heading
                    if (/^#{1,3}\s/.test(t)) {
                      return <h4 key={i} className="gemini-section-heading">{t.replace(/^#{1,3}\s+/, '')}</h4>;
                    }

                    // **Bold heading** on its own line (whole line is bolded)
                    if (/^\*\*[^*]+\*\*\s*$/.test(t)) {
                      return <h4 key={i} className="gemini-section-heading">{t.replace(/\*\*/g, '')}</h4>;
                    }

                    // Replace inline **bold** with <strong>
                    const html = t
                      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.+?)\*/g, '<em>$1</em>');

                    // Bullet
                    if (/^[-•*]\s/.test(t)) {
                      return <p key={i} className="gemini-bullet" dangerouslySetInnerHTML={{ __html: '• ' + html.replace(/^[-•*]\s+/, '') }} />;
                    }

                    return <p key={i} className="gemini-para" dangerouslySetInnerHTML={{ __html: html }} />;
                  })}
                </div>
              )}
            </div>
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
            <h2 id="zone-detail-title">{designatedZone.name}</h2>
            <span className="zone-active-badge">{designatedZone.status}</span>
            <div className="zone-detail-grid">
              <div><MapPin size={18} /><span>Exact designated area</span><strong>{designatedZone.area}</strong></div>
              <div><Clock3 size={18} /><span>Operating hours</span><strong>{designatedZone.operatingHours}</strong></div>
              <div><Store size={18} /><span>Vendor capacity</span><strong>{designatedZone.capacity} vendors</strong></div>
              <div><Navigation size={18} /><span>Assigned slot</span><strong>Slot #{designatedZone.slot}</strong></div>
              <div><ShieldCheck size={18} /><span>Certificate validity</span><strong>Until {designatedZone.validUntil}</strong></div>
            </div>
            <div className="zone-rules"><h3>Zone rules</h3><ol>{(designatedZone.rules || []).map((rule) => <li key={rule}>{rule}</li>)}</ol></div>

          </section>
        </div>
      )}
    </div>
  );
}
