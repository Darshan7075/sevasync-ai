import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, BellOff, ShieldAlert, CheckCircle2, Zap, 
  Clock, Filter, Search, Trash2, Check,
  Activity, Package, Users, MapPin, ExternalLink,
  ChevronRight, AlertTriangle, Info, MessageSquare,
  Box, Truck, RefreshCw, Shield, UserPlus
} from 'lucide-react';

const AlertsPage = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'CRITICAL', category: 'Mission', title: 'New Emergency Report', message: 'Medical emergency reported in Sector-07. Urgent triage required.', time: '2m ago', icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-50' },
    { id: 2, type: 'SUCCESS', category: 'Logistics', title: 'Resource Dispatched', message: '120 units of Food Packs successfully dispatched to Ahmedabad Hub.', time: '14m ago', icon: Truck, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 3, type: 'INFO', category: 'Personnel', title: 'Task Completed', message: 'Agent Rahul Sharma finished the debris clearance mission in Bhopal.', time: '1h ago', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-50' },
    { id: 4, type: 'WARNING', category: 'Resources', title: 'Low Stock Alert', message: 'Oxygen Cylinders in Surat storage falling below 15% threshold.', time: '3h ago', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-50' },
    { id: 5, type: 'SUCCESS', category: 'Resources', title: 'Inventory Restored', message: 'Blood Bank Inventory updated. 50 units of O+ added to central stock.', time: '5h ago', icon: RefreshCw, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { id: 6, type: 'INFO', category: 'Mission', title: 'New Volunteer Request', message: 'Devansh Panchal applied for Field Lead role in Sector-02.', time: '6h ago', icon: UserPlus, color: 'text-indigo-500', bg: 'bg-indigo-50' },
  ]);

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n => {
      const matchTab = activeTab === 'All' || n.category === activeTab || (activeTab === 'Urgent' && n.type === 'CRITICAL');
      const matchSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          n.message.toLowerCase().includes(searchTerm.toLowerCase());
      return matchTab && matchSearch;
    });
  }, [notifications, activeTab, searchTerm]);

  const clearNotification = (id, title) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    // Simulated notification show (assuming it's available or we use a simple alert)
    console.log(`Alert Resolved: ${title}`);
  };

  const markAllRead = () => {
     setNotifications([]);
     alert("SECTOR STABILIZED: All active alerts have been cleared from the command buffer.");
  };

  // Simulate Live Intelligence Stream
  React.useEffect(() => {
    const interval = setInterval(() => {
      const liveAlert = { 
        id: Date.now(), 
        type: 'INFO', 
        category: 'System', 
        title: 'Intelligence Sync Complete', 
        message: 'Tactical data synchronized with regional hubs. Signal integrity at 100%.', 
        time: 'Just Now', 
        icon: Zap, 
        color: 'text-indigo-400', 
        bg: 'bg-slate-900 text-white' 
      };
      setNotifications(prev => [liveAlert, ...prev].slice(0, 10));
    }, 45000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1400px] mx-auto pb-24">
      
      {/* 1. Tactical Header */}
      <div className="bg-[#0f172a] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
          <Bell size={280} className="text-rose-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span className="text-[11px] font-black text-rose-400 uppercase tracking-[0.3em]">Command Center Intelligence</span>
            </div>
            <h1 className="text-[48px] font-black tracking-tighter uppercase leading-none font-outfit">Tactical Alerts</h1>
            <p className="text-slate-400 text-[16px] mt-4 max-w-xl font-medium">
               Monitor mission-critical updates, resource logistics, and agent deployments in real-time. Stay ahead of every crisis.
            </p>
          </div>
          <div className="flex gap-4">
             <button 
               onClick={markAllRead}
               className="px-8 py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
             >
                Clear All Notifications
             </button>
             <button className="w-14 h-14 rounded-2xl bg-rose-600 flex items-center justify-center shadow-2xl shadow-rose-600/30">
                <Filter size={20} />
             </button>
          </div>
        </div>
      </div>

      {/* 2. Intelligent Control Bar */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-center">
         <div className="xl:col-span-8 relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="SEARCH ALERTS BY KEYWORD, LOCATION, OR AGENT..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[28px] py-5 pl-16 pr-8 text-[14px] font-bold text-slate-700 outline-none focus:ring-4 ring-rose-500/5 transition-all shadow-sm uppercase tracking-tight"
            />
         </div>
         <div className="xl:col-span-4 flex bg-white p-1.5 rounded-full border border-slate-100 shadow-sm overflow-x-auto scrollbar-hide">
             {['All', 'Urgent', 'Mission', 'Logistics', 'Resources'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                >
                   {tab}
                </button>
             ))}
         </div>
      </div>

      {/* 3. Notification Stream */}
      <div className="space-y-6">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((note, i) => (
              <motion.div 
                key={note.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
              >
                 <div className="flex flex-col md:flex-row md:items-center gap-8">
                    {/* Visual Indicator */}
                    <div className={`w-20 h-20 rounded-[24px] ${note.bg} flex items-center justify-center ${note.color} transition-transform group-hover:scale-110 relative`}>
                       {note.type === 'CRITICAL' && <div className="absolute inset-0 rounded-[24px] bg-rose-400 animate-ping opacity-20" />}
                       <note.icon size={32} className="relative z-10" />
                    </div>

                    <div className="flex-1 space-y-2">
                       <div className="flex items-center gap-4">
                          <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full ${
                             note.type === 'CRITICAL' ? 'bg-rose-100 text-rose-600' : 
                             note.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                             note.type === 'SUCCESS' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                             {note.category} • {note.type}
                          </span>
                          <span className="text-[11px] font-bold text-slate-300 flex items-center gap-2">
                             <Clock size={14} /> {note.time}
                          </span>
                       </div>
                       <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{note.title}</h3>
                       <p className="text-[15px] font-medium text-slate-500 leading-relaxed max-w-3xl">{note.message}</p>
                    </div>

                    <div className="flex items-center gap-4 border-l border-slate-50 pl-8 h-full">
                       <button 
                         onClick={() => alert(`MISSION BRIEFING: Establishing tactical link for "${note.title.toUpperCase()}"...`)}
                         className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                       >
                          <ExternalLink size={20} />
                       </button>
                       <button 
                         onClick={() => clearNotification(note.id, note.title)}
                         className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                       >
                          <Check size={20} />
                       </button>
                    </div>
                 </div>
                 
                 {/* Premium Hover Glow */}
                 <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    note.type === 'CRITICAL' ? 'bg-rose-500' : 
                    note.type === 'WARNING' ? 'bg-amber-500' :
                    note.type === 'SUCCESS' ? 'bg-emerald-500' : 'bg-blue-500'
                 } opacity-0 group-hover:opacity-100 transition-opacity`} />
              </motion.div>
            ))
          ) : (
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="py-32 text-center"
            >
               <div className="w-24 h-24 bg-slate-50 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-slate-200">
                  <BellOff size={48} />
               </div>
               <h3 className="text-2xl font-black text-slate-300 uppercase tracking-widest">No New Tactical Alerts</h3>
               <p className="text-slate-400 font-bold mt-2 uppercase text-[12px] tracking-[0.2em]">All sectors currently stabilized.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Strategic Summary & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
            <h3 className="text-[20px] font-black text-slate-900 uppercase tracking-tight mb-8 flex items-center gap-4">
               <Zap size={24} className="text-rose-500" />
               Alert Intelligence Matrix
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
               <div className="p-8 bg-rose-50 rounded-[32px] border border-rose-100">
                  <p className="text-[11px] font-black text-rose-600 uppercase tracking-widest mb-2">Priority Missions</p>
                  <p className="text-[32px] font-black text-rose-900 leading-none">09</p>
                  <p className="text-[12px] font-bold text-rose-800/60 mt-4 uppercase">Requires Immediate Commander Authorization</p>
               </div>
               <div className="p-8 bg-blue-50 rounded-[32px] border border-blue-100">
                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2">System Stability</p>
                  <p className="text-[32px] font-black text-blue-900 leading-none">99.8%</p>
                  <p className="text-[12px] font-bold text-blue-800/60 mt-4 uppercase">Neural Comms Sync Established</p>
               </div>
            </div>
            <button 
               onClick={() => alert("AI LOGISTICS ENGINE: Analyzing Case Volume Trends... Recommendation: Sector-04 requires 20% more medical units.")}
               className="w-full py-5 bg-blue-600 rounded-[20px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 hover:shadow-[0_0_30px_-5px_rgba(37,99,235,0.5)] transition-all shadow-xl shadow-blue-600/20 text-white"
            >
               Analyze Logistics
            </button>
         </div>

         <div className="lg:col-span-4 bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Shield size={120} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3">
               <Activity size={22} className="text-rose-500" />
               Live Telemetry
            </h3>
            <div className="space-y-6 relative z-10">
               {[
                  { label: 'Signal Strength', val: '94%', color: 'bg-emerald-500' },
                  { label: 'Uplink Latency', val: '12ms', color: 'bg-blue-500' },
                  { label: 'Data Throughput', val: '1.2 GB/s', color: 'bg-indigo-500' },
               ].map((d, i) => (
                  <div key={i} className="space-y-3">
                     <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{d.label}</span>
                        <span className="text-[12px] font-black">{d.val}</span>
                     </div>
                     <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: d.val.includes('%') ? d.val : '70%' }}
                          className={`h-full ${d.color}`}
                        />
                     </div>
                  </div>
               ))}
               <button 
                  onClick={() => alert("SYSTEM CONFIGURATION: Accessing tactical alert sensitivity levels and neural uplink parameters...")}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5 mt-4"
               >
                  Tactical Settings
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AlertsPage;
