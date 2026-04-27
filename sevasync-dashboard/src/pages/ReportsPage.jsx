import React, { useState, useMemo, useCallback } from 'react';
import ReportTable from '../components/ReportTable.jsx';
import ReportModal from '../components/ReportModal.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter as FilterIcon, FileText, 
  AlertTriangle, CheckSquare, Clock, 
  Layers, BarChart3, Shield, Zap, 
  Target, Activity, Radio, MapPin,
  ChevronRight, ArrowUpRight, MoreVertical,
  ShieldCheck, Inbox, Trash2, CheckCircle2,
  AlertCircle, Download, X, Sparkles
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { reportService } from '../services/api';

const ReportsPage = ({ reports, setReports, isLoading, cityCoordinates, isCrisisMode }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const handleAddReport = async (newReport) => {
    try {
      const payload = {
        ngo_name: "SevaSync AI Hub",
        area: newReport.area,
        city: newReport.city || "Vadodara",
        issue_type: newReport.issue,
        description: newReport.description,
        people_affected: parseInt(newReport.people) || 1,
        resource_needed: newReport.issue === 'Food' ? 'Ration Packs' : 
                         newReport.issue === 'Water' ? 'Water Tanker' : 
                         newReport.issue === 'Medical' ? 'Ambulance' : 
                         newReport.issue === 'Shelter' ? 'Tents' : 'Field Agents',
        lat: parseFloat(newReport.lat) || (cityCoordinates[newReport.area]?.[0] || 22.3 + Math.random() * 0.1),
        lng: parseFloat(newReport.lng) || (cityCoordinates[newReport.area]?.[1] || 73.2 + Math.random() * 0.1)
      };

      const response = await reportService.create(payload);
      
      if (response.data) {
        setReports(prev => [response.data, ...prev]);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error("Error creating report:", error);
      const localReport = {
        id: Math.floor(Math.random() * 9000) + 1000,
        area: newReport.area,
        issue: newReport.issue,
        people: newReport.people,
        urgency: newReport.urgency || "Medium",
        status: "Pending",
        timestamp: new Date().toISOString()
      };
      setReports(prev => [localReport, ...prev]);
      setIsModalOpen(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await reportService.updateStatus(id, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    } catch (error) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    }
  };

  const handleDelete = async (id) => {
    try {
      await reportService.delete(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      setReports(prev => prev.filter(r => r.id !== id));
    }
  };

  const filteredReports = useMemo(() => {
    return (reports || []).filter(r => {
      if (isCrisisMode && r.urgency !== 'High') return false;
      const matchSearch = (r.area || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.issue || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchArea = areaFilter === 'All' || r.area === areaFilter;
      const matchUrgency = urgencyFilter === 'All' || r.urgency === urgencyFilter;
      const matchStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchSearch && matchArea && matchUrgency && matchStatus;
    });
  }, [reports, searchTerm, areaFilter, urgencyFilter, statusFilter, isCrisisMode]);

  const stats = useMemo(() => {
    const total = filteredReports.length;
    const critical = filteredReports.filter(r => r.urgency === 'High').length;
    const active = filteredReports.filter(r => r.status === 'In Progress').length;
    const resolved = filteredReports.filter(r => r.status === 'Resolved').length;
    return { total, critical, active, resolved };
  }, [filteredReports]);

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-24">
      
      {/* 1. Tactical Command Header */}
      <div className="bg-[#0f172a] h-[320px] relative overflow-hidden">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-950 z-0" />
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
         
         <div className="max-w-[1700px] mx-auto px-10 pt-16 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
               <div>
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 backdrop-blur-xl border border-blue-400/20">
                        <Radio size={20} className="animate-pulse" />
                     </div>
                     <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Field Intelligence Stream</span>
                  </div>
                  <h1 className="text-[52px] font-black text-white tracking-tighter leading-none mb-4">Mission Matrix</h1>
                  <p className="text-slate-400 text-lg font-medium max-w-2xl">
                     Live synchronized triage of community assistance requests. <span className="text-blue-400 font-bold">Autonomous dispatch</span> protocols active.
                  </p>
               </div>
               
               <div className="flex gap-4">
                  <div className="px-8 py-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] text-white">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Response Load</p>
                     <div className="flex items-center gap-3">
                        <span className="text-[28px] font-black">94.2%</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]" />
                     </div>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="px-10 py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-[32px] font-black uppercase tracking-widest text-[13px] shadow-2xl shadow-blue-600/30 transition-all active:scale-95 flex items-center gap-3"
                  >
                     <Zap size={20} className="fill-white" /> Log Tactical Report
                  </button>
               </div>
            </div>
         </div>
      </div>

      <div className="max-w-[1700px] mx-auto px-10 -mt-20 relative z-20 space-y-8">
         
         {/* 2. Intelligence Metrics */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Requests', val: stats.total, icon: Inbox, color: '#3b82f6', bg: 'bg-blue-50' },
              { label: 'Critical Triage', val: stats.critical, icon: AlertCircle, color: '#ef4444', bg: 'bg-rose-50' },
              { label: 'Active Missions', val: stats.active, icon: Activity, color: '#8b5cf6', bg: 'bg-purple-50' },
              { label: 'Closed/Resolved', val: stats.resolved, icon: CheckCircle2, color: '#10b981', bg: 'bg-emerald-50' },
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
                 <h2 className="text-[36px] font-black text-slate-900 leading-none">{stat.val.toLocaleString()}</h2>
              </motion.div>
            ))}
         </div>

         {/* 3. Operational Grid */}
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
            
            {/* Control Sidebar */}
            <div className="xl:col-span-3 space-y-8">
               <div className="bg-white rounded-[40px] p-8 shadow-sm border border-slate-100 space-y-10">
                  <div>
                     <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-900 mb-8 flex items-center gap-2">
                        <FilterIcon size={16} /> Matrix Filters
                     </h3>
                     
                     <div className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Search</label>
                           <div className="relative">
                              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
                              <input 
                                 type="text" 
                                 placeholder="ID, LOCATION, ISSUE..." 
                                 className="w-full pl-14 pr-6 py-4 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold outline-none focus:bg-white focus:ring-4 ring-blue-500/5 transition-all"
                                 value={searchTerm}
                                 onChange={(e) => setSearchTerm(e.target.value)}
                              />
                           </div>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Regional Sector</label>
                           <select 
                              value={areaFilter}
                              onChange={(e) => setAreaFilter(e.target.value)}
                              className="w-full px-6 py-4 bg-slate-50 border-transparent rounded-2xl text-[13px] font-bold outline-none cursor-pointer focus:bg-white transition-all appearance-none"
                           >
                              <option value="All">All Regions</option>
                              {Object.keys(cityCoordinates).sort().map(c => <option key={c} value={c}>{c}</option>)}
                           </select>
                        </div>

                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Triage Urgency</label>
                           <div className="flex flex-wrap gap-2">
                              {['All', 'High', 'Medium', 'Low'].map(lvl => (
                                 <button 
                                    key={lvl}
                                    onClick={() => setUrgencyFilter(lvl)}
                                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                       urgencyFilter === lvl ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:text-slate-600'
                                    }`}
                                 >
                                    {lvl}
                                 </button>
                              ))}
                           </div>
                        </div>

                        <div className="space-y-4 pt-4">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Status Protocol</label>
                           <div className="space-y-2">
                              {['All', 'Pending', 'In Progress', 'Resolved'].map((stat) => (
                                 <button 
                                    key={stat}
                                    onClick={() => setStatusFilter(stat)}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl text-[12px] font-black uppercase tracking-tight transition-all ${
                                       statusFilter === stat 
                                       ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                                       : 'bg-white border border-slate-100 text-slate-400 hover:border-blue-200 hover:text-slate-600'
                                    }`}
                                 >
                                    {stat}
                                    {statusFilter === stat && <CheckCircle2 size={16} />}
                                 </button>
                              ))}
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* AI Mission Insights Card */}
               <div className="bg-[#0f172a] rounded-[40px] p-8 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-blue-600/20 rounded-full blur-3xl group-hover:bg-blue-600/40 transition-all duration-1000" />
                  <div className="relative z-10">
                     <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-blue-400">
                           <Sparkles size={20} />
                        </div>
                        <h4 className="text-[13px] font-black uppercase tracking-widest">Mission Pulse</h4>
                     </div>
                     <p className="text-[12px] text-slate-400 leading-relaxed italic mb-8 uppercase font-medium">
                        "CASE VOLUME IN <span className="text-white">SURAT</span> HAS INCREASED BY 24%. RECOMMEND REDEPLOYMENT OF MEDICAL UNITS FROM BUFFER ZONES."
                     </p>
                     <button className="w-full py-4 bg-blue-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                        Analyze Logistics
                     </button>
                  </div>
               </div>
            </div>

            {/* Matrix Table Container */}
            <div className="xl:col-span-9 bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden">
               <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/20">
                  <div>
                     <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">Active Mission Feed</h3>
                     <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Live data from SevaSyncAI nodes</p>
                  </div>
                  <div className="flex gap-4">
                     <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <Download size={18} />
                     </button>
                     <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                        <MoreVertical size={18} />
                     </button>
                  </div>
               </div>
               
               <div className="overflow-x-auto">
                  <ReportTable 
                     reports={filteredReports}
                     onReportClick={() => {}}
                     onUpdateStatus={handleUpdateStatus}
                     onDelete={handleDelete}
                  />
               </div>
            </div>
         </div>
      </div>

      <ReportModal 
         isOpen={isModalOpen}
         onClose={() => setIsModalOpen(false)}
         onSave={handleAddReport}
         initialLocation={null}
      />
    </div>
  );
};

export default ReportsPage;
