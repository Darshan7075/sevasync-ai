import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Briefcase, Filter, AlertTriangle, 
  CheckCircle2, Clock, MapPin, ChevronRight,
  Target, Users, Zap, MoreVertical, ShieldAlert,
  Eye, MessageSquare, Trash2, Edit3, Sparkles, X, Info, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../services/api';

const CasesPage = ({ reports, setReports, volunteers, isCrisisMode, isLoading }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [selectedCase, setSelectedCase] = useState(null);
  const [activeNotification, setActiveNotification] = useState(null);
  const navigate = useNavigate();

  const filteredCases = useMemo(() => {
    return (reports || []).filter(r => {
      const matchesSearch = (r.area || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (r.issue_type || r.issue || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (r.id || '').toString().includes(searchTerm);
      const matchesFilter = filter === 'All' || r.status === filter || r.urgency === filter;
      return matchesSearch && matchesFilter;
    });
  }, [reports, searchTerm, filter]);

  const stats = useMemo(() => ({
    total: reports?.length || 0,
    critical: reports?.filter(r => r.urgency === 'High' || (r.urgency_score && r.urgency_score >= 8)).length || 0,
    active: reports?.filter(r => r.status === 'Assigned' || r.status === 'In Progress' || r.status === 'Pending').length || 0,
    resolved: reports?.filter(r => r.status === 'Resolved').length || 0
  }), [reports]);

  const showNotification = (title, message, type = 'info') => {
    setActiveNotification({ title, message, type });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const handleUpdateStatus = async (id, status) => {
    const numericId = typeof id === 'string' ? id.replace('SS-', '') : id;
    
    try {
      await reportService.updateStatus(numericId, status);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showNotification("STATUS UPDATED", `Case SS-${id} successfully synced with tactical server.`, "success");
    } catch (error) {
      console.warn("Backend update failed, falling back to local state:", error);
      setReports(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showNotification("LOCAL UPDATE", `Case SS-${id} updated locally. (Server connection required for persistence)`, "info");
    }
  };

  const handleAIDiagnosis = (c) => {
    setSelectedCase(c);
  };

  const handleDeleteCase = (id) => {
    if (window.confirm("Archive this case?")) {
      setReports(prev => prev.filter(r => r.id !== id));
      showNotification("ARCHIVED", `Case SS-${id} moved to historical logs.`, "info");
    }
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1700px] mx-auto pb-20 relative">
      
      {/* GLOBAL NOTIFICATION OVERLAY */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[350px] border ${
              activeNotification.type === 'error' ? 'bg-red-600 text-white border-red-500' : 
              activeNotification.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {activeNotification.type === 'error' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase">{activeNotification.title}</p>
              <p className="text-xs opacity-90">{activeNotification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CASE DETAIL MODAL */}
      <AnimatePresence>
        {selectedCase && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[40px] w-full max-w-4xl shadow-2xl overflow-hidden relative"
            >
              <button onClick={() => setSelectedCase(null)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-full transition-all text-slate-400">
                <X size={24} />
              </button>

              <div className="p-12 space-y-8">
                <div className="flex items-center gap-4">
                  <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest border ${
                    selectedCase.urgency === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                  }`}>
                    <AlertTriangle size={14} className="inline mr-2" /> {selectedCase.urgency} Priority
                  </div>
                  <span className="text-slate-400 font-bold text-xs uppercase tracking-widest">Case ID: SS-{selectedCase.id}</span>
                </div>

                <h2 className="text-4xl font-black text-slate-900 uppercase font-outfit">{selectedCase.issue_type || selectedCase.issue}</h2>

                <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles size={20} className="text-blue-600" />
                    <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">AI Tactical Analysis</span>
                  </div>
                  <p className="text-slate-700 text-lg font-medium leading-relaxed italic">
                    "{selectedCase.explanation || "System analyzing historical data patterns. Standard emergency response protocols recommended."}"
                  </p>
                </div>

                <div className="flex gap-4 pt-4">
                  <button 
                    disabled={selectedCase.status === 'Resolved'}
                    onClick={() => { handleUpdateStatus(selectedCase.id, 'Resolved'); setSelectedCase(null); }}
                    className="flex-1 bg-blue-600 disabled:bg-slate-200 text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all"
                  >
                    {selectedCase.status === 'Resolved' ? 'Already Resolved' : 'Mark as Resolved'}
                  </button>
                  <button onClick={() => navigate('/map-operations')} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl text-[12px] font-black uppercase tracking-widest">
                    View on Map
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <div className="bg-[#0F172A] rounded-[40px] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
          <Briefcase size={320} className="text-blue-500/20" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-6">
              <div className="px-4 py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-full text-[11px] font-black uppercase tracking-[0.2em] text-blue-400">
                Operational Management Hub
              </div>
              <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span className="text-[9px] font-black tracking-widest text-green-400 uppercase">Live Intel Active</span>
              </div>
            </div>
            <h1 className="text-[54px] font-black tracking-tighter leading-none uppercase font-outfit mb-6">Case Management</h1>
            <p className="text-slate-400 text-lg max-w-3xl leading-relaxed opacity-80">
              Monitoring {stats.total} tactical nodes. {stats.critical} critical cases requiring immediate attention.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full md:w-auto relative z-10">
            {[
              { label: 'Total Cases', val: stats.total, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Critical Alert', val: stats.critical, icon: ShieldAlert, color: 'text-rose-500', bg: 'bg-rose-500/10' },
              { label: 'Active Missions', val: stats.active, icon: Target, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Resolved', val: stats.resolved, icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' }
            ].map((s, i) => (
              <div key={i} className={`${s.bg} backdrop-blur-xl border border-white/10 p-6 rounded-[32px] min-w-[180px]`}>
                <div className="flex items-center justify-between mb-4">
                  <s.icon size={24} className={s.color} />
                  <div className="w-2 h-2 bg-white/20 rounded-full" />
                </div>
                <p className="text-4xl font-black text-white leading-none mb-2 font-outfit">{s.val}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col xl:flex-row gap-8 items-center justify-between bg-white p-8 rounded-[40px] border border-slate-100 shadow-xl">
        <div className="relative w-full xl:w-[500px]">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search cases by ID, area or tactical type..."
            className="w-full pl-16 pr-6 py-5 bg-slate-50 border-2 border-transparent rounded-[24px] text-sm font-bold outline-none focus:border-blue-500/20 focus:bg-white transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-3 w-full xl:w-auto">
          {['All', 'High', 'Pending', 'Assigned', 'Resolved'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-8 py-4 rounded-2xl text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
                filter === f 
                ? 'bg-blue-600 text-white shadow-2xl scale-105' 
                : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cases Grid */}
      <div className="grid grid-cols-1 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredCases.map((c, i) => (
            <motion.div 
              key={c.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-100 rounded-[40px] p-10 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all group relative overflow-hidden"
            >
              <div className={`absolute top-0 left-0 w-2.5 h-full ${c.urgency === 'High' ? 'bg-rose-500' : 'bg-blue-600'}`} />
              
              <div className="flex flex-col xl:flex-row gap-12 items-start xl:items-center">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-5">
                    <span className="px-5 py-2 bg-slate-100 rounded-xl text-[11px] font-black text-slate-500 tracking-[0.2em] uppercase border border-slate-200">ID: SS-{c.id}</span>
                    <div className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${
                      c.urgency === 'High' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-blue-50 border-blue-100 text-blue-600'
                    }`}>
                      <AlertTriangle size={14} className="inline mr-2" /> {c.urgency}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border text-[11px] font-black uppercase tracking-widest ${
                      c.status === 'Resolved' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 
                      c.status === 'Assigned' ? 'bg-indigo-50 border-indigo-100 text-indigo-600' : 'bg-amber-50 border-amber-100 text-amber-600'
                    }`}>
                      <Clock size={14} className="inline mr-2" /> {c.status}
                    </div>
                  </div>

                  <h3 className="text-[32px] font-black text-slate-900 uppercase font-outfit">{c.issue_type || c.issue}</h3>
                  <div className="flex items-center gap-6 text-sm font-bold text-slate-500 uppercase tracking-widest">
                    <div className="flex items-center gap-2"><MapPin size={18} className="text-blue-500" /> {c.area}, {c.city}</div>
                    <div className="flex items-center gap-2"><Users size={18} className="text-indigo-500" /> {c.people_affected || c.people} Impacted</div>
                  </div>
                  <p className="text-slate-400 text-[16px] italic leading-relaxed max-w-4xl line-clamp-2">
                    {c.description || "Monitoring for ground updates..."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 xl:border-l border-slate-100 xl:pl-10">
                  <button 
                    disabled={c.status === 'Assigned' || c.status === 'Resolved'}
                    onClick={() => handleUpdateStatus(c.id, 'Assigned')}
                    className="p-5 bg-slate-50 disabled:bg-indigo-50 disabled:text-indigo-400 text-slate-600 rounded-[24px] hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.2em] border border-slate-200"
                  >
                    <Users size={22} /> {c.status === 'Assigned' || c.status === 'Resolved' ? 'Assigned' : 'Assign'}
                  </button>
                  <button 
                    disabled={c.status === 'Resolved'}
                    onClick={() => handleUpdateStatus(c.id, 'Resolved')}
                    className="px-10 py-5 bg-blue-600 disabled:bg-slate-200 text-white rounded-[24px] shadow-2xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3 text-[12px] font-black uppercase tracking-[0.2em]"
                  >
                    <CheckCircle2 size={22} /> {c.status === 'Resolved' ? 'Resolved' : 'Resolve'}
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => handleAIDiagnosis(c)} className="p-5 bg-slate-50 text-slate-400 rounded-[24px] hover:bg-blue-600 hover:text-white border border-slate-200 transition-all shadow-sm"><Sparkles size={18}/></button>
                    <button onClick={() => handleDeleteCase(c.id)} className="p-5 bg-slate-50 text-slate-400 rounded-[24px] hover:bg-rose-600 hover:text-white border border-slate-200 transition-all shadow-sm"><Trash2 size={18}/></button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CasesPage;
