import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, Search, Filter, AlertTriangle, 
  ArrowUpRight, ArrowDownRight, Clock, MapPin,
  Plus, MoreVertical, CheckCircle2, History,
  TrendingUp, BarChart3, ChevronRight, Zap,
  ShieldCheck, Globe, Truck, Boxes, RefreshCcw, X
} from 'lucide-react';
import { resourceService } from '../services/api';

const Modal = ({ title, children, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
  >
    <motion.div 
      initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
      className="bg-white rounded-[40px] w-full max-w-xl shadow-2xl overflow-hidden"
    >
      <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
        <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900"><X size={20} /></button>
      </div>
      <div className="p-10">{children}</div>
    </motion.div>
  </motion.div>
);

const InventoryPage = ({ resources, setResources, cityCoordinates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL STOCK');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [notification, setNotification] = useState(null);

  const categories = ['All', 'Medical', 'Food', 'Water', 'Shelter', 'Other'];

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddResource = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      type: formData.get('type'),
      quantity: parseInt(formData.get('quantity')),
      location: formData.get('location'),
      category: formData.get('category') || 'General'
    };

    try {
      const { data } = await resourceService.create(payload);
      setResources(prev => [data, ...prev]);
      showNotification("SHIPMENT REGISTERED", "New resource units have been added to the global matrix.");
      setIsAddModalOpen(false);
      setCurrentPage(1);
    } catch (err) {
      // Local fallback for demo
      const mockNew = { ...payload, id: Date.now() };
      setResources(prev => [mockNew, ...prev]);
      showNotification("LOCAL REGISTRATION", "Shipment logged locally. Server sync pending.", "info");
      setIsAddModalOpen(false);
      setCurrentPage(1);
    }
  };

  const handleQuickRestock = async (res) => {
    try {
      const qty = 50; // Standard tactical restock
      if (!isNaN(res.id)) {
        await resourceService.restock(res.id, qty);
      }
      setResources(prev => prev.map(r => r.id === res.id ? { ...r, quantity: r.quantity + qty } : r));
      showNotification("REPLENISHMENT COMPLETE", `Added +${qty} units to ${res.type}.`);
    } catch (err) {
      showNotification("RESTOCK FAILED", "Unable to sync with central hub.", "error");
    }
  };

  const stats = useMemo(() => {
    const res = resources || [];
    return {
      total: res.length,
      lowStock: res.filter(r => (r.quantity || 0) < 30).length,
      critical: res.filter(r => (r.quantity || 0) < 10).length,
      cities: new Set(res.map(r => r.location)).size,
      efficiency: 94.8
    };
  }, [resources]);

  const filteredResources = useMemo(() => {
    return (resources || []).filter(r => {
      const matchSearch = r.type?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.location?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTab = activeTab === 'ALL STOCK' || 
                       (activeTab === 'LOW STOCK' && r.quantity < 30) ||
                       (activeTab === 'CRITICAL' && r.quantity < 10);
      return matchSearch && matchTab;
    });
  }, [resources, searchTerm, activeTab]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);
  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage]);

  // Reset page when filtering
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, activeTab]);

  return (
    <div className="p-8 space-y-10 animate-fade-in max-w-[1700px] mx-auto pb-24">
      
      {/* Tactical Notifications */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[400px] border ${
              notification.type === 'error' ? 'bg-rose-600 text-white border-rose-500' : 
              notification.type === 'info' ? 'bg-blue-600 text-white border-blue-500' : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            {notification.type === 'error' ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase opacity-80">Inventory Update</p>
              <p className="text-sm font-bold">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* 1. Tactical Intelligence Header */}
      <div className="bg-[#0f172a] rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl group-hover:bg-blue-600/20 transition-colors duration-1000" />
         <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
         
         <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-10">
            <div className="flex items-start gap-8">
               <div className="w-24 h-24 rounded-[32px] bg-white/5 border border-white/10 backdrop-blur-xl flex items-center justify-center text-blue-400 shadow-2xl">
                  <Boxes size={44} className="animate-pulse" />
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                     <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Global Logistics Protocol</span>
                  </div>
                  <h1 className="text-[48px] font-black tracking-tighter uppercase leading-none mb-4">Supply Matrix</h1>
                  <p className="text-slate-400 text-lg font-medium max-w-2xl leading-relaxed">
                     Centralized autonomous oversight for <span className="text-white font-bold">{stats.total} resource categories</span> across the regional relief network.
                  </p>
               </div>
            </div>

            <div className="flex flex-wrap gap-4">
               <button className="px-8 py-5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-[24px] font-black text-[12px] tracking-widest uppercase transition-all flex items-center gap-3 active:scale-95">
                  <History size={18} className="text-blue-400" /> Audit Vault
               </button>
               <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-[12px] tracking-widest uppercase transition-all shadow-2xl shadow-blue-500/20 flex items-center gap-3 active:scale-95 group"
               >
                  <Plus size={20} className="group-hover:rotate-90 transition-transform" /> Register Shipment
               </button>
            </div>
         </div>
      </div>

      {/* 2. Real-time Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
         {[
           { label: 'Inventory Units', val: (resources || []).reduce((acc, r) => acc + (r.quantity || 0), 0).toLocaleString(), icon: Package, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.05)' },
           { label: 'Low Stock Alerts', val: stats.lowStock, icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.05)' },
           { label: 'Critical Zones', val: stats.critical, icon: Zap, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.05)' },
           { label: 'Deployment Hubs', val: stats.cities, icon: Globe, color: '#10b981', bg: 'rgba(16, 185, 129, 0.05)' },
           { label: 'Flow Efficiency', val: `${stats.efficiency}%`, icon: TrendingUp, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.05)' },
         ].map((s, i) => (
           <motion.div 
             key={s.label}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="bg-white p-8 rounded-[36px] border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group relative overflow-hidden"
           >
              <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-125 transition-transform">
                 <s.icon size={60} />
              </div>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner" style={{ backgroundColor: s.bg, color: s.color }}>
                 <s.icon size={24} />
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{s.label}</p>
              <h2 className="text-[32px] font-black text-slate-900 tracking-tighter">{s.val}</h2>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* 3. Main Inventory Control Table */}
         <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-[48px] border border-slate-100 shadow-sm overflow-hidden relative">
               <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex bg-slate-50 p-1.5 rounded-[24px] border border-slate-100">
                     {['ALL STOCK', 'LOW STOCK', 'CRITICAL'].map(tab => (
                        <button
                           key={tab}
                           onClick={() => setActiveTab(tab)}
                           className={`px-8 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all ${
                              activeTab === tab ? 'bg-white text-blue-600 shadow-md' : 'text-slate-400 hover:text-slate-600'
                           }`}
                        >
                           {tab}
                        </button>
                     ))}
                  </div>

                  <div className="relative w-full md:w-96">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                     <input 
                        type="text" 
                        placeholder="FILTER BY HUB OR ITEM..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 border-none rounded-full py-5 pl-16 pr-6 text-[13px] font-bold outline-none focus:ring-4 ring-blue-500/5 transition-all placeholder:text-slate-300 placeholder:uppercase"
                     />
                  </div>
               </div>

               <div className="overflow-x-auto">
                  <table className="w-full text-left">
                     <thead>
                        <tr className="bg-slate-50/30">
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Resource Intel</th>
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Operational Hub</th>
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Capacity Status</th>
                           <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                        {paginatedResources.map((item, i) => (
                          <motion.tr 
                            key={item.id} 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="hover:bg-blue-50/30 transition-colors group"
                          >
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-6">
                                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 ${
                                      item.quantity < 10 ? 'bg-rose-50 border-rose-100 text-rose-500 animate-pulse' : 
                                      item.quantity < 30 ? 'bg-amber-50 border-amber-100 text-amber-500' : 
                                      'bg-blue-50 border-blue-100 text-blue-500'
                                   }`}>
                                      <Package size={24} />
                                   </div>
                                   <div>
                                      <p className="text-[16px] font-black text-slate-900 uppercase tracking-tight">{item.type}</p>
                                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">SIG: LOG-{item.id}</p>
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center gap-3 text-slate-600">
                                   <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                      <MapPin size={14} />
                                   </div>
                                   <span className="text-[14px] font-black uppercase tracking-tight">{item.location}</span>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="space-y-3 w-48">
                                   <div className="flex justify-between items-end">
                                      <span className={`text-[18px] font-black ${item.quantity < 10 ? 'text-rose-500' : 'text-slate-900'}`}>{item.quantity}</span>
                                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">UNITS</span>
                                   </div>
                                   <div className="h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-50">
                                      <motion.div 
                                         initial={{ width: 0 }}
                                         animate={{ width: `${Math.min(item.quantity, 100)}%` }}
                                         className={`h-full rounded-full ${
                                            item.quantity < 10 ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.4)]' : 
                                            item.quantity < 30 ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.4)]' : 
                                            'bg-blue-500 shadow-[0_0_12px_rgba(59,130,246,0.4)]'
                                         }`}
                                      />
                                   </div>
                                </div>
                             </td>
                             <td className="px-10 py-8">
                                <div className="flex items-center justify-end gap-4">
                                   <button 
                                      onClick={() => handleQuickRestock(item)}
                                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                   >
                                      <RefreshCcw size={18} />
                                   </button>
                                   <button 
                                      onClick={() => setActiveResource(item)}
                                      className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all shadow-sm"
                                   >
                                      <MoreVertical size={18} />
                                   </button>
                                </div>
                             </td>
                          </motion.tr>
                        ))}
                     </tbody>
                  </table>
               </div>

               {/* Pagination Controls */}
               {totalPages > 1 && (
                  <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/20">
                     <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        Showing Page {currentPage} of {totalPages}
                     </p>
                     <div className="flex gap-4">
                        <button 
                           disabled={currentPage === 1}
                           onClick={() => setCurrentPage(prev => prev - 1)}
                           className="px-6 py-2.5 rounded-xl bg-white border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
                        >
                           Previous
                        </button>
                        <button 
                           disabled={currentPage === totalPages}
                           onClick={() => setCurrentPage(prev => prev + 1)}
                           className="px-6 py-2.5 rounded-xl bg-blue-600 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20 disabled:opacity-30 transition-all"
                        >
                           Next Page
                        </button>
                     </div>
                  </div>
               )}
            </div>
         </div>

         {/* 4. Strategic Side Panel */}
         <div className="lg:col-span-4 space-y-10">
            
            {/* AI Supply Forecast */}
            <div className="bg-[#0f172a] rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-10 opacity-10">
                  <BarChart3 size={100} />
               </div>
               <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                        <Zap size={24} className="fill-blue-400" />
                     </div>
                     <h3 className="text-[20px] font-black uppercase tracking-tight">AI Supply Forecast</h3>
                  </div>

                  <div className="space-y-8">
                     {[
                       { item: 'Oxygen Cylinders', risk: 'HIGH', reason: 'Rising case density in Surat Hub.', action: 'Restock +50 Units' },
                       { item: 'Medical Kits', risk: 'MEDIUM', reason: 'Inventory drift detected in Bhopal.', action: 'Redeploy Units' },
                     ].map((item, i) => (
                       <div key={i} className="space-y-4 p-6 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer">
                          <div className="flex justify-between items-start">
                             <h4 className="text-[15px] font-black uppercase">{item.item}</h4>
                             <span className={`px-3 py-1 rounded-full text-[9px] font-black tracking-[0.1em] ${
                                item.risk === 'HIGH' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'
                             }`}>
                                {item.risk} RISK
                             </span>
                          </div>
                          <p className="text-[12px] text-slate-400 leading-relaxed italic">"{item.reason}"</p>
                          <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                             {item.action}
                          </button>
                       </div>
                     ))}
                  </div>

                  <button className="mt-10 w-full py-5 bg-blue-600 rounded-[24px] font-black uppercase tracking-[0.2em] text-[12px] hover:bg-blue-700 transition-all">
                     View Strategic Plan
                  </button>
               </div>
            </div>

            {/* Warehouse Capacity Map */}
            <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm space-y-10">
               <div className="flex items-center justify-between">
                  <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-900">Network Distribution</h3>
                  <div className="flex items-center gap-2">
                     <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Sync</span>
                  </div>
               </div>

               <div className="space-y-8">
                  {[
                    { hub: 'Surat Central', cap: 92, status: 'Full' },
                    { hub: 'Vadodara Hub', cap: 45, status: 'Optimal' },
                    { hub: 'Bhopal Sector', cap: 12, status: 'Critical' },
                  ].map((hub, i) => (
                    <div key={i} className="space-y-3">
                       <div className="flex justify-between text-[11px] font-black uppercase">
                          <span className="text-slate-900">{hub.hub}</span>
                          <span className={hub.cap > 80 ? 'text-rose-500' : hub.cap < 20 ? 'text-amber-500' : 'text-emerald-500'}>{hub.cap}%</span>
                       </div>
                       <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                          <div 
                             className={`h-full rounded-full ${hub.cap > 80 ? 'bg-rose-500' : hub.cap < 20 ? 'bg-amber-500' : 'bg-emerald-500'}`} 
                             style={{ width: `${hub.cap}%` }} 
                          />
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm">
                        <Truck size={24} />
                     </div>
                     <div>
                        <p className="text-[14px] font-black text-slate-900 uppercase">Live Shipments</p>
                        <p className="text-[11px] text-blue-600 font-bold uppercase tracking-widest">8 En-Route</p>
                     </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
               </div>
            </div>
         </div>
      </div>

      {/* Register Shipment Modal */}
      <AnimatePresence>
         {isAddModalOpen && (
           <Modal title="REGISTER NEW SHIPMENT" onClose={() => setIsAddModalOpen(false)}>
              <form onSubmit={handleAddResource} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Type</label>
                    <input name="type" required type="text" placeholder="e.g. Surgical Masks" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 focus:bg-white transition-all outline-none font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                       <select name="category" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold">
                          {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Hub</label>
                       <select name="location" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold">
                          {Object.keys(cityCoordinates || {}).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Units</label>
                    <input name="quantity" required type="number" placeholder="Enter quantity" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold" />
                 </div>
                 <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-[0.98]">
                    Authorize Supply Entry
                 </button>
              </form>
           </Modal>
         )}

         {activeResource && (
           <Modal title="RESOURCE INTELLIGENCE" onClose={() => setActiveResource(null)}>
              <div className="space-y-8">
                 <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                       <Package size={32} />
                    </div>
                    <div>
                       <h4 className="text-[20px] font-black text-slate-900">{activeResource.type}</h4>
                       <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Resource Tag: SS-LOG-{activeResource.id}</p>
                    </div>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Status</p>
                       <p className="text-[14px] font-bold text-emerald-600 uppercase">Operational</p>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                       <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Last Sync</p>
                       <p className="text-[14px] font-bold text-slate-900 uppercase">JUST NOW</p>
                    </div>
                 </div>

                 <div className="space-y-4 pt-4">
                    <button onClick={() => { showNotification("TACTICAL REPORT GENERATED", "Download link sent to command center."); setActiveResource(null); }} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-black transition-all">Download Logistics Report</button>
                    <button onClick={() => { showNotification("DECOMMISSIONING FAILED", "Admin override required to remove critical assets.", "error"); setActiveResource(null); }} className="w-full py-4 bg-white border border-rose-100 text-rose-500 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:bg-rose-50 transition-all">Decommission Asset</button>
                 </div>
              </div>
           </Modal>
         )}
      </AnimatePresence>

    </div>
  );
};

export default InventoryPage;
