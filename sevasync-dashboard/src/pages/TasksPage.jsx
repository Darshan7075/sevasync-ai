import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Target, Clock, MapPin, Users, Package, 
  Activity, AlertCircle, CheckCircle2, ChevronRight, 
  Filter, LayoutGrid, Timer, User, ShieldCheck, 
  ArrowUpRight, BarChart3, History, MessageSquare,
  Truck, Send, Sparkles, Zap, Shield, Radio,
  MoreVertical, Download, X, ListFilter,
  BarChart, Layers
} from 'lucide-react';
import { reportService, volunteerService } from '../services/api';

const TasksPage = ({ reports, volunteers, resources, isCrisisMode, setReports, setVolunteers }) => {
  const [activeTab, setActiveTab] = useState('active');
  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [selectedTaskChat, setSelectedTaskChat] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await reportService.updateStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const handleAssign = async (reportId, volunteerId) => {
    try {
      await volunteerService.assign(reportId, volunteerId);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Assigned' } : r));
    } catch (error) {
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'Assigned' } : r));
    }
  };

  const activeTasks = useMemo(() => {
    return (reports || []).filter(r => r.status !== 'Resolved' && r.status !== 'Completed');
  }, [reports]);

  const completedTasks = useMemo(() => {
    return (reports || []).filter(r => r.status === 'Resolved' || r.status === 'Completed');
  }, [reports]);

  const filteredTasks = useMemo(() => {
    const base = activeTab === 'active' ? activeTasks : completedTasks;
    return base.filter(t => {
      const matchSearch = (t.area || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (t.issue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          `SS-${t.id}`.toLowerCase().includes(searchTerm.toLowerCase());
      const matchPriority = priorityFilter === 'All' || 
                            (priorityFilter === 'Critical' && t.urgency === 'High') ||
                            (priorityFilter === 'Normal' && t.urgency === 'Medium') ||
                            (priorityFilter === 'Support' && t.urgency === 'Low');
      return matchSearch && matchPriority;
    });
  }, [activeTab, activeTasks, completedTasks, searchTerm, priorityFilter]);

  const displayedTasks = filteredTasks;

  const calculateElapsed = (timestamp) => {
    if (!timestamp) return "00:00:00";
    const start = new Date(timestamp);
    if (isNaN(start.getTime())) return "00:00:00";
    const diff = Math.max(0, currentTime.getTime() - start.getTime());
    const totalSeconds = Math.floor(diff / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      
      {/* 1. Tactical Command Header */}
      <div className="bg-[#0f172a] h-[340px] relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 to-slate-950 z-0" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
         
         <div className="max-w-[1700px] mx-auto px-10 pt-16 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400 backdrop-blur-xl border border-indigo-400/20">
                        <Target size={20} className="animate-pulse" />
                     </div>
                     <span className="text-[11px] font-black text-indigo-400 uppercase tracking-[0.3em]">Operational Dispatch Center</span>
                  </div>
                  <h1 className="text-[52px] font-black text-white tracking-tighter leading-none mb-4">Mission Control</h1>
                  <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                     Real-time task synchronization and field unit coordination. <span className="text-indigo-400 font-bold">Autonomous re-routing</span> protocols engaged for high-priority missions.
                  </p>
               </div>
               
               <div className="flex gap-4">
                  <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-1 rounded-3xl">
                     <button 
                       onClick={() => setActiveTab('active')}
                       className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
                         activeTab === 'active' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'
                       }`}
                     >
                       Active Missions
                     </button>
                     <button 
                       onClick={() => setActiveTab('completed')}
                       className={`px-8 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest transition-all ${
                         activeTab === 'completed' ? 'bg-indigo-600 text-white shadow-xl' : 'text-slate-400 hover:text-white'
                       }`}
                     >
                       Archive
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-10 -mt-24 relative z-20 space-y-10">
         
         {/* 2. Deployment Analytics Summary */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Missions', val: reports.length, icon: Layers, color: '#6366f1', bg: 'bg-indigo-50' },
              { label: 'In Progress', val: activeTasks.length, icon: Activity, color: '#3b82f6', bg: 'bg-blue-50' },
              { label: 'Critical Ops', val: activeTasks.filter(t => t.urgency === 'High').length, icon: AlertCircle, color: '#ef4444', bg: 'bg-rose-50' },
              { label: 'Avg Velocity', val: '4.2m', icon: Timer, color: '#10b981', bg: 'bg-emerald-50' },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-[40px] shadow-xl shadow-slate-200/50 border border-slate-100 group hover:scale-[1.02] transition-all"
              >
                 <div className="flex justify-between items-start mb-6">
                    <div className={`w-14 h-14 rounded-2xl ${stat.bg} flex items-center justify-center`} style={{ color: stat.color }}>
                       <stat.icon size={28} />
                    </div>
                    <ArrowUpRight size={20} className="text-slate-300 group-hover:text-slate-900 transition-colors" />
                 </div>
                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                 <h2 className="text-[36px] font-black text-slate-900 leading-none">{stat.val}</h2>
              </motion.div>
            ))}
         </div>

         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* 3. Dispatch Controls Sidebar */}
            <div className="xl:col-span-3 space-y-8">
               <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-10">
                  <div>
                     <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-2">
                        <ListFilter size={16} /> Mission Filters
                     </h3>
                     
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Search</label>
                           <div className="relative">
                              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                              <input 
                                 type="text" 
                                 placeholder="ID, MISSION NAME, SECTOR..." 
                                 className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:ring-4 ring-indigo-500/5 transition-all"
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                              />
                           </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Priority Level</label>
                           <div className="flex flex-wrap gap-2">
                              {['All', 'Critical', 'Normal', 'Support'].map(lvl => (
                                 <button 
                                    key={lvl}
                                    onClick={() => setPriorityFilter(lvl)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                       priorityFilter === lvl ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-indigo-600'
                                    }`}
                                 >
                                    {lvl}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                           <div className="flex items-center justify-between mb-4">
                              <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Global Ops Status</span>
                              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                           </div>
                           <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full bg-indigo-600 w-[68%]" />
                           </div>
                           <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">68% MISSION CAPACITY UTILIZED</p>
                        </div>
                     </div>
                  </div>
               </div>

               {/* AI Resource Optimizer Card */}
               <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent z-0" />
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-6">
                        <Sparkles size={24} className="text-indigo-400" />
                        <h4 className="text-[13px] font-black uppercase tracking-widest">Dispatch AI</h4>
                     </div>
                     <p className="text-[12px] text-slate-400 leading-relaxed font-medium mb-8 uppercase">
                        "IDENTIFIED 3 MISSIONS IN <span className="text-indigo-400">BHOPAL</span> WITH SYNERGISTIC RESOURCE REQUIREMENTS. RECOMMEND BATCH DISPATCH."
                     </p>
                     <button className="w-full py-4 bg-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all">
                        Engage Smart Dispatch
                     </button>
                  </div>
               </div>
            </div>

            {/* 4. Interactive Mission Grid */}
            <div className="xl:col-span-9 space-y-6">
               {displayedTasks.slice(0, 8).map((task, i) => (
                  <motion.div 
                    key={task.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden group hover:shadow-xl hover:shadow-slate-200/50 transition-all"
                  >
                     <div className="flex flex-col lg:flex-row">
                        {/* Status Indicator Sidebar */}
                        <div className={`w-1 lg:w-2 ${
                           task.urgency === 'High' ? 'bg-rose-500' : 'bg-indigo-500'
                        }`} />
                        
                        <div className="flex-1 p-8">
                           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                              <div>
                                 <div className="flex items-center gap-3 mb-2">
                                    <span className="text-[11px] font-black text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-lg">ID: SS-{task.id}</span>
                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">• Sector {task.area?.split(',')[0]}</span>
                                 </div>
                                 <h3 className="text-[24px] font-black text-slate-900 uppercase tracking-tight">{task.issue} Support</h3>
                              </div>
                              <div className="flex items-center gap-4">
                                 <div className="text-right hidden md:block">
                                    <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Elapsed</p>
                                    <p className="text-[20px] font-black text-slate-900 tabular-nums">{calculateElapsed(task.timestamp)}</p>
                                 </div>
                                 <div className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                    task.urgency === 'High' ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-50 text-slate-400'
                                 }`}>
                                    {task.urgency} Priority
                                 </div>
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
                              <div className="space-y-4">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mission Parameters</p>
                                 <div className="space-y-3">
                                    <div className="flex items-center gap-3 text-slate-600">
                                       <MapPin size={16} className="text-indigo-500" />
                                       <span className="text-[13px] font-bold">{task.area}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                       <Users size={16} className="text-blue-500" />
                                       <span className="text-[13px] font-bold">{task.people} Impacted Units</span>
                                    </div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Unit Status</p>
                                 <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-600 font-bold">
                                       {volunteers?.[i % volunteers?.length]?.name?.[0] || 'V'}
                                    </div>
                                    <div>
                                       <p className="text-[13px] font-bold text-slate-900">{volunteers?.[i % volunteers?.length]?.name || 'Auto-Assign Pending'}</p>
                                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Field Agent • 1.2 KM AWAY</p>
                                    </div>
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Progress Metrics</p>
                                 <div className="space-y-2">
                                    <div className="flex justify-between text-[11px] font-black">
                                       <span className="text-slate-400 uppercase">Deployment</span>
                                       <span className="text-indigo-600">65%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                       <div className="h-full bg-indigo-600 rounded-full" style={{ width: '65%' }} />
                                    </div>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-wrap gap-3 pt-8 border-t border-slate-50">
                              <button 
                                onClick={() => handleUpdateStatus(task.id, 'In Progress')}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center gap-2"
                              >
                                 <Zap size={16} /> Engage Mission
                              </button>
                              <button 
                                onClick={() => setSelectedTaskChat(task)}
                                className="px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
                              >
                                 <MessageSquare size={16} /> Comms Node
                              </button>
                              <button className="px-6 py-3 bg-white border border-slate-100 text-slate-600 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2">
                                 <Truck size={16} /> Logistics Sync
                              </button>
                              <div className="flex-1" />
                              <button 
                                onClick={() => handleUpdateStatus(task.id, 'Resolved')}
                                className="px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-emerald-600 hover:text-white transition-all flex items-center gap-2"
                              >
                                 <CheckCircle2 size={16} /> Mark Objective Complete
                              </button>
                           </div>
                        </div>
                     </div>
                  </motion.div>
               ))}
            </div>
         </div>
      </div>

      {/* Comms Node Overlay */}
      <AnimatePresence>
         {selectedTaskChat && (
            <div className="fixed inset-0 z-[100] flex items-end justify-end p-10 pointer-events-none">
               <motion.div 
                 initial={{ opacity: 0, y: 100, scale: 0.9 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 exit={{ opacity: 0, y: 100, scale: 0.9 }}
                 className="w-[400px] bg-white rounded-[32px] shadow-2xl border border-slate-100 overflow-hidden pointer-events-auto"
               >
                  <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                           <Radio size={20} className="animate-pulse" />
                        </div>
                        <div>
                           <p className="text-[13px] font-black uppercase tracking-widest">Tactical Comms</p>
                           <p className="text-[10px] font-bold opacity-60">MISSION: SS-{selectedTaskChat.id}</p>
                        </div>
                     </div>
                     <button onClick={() => setSelectedTaskChat(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                        <X size={20} />
                     </button>
                  </div>
                  <div className="h-[300px] bg-slate-50 p-6 space-y-4 overflow-y-auto">
                     <div className="bg-white p-4 rounded-2xl rounded-bl-none shadow-sm border border-slate-100 mr-10">
                        <p className="text-[12px] font-bold text-slate-900">Unit Alpha: On site. Confirming resource requirements for {selectedTaskChat.issue}.</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-2">07:42 PM • FIELD UNIT</p>
                     </div>
                     <div className="bg-indigo-50 p-4 rounded-2xl rounded-br-none shadow-sm border border-indigo-100 ml-10">
                        <p className="text-[12px] font-bold text-indigo-900">Command: Roger that. Logistics sync initiated. Maintain perimeter.</p>
                        <p className="text-[9px] font-bold text-indigo-400 mt-2">07:44 PM • COMMAND CENTER</p>
                     </div>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-50 flex gap-2">
                     <input type="text" placeholder="Transmit tactical directive..." className="flex-1 bg-slate-50 border-transparent rounded-xl px-4 py-3 text-[12px] font-bold outline-none" />
                     <button className="p-3 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
                        <Send size={18} />
                     </button>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default TasksPage;
