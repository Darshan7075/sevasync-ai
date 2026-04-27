import React, { useMemo, useState, useEffect, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, MapPin, Zap, UserPlus, Star, 
  Activity, ShieldCheck, CheckCircle2, X, Clock, 
  Globe, Truck, History, Sparkles, Filter, 
  ChevronRight, Phone, Mail, Award, Target,
  RefreshCw, MousePointer2, ExternalLink, AlertTriangle,
  ChevronLeft, Radio, Terminal, Map as MapIcon
} from 'lucide-react';
import { volunteerService } from '../services/api';

// Memoized Agent Card for performance
const AgentCard = memo(({ agent, index, onAssign, onTrack, onSelect, matchScore }) => {
  const isTopMatch = index === 0 && matchScore >= 95;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index % 12) * 0.05 }}
      className={`relative bg-white rounded-[40px] border-2 transition-all duration-500 hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] group cursor-default overflow-hidden ${
         isTopMatch ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-100'
      }`}
    >
       {isTopMatch && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-6 py-1.5 rounded-b-2xl text-[9px] font-black uppercase tracking-[0.2em] z-20 shadow-lg">
             Best Match
          </div>
       )}

       <div className="p-8">
          {/* Card Top: Profile Info */}
          <div className="flex items-start justify-between mb-8">
             <div className="flex items-center gap-5">
                <div className="relative">
                   <div className="w-16 h-16 rounded-[22px] overflow-hidden bg-slate-100 shadow-inner">
                      <img 
                         src={`https://ui-avatars.com/api/?name=${agent.name}&background=6366f1&color=fff&size=128&bold=true`} 
                         alt={agent.name} 
                         loading="lazy"
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white ${
                      agent.status === 'Active' || !agent.status ? 'bg-emerald-500' : 'bg-blue-500'
                   }`} />
                </div>
                <div>
                   <h4 className="text-[20px] font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">{agent.name}</h4>
                   <div className="flex items-center gap-2 mt-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                         agent.status === 'Active' || !agent.status ? 'text-emerald-500' : 'text-blue-500'
                      }`}>
                         {agent.status === 'Active' || !agent.status ? 'Available' : 'On Task'}
                      </span>
                   </div>
                </div>
             </div>
             <div className="text-right">
                <div className="flex items-center gap-1.5 bg-rose-50 text-rose-600 px-3 py-1 rounded-full border border-rose-100 mb-2">
                   <Star size={12} fill="currentColor" />
                   <span className="text-[12px] font-black">{agent.rating || '4.8'}</span>
                </div>
                <span className="text-[9px] font-black text-rose-400 uppercase tracking-widest">High Priority</span>
             </div>
          </div>

          {/* Tactical Data: Match Score Section */}
          <div className="bg-blue-600 rounded-[32px] p-8 text-white relative overflow-hidden mb-8 shadow-xl shadow-blue-600/20">
             <div className="absolute top-0 right-0 p-8 opacity-10">
                <Sparkles size={80} />
             </div>
             
             <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Match Score</p>
                   <h2 className="text-[44px] font-black leading-none">{matchScore}%</h2>
                </div>
             </div>

             <div className="space-y-4 relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-60">Why this match?</p>
                <div className="grid grid-cols-1 gap-3">
                   {[
                      { label: 'Nearby Location', active: true },
                      { label: 'Available Immediately', active: true },
                      { label: 'Has Transport', active: agent.transport && agent.transport !== 'None' },
                      { label: 'High Reliability', active: agent.rating >= 4.5 }
                   ].map((item, idx) => (
                      <div key={idx} className={`flex items-center gap-3 ${item.active ? 'opacity-100' : 'opacity-30'}`}>
                         <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.active ? 'border-white/40 bg-white/10' : 'border-white/10'}`}>
                            <CheckCircle2 size={12} />
                         </div>
                         <span className="text-[11px] font-bold uppercase tracking-widest">{item.label}</span>
                      </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-6 mb-8 px-2">
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Location</p>
                <div className="flex items-center gap-2 text-slate-600">
                   <MapPin size={14} className="text-blue-500" />
                   <span className="text-[12px] font-bold">{agent.city || agent.location} (1.9km)</span>
                </div>
             </div>
             <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Transport</p>
                <div className="flex items-center gap-2 text-slate-600">
                   <Truck size={14} className="text-blue-500" />
                   <span className="text-[12px] font-bold">{agent.transport || 'Bike'}</span>
                </div>
             </div>
          </div>

          <div className="grid grid-cols-12 gap-3 mt-8">
             <button 
               onClick={() => onAssign(agent)}
               className="col-span-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
             >
                <MousePointer2 size={16} /> Assign
             </button>
             <button 
               onClick={() => onTrack(agent)}
               className="col-span-4 py-4 bg-slate-50 border border-slate-100 text-slate-600 rounded-2xl font-black text-[12px] uppercase tracking-[0.2em] transition-all hover:bg-slate-100 active:scale-95 flex items-center justify-center gap-2"
             >
                <Activity size={16} /> Track
             </button>
             <button 
               onClick={() => onSelect(agent)}
               className="col-span-2 py-4 bg-slate-50 border border-slate-100 text-slate-400 rounded-2xl flex items-center justify-center hover:text-blue-600 transition-all"
             >
                <ExternalLink size={18} />
             </button>
          </div>
       </div>
    </motion.div>
  );
});

const VolunteersPage = ({ volunteers, setVolunteers, cityCoordinates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [trackingAgent, setTrackingAgent] = useState(null);
  const [isRecruitModalOpen, setIsRecruitModalOpen] = useState(false);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const agentsPerPage = 12;

  // Debounce search term to prevent lag while typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [newVolunteer, setNewVolunteer] = useState({
    name: '',
    skill: 'Generalist',
    location: 'Vadodara',
    availability: 'Full',
    contact: '',
    rating: 5.0
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await volunteerService.create(newVolunteer);
      setVolunteers(prev => [res.data, ...prev]);
      setIsRecruitModalOpen(false);
      setNewVolunteer({ name: '', skill: 'Generalist', location: 'Vadodara', availability: 'Full', contact: '', rating: 5.0 });
      showNotification("VOLUNTEER REGISTERED", "Agent successfully added to the SevaSync network.");
    } catch (error) {
      console.error("Failed to register volunteer:", error);
      showNotification("REGISTRATION FAILED", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = (agent) => {
    showNotification(`ASSIGNING ${agent.name.toUpperCase()}...`, "info");
    setTimeout(() => {
      showNotification("ASSIGNMENT SUCCESSFUL", "Agent dispatched to nearest high-priority sector.");
    }, 1500);
  };

  const getMatchScore = (agent) => {
    const base = agent.rating ? parseFloat(agent.rating) * 20 : 85;
    const historyBonus = Math.min((agent.history || agent.tasks_completed || 0) / 2, 5);
    return Math.min(Math.round(base + historyBonus), 99);
  };

  const filteredVolunteers = useMemo(() => {
    return (volunteers || []).filter(v => {
      const name = v.name || '';
      const role = v.role || v.skill || '';
      const matchSearch = name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                          role.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCity = selectedCity === 'All' || v.city === selectedCity || v.location === selectedCity;
      const matchStatus = selectedStatus === 'All' || v.status === selectedStatus;
      return matchSearch && matchCity && matchStatus;
    });
  }, [volunteers, debouncedSearch, selectedCity, selectedStatus]);

  // Reset page when filters change
  useEffect(() => setCurrentPage(1), [debouncedSearch, selectedCity, selectedStatus]);

  const paginatedVolunteers = useMemo(() => {
    const start = (currentPage - 1) * agentsPerPage;
    return filteredVolunteers.slice(start, start + agentsPerPage);
  }, [filteredVolunteers, currentPage]);

  const totalPages = Math.ceil(filteredVolunteers.length / agentsPerPage);

  const stats = useMemo(() => ({
    total: (volunteers || []).length,
    active: (volunteers || []).filter(v => v.status === 'Active' || !v.status).length,
    deployed: (volunteers || []).filter(v => v.status === 'Mission Active' || v.status === 'On Task').length,
    avgRating: 4.8
  }), [volunteers]);

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1800px] mx-auto pb-24 relative">
      
      {/* Notification Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[400px] border ${
              notification.type === 'error' ? 'bg-rose-600 text-white border-rose-500' : 
              notification.type === 'info' ? 'bg-blue-600 text-white border-blue-500' : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            {notification.type === 'error' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
            <div className="flex-1">
              <p className="text-[11px] font-black tracking-widest uppercase opacity-80">{notification.type === 'error' ? 'System Error' : 'Intelligence Update'}</p>
              <p className="text-sm font-bold">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Header Section - Deployment Hub */}
      <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-1000" />
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-start gap-6">
               <div className="w-20 h-20 rounded-[28px] bg-blue-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 relative">
                  <div className="absolute inset-0 rounded-[28px] bg-blue-400 animate-ping opacity-20" />
                  <Target size={36} className="relative z-10" />
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <h1 className="text-[42px] font-black tracking-tighter text-slate-900 leading-none">Deployment Hub</h1>
                     <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-100 text-[10px] font-black tracking-widest uppercase">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live System Active
                     </div>
                  </div>
                  <p className="text-slate-500 text-lg font-medium max-w-2xl">
                     Intelligent resource monitoring, volunteer mobilization, and live mission tracking center for active emergency response.
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <button 
                  onClick={() => window.location.reload()}
                  className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-90 shadow-sm"
               >
                  <RefreshCw size={22} />
               </button>
               <button 
                  onClick={() => setIsRecruitModalOpen(true)}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-[13px] tracking-[0.1em] uppercase transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 group active:scale-95"
               >
                  <UserPlus size={18} className="group-hover:rotate-12 transition-transform" /> Register Volunteer
               </button>
            </div>
         </div>
      </div>

      {/* Control Center: Search & Filter */}
      <div className="flex flex-col xl:flex-row gap-6 items-center">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="SEARCH BY CASE, AREA, OR URGENCY" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[28px] py-6 pl-16 pr-8 text-[15px] font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/5 transition-all shadow-sm placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
            />
         </div>
         
         <div className="flex gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
            <div className="flex bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm gap-2">
               {['All', 'Active', 'Mission Active'].map(status => (
                  <button
                     key={status}
                     onClick={() => setSelectedStatus(status)}
                     className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        selectedStatus === status 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                     }`}
                  >
                     {status === 'All' ? 'All Units' : status === 'Active' ? 'Ready' : 'Deployed'}
                  </button>
               ))}
            </div>
            
            <select 
               value={selectedCity} 
               onChange={(e) => setSelectedCity(e.target.value)}
               className="bg-white border border-slate-100 rounded-[28px] px-8 py-4 text-[13px] font-black text-slate-700 outline-none shadow-sm cursor-pointer appearance-none hover:border-blue-200 transition-colors"
            >
               <option value="All">All Sectors</option>
               {Object.keys(cityCoordinates).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
         </div>
      </div>

      {/* Agent Roster Grid - Tactical Layout with Pagination */}
      <div className="space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
           <AnimatePresence mode="popLayout">
              {paginatedVolunteers.map((agent, i) => (
                <AgentCard 
                  key={agent.id}
                  agent={agent}
                  index={i}
                  matchScore={getMatchScore(agent)}
                  onAssign={handleAssign}
                  onTrack={setTrackingAgent}
                  onSelect={setSelectedAgent}
                />
              ))}
           </AnimatePresence>
        </div>

        {/* Tactical Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-6 pb-12">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-[14px] font-black text-slate-900 uppercase tracking-widest">Page</span>
              <div className="px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-500/20">
                {currentPage}
              </div>
              <span className="text-[14px] font-black text-slate-400 uppercase tracking-widest">of {totalPages}</span>
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>

      {/* Recruit Modal */}
      <AnimatePresence>
        {isRecruitModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-black text-slate-900 uppercase">Recruit New Agent</h2>
                  <button onClick={() => setIsRecruitModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                    <X size={24} />
                  </button>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Full Name</label>
                    <input 
                      required
                      type="text" 
                      value={newVolunteer.name}
                      onChange={(e) => setNewVolunteer({...newVolunteer, name: e.target.value})}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500/20 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Primary Skill</label>
                      <select 
                        value={newVolunteer.skill}
                        onChange={(e) => setNewVolunteer({...newVolunteer, skill: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500/20 transition-all outline-none"
                      >
                        <option>Medical</option>
                        <option>Rescue</option>
                        <option>Food Logistics</option>
                        <option>Generalist</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</label>
                      <select 
                        value={newVolunteer.location}
                        onChange={(e) => setNewVolunteer({...newVolunteer, location: e.target.value})}
                        className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500/20 transition-all outline-none"
                      >
                        {Object.keys(cityCoordinates).map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Number</label>
                    <input 
                      required
                      type="tel" 
                      value={newVolunteer.contact}
                      onChange={(e) => setNewVolunteer({...newVolunteer, contact: e.target.value})}
                      placeholder="+91 98XXX XXXXX"
                      className="w-full p-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-blue-500/20 transition-all outline-none"
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="w-full py-5 bg-blue-600 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? 'Registering Agent...' : 'Finalize Registration'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Detail Modal */}
      <AnimatePresence>
         {selectedAgent && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-lg">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 40 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 40 }}
                 className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl overflow-hidden relative"
               >
                  <button 
                     onClick={() => setSelectedAgent(null)}
                     className="absolute top-10 right-10 w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all z-20 border border-slate-100"
                  >
                     <X size={24} />
                  </button>

                  <div className="flex flex-col md:flex-row h-full">
                     <div className="w-full md:w-[380px] bg-slate-50 p-12 flex flex-col border-r border-slate-100">
                        <div className="w-48 h-48 rounded-[48px] bg-white p-3 shadow-2xl mx-auto mb-8">
                           <img 
                              src={`https://ui-avatars.com/api/?name=${selectedAgent.name}&background=6366f1&color=fff&size=512&bold=true`} 
                              alt="p" 
                              className="w-full h-full rounded-[40px] object-cover"
                           />
                        </div>
                        <div className="text-center mb-10">
                           <h2 className="text-[32px] font-black text-slate-900 leading-tight mb-2 uppercase">{selectedAgent.name}</h2>
                           <div className="flex items-center justify-center gap-3">
                              <span className="text-[14px] font-black text-blue-600 uppercase tracking-widest">{selectedAgent.role || selectedAgent.skill}</span>
                              <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <div className="flex items-center gap-1 text-amber-500 font-black">
                                 <Star size={16} fill="currentColor" />
                                 <span>{selectedAgent.rating}</span>
                              </div>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <button 
                              onClick={() => {
                                 const text = encodeURIComponent(`Hello ${selectedAgent.name}, this is SevaSync AI. We have a high-priority mission for you.`);
                                 window.open(`https://wa.me/${selectedAgent.contact || ''}?text=${text}`, '_blank');
                                 showNotification("CONTACTING AGENT", "Initiating secure tactical communication via WhatsApp.");
                              }}
                              className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all active:scale-95"
                           >
                              <Phone size={18} /> Contact Agent
                           </button>
                           <button 
                              onClick={() => showNotification("BRIEFING SENT", "Mission parameters and tactical data transmitted to agent.")}
                              className="w-full py-5 bg-white border-2 border-slate-100 text-slate-600 rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] flex items-center justify-center gap-3 hover:bg-slate-50 transition-all active:scale-95"
                           >
                              <Mail size={18} /> Send Briefing
                           </button>
                        </div>
                     </div>

                     <div className="flex-1 p-12 overflow-y-auto max-h-[80vh]">
                        <div className="grid grid-cols-2 gap-4 mb-12">
                           {[
                             { label: 'Current Sector', val: selectedAgent.city || selectedAgent.location, icon: MapPin, color: 'text-blue-500' },
                             { label: 'Available Today', val: selectedAgent.availableTime || selectedAgent.availability || '8.5 Hours', icon: Clock, color: 'text-emerald-500' },
                             { label: 'Primary Transit', val: selectedAgent.transport || 'Bike Unit', icon: Truck, color: 'text-indigo-500' },
                             { label: 'Language Prof.', val: selectedAgent.language || 'English / Hindi', icon: Globe, color: 'text-rose-500' },
                           ].map(d => (
                             <div key={d.label} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
                                <div className="flex items-center gap-3 text-slate-400 mb-3">
                                   <d.icon size={16} className={d.color} />
                                   <span className="text-[11px] font-black uppercase tracking-widest">{d.label}</span>
                                </div>
                                <p className="text-[15px] font-black text-slate-900">{d.val}</p>
                             </div>
                           ))}
                        </div>

                        <div className="space-y-8">
                           <div className="flex justify-between items-end border-b border-slate-100 pb-6">
                              <div>
                                 <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">Deployment History</h3>
                                 <p className="text-[12px] font-medium text-slate-400 mt-1">Verified tactical performance metrics</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[24px] font-black text-blue-600 leading-none">{selectedAgent.history || selectedAgent.tasks_completed || 0}</p>
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Missions</p>
                              </div>
                           </div>

                           <div className="space-y-4">
                              {[1, 2, 3].map(m => (
                                <div key={m} className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between group hover:bg-white hover:border-blue-100 transition-all cursor-pointer">
                                   <div className="flex items-center gap-5">
                                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-blue-600 shadow-sm group-hover:scale-110 transition-transform">
                                         <History size={24} />
                                      </div>
                                      <div>
                                         <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight">Mission Sector-0{m} Relief</p>
                                         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Completed • March 2026</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-4">
                                      <div className="text-right hidden sm:block">
                                         <div className="flex items-center gap-1 text-emerald-500 font-black text-[12px]">
                                            <Award size={14} /> EXCELLENT
                                         </div>
                                      </div>
                                      <ChevronRight size={20} className="text-slate-300" />
                                   </div>
                                </div>
                              ))}
                           </div>

                           <button 
                             onClick={() => { handleAssign(selectedAgent); setSelectedAgent(null); }}
                             className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all mt-6 active:scale-[0.98]"
                           >
                              Authorize Strategic Deployment
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
      
      {/* Tactical Tracking Modal */}
      <AnimatePresence>
         {trackingAgent && (
            <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-[#0f172a]/90 backdrop-blur-xl">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 40 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 40 }}
                 className="bg-white rounded-[48px] w-full max-w-5xl shadow-[0_0_100px_-20px_rgba(37,99,235,0.3)] overflow-hidden relative border border-white/10"
               >
                  <div className="flex flex-col lg:flex-row h-[80vh]">
                     {/* Left: Pulse Radar & Telemetry */}
                     <div className="w-full lg:w-2/5 bg-slate-900 p-12 text-white flex flex-col justify-between relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-24 opacity-5 pointer-events-none">
                           <Activity size={300} />
                        </div>
                        
                        <div className="relative z-10">
                           <div className="flex items-center gap-3 mb-10">
                              <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/40">
                                 <Radio size={24} className="animate-pulse" />
                              </div>
                              <div>
                                 <h2 className="text-[20px] font-black uppercase tracking-tight leading-none">Tactical Pulse</h2>
                                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mt-1">Live Signal Locked</p>
                              </div>
                           </div>

                           <div className="space-y-12">
                              <div className="flex flex-col items-center py-10 relative">
                                 {/* Pulse Radar Visual */}
                                 <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
                                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 animate-ping" />
                                    <div className="absolute inset-4 rounded-full border-2 border-blue-500/30 animate-pulse" />
                                    <div className="absolute inset-8 rounded-full border-2 border-blue-500/40" />
                                    <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl shadow-blue-600/50 relative z-10">
                                       <img 
                                          src={`https://ui-avatars.com/api/?name=${trackingAgent.name}&background=fff&color=2563eb&size=128&bold=true`} 
                                          className="w-20 h-20 rounded-full border-4 border-white/20" 
                                          alt="p" 
                                       />
                                    </div>
                                 </div>
                                 <h3 className="text-[28px] font-black uppercase tracking-tighter">{trackingAgent.name}</h3>
                                 <p className="text-blue-400 font-black text-[12px] uppercase tracking-widest mt-2">Mission Active • Sector-04</p>
                              </div>

                              <div className="grid grid-cols-2 gap-8">
                                 <div className="space-y-2">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">GPS Vector</p>
                                    <p className="text-[16px] font-mono font-bold text-blue-100/90">
                                       22.{Math.floor(Math.random() * 9000 + 1000)}° N, <br />
                                       73.{Math.floor(Math.random() * 9000 + 1000)}° E
                                    </p>
                                 </div>
                                 <div className="space-y-2 text-right">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Signal Strength</p>
                                    <div className="flex items-center justify-end gap-1">
                                       {[1,2,3,4,5].map(i => (
                                          <motion.div 
                                             key={i} 
                                             animate={{ 
                                                height: [12, 16, 12],
                                                opacity: [0.6, 1, 0.6]
                                             }}
                                             transition={{ 
                                                duration: 1.5, 
                                                repeat: Infinity, 
                                                delay: i * 0.2 
                                             }}
                                             className={`w-1 rounded-full ${i <= 4 ? 'bg-emerald-500' : 'bg-slate-700'}`} 
                                          />
                                       ))}
                                       <span className="text-[14px] font-bold ml-2">{(94 + Math.random()).toFixed(1)}%</span>
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <button 
                             onClick={() => {
                               const coords = trackingAgent.lat && trackingAgent.lng ? [trackingAgent.lat, trackingAgent.lng] : (cityCoordinates[trackingAgent.city || trackingAgent.location] || [23.2599, 77.4126]);
                               navigate('/', { state: { focus: { lat: coords[0], lng: coords[1], name: trackingAgent.name } } });
                             }}
                             className="w-full py-4 bg-blue-600/20 border border-blue-500/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-3 mt-4"
                           >
                              <MapIcon size={16} /> Open Strategic Map
                           </button>
                        </div>

                        <div className="relative z-10 pt-10 border-t border-white/10 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <ShieldCheck className="text-blue-400" size={24} />
                              <div>
                                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Auth Protocol</p>
                                 <p className="text-[12px] font-bold">AES-256 SECURE</p>
                              </div>
                           </div>
                           <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                              <Terminal size={20} />
                           </div>
                        </div>
                     </div>

                     {/* Right: Detailed Telemetry & Timeline */}
                     <div className="flex-1 p-12 overflow-y-auto">
                        <div className="flex justify-between items-start mb-12">
                           <div className="flex items-center gap-4">
                              <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                              <h3 className="text-[22px] font-black text-slate-900 uppercase tracking-tight">Mission Matrix</h3>
                           </div>
                           <button 
                              onClick={() => setTrackingAgent(null)}
                              className="w-14 h-14 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all border border-slate-100"
                           >
                              <X size={24} />
                           </button>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
                           {[
                              { label: 'Mission Time', val: '42m 18s', icon: Clock, color: 'text-blue-500' },
                              { label: 'Strategic Vitality', val: '98%', icon: Activity, color: 'text-emerald-500' },
                              { label: 'Battery Level', val: '84%', icon: Zap, color: 'text-amber-500' },
                           ].map((d, i) => (
                              <div key={i} className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 group hover:bg-white hover:shadow-xl transition-all">
                                 <div className="flex items-center gap-3 text-slate-400 mb-4">
                                    <d.icon size={18} className={d.color} />
                                    <span className="text-[11px] font-black uppercase tracking-widest">{d.label}</span>
                                 </div>
                                 <p className="text-[24px] font-black text-slate-900">{d.val}</p>
                              </div>
                           ))}
                        </div>

                        <div className="space-y-10">
                           <h4 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                              <History size={20} className="text-blue-600" />
                              Live Mission Timeline
                           </h4>
                           
                           <div className="space-y-8 relative">
                              <div className="absolute left-4 top-2 bottom-2 w-px bg-slate-100" />
                              {[
                                 { time: '14:22:15', action: 'Vector locked on target sector' },
                                 { time: '14:18:40', action: 'Arrival at Hub-04 authorized' },
                                 { time: '14:05:12', action: 'Strategic mobilization initiated' },
                                 { time: '13:58:00', action: 'Mission command established' },
                              ].map((item, idx) => (
                                 <div key={idx} className="flex gap-8 relative group">
                                    <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-100 flex items-center justify-center relative z-10 group-hover:border-blue-600 transition-colors shadow-sm">
                                       <div className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-blue-600 animate-pulse' : 'bg-slate-300'}`} />
                                    </div>
                                    <div className="flex-1 pb-8 border-b border-slate-50 last:border-0 last:pb-0">
                                       <p className="text-[14px] font-black text-slate-900 uppercase tracking-tight">{item.action}</p>
                                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.time} • GPS VERIFIED</p>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>

                        <div className="mt-12 p-8 bg-blue-50 rounded-[40px] border border-blue-100 flex items-center justify-between">
                           <div className="flex items-center gap-6">
                              <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                 <Phone size={24} />
                              </div>
                              <div>
                                 <p className="text-[15px] font-black text-slate-900 uppercase">Emergency Comms Link</p>
                                 <p className="text-[12px] font-bold text-blue-600 uppercase tracking-widest mt-0.5">Secure Voice Terminal Active</p>
                              </div>
                           </div>
                           <button 
                              onClick={() => showNotification("VOICE TERMINAL INITIALIZED", "Establishing secure encrypted comms link with field agent...")}
                              className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all"
                           >
                              Connect Now
                           </button>
                        </div>
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default VolunteersPage;
