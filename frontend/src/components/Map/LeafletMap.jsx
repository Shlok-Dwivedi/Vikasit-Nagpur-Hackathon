import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, LayersControl, Polygon, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, RotateCcw, MapPin, Layers } from 'lucide-react';
import './LeafletMap.css';

// Fix default Leaflet icon paths in Vite bundle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Defined Nagpur Authorized Vending Zones with GIS Polygons & Center Coordinates
const DEFAULT_NAGPUR_ZONES = [
  {
    id: 'ZONE-A',
    key: 'ZONE_A',
    name: 'Zone A – Traffic Park / Futala',
    shortName: 'Zone A (Traffic Park)',
    center: [21.1300, 79.0680],
    boundary: [
      [21.1320, 79.0650],
      [21.1325, 79.0710],
      [21.1275, 79.0715],
      [21.1270, 79.0655]
    ],
    capacity: 40,
    activeVendors: 33,
    color: '#8b5cf6'
  },
  {
    id: 'ZONE-B',
    key: 'ZONE_B',
    name: 'Zone B – VNIT Gate',
    shortName: 'Zone B (VNIT Gate)',
    center: [21.1237, 79.0516],
    boundary: [
      [21.12445, 79.05065],
      [21.1245, 79.0525],
      [21.12305, 79.05265],
      [21.12285, 79.05085]
    ],
    capacity: 35,
    activeVendors: 31,
    color: '#10b981'
  },
  {
    id: 'ZONE-C',
    key: 'ZONE_C',
    name: 'Zone C – Civil Lines / Sitabuldi',
    shortName: 'Zone C (Civil Lines)',
    center: [21.1540, 79.0750],
    boundary: [
      [21.1560, 79.0720],
      [21.1565, 79.0780],
      [21.1515, 79.0785],
      [21.1510, 79.0725]
    ],
    capacity: 38,
    activeVendors: 36,
    color: '#3b82f6'
  },
  {
    id: 'ZONE-D',
    key: 'ZONE_D',
    name: 'Zone D – Ramnagar / Dharampeth',
    shortName: 'Zone D (Ramnagar)',
    center: [21.1350, 79.0580],
    boundary: [
      [21.1370, 79.0550],
      [21.1375, 79.0610],
      [21.1325, 79.0615],
      [21.1320, 79.0555]
    ],
    capacity: 32,
    activeVendors: 27,
    color: '#f59e0b'
  }
];

const vendorCoords = (vendor) => {
  const lat = Number(vendor?.lat);
  const lng = Number(vendor?.lng);
  return Number.isFinite(lat) && Number.isFinite(lng) ? [lat, lng] : null;
};

// Custom SVG map markers
const createCustomIcon = (color, label = '') => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 12px ${color};
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      font-size: 11px;
      font-weight: bold;
    ">${label}</div>`,
    iconSize: [26, 26],
    iconAnchor: [13, 13]
  });
};

const createZoneMarkerIcon = (label, color) => {
  return L.divIcon({
    className: 'custom-zone-marker',
    html: `<div style="
      background: rgba(15, 23, 42, 0.9);
      border: 2px solid ${color};
      color: #ffffff;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
      box-shadow: 0 4px 14px rgba(0,0,0,0.6);
      display: flex;
      align-items: center;
      gap: 5px;
    "><span style="width:7px; height:7px; border-radius:50%; background:${color};"></span>${label}</div>`,
    iconSize: [140, 30],
    iconAnchor: [70, 15]
  });
};

const vendorGreenIcon = createCustomIcon('#10b981', 'V');
const vendorAmberIcon = createCustomIcon('#f59e0b', 'P');
const searchTargetIcon = createCustomIcon('#3b82f6', '📍');

function DynamicMapController({ targetCoords, refreshKey }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
  }, [map, refreshKey]);

  useEffect(() => {
    if (targetCoords) {
      map.flyTo(targetCoords, 16, { duration: 1.2 });
    }
  }, [targetCoords, map]);
  return null;
}

