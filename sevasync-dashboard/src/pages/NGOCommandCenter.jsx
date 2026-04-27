import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import MapView from '../components/MapView.jsx';
import StatsCard from '../components/StatsCard.jsx';
import IntelligenceBriefing from '../components/IntelligenceBriefing.jsx';
import AIAssistant from '../components/AIAssistant.jsx';
import {
  Shield, Activity, AlertCircle, Zap,
  Terminal, Globe, Crosshair, Search, Sparkles, MapPin, ChevronRight, Map, MessageCircle
} from 'lucide-react';

const NGOCommandCenter = ({ reports, volunteers, resources, cityCoordinates, isCrisisMode, setReports }) => {
  const [selectedRegion, setSelectedRegion] = useState('All Cities');
  const [mapViewMode, setMapViewMode] = useState('cluster');
  const [focusedLocation, setFocusedLocation] = useState(null);
  
  const [isOrchestrating, setIsOrchestrating] = useState(false);
  const [orchestrationStage, setOrchestrationStage] = useState('');

  const handleActivateResponse = () => {
    setIsOrchestrating(true);
    setOrchestrationStage('CALCULATING OPTIMAL ROUTES...');
    
    setTimeout(() => {
      setOrchestrationStage('DISPATCHING MOBILE UNITS...');
      setTimeout(() => {
        setOrchestrationStage('DEPLOYMENT SUCCESSFUL');
        setTimeout(() => {
          setIsOrchestrating(false);
          setOrchestrationStage('');
          alert("🚀 TACTICAL SUCCESS: AI has coordinated 3 units and redirected 500+ ration packs to the critical sector.");
        }, 1500);
      }, 2000);
    }, 1500);
  };

  const highUrgencyReports = useMemo(() => {
    const list = reports || [];
    return list
      .filter(r => r.urgency === 'High' || r.urgency_score >= 8)
      .sort((a, b) => (b.urgency_score || 0) - (a.urgency_score || 0))
      .slice(0, 8);
  }, [reports]);

  return (
    <div className={`flex flex-col h-screen overflow-hidden transition-all duration-700 ${isCrisisMode ? 'bg-[#1a0b0b]' : 'bg-[#f1f3f4]'}`}>
      {/* Tactical Header */}
      <div className={`px-6 py-3 border-b flex items-center justify-between sticky top-0 z-[40] shadow-sm transition-all duration-500 ${isCrisisMode ? 'bg-[#c5221f] text-white border-transparent' : 'bg-white border-[#dadce0]'}`}>
        <div className="flex items-center gap-4">
          <div className="p-2 bg-[#e8f0fe] rounded-xl text-[#1a73e8]">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-[20px] font-medium text-[#202124] tracking-tight">Mission Control</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-[#34a853] animate-pulse" />
                <span className="text-[11px] text-[#5f6368] font-medium uppercase tracking-wider">Tactical Link: Active</span>
              </div>
              <span className="text-[#dadce0]">|</span>
              <span className="text-[11px] text-[#5f6368] font-medium uppercase tracking-wider">Health: 100%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center gap-8 mr-8 border-l border-[#dadce0] pl-8">
            <div className="flex flex-col">
              <p className="text-[11px] text-[#5f6368] font-medium uppercase">Priority Reports</p>
              <p className="text-[20px] font-medium text-[#c5221f]">{highUrgencyReports.length}</p>
            </div>
            <div className="flex flex-col">
              <p className="text-[11px] text-[#5f6368] font-medium uppercase">Available Units</p>
              <p className="text-[20px] font-medium text-[#202124]">{volunteers.length}</p>
            </div>
          </div>
          <button 
            onClick={() => setFocusedLocation(null)}
            className="px-6 py-2.5 bg-[#1a73e8] text-white rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-[#1557b0] transition-all shadow-lg shadow-blue-500/20 active:scale-[0.95] cursor-pointer"
          >
            Global Overview
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar: Tactical Feed */}
        <div className="w-[350px] bg-white border-r border-[#dadce0] flex flex-col shadow-xl z-20 overflow-hidden">
          <div className="p-4 border-b border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-[#3c4043] flex items-center gap-2">
              <Activity size={16} className="text-[#1a73e8]" />
              TACTICAL FEED
            </h2>
            <AlertCircle size={16} className="text-[#ea4335]" />
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {highUrgencyReports.map((report, i) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                onClick={() => setFocusedLocation({ lat: report.lat, lng: report.lng })}
                className="p-5 rounded-2xl border border-[#dadce0] bg-[#ffffff] hover:shadow-md cursor-pointer transition-all border-l-[6px] border-l-[#ea4335]"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#ea4335] animate-ping" />
                    <span className="text-[11px] font-bold text-[#ea4335] uppercase tracking-wider">Critical</span>
                  </div>
                  <span className="text-[10px] font-medium text-[#5f6368] bg-[#f1f3f4] px-2 py-0.5 rounded">ID-{report.id}</span>
                </div>
                <h4 className="text-[15px] font-semibold text-[#202124] mb-2">{report.issue}</h4>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[#5f6368] text-[12px]">
                    <MapPin size={14} className="text-[#1a73e8]" />
                    <span>{report.area}</span>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-[#f1f3f4]">
                    <div className="flex items-center gap-3">
                      <span className="text-[12px] font-medium text-[#c5221f]">{report.people} impacted</span>
                      <div className="w-[1px] h-3 bg-[#dadce0]" />
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const text = encodeURIComponent(`🚨 *SEVASYNC EMERGENCY DISPATCH*\n\nIssue: ${report.issue}\nArea: ${report.area}\nPeople Affected: ${report.people}\n\n*Action Required:* Please respond to this sector immediately.`);
                          window.open(`https://wa.me/?text=${text}`, '_blank');
                        }}
                        className="flex items-center gap-1.5 text-[11px] font-bold text-[#128C7E] hover:bg-[#128C7E]/5 px-2 py-1 rounded-lg transition-all"
                      >
                        <MessageCircle size={14} /> Send WhatsApp
                      </button>
                    </div>
                    <ChevronRight size={16} className="text-[#dadce0]" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-[#f1f3f4] border-t border-[#dadce0]">
            <IntelligenceBriefing reports={reports} volunteers={volunteers} />
          </div>
        </div>

        {/* Center: Tactical Map */}
        <div className="flex-1 relative bg-[#f1f3f4] z-10">
          <div className="absolute top-6 left-6 right-6 z-30 flex justify-between pointer-events-none">
            <div className="flex gap-4 pointer-events-auto">
              <div className="bg-white px-4 py-2 rounded-full shadow-lg border border-[#dadce0] flex items-center gap-3">
                <Search size={18} className="text-[#5f6368]" />
                <input
                  type="text"
                  placeholder="Search sector..."
                  className="bg-transparent border-none outline-none text-sm w-48 font-medium text-[#3c4043]"
                />
              </div>
            </div>

            <div className="bg-[#f8f9fa] p-1 rounded-full shadow-lg border border-[#dadce0] flex gap-1 pointer-events-auto">
              <button
                onClick={() => setMapViewMode('cluster')}
                className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${mapViewMode === 'cluster' ? 'bg-[#1a73e8] text-white shadow-md' : 'text-[#5f6368] hover:bg-[#f1f3f4]'}`}
              >
                Clusters
              </button>
              <button
                onClick={() => setMapViewMode('heatmap')}
                className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${mapViewMode === 'heatmap' ? 'bg-[#1a73e8] text-white shadow-md' : 'text-[#5f6368] hover:bg-[#f1f3f4]'}`}
              >
                Heatmap
              </button>
              <button
                onClick={() => {
                  setMapViewMode('weather');
                  alert("Live Weather Systems Engaged: Monitoring Cyclone path in Bay of Bengal...");
                }}
                className={`px-6 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all ${mapViewMode === 'weather' ? 'bg-amber-500 text-white shadow-md' : 'text-[#5f6368] hover:bg-[#f1f3f4]'}`}
              >
                Weather Overlay
              </button>
            </div>
          </div>

          <MapView
            reports={reports}
            selectedCity={selectedRegion}
            cityCoordinates={cityCoordinates}
            hotspots={[]}
            focusedLocation={null}
            onCreateReport={() => { }}
            view={mapViewMode}
          />
        </div>

        {/* Right Sidebar: AI & Resources */}
        <div className="w-[380px] bg-white border-l border-[#dadce0] flex flex-col shadow-2xl z-10 overflow-hidden">
          <div className="p-4 border-b border-[#dadce0] bg-[#f8f9fa] flex items-center justify-between">
            <h2 className="text-[14px] font-bold text-[#3c4043] flex items-center gap-2">
              <Terminal size={16} className="text-[#5f6368]" />
              INTEL CONSOLE
            </h2>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-100">
               <Zap size={10} fill="currentColor" />
               TACTICAL
            </div>
          </div>

          <div className="flex-1 p-6 space-y-8 overflow-y-auto">
            {/* AI Insight Panel */}
            <div className={`p-6 border rounded-2xl relative overflow-hidden shadow-xl transition-all duration-500 ${isOrchestrating ? 'bg-emerald-50 border-emerald-200' : 'bg-[#e8f0fe] border-[#1a73e8]/20'}`}>
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Zap size={64} className={isOrchestrating ? 'text-emerald-600' : 'text-[#1a73e8]'} />
              </div>
              <h3 className={`text-[16px] font-bold mb-4 flex items-center gap-2 ${isOrchestrating ? 'text-emerald-700' : 'text-[#1a73e8]'}`}>
                <Sparkles size={18} /> {isOrchestrating ? 'AI Orchestration Active' : 'Strategic Insight'}
              </h3>
              <p className={`text-[13px] leading-relaxed mb-6 ${isOrchestrating ? 'text-emerald-600' : 'text-[#1967d2]'}`}>
                {isOrchestrating ? orchestrationStage : "AI detects a pattern of Medical Supply Shortages in the South-East quadrant. Suggested deployment of 3 mobile units."}
              </p>
              <button 
                disabled={isOrchestrating}
                onClick={handleActivateResponse}
                className={`w-full py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] shadow-xl transition-all cursor-pointer ${
                  isOrchestrating 
                  ? 'bg-emerald-600 text-white animate-pulse shadow-emerald-500/20' 
                  : 'bg-[#1a73e8] text-white hover:bg-[#1557b0] shadow-blue-500/20 active:scale-[0.98]'
                }`}
              >
                {isOrchestrating ? 'COORDINATING...' : 'Activate Response Plan'}
              </button>
            </div>

            {/* Resource Gaps */}
            <div className="space-y-4">
              <h3 className="text-[12px] font-black text-[#5f6368] uppercase tracking-[0.2em]">Resource Matrix</h3>
              {resources.slice(0, 3).map(res => (
                <div key={res.id} className="p-4 bg-white border border-[#dadce0] rounded-xl hover:shadow-md transition-all border-l-4 border-l-[#fbbc04]">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[13px] font-bold text-[#202124]">{res.type}</span>
                    <span className="text-[11px] font-bold text-[#fbbc04] uppercase">LOW STOCK</span>
                  </div>
                  <div className="w-full bg-[#f1f3f4] h-1.5 rounded-full overflow-hidden mb-2">
                    <div className="h-full bg-[#fbbc04] w-1/4" />
                  </div>
                  <p className="text-[11px] text-[#5f6368]">Hub: {res.location} | Units: {res.quantity}</p>
                </div>
              ))}
            </div>

            {/* Live Volunteers */}
            <div className="space-y-4">
              <h3 className="text-[12px] font-black text-[#5f6368] uppercase tracking-[0.2em]">Deployment Readiness</h3>
              <div className="grid grid-cols-2 gap-3">
                {volunteers.slice(0, 4).map(v => (
                  <div key={v.id} className="p-3 bg-white border border-[#dadce0] rounded-xl text-center hover:border-[#1a73e8]/30 transition-all">
                    <div className="w-10 h-10 bg-[#e8f0fe] text-[#1a73e8] rounded-full flex items-center justify-center mx-auto mb-2">
                      <Crosshair size={18} />
                    </div>
                    <p className="text-[12px] font-bold text-[#202124] truncate">{v.name}</p>
                    <p className="text-[10px] text-[#5f6368]">{v.role}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIAssistant reports={reports} />
    </div>
  );
};

export default NGOCommandCenter;
