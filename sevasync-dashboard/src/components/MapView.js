
import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Marker configurations
const createIcon = (color) => new L.divIcon({
  html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
  className: 'custom-div-icon',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

const icons = {
  High: createIcon('#ef4444'),
  Medium: createIcon('#f97316'),
  Low: createIcon('#10b981'),
};

const MapView = ({ reports }) => {
  const position = [23.25, 77.41]; // Default to Bhopal

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-soft overflow-hidden h-full min-h-[500px]">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-slate-900">Incident Mapping</h3>
        <div className="flex gap-4 text-xs font-bold uppercase tracking-wider text-slate-500">
           <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/> High</span>
           <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-orange-500"/> Medium</span>
           <span className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500"/> Low</span>
        </div>
      </div>
      <div className="h-[450px] rounded-2xl overflow-hidden border border-slate-50">
        <MapContainer center={position} zoom={5} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {reports.map((report) => (
            <Marker 
              key={report.id} 
              position={[report.lat, report.lng]} 
              icon={icons[report.urgency]}
            >
              <Popup className="custom-popup">
                <div className="p-1">
                  <h4 className="font-bold text-slate-900 leading-tight mb-1">{report.issue}</h4>
                  <p className="text-xs text-slate-500 font-medium">{report.area}</p>
                  <p className="text-xs text-slate-600 mt-2 mb-2 line-clamp-2">{report.description}</p>
                  <div className="flex justify-between items-center py-2 border-t border-slate-100 mt-2">
                    <span className="text-[10px] font-bold text-slate-400">AFFECTED: {report.people}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      report.urgency === 'High' ? 'bg-red-50 text-red-600' : 
                      report.urgency === 'Medium' ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {report.urgency}
                    </span>
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

export default MapView;
