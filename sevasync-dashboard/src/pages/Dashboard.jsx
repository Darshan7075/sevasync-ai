import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Activity, Zap, Sparkles, Map as MapIcon, 
  ChevronRight, ArrowUpRight, ArrowDownRight, Package, 
  Users, CheckCircle2, Clock, Terminal, BarChart3, 
  Plus, Send, LayoutGrid, Settings, Download, Upload,
  ShieldCheck, Globe, MessageSquare, TrendingUp,
  ShieldAlert, Radio, Search, Filter, MapPin, Target,
  AlertCircle, MessageCircle, MoreVertical, History,
  MousePointer2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import MapView from '../components/MapView.jsx';

const Dashboard = ({ reports, volunteers, resources, bloodDonors, cityCoordinates, isCrisisMode, toggleCrisisMode }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const focusedLocation = location.state?.focus;
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  const stats = useMemo(() => [
    { label: 'PEOPLE HELPED', value: (reports || []).reduce((acc, r) => acc + (r.people || 0), 0).toLocaleString(), icon: Users, color: '#3b82f6', sub: 'TOTAL IMPACTED' },
    { label: 'ACTIVE CASES', value: (reports || []).filter(r => r.status === 'Pending').length, icon: Target, color: '#ef4444', sub: 'AWAITING ACTION' },
    { label: 'MISSIONS DONE', value: (volunteers || []).reduce((acc, v) => acc + (v.history || 0), 0).toLocaleString(), icon: CheckCircle2, color: '#10b981', sub: 'TASKS FINISHED' },
    { label: 'RESOURCES USED', value: (resources || []).reduce((acc, r) => acc + (r.quantity || 0), 0).toLocaleString(), icon: Package, color: '#a855f7', sub: 'UNITS DEPLOYED' },
    { label: 'RESPONSE TIME', value: '4.2 min', icon: Clock, color: '#f59e0b', sub: 'AVG VELOCITY' },
  ], [reports, volunteers, resources]);

  const triageHub = useMemo(() => {
    return (reports || []).filter(r => {
      const level = r.urgency === 'High' ? 'CRITICAL' : r.urgency?.toUpperCase();
      const matchUrgency = selectedUrgency === 'ALL' || level === selectedUrgency || (selectedUrgency === 'HIGH' && r.urgency === 'High');
      return matchUrgency;
    }).slice(0, 5).map(r => ({
      location: r.area?.toUpperCase() || 'SECTOR ALPHA',
      type: r.issue?.toUpperCase() || 'GENERAL ASSISTANCE',
      impact: r.people || 0,
      status: r.urgency === 'High' ? 'CRITICAL' : 'MEDIUM',
      color: r.urgency === 'High' ? '#ef4444' : '#facc15'
    }));
  }, [reports, selectedUrgency]);

  const chartData = [
    { name: 'Medical', value: 45, color: '#3b82f6' },
    { name: 'Food', value: 78, color: '#3b82f6' },
    { name: 'Water', value: 35, color: '#10b981' },
    { name: 'Shelter', value: 62, color: '#f59e0b' },
    { name: 'Rescue', value: 28, color: '#ef4444' },
    { name: 'Blood', value: 55, color: '#a855f7' },
  ];

  return (
    <div className={`min-h-screen transition-colors duration-700 pb-20 ${isCrisisMode ? 'bg-rose-50/50' : 'bg-[#f8fafc]'}`}>
      
      {/* Crisis Overlay */}
      <AnimatePresence>
         {isCrisisMode && (
           <motion.div 
             initial={{ opacity: 0 }}
             animate={{ opacity: [0.05, 0.15, 0.05] }}
             exit={{ opacity: 0 }}
             transition={{ duration: 2, repeat: Infinity }}
             className="fixed inset-0 pointer-events-none z-[100] bg-rose-600 mix-blend-overlay"
           />
         )}
      </AnimatePresence>

      <div className="max-w-[1700px] mx-auto p-6 space-y-6 relative z-10">
        
        {/* Header Section */}
        <div className={`flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-8 rounded-[32px] border transition-all duration-500 shadow-sm relative overflow-hidden ${isCrisisMode ? 'border-rose-200 shadow-rose-100' : 'border-slate-100'}`}>
           <div className="flex items-center gap-6 relative z-10">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transition-colors duration-500 ${isCrisisMode ? 'bg-rose-600' : 'bg-blue-600'}`}>
                {user?.name?.[0] || 'D'}
              </div>
              <div>
                <h1 className="text-[28px] font-bold text-slate-900 tracking-tight leading-none mb-2">Welcome back, <span className={isCrisisMode ? 'text-rose-600' : 'text-blue-600'}>{user?.name?.split(' ')[0] || 'Agent'}</span></h1>
                <p className="text-slate-400 text-[14px] font-medium flex items-center gap-2 uppercase tracking-wide">
                   YOU HAVE <span className="text-rose-500 font-black">35 ACTIVE CASES</span> AND <span className="text-rose-500 font-black">9 CRITICAL ALERTS</span> NEEDING ATTENTION.
                </p>
              </div>
           </div>
            <div className="flex items-center gap-4 mt-6 md:mt-0">
              <button 
                onClick={toggleCrisisMode}
                className={`px-6 py-3 rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 transition-all shadow-xl ${
                  isCrisisMode ? 'bg-rose-600 text-white animate-pulse shadow-rose-500/20' : 'bg-slate-900 text-white'
                }`}
              >
                <ShieldAlert size={18} />
                {isCrisisMode ? 'Deactivate Red Alert' : 'Trigger Crisis'}
              </button>
              <button 
                onClick={() => navigate('/tasks')}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all"
              >
                <Globe size={18} />
                Mission Control
              </button>
           </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search missions, locations, or categories..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-100 rounded-[24px] py-5 pl-14 pr-6 text-[14px] shadow-sm outline-none focus:ring-4 ring-blue-500/5 transition-all font-medium"
              />
           </div>
           <div className="bg-white p-1 rounded-full border border-slate-100 shadow-sm flex gap-1">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(lvl => (
                <button 
                  key={lvl}
                  onClick={() => setSelectedUrgency(lvl)}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black tracking-widest transition-all ${
                    selectedUrgency === lvl ? 'bg-slate-900 text-white' : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
           </div>
        </div>

        {/* Action Tabs Quick Link */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <button onClick={() => navigate('/reports')} className="flex items-center justify-between p-7 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                    <Activity size={20} />
                 </div>
                 <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.1em] group-hover:text-slate-900 transition-all">View Active Cases</span>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
           </button>
           <button onClick={() => navigate('/volunteers')} className="flex items-center justify-between p-7 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
                    <Users size={20} />
                 </div>
                 <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.1em] group-hover:text-slate-900 transition-all">Assign Volunteers</span>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
           </button>
           <button onClick={() => navigate('/resources')} className="flex items-center justify-between p-7 bg-white border border-slate-100 rounded-[28px] shadow-sm hover:shadow-md transition-all group">
              <div className="flex items-center gap-5">
                 <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                    <Package size={20} />
                 </div>
                 <span className="text-[12px] font-black text-slate-500 uppercase tracking-[0.1em] group-hover:text-slate-900 transition-all">Manage Resources</span>
              </div>
              <ChevronRight size={20} className="text-slate-300 group-hover:translate-x-1 transition-all" />
           </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
           {stats.map(s => (
             <div key={s.label} className="bg-white p-7 rounded-[32px] border border-slate-100 shadow-sm relative overflow-hidden group hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${s.color}10`, color: s.color }}>
                      <s.icon size={24} />
                   </div>
                </div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{s.label}</p>
                <p className="text-[34px] font-black text-slate-900 mb-1 leading-none">{s.value}</p>
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{s.sub}</p>
             </div>
           ))}
        </div>

        {/* Main Grid: Forecast, Map, Triage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           
           {/* Column 1: AI Forecast & Triage */}
           <div className="lg:col-span-3 space-y-6">
              {/* AI Strategic Forecast */}
              <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Zap size={60} />
                 </div>
                 <div className="flex items-center justify-between mb-8 relative z-10">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                       <Radio size={16} className="text-blue-400" />
                       AI Strategic Forecast
                    </h3>
                    <button className="text-[9px] font-black text-blue-400 uppercase tracking-widest border border-blue-400/30 px-3 py-1 rounded-full">AI Insights</button>
                 </div>
                 <div className="space-y-6 relative z-10">
                    {[
                      { type: 'MEDICAL EMERGENCY', loc: 'VADODARA CENTRAL', color: 'rose' },
                      { type: 'SHELTER SUPPORT', loc: 'HAKLAPUR, VADODARA', color: 'blue' },
                      { type: 'MEDICAL EMERGENCY', loc: 'MAKARPURA, VADODARA', color: 'rose' },
                    ].map((f, i) => (
                      <div key={i} className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                         <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${f.color === 'rose' ? 'bg-rose-500 animate-pulse' : 'bg-blue-500'}`} />
                            <span className="text-[10px] font-black tracking-widest uppercase">{f.type}</span>
                         </div>
                         <p className="text-[11px] font-bold opacity-60 uppercase">{f.loc}</p>
                         <div className="flex gap-2">
                            <button onClick={() => navigate('/tasks')} className="px-4 py-2 bg-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Deploy Unit</button>
                            <button onClick={() => navigate('/resources')} className="px-4 py-2 bg-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest">Dispatch Stock</button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>

              {/* Regional Triage Hub */}
              <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900">
                       <Shield size={16} className="text-blue-600" />
                       Regional Triage Hub
                    </h3>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Cases</span>
                 </div>
                 <div className="space-y-7">
                    {['VADODARA CENTRAL', 'AJMER ROAD', 'GOTRI ROAD', 'ALAKAPURI', 'SECTOR 10'].map((loc, i) => (
                       <div key={loc} className="flex items-center justify-between group cursor-pointer" onClick={() => navigate('/reports')}>
                          <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all">
                                <MapPin size={18} />
                             </div>
                             <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase leading-none mb-1">{loc}</p>
                                <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest">Medical Emergency</p>
                             </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); navigate('/volunteers'); }} className="px-4 py-1.5 bg-slate-100 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Assign</button>
                       </div>
                    ))}
                 </div>
              </div>
           </div>

           {/* Column 2: Live Map (Main Center) */}
           <div className="lg:col-span-9">
              <div className="bg-white rounded-[40px] border border-slate-100 shadow-sm overflow-hidden h-[860px] relative group">
                 <div className="absolute top-8 left-8 z-20">
                    <div className="bg-slate-900 text-white px-7 py-3 rounded-full shadow-2xl flex items-center gap-3">
                       <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                       <span className="text-[11px] font-black uppercase tracking-[0.2em]">Live Operations Map</span>
                    </div>
                 </div>
                 
                 <div className="absolute top-8 right-8 z-20 flex flex-col gap-3">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-[32px] shadow-2xl border border-white/50 space-y-5">
                       {[
                         { val: 9, label: 'CRITICAL AREAS', color: 'rose' },
                         { val: 35, label: 'ACTIVE CASES', color: 'blue' },
                         { val: '4.2 min', label: 'AVG RESPONSE', color: 'amber' },
                         { val: 30, label: 'FIELD UNITS', color: 'emerald' },
                       ].map(m => (
                         <div key={m.label} className="text-center">
                            <p className={`text-[14px] font-black text-${m.color}-600 leading-none mb-1`}>{m.val}</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">{m.label}</p>
                            <div className="w-full h-[1px] bg-slate-100 mt-4 last:hidden" />
                         </div>
                       ))}
                    </div>
                    <button className="w-14 h-14 bg-white rounded-2xl shadow-xl flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all border border-slate-100">
                       <MoreVertical size={22} />
                    </button>
                    <button className="w-14 h-14 bg-blue-600 rounded-2xl shadow-xl flex items-center justify-center text-white hover:bg-blue-700 transition-all shadow-blue-500/30">
                       <MapIcon size={22} />
                    </button>
                 </div>

                 <div className="h-full w-full grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700">
                    <MapView reports={reports} volunteers={volunteers} cityCoordinates={cityCoordinates} focusedLocation={focusedLocation} />
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Section: Predictive, Deployments, Audit */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
           {/* AI Logistics Predictive Scan */}
           <div className="lg:col-span-3 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between">
                 <h3 className="text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900">
                    <BarChart3 size={16} className="text-blue-600" />
                    AI Logistics Predictive Scan
                 </h3>
              </div>
              <div className="space-y-6">
                 {[
                   { label: 'SHORTAGE EXPECTED', prob: '82%', type: 'PREPARE 120 PACKS FOOD', color: 'blue' },
                   { label: 'FLOOD RISK INCREASE', prob: '94%', type: 'DEPLOY RESCUE BOATS TO NADIA', color: 'blue' },
                   { label: 'MEDICAL REQUESTS STABLE', prob: '75%', type: 'MAINTAIN CURRENT SHIFT', color: 'blue' },
                 ].map((p, i) => (
                   <div key={i} className="space-y-3">
                      <div className="flex justify-between items-center">
                         <p className="text-[9px] font-black text-slate-900 uppercase tracking-widest">{p.label}</p>
                         <span className="text-[11px] font-black text-blue-600">{p.prob} Conf.</span>
                      </div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{p.type}</p>
                      <div className="grid grid-cols-2 gap-2">
                         <button className="py-2 bg-blue-600 text-white rounded-lg text-[9px] font-black uppercase tracking-widest">Dispatch Now</button>
                         <button className="py-2 bg-slate-100 text-slate-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Assign Vols</button>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           {/* Active Deployments */}
           <div className="lg:col-span-4 bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-2 text-slate-900">
                    <Radio size={16} className="text-blue-600" />
                    Active Deployments
                 </h3>
                 <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">8 Field Units</span>
              </div>
              <div className="space-y-8 flex-1">
                 {[
                   { id: 'MSN-3012', type: 'SHELTER SUPPORT', progress: 55, status: 'IN PROGRESS' },
                   { id: 'MSN-2219', type: 'ELDERLY CARE SUPPORT', progress: 82, status: 'IN PROGRESS' },
                   { id: 'MSN-2917', type: 'WOMEN SAFETY SUPPORT', progress: 38, status: 'IN PROGRESS' },
                 ].map((item, i) => (
                   <div key={i} className="space-y-3 cursor-pointer group/item" onClick={() => navigate('/tasks')}>
                      <div className="flex justify-between items-end">
                         <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 group-hover/item:text-blue-500 transition-colors">{item.id}</p>
                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{item.type}</p>
                         </div>
                         <span className="text-[9px] font-black text-blue-600 uppercase">{item.status}</span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                         <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${item.progress}%` }}
                           className="h-full bg-blue-600 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.2)]"
                         />
                      </div>
                   </div>
                 ))}
              </div>
              <button 
                 onClick={() => navigate('/tasks')}
                 className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] mt-8 hover:bg-black transition-all"
              >
                 View All Mission Logs
              </button>
           </div>

           {/* Tactical Audit Log */}
           <div className="lg:col-span-5 bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-[13px] font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Terminal size={16} className="text-blue-400" />
                    Tactical Audit Log
                 </h3>
                 <span className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Feed
                 </span>
              </div>
              <div className="space-y-6 font-mono max-h-[350px] overflow-y-auto pr-4 scrollbar-hide">
                 {[
                   { time: '08:42:17 AM', user: 'MISSION', action: 'ACTIVITY RECORD #1: TACTICAL EVENT PROCESSED IN THE SYSTEM.' },
                   { time: '08:41:05 AM', user: 'VOLUNTEER', action: 'ACTIVITY RECORD #2: LOGISTICAL UPDATE PROCESSED IN THE SYSTEM.' },
                   { time: '08:35:22 AM', user: 'MISSION', action: 'ACTIVITY RECORD #3: TACTICAL EVENT PROCESSED IN THE SYSTEM.' },
                   { time: '08:32:10 AM', user: 'MISSION', action: 'ACTIVITY RECORD #4: TACTICAL EVENT PROCESSED IN THE SYSTEM.' },
                   { time: '08:28:45 AM', user: 'VOLUNTEER', action: 'ACTIVITY RECORD #5: LOGISTICAL UPDATE PROCESSED IN THE SYSTEM.' },
                 ].map((log, i) => (
                   <div key={i} className="space-y-1 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="flex items-center gap-3">
                         <span className="text-[10px] text-blue-400">{log.time}</span>
                         <span className={`text-[10px] font-black px-2 py-0.5 rounded ${log.user === 'MISSION' ? 'bg-blue-500/20 text-blue-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{log.user}</span>
                      </div>
                      <p className="text-[11px] leading-relaxed tracking-tight">{log.action}</p>
                   </div>
                 ))}
              </div>
              <button 
                 onClick={() => alert('SYNCHRONIZING MISSION DATA... Tactical Report #SR-2024 is being compiled for download.')}
                 className="w-full py-4 mt-8 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all"
              >
                 <Download size={16} className="text-blue-400" />
                 <span className="text-[11px] font-black uppercase tracking-widest">Download Mission Report</span>
              </button>
           </div>
        </div>

        {/* Need Distribution Chart */}
        <div className="bg-white rounded-[40px] p-10 border border-slate-100 shadow-sm space-y-10">
           <div className="flex items-center justify-between">
              <div>
                 <h3 className="text-[20px] font-black text-slate-900 uppercase tracking-tight">Need Distribution</h3>
                 <p className="text-[12px] font-bold text-slate-400 mt-1 uppercase tracking-widest">Real-time analysis of community requirements</p>
              </div>
              <button className="px-6 py-2.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">Weekly Trend</button>
           </div>
           <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                       dataKey="name" 
                       axisLine={false} 
                       tickLine={false} 
                       tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }}
                       dy={15}
                    />
                    <YAxis hide />
                    <Tooltip 
                       cursor={{ fill: '#f8fafc' }}
                       contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)', padding: '20px' }}
                    />
                    <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={32}>
                       {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
           </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
