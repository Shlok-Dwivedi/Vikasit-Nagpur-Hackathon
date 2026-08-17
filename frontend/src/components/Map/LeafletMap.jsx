import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './LeafletMap.css';

// Fix default Leaflet icon paths in Vite bundle
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom colored SVG markers for vendors & zones
const createCustomIcon = (color) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `<div style="
      background-color: ${color};
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 10px ${color};
    "></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9]
  });
};

const vendorGreenIcon = createCustomIcon('#10b981');
const vendorAmberIcon = createCustomIcon('#f59e0b');
const vendorRedIcon = createCustomIcon('#ef4444');

export default function LeafletMap({ 
  center = [21.1255, 79.0510], 
  zoom = 14,
  height = '420px',
  showZones = true 
}) {

  // Sample Vendor Locations in Nagpur Civic Zone
  const vendors = [
    {
      id: 'V-1029',
      name: 'Ramesh Fruit Stall',
      category: 'Perishable Food',
      lat: 21.1275,
      lng: 79.0530,
      status: 'vending',
      zone: 'Zone A - Market Sq',
      qrVerified: true
    },
    {
      id: 'V-1088',
      name: 'Priya Fast Food Cart',
      category: 'Prepared Snacks',
      lat: 21.1220,
      lng: 79.0480,
      status: 'vending',
      zone: 'Zone B - VNIT Gate',
      qrVerified: true
    },
    {
      id: 'V-2041',
      name: 'Sunil Garment Vendor',
      category: 'Textiles',
      lat: 21.1310,
      lng: 79.0580,
      status: 'restricted',
      zone: 'Zone C - Metro Corridor',
      qrVerified: false
    },
    {
      id: 'V-3005',
      name: 'Unauthorized Chai Counter',
      category: 'Beverages',
      lat: 21.1180,
      lng: 79.0520,
      status: 'no-vending',
      zone: 'Strict No-Vending Buffer',
      qrVerified: false
    }
  ];

  // Polygon Boundaries for Vending & No-Vending Zones
  const greenZonePolygon = [
    [21.1260, 79.0500],
    [21.1300, 79.0550],
    [21.1280, 79.0590],
    [21.1240, 79.0530]
  ];

  const redZonePolygon = [
    [21.1160, 79.0500],
    [21.1200, 79.0550],
    [21.1190, 79.0580],
    [21.1150, 79.0520]
  ];

  return (
    <div className="map-wrapper" style={{ height }}>
      <div className="map-badge-overlay">
        <div className="map-legend">
          <div className="legend-item"><span className="dot-green"></span> Designated Vending Zone</div>
          <div className="legend-item"><span className="dot-amber"></span> Time Restricted</div>
          <div className="legend-item"><span className="dot-red"></span> No-Vending Zone</div>
        </div>
      </div>

      <MapContainer 
        center={center} 
        zoom={zoom} 
        scrollWheelZoom={false}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {showZones && (
          <>
            {/* Designated Vending Zone Polygon */}
            <Polygon 
              positions={greenZonePolygon}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.25,
                weight: 2
              }}
            />

            {/* No Vending Zone Polygon */}
            <Polygon 
              positions={redZonePolygon}
              pathOptions={{
                color: '#ef4444',
                fillColor: '#ef4444',
                fillOpacity: 0.3,
                weight: 2
              }}
            />

            {/* High Density Heatmap Circle Simulation */}
            <Circle 
              center={[21.1275, 79.0530]} 
              radius={300}
              pathOptions={{ color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.15 }}
            />
          </>
        )}

        {/* Vendor Markers */}
        {vendors.map((vendor) => {
          let icon = vendorGreenIcon;
          if (vendor.status === 'restricted') icon = vendorAmberIcon;
          if (vendor.status === 'no-vending') icon = vendorRedIcon;

          return (
            <Marker key={vendor.id} position={[vendor.lat, vendor.lng]} icon={icon}>
              <Popup>
                <div className="vendor-popup">
                  <h4>{vendor.name}</h4>
                  <p><strong>ID:</strong> {vendor.id}</p>
                  <p><strong>Category:</strong> {vendor.category}</p>
                  <p><strong>Location:</strong> {vendor.zone}</p>
                  <div className={`popup-tag ${vendor.status}`}>
                    {vendor.status === 'vending' && 'Verified Vending Permit'}
                    {vendor.status === 'restricted' && 'Time Restricted (6 AM - 2 PM)'}
                    {vendor.status === 'no-vending' && 'Unauthorized / Non-Vending Zone'}
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
