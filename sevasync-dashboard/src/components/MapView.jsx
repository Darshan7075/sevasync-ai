import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Crosshair, Target, Zap, Waves, Activity, Shield, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// --- SUB-COMPONENTS ---

function MapController({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true, duration: 1.5 });
  }, [center, zoom, map]);
  return null;
}

// --- MAIN COMPONENT ---

const MapView = ({ reports, volunteers, selectedCity, cityCoordinates, isCrisisMode, focusedLocation }) => {
  const isAllCities = selectedCity === 'All Cities';
  
  const center = useMemo(() => {
    if (focusedLocation) return [focusedLocation.lat, focusedLocation.lng];
    if (!selectedCity || selectedCity.includes('All')) return [22.3072, 73.1812];
    const cityKey = Object.keys(cityCoordinates || {}).find(k => k.toLowerCase() === selectedCity.toLowerCase());
    const coords = cityKey && cityCoordinates[cityKey] ? cityCoordinates[cityKey] : [22.3072, 73.1812];
    return coords;
  }, [selectedCity, cityCoordinates, focusedLocation]);

  const zoom = focusedLocation ? 14 : (isAllCities ? 5 : 12);

  const mapIcons = useMemo(() => {
    const createIcon = (color) => new L.divIcon({
      html: `<div class="relative flex items-center justify-center">
               <div class="absolute inset-0 blur-sm opacity-60 animate-pulse" style="background-color: ${color}"></div>
               <div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px ${color};"></div>
             </div>`,
      className: 'custom-icon',
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    });
    return { High: createIcon('#f97316'), Critical: createIcon('#ea4335'), Active: createIcon('#3b82f6'), Volunteer: createIcon('#10b981'), Resource: createIcon('#a855f7') };
  }, []);

  return (
    <div className="w-full h-full relative group">
      <MapContainer center={center} zoom={zoom} className="h-full w-full" zoomControl={false} scrollWheelZoom={false}>
        <TileLayer 
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" 
        />
        
        <MapController center={center} zoom={zoom} />

        {(reports || []).filter(r => r && !isNaN(r.lat) && !isNaN(r.lng)).map(r => (
           <Marker 
             key={r.id} 
             position={[parseFloat(r.lat), parseFloat(r.lng)]} 
             icon={r.urgency === 'High' || (r.urgency_score >= 8) ? mapIcons.Critical : ((r.urgency_score >= 5) ? mapIcons.High : mapIcons.Active)}
           >
             <Popup>
               <div className="p-1 font-sans">
                  <h4 className="font-bold text-[14px] mb-1">{r.issue_type || r.issue || 'Emergency'}</h4>
                  <p className="text-[11px] text-[#64748b]">{r.area}</p>
                  <div className="mt-2 pt-2 border-t flex justify-between items-center">
                     <span className="text-[10px] font-bold text-red-500 uppercase">{r.urgency}</span>
                     <span className="text-[10px] font-bold text-[#1a73e8]">#{r.id}</span>
                  </div>
               </div>
             </Popup>
           </Marker>
        ))}

        {(volunteers || []).filter(v => v).map(v => {
           const coords = v.lat && v.lng ? [v.lat, v.lng] : (cityCoordinates[v.city || v.location] || [22.3 + Math.random() * 0.1, 73.1 + Math.random() * 0.1]);
           return (
              <Marker 
                key={`v-${v.id}`} 
                position={coords} 
                icon={mapIcons.Volunteer}
              >
                <Popup>
                  <div className="p-1 font-sans">
                     <h4 className="font-bold text-[14px] mb-1">{v.name}</h4>
                     <p className="text-[11px] text-[#64748b]">{v.role || v.skill} • Agent</p>
                     <div className="mt-2 pt-2 border-t flex justify-between items-center">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">{v.status || 'Active'}</span>
                        <span className="text-[10px] font-bold text-[#1a73e8]">ID:{v.id}</span>
                     </div>
                  </div>
                </Popup>
              </Marker>
           );
        })}

        {/* Focused Asset Marker */}
        {focusedLocation && (
           <Marker 
             position={[focusedLocation.lat, focusedLocation.lng]} 
             icon={new L.divIcon({
                html: `<div class="relative flex items-center justify-center">
                         <div class="absolute inset-0 w-16 h-16 bg-blue-500/20 rounded-full blur-xl animate-ping"></div>
                         <div class="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-2xl relative z-10"></div>
                       </div>`,
                className: 'focused-icon',
                iconSize: [24, 24],
                iconAnchor: [12, 12],
             })}
           >
             <Popup autoOpen={true}>
                <div className="p-3 text-center">
                   <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Target Asset Focus</p>
                   <h4 className="text-[16px] font-black text-slate-900 uppercase leading-none">{focusedLocation.name}</h4>
                   <p className="text-[11px] text-slate-400 font-bold mt-2 uppercase tracking-tight italic">Live Telemetry Synchronized</p>
                </div>
             </Popup>
           </Marker>
        )}

        {/* Crisis Visualization */}
        {isCrisisMode && (
          <Circle 
            center={center} 
            radius={20000} 
            pathOptions={{ fillColor: '#ea4335', fillOpacity: 0.05, color: '#ea4335', weight: 1, dashArray: '5, 10' }} 
          />
        )}
      </MapContainer>

      {/* Map Controls Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
         <button 
           onClick={() => alert("📍 CENTERING ON PRIMARY INCIDENT COMMAND...")}
           className="p-2 bg-white rounded-lg shadow-md border border-[#f1f5f9] text-[#64748b] hover:text-[#1a73e8] transition-colors"
         >
            <Target size={18} />
         </button>
         <button 
           onClick={() => alert("⚡ INITIATING AI LOGISTICS ANALYSIS...")}
           className="p-2 bg-white rounded-lg shadow-md border border-[#f1f5f9] text-[#64748b] hover:text-[#1a73e8] transition-colors"
         >
            <Zap size={18} />
         </button>
      </div>
    </div>
  );
};

export default MapView;
