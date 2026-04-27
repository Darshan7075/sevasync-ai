import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Search, MapPin, Star, ShieldCheck, 
  Globe, Phone, Mail, Award, Activity, Users, 
  ChevronRight, ExternalLink, Target, Clock, MessageCircle, X,
  Zap, Navigation, ShieldAlert, TrendingUp, Filter,
  Briefcase, Heart, AlertTriangle
} from 'lucide-react';

const NGOsPage = ({ ngos = [], reports = [], cityCoordinates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [activeTab, setActiveTab] = useState('Network');

  const filteredNGOs = useMemo(() => {
    return (ngos || []).filter(n => {
      const name = n.name || '';
      const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCity = selectedCity === 'All' || n.location === selectedCity;
      return matchSearch && matchCity;
    });
  }, [ngos, searchTerm, selectedCity]);

  const stats = useMemo(() => ({
    total: (ngos || []).length,
    active: (ngos || []).filter(n => (n.activeMissions || 0) > 0).length,
    impact: '125K+',
    missions: '2.4K'
  }), [ngos]);

  const specialties = [
    { label: 'Emergency Rescue', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-50' },
    { label: 'Medical Support', icon: Activity, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Logistics & Food', icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Community Support', icon: Heart, color: 'text-emerald-500', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1700px] mx-auto pb-24">
      
      {/* 1. TACTICAL OVERVIEW HEADER */}
      <div className="bg-[#0F172A] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
          <Building2 size={300} className="text-blue-500" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-transparent" />
        
        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-12">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              <span className="text-[12px] font-black text-blue-400 uppercase tracking-[0.3em]">Operational Network Matrix</span>
            </div>
            <h1 className="text-[56px] font-black tracking-tighter uppercase leading-none font-outfit">NGO ALLIANCE HUB</h1>
            <p className="text-slate-400 text-[18px] max-w-2xl font-medium leading-relaxed">
              Coordinating <span className="text-white font-bold">{stats.total}</span> tactical units across <span className="text-white font-bold">{Object.keys(cityCoordinates || {}).length}</span> regional sectors for high-impact humanitarian response.
            </p>
            <div className="flex gap-4">
               {['Network', 'Sectors', 'Deployment'].map(tab => (
                 <button 
                   key={tab}
                   onClick={() => setActiveTab(tab)}
                   className={`px-8 py-3 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                 >
                   {tab}
                 </button>
               ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-6">
            {[
              { label: 'TOTAL IMPACT', val: stats.impact, icon: TrendingUp, color: 'text-emerald-400' },
              { label: 'ACTIVE MISSIONS', val: stats.missions, icon: Target, color: 'text-blue-400' },
              { label: 'OPERATIONAL CAPACITY', val: '94%', icon: ShieldCheck, color: 'text-amber-400' },
            ].map((s, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[32px] min-w-[200px] hover:bg-white/10 transition-all cursor-pointer group">
                <div className="flex items-center gap-3 mb-4">
                  <s.icon size={18} className={s.color} />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{s.label}</span>
                </div>
                <p className="text-3xl font-black group-hover:scale-110 transition-transform origin-left">{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. OPERATIONAL FILTERS */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={22} />
          <input 
            type="text" 
            placeholder="Search Alliance Partners by expertise, city, or mission ID..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-[28px] py-6 pl-16 pr-8 text-[16px] text-slate-700 outline-none focus:ring-4 ring-blue-500/5 transition-all shadow-sm font-medium"
          />
        </div>
        <div className="md:col-span-4 flex gap-4">
          <select 
            value={selectedCity} 
            onChange={(e) => setSelectedCity(e.target.value)}
            className="flex-1 bg-white border border-slate-100 rounded-[28px] px-8 py-6 text-[14px] font-black text-slate-600 uppercase tracking-widest outline-none shadow-sm cursor-pointer hover:border-blue-200 transition-all appearance-none"
          >
            <option value="All">All Sectors</option>
            {Object.keys(cityCoordinates || {}).map(c => <option key={c} value={c}>{c} Sector</option>)}
          </select>
          <button className="p-6 bg-white border border-slate-100 rounded-[28px] text-slate-400 hover:text-blue-600 transition-all shadow-sm">
            <Filter size={24} />
          </button>
        </div>
      </div>

      {/* 3. MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        
        {/* NGO PARTNER GRID */}
        <div className="xl:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredNGOs.length > 0 ? filteredNGOs.map((ngo, i) => (
            <motion.div 
              key={ngo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelectedNGO(ngo)}
              className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] group cursor-pointer hover:shadow-2xl hover:shadow-blue-600/5 hover:-translate-y-2 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-slate-50 rounded-full group-hover:bg-blue-50 transition-colors duration-700" />
              
              <div className="relative z-10 space-y-8">
                <div className="flex justify-between items-start">
                  <div className="w-16 h-16 rounded-[24px] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 transition-all group-hover:scale-110 group-hover:bg-blue-600">
                    <Building2 size={32} />
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 rounded-full border border-amber-100">
                    <Star size={14} className="text-amber-500 fill-amber-500" />
                    <span className="text-[12px] font-black text-amber-600">{ngo.rating || '4.9'}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Active Node</span>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors font-outfit uppercase tracking-tight">{ngo.name}</h3>
                  <div className="flex items-center gap-3 text-slate-400">
                    <MapPin size={16} />
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em]">{ngo.location} Sector</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target size={14} className="text-blue-500" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Missions</p>
                    </div>
                    <p className="text-xl font-black text-slate-900">{ngo.activeMissions || 12}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Users size={14} className="text-blue-500" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel</p>
                    </div>
                    <p className="text-xl font-black text-slate-900">{ngo.members || 45}</p>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex flex-wrap gap-2">
                    {['RESCUE', 'MEDICAL'].map(tag => (
                      <span key={tag} className="text-[9px] font-black px-3 py-1 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 group-hover:border-blue-100 group-hover:text-blue-600">#{tag}</span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )) : (
            <div className="col-span-2 py-24 text-center space-y-6 bg-slate-50 rounded-[48px] border-2 border-dashed border-slate-100">
              <Search size={48} className="mx-auto text-slate-200" />
              <p className="text-slate-400 font-bold uppercase tracking-widest">No Alliance Partners found matching your criteria</p>
            </div>
          )}
        </div>

        {/* SIDEBAR: SECTOR INTEL */}
        <div className="xl:col-span-4 space-y-8">
          
          {/* SPECIALTY DISTRIBUTION */}
          <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-widest mb-10 flex items-center gap-3">
              <Zap size={22} className="text-blue-600" />
              SECTOR EXPERTISE
            </h3>
            <div className="space-y-6">
              {specialties.map((s, i) => (
                <div key={i} className="group cursor-pointer">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-2xl ${s.bg} ${s.color} transition-all group-hover:scale-110`}>
                        <s.icon size={20} />
                      </div>
                      <span className="text-[13px] font-black text-slate-700 uppercase">{s.label}</span>
                    </div>
                    <span className="text-[12px] font-black text-slate-900">{Math.floor(Math.random() * 30 + 10)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.floor(Math.random() * 60 + 30)}%` }}
                      className={`h-full rounded-full bg-current ${s.color}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MISSION PULSE TICKET */}
          <div className="bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Activity size={100} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3">
              <Activity size={22} className="text-emerald-400" />
              MISSION PULSE
            </h3>
            <div className="space-y-8 relative">
              <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
              {[
                { title: 'TEAM DELTA DEPLOYED', time: '2M AGO', city: 'Surat' },
                { title: 'RESOURCE SYNC COMPLETE', time: '12M AGO', city: 'Vadodara' },
                { title: 'NEW SOS ENCRYPTED', time: '1H AGO', city: 'Ahmedabad' },
                { title: 'MEDICAL NODE ACTIVE', time: '3H AGO', city: 'Rajkot' },
              ].map((m, i) => (
                <div key={i} className="flex gap-6 relative group">
                  <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10 group-hover:bg-blue-600 transition-colors">
                    <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-white" />
                  </div>
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-tight">{m.title}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5">{m.city} • {m.time}</p>
                  </div>
                </div>
              ))}
              <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                VIEW GLOBAL LOGS
              </button>
            </div>
          </div>

          {/* CAPACITY ALERT */}
          <div className="bg-rose-50 rounded-[40px] p-10 border border-rose-100 flex items-start gap-6">
            <div className="w-14 h-14 bg-rose-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-rose-200 shrink-0">
               <AlertTriangle size={28} />
            </div>
            <div>
               <h4 className="text-[13px] font-black text-rose-600 uppercase tracking-widest mb-2">NETWORK ALERT</h4>
               <p className="text-[12px] text-rose-900/60 font-bold leading-relaxed uppercase">
                  VADODARA SECTOR AT 92% PERSONNEL UTILIZATION. REQUESTING STANDBY TEAMS FROM AHMEDABAD.
               </p>
            </div>
          </div>

        </div>
      </div>

      {/* 4. NGO DETAIL MODAL */}
      <AnimatePresence>
         {selectedNGO && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/80 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 40 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 40 }}
                className="bg-white rounded-[48px] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[85vh] border border-white/20"
              >
                 {/* Left Panel - Profile */}
                 <div className="w-full md:w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none" />
                    
                    <div className="relative z-10">
                       <button 
                          onClick={() => setSelectedNGO(null)}
                          className="md:hidden absolute top-0 right-0 p-2 text-white/50"
                       >
                          <X size={24} />
                       </button>
                       <div className="w-24 h-24 bg-blue-600 rounded-[32px] flex items-center justify-center text-white mb-10 shadow-2xl shadow-blue-600/20 border border-blue-400/20">
                          <Building2 size={48} />
                       </div>
                       <h2 className="text-[42px] font-black leading-none mb-6 tracking-tighter uppercase font-outfit">{selectedNGO.name}</h2>
                       <div className="flex items-center gap-3 mb-12">
                          <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400 border border-emerald-400/20">
                             <ShieldCheck size={18} />
                          </div>
                          <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400">Verified Strategic Partner</span>
                       </div>

                       <div className="space-y-8">
                          <div className="flex items-center gap-5 text-slate-400 hover:text-white transition-colors cursor-pointer group">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-blue-600 transition-all">
                                <Globe size={18} />
                             </div>
                             <span className="text-[14px] font-bold uppercase tracking-wide">PORTAL ACTIVE</span>
                          </div>
                          <div className="flex items-center gap-5 text-slate-400 hover:text-white transition-colors cursor-pointer group">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-emerald-600 transition-all">
                                <Phone size={18} />
                             </div>
                             <span className="text-[14px] font-bold uppercase tracking-wide">+91 SECURE LINE</span>
                          </div>
                       </div>
                    </div>

                    <div className="relative z-10 space-y-4">
                       <button className="w-full py-5 bg-blue-600 rounded-[24px] font-black uppercase tracking-widest text-[12px] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 active:scale-95">
                          DISPATCH FIELD TEAM
                       </button>
                       <button className="w-full py-5 bg-white/5 rounded-[24px] font-black uppercase tracking-widest text-[12px] hover:bg-white/10 transition-all border border-white/10">
                          SECURE MESSAGE
                       </button>
                    </div>
                 </div>

                 {/* Right Panel - Stats & Activity */}
                 <div className="flex-1 p-12 overflow-y-auto bg-slate-50/30">
                    <div className="flex justify-between items-center mb-12">
                       <div className="flex items-center gap-4">
                          <div className="w-2 h-10 bg-blue-600 rounded-full" />
                          <h3 className="text-[20px] font-black text-slate-900 uppercase tracking-widest font-outfit">OPERATIONAL INTELLIGENCE</h3>
                       </div>
                       <button onClick={() => setSelectedNGO(null)} className="hidden md:flex p-3 bg-white border border-slate-100 hover:bg-slate-100 rounded-full transition-all text-slate-400 shadow-sm">
                          <X size={24} />
                       </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                       {[
                         { label: 'TOTAL DEPLOYMENTS', val: '452', icon: Target, color: 'text-blue-600' },
                         { label: 'SUCCESS RATE', val: '98.4%', icon: ShieldCheck, color: 'text-emerald-600' },
                         { label: 'PERSONNEL HUB', val: selectedNGO.location, icon: MapPin, color: 'text-rose-600' },
                       ].map((s, i) => (
                          <div key={i} className="p-8 bg-white rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all group">
                             <div className={`w-12 h-12 rounded-xl mb-6 flex items-center justify-center bg-slate-50 group-hover:scale-110 transition-transform ${s.color}`}>
                                <s.icon size={22} />
                             </div>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                             <p className="text-2xl font-black text-slate-900">{s.val}</p>
                          </div>
                       ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                       <div className="space-y-8">
                          <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                             <Clock size={18} className="text-blue-600" />
                             MISSION TIMELINE
                          </h4>
                          <div className="space-y-8 relative">
                             <div className="absolute left-2 top-2 bottom-2 w-px bg-slate-100" />
                             {[1,2,3].map(i => (
                               <div key={i} className="flex gap-6 relative">
                                  <div className="w-4 h-4 rounded-full bg-white border-2 border-blue-600 relative z-10" />
                                  <div>
                                     <p className="text-[14px] font-black text-slate-800 uppercase">Mission {i === 1 ? 'Active' : 'Completed'} in {selectedNGO.location}</p>
                                     <p className="text-[12px] text-slate-400 font-bold uppercase mt-1">Sector {Math.floor(Math.random() * 8 + 1)} • {i}H AGO</p>
                                  </div>
                               </div>
                             ))}
                          </div>
                       </div>
                       
                       <div className="space-y-8">
                          <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                             <Award size={18} className="text-amber-500" />
                             TACTICAL RATINGS
                          </h4>
                          <div className="space-y-6">
                             {[
                                { label: 'Response Speed', val: 95 },
                                { label: 'Logistics Efficiency', val: 88 },
                                { label: 'Communication Transparency', val: 92 },
                             ].map((r, i) => (
                                <div key={i} className="space-y-3">
                                   <div className="flex justify-between text-[11px] font-black uppercase text-slate-500">
                                      <span>{r.label}</span>
                                      <span className="text-slate-900">{r.val}%</span>
                                   </div>
                                   <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                      <motion.div 
                                         initial={{ width: 0 }}
                                         animate={{ width: `${r.val}%` }}
                                         className="h-full bg-blue-600 rounded-full"
                                      />
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </div>

                    <div className="mt-16 p-10 bg-slate-900 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden group">
                       <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-10 transition-opacity" />
                       <div className="flex items-center gap-6 relative z-10">
                          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-blue-400 shadow-inner">
                             <MessageCircle size={32} />
                          </div>
                          <div>
                             <p className="text-[18px] font-black uppercase font-outfit tracking-tight">SECURE TACTICAL CHANNEL</p>
                             <p className="text-[12px] text-blue-400 font-bold uppercase tracking-widest">End-to-End Encrypted Mission Comms</p>
                          </div>
                       </div>
                       <button className="px-8 py-4 bg-white text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-50 transition-all relative z-10 active:scale-95 shadow-xl shadow-black/20">
                          ESTABLISH LINK
                       </button>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default NGOsPage;