export default function LeafletMap({ 
  center = [21.1458, 79.0882],
  zoom = 13,
  height = '460px',
  vendors = [],
  zones = [],
  refreshKey = 0
}) {
  const [mapKey, setMapKey] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [targetCoords, setTargetCoords] = useState(null);
  const [searchedLocationName, setSearchedLocationName] = useState('');
  const [selectedZoneId, setSelectedZoneId] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (refreshKey > 0) {
      setMapKey(prev => prev + 1);
      setTargetCoords(null);
      setSearchedLocationName('');
    }
  }, [refreshKey]);

  // Combine backend zones or fallback to defined GIS zones
  const activeZones = DEFAULT_NAGPUR_ZONES.map(dz => {
    const matchedBackend = zones.find(z => z.id === dz.id || z.id === dz.key);
    return matchedBackend ? { ...dz, ...matchedBackend } : dz;
  });

  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toLowerCase();
    if (!query) return;

    setSearchLoading(true);

    // 1. Search in Vending Zones (Name or ID)
    const matchedZone = activeZones.find(z => 
      z.name.toLowerCase().includes(query) || 
      z.id.toLowerCase().includes(query) ||
      z.key.toLowerCase().includes(query) ||
      dzMatchesQuery(z.name, query)
    );

    if (matchedZone) {
      setTargetCoords(matchedZone.center);
      setSearchedLocationName(`Zone: ${matchedZone.name}`);
      setSelectedZoneId(matchedZone.id);
      setSearchLoading(false);
      return;
    }

    // 2. Search in Vendor Names or Addresses
    const matchedVendor = vendors.find(v => 
      (v.name || '').toLowerCase().includes(query) ||
      (v.stallName || '').toLowerCase().includes(query) ||
      (v.location || '').toLowerCase().includes(query)
    );

    const vendorCoordPair = matchedVendor ? vendorCoords(matchedVendor) : null;
    if (vendorCoordPair) {
      setTargetCoords(vendorCoordPair);
      setSearchedLocationName(`Vendor: ${matchedVendor.name} (${matchedVendor.location})`);
      setSearchLoading(false);
      return;
    }

    // 3. Fallback to OpenStreetMap Nominatim Geocoding API for arbitrary address search
    try {
      const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ', Nagpur, Maharashtra')}`);
      const geoData = await geoRes.json();
      if (geoData && geoData.length > 0) {
        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData[0].lon);
        if (Number.isFinite(lat) && Number.isFinite(lon)) {
          setTargetCoords([lat, lon]);
          setSearchedLocationName(geoData[0].display_name.split(',')[0]);
          setSearchLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Geocoding search note:', err);
    }

    setSearchedLocationName(`No map coordinates found for "${searchQuery}"`);
    setSearchLoading(false);
  };

  const dzMatchesQuery = (name, q) => {
    const keywords = q.split(' ');
    return keywords.some(kw => kw.length > 2 && name.toLowerCase().includes(kw));
  };

  const handleZoneSelect = (zoneId) => {
    setSelectedZoneId(zoneId);
    if (!zoneId) return;
    const z = activeZones.find(item => item.id === zoneId || item.key === zoneId);
    if (z) {
      setTargetCoords(z.center);
      setSearchedLocationName(`Zone: ${z.name}`);
    }
  };

  const handleResetView = () => {
    setTargetCoords(null);
    setSearchedLocationName('');
    setSearchQuery('');
    setSelectedZoneId('');
    setMapKey(prev => prev + 1);
  };

  return (
    <div className="map-wrapper" style={{ height, position: 'relative' }}>
      
      {/* Interactive Search Bar & Zone Filter Overlay */}
      <div style={{ position: 'absolute', top: '12px', left: '14px', zIndex: 1000, display: 'flex', gap: '8px', flexWrap: 'wrap', maxWidth: 'calc(100% - 28px)' }}>
        
        {/* Text Search Input */}
        <form onSubmit={handleAddressSearch} style={{ display: 'flex', gap: '6px', background: 'rgba(9, 13, 22, 0.92)', backdropFilter: 'blur(8px)', padding: '6px 12px', borderRadius: '24px', border: '1px solid rgba(59, 130, 246, 0.4)', boxShadow: '0 8px 24px rgba(0,0,0,0.6)', flex: 1, minWidth: '240px' }}>
          <Search size={16} color="#60a5fa" style={{ marginTop: '8px' }} />
          <input 
            type="text" 
            placeholder="Search Zone, Vendor, or Location..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.825rem', outline: 'none' }}
          />
          <button type="submit" className="quick-act-btn" disabled={searchLoading} style={{ padding: '4px 12px', fontSize: '0.75rem', background: '#3b82f6' }}>
            <span>{searchLoading ? 'Locating…' : 'Search'}</span>
          </button>
        </form>

        {/* Zone Selector Dropdown */}
        <div style={{ background: 'rgba(9, 13, 22, 0.92)', backdropFilter: 'blur(8px)', padding: '4px 10px', borderRadius: '24px', border: '1px solid rgba(139, 92, 246, 0.4)', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={14} color="#a78bfa" />
          <select
            value={selectedZoneId}
            onChange={(e) => handleZoneSelect(e.target.value)}
            style={{ background: 'transparent', border: 'none', color: '#e2e8f0', fontSize: '0.78rem', outline: 'none', fontWeight: '600', cursor: 'pointer' }}
          >
            <option value="" style={{ background: '#0f172a', color: '#fff' }}>Select Available Zone…</option>
            {activeZones.map(z => (
              <option key={z.id} value={z.id} style={{ background: '#0f172a', color: '#fff' }}>
                {z.shortName}
              </option>
            ))}
          </select>
        </div>

      </div>



      <MapContainer 
        key={mapKey}
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', borderRadius: '14px' }}
      >
        <DynamicMapController targetCoords={targetCoords} refreshKey={refreshKey} />

        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="CartoDB Dark Theme">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="OpenStreetMap Standard">
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {/* Render Available Authorized Vending Zones Polygons & Markers */}
        {activeZones.map((zone) => (
          <React.Fragment key={zone.id}>
            <Polygon 
              positions={zone.boundary} 
              pathOptions={{ color: zone.color, weight: 3, fillColor: zone.color, fillOpacity: 0.22 }}
            >
              <Tooltip sticky>{zone.name} (Capacity: {zone.capacity})</Tooltip>
            </Polygon>

            <Marker position={zone.center} icon={createZoneMarkerIcon(zone.shortName, zone.color)}>
              <Popup>
                <div style={{ padding: '4px' }}>
                  <h4 style={{ margin: '0 0 4px', color: '#1e293b', fontSize: '0.95rem' }}>{zone.name}</h4>
                  <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#475569' }}><strong>Capacity:</strong> {zone.capacity} Vendors</p>
                  <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#475569' }}><strong>Active Vendors:</strong> {zone.activeVendors}</p>
                  <p style={{ margin: '2px 0', fontSize: '0.78rem', color: '#10b981', fontWeight: '700' }}>Status: Active Civic Vending Bay</p>
                </div>
              </Popup>
            </Marker>
          </React.Fragment>
        ))}

        {/* Dynamic Searched Location Pin */}
        {targetCoords && (
          <Marker position={targetCoords} icon={searchTargetIcon}>
            <Popup>
              <div style={{ fontWeight: 'bold', color: '#3b82f6', padding: '4px' }}>
                📍 {searchedLocationName || searchQuery}
                <p style={{ color: '#64748b', fontSize: '11px', margin: '4px 0 0' }}>Nagpur Map Search Pin</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Render Dynamic Vendor Pins */}
        {vendors.map((vendor, idx) => {
          const coords = vendorCoords(vendor);
          if (!coords) return null;
          const icon = vendor.status === 'approved' ? vendorGreenIcon : vendorAmberIcon;

          return (
            <Marker key={vendor.id || idx} position={coords} icon={icon}>
              <Popup>
                <div className="vendor-popup">
                  <h4 style={{ margin: 0, color: '#111827' }}>{vendor.name}</h4>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>ID:</strong> {vendor.id}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Stall:</strong> {vendor.stallName || vendor.name}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Category:</strong> {vendor.category}</p>
                  <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Address:</strong> {vendor.location}</p>
                  <div className="popup-tag vending" style={{ marginTop: '4px' }}>
                    Verified Vending Permit
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
