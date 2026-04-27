
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
const getMarkerIcon = (urgency) => {
  const color = urgency === 'High' ? '#ef4444' : urgency === 'Medium' ? '#f97316' : '#10b981';
  
  const svg = `<svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C16 16.8 19 13.5 19 9C19 5.1 15.9 2 12 2C8.1 2 5 5.1 5 9C5 13.5 8 16.8 12 21Z" fill="${color}" stroke="white" stroke-width="2"/>
    <circle cx="12" cy="9" r="3" fill="white"/>
  </svg>`;
  
  return L.divIcon({
    html: svg,
    className: 'custom-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
};

const MapSection = ({ reports }) => {
  const center = [23.25, 77.41]; // Default to Bhopal

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 mb-8 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-slate-900">Incident Heatmap</h3>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500" /> High</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-500" /> Medium</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-emerald-500" /> Low</div>
        </div>
      </div>
      <div className="h-[500px] w-full rounded-2xl overflow-hidden border border-slate-100 z-0">
        <MapContainer center={center} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              icon={getMarkerIcon(report.urgency)}
            >
              <Popup>
                <div className="p-1">
                  <h4 className="font-bold text-slate-900">{report.issue}</h4>
                  <p className="text-sm text-slate-600 mb-1">{report.area}</p>
                  <p className="text-xs text-slate-500">{report.people} people affected</p>
                  <div className={`mt-2 inline-block px-2 py-1 rounded text-[10px] uppercase font-bold
                    ${report.urgency === 'High' ? 'bg-red-100 text-red-600' : 
                      report.urgency === 'Medium' ? 'bg-orange-100 text-orange-600' : 
                      'bg-emerald-100 text-emerald-600'}
                  `}>
                    {report.urgency} Priority
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapSection;
