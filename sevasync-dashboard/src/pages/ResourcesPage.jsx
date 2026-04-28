import React, { useMemo, useState, useEffect, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Package, MapPin, Truck, AlertTriangle, Droplets, 
  Activity, X, Plus, Send, RefreshCcw, LayoutGrid, 
  Settings, ChevronRight, Sparkles, Filter, MoreHorizontal,
  History, Info, CheckCircle2, Zap, ArrowUpRight, Boxes,
  BarChart3, MousePointer2, ExternalLink, Globe, ShieldCheck,
  ChevronLeft, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { resourceService } from '../services/api';

// Memoized Resource Card for Grid View (New)
const ResourceCard = memo(({ resource, onSend, onRestock }) => {
  const isCritical = resource.quantity < 20;
  const isLow = resource.quantity < 100 && resource.quantity >= 20;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-white rounded-[40px] border-2 border-slate-100 p-8 transition-all duration-500 hover:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.1)] group overflow-hidden"
    >
       <div className="flex justify-between items-start mb-8">
          <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${
             isCritical ? 'bg-rose-50 text-rose-600 shadow-rose-100' : 
             isLow ? 'bg-amber-50 text-amber-600 shadow-amber-100' : 'bg-emerald-50 text-emerald-600 shadow-emerald-100'
          }`}>
             {resource.type?.toLowerCase().includes('water') ? <Droplets size={28} /> : 
              resource.type?.toLowerCase().includes('food') ? <Boxes size={28} /> : 
              resource.type?.toLowerCase().includes('medical') ? <Activity size={28} /> : <Package size={28} />}
          </div>
          <div className="text-right">
             <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                isCritical ? 'bg-rose-50 text-rose-600 border-rose-100' : 
                isLow ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
             }`}>
                {isCritical ? 'Critical' : isLow ? 'Low Stock' : 'Stable'}
             </div>
          </div>
       </div>

       <div className="mb-8">
          <h4 className="text-[22px] font-black text-slate-900 mb-1 group-hover:text-blue-600 transition-colors">{resource.type}</h4>
          <div className="flex items-center gap-2 text-slate-400">
             <MapPin size={14} className="text-blue-500" />
             <span className="text-[12px] font-bold uppercase tracking-widest">{resource.location} Tactical Hub</span>
          </div>
          
          <div className="mt-4 flex items-start gap-2 bg-gradient-to-r from-blue-50 to-transparent p-3 rounded-xl border-l-2 border-blue-400">
             <Zap size={14} className="text-blue-500 mt-0.5 shrink-0" />
             <div>
                <span className="text-[9px] font-black text-blue-600 uppercase tracking-[0.2em] block mb-0.5">AI Forecast</span>
                <span className="text-[11px] font-bold text-slate-600 leading-tight">
                  {isCritical ? 'CRITICAL SHORTAGE. 98% CHANCE OF DEPLETION IN 2H.' : isLow ? 'HIGH DEMAND EXPECTED FROM NEARBY SECTORS.' : 'STOCK SUFFICIENT FOR PROJECTED 48H DEMAND.'}
                </span>
             </div>
          </div>
       </div>

       <div className="bg-slate-50 rounded-[32px] p-6 mb-8 border border-slate-100 relative">
          <div className="flex justify-between items-end mb-4">
             <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Level</p>
                <h2 className="text-[36px] font-black text-slate-900 leading-none">{resource.quantity}</h2>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Condition</p>
                <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-600 shadow-sm uppercase">
                  {resource.expiry || 'Optimal'}
                </div>
             </div>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
             <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((resource.quantity / 500) * 100, 100)}%` }}
                className={`h-full rounded-full ${isCritical ? 'bg-rose-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'}`}
             />
          </div>
       </div>

       <div className="grid grid-cols-2 gap-3">
          <button 
             onClick={() => onSend(resource)}
             className="py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
             <Send size={14} /> Dispatch
          </button>
          <button 
             onClick={() => onRestock(resource)}
             className="py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
             <RefreshCcw size={14} /> Restock
          </button>
       </div>
    </motion.div>
  );
});

const ResourcesPage = ({ resources, setResources, cityCoordinates }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [activeResource, setActiveResource] = useState(null);
  const [notification, setNotification] = useState(null);

  const categories = ['All', 'Food', 'Water', 'Medical', 'Shelter', 'Logistics'];
  const statuses = ['All', 'Stable', 'Low', 'Critical'];

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const filteredResources = useMemo(() => {
    return (resources || []).filter(r => {
      const type = r.type || '';
      const matchSearch = type.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchCat = selectedCategory === 'All' || type.includes(selectedCategory);
      
      const qty = r.quantity || 0;
      const statusLabel = qty < 20 ? 'Critical' : qty < 100 ? 'Low' : 'Stable';
      const matchStatus = selectedStatus === 'All' || statusLabel === selectedStatus;
      
      return matchSearch && matchCat && matchStatus;
    });
  }, [resources, debouncedSearch, selectedCategory, selectedStatus]);

  useEffect(() => setCurrentPage(1), [debouncedSearch, selectedCategory, selectedStatus]);

  const paginatedResources = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredResources.slice(start, start + itemsPerPage);
  }, [filteredResources, currentPage]);

  const totalPages = Math.ceil(filteredResources.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalCount = resources.length || 1;
    const criticalCount = resources.filter(r => r.quantity < 20).length;
    const lowCount = resources.filter(r => r.quantity < 100 && r.quantity >= 20).length;
    // Efficiency is 100% minus the percentage of items that are low or critical
    const calculatedEfficiency = Math.round(100 - ((criticalCount * 2 + lowCount) / (totalCount * 2)) * 100);
    
    return {
      total: resources.length,
      low: lowCount,
      critical: criticalCount,
      efficiency: Math.min(Math.max(calculatedEfficiency, 0), 100) // Keep between 0-100
    };
  }, [resources]);

  return (
    <div className="p-8 space-y-10 animate-fade-in max-w-[1800px] mx-auto pb-24 relative">
      
      {/* Notification Overlay */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[400px] border ${
              notification.type === 'error' ? 'bg-rose-600 text-white border-rose-500' : 'bg-emerald-600 text-white border-emerald-500'
            }`}
          >
            {notification.type === 'error' ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase opacity-80">Logistics Update</p>
              <p className="text-sm font-bold">{notification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Tactical Command Header */}
      <div className="bg-white rounded-[40px] p-10 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-slate-100 relative overflow-hidden group">
         <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-50/50 rounded-full blur-3xl group-hover:bg-blue-100/50 transition-colors duration-1000" />
         
         <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="flex items-start gap-6">
               <div className="w-20 h-20 rounded-[28px] bg-slate-900 flex items-center justify-center text-white shadow-2xl shadow-slate-900/20 relative">
                  <div className="absolute inset-0 rounded-[28px] bg-blue-400 animate-pulse opacity-20" />
                  <Boxes size={36} className="relative z-10" />
               </div>
               <div>
                  <div className="flex items-center gap-3 mb-2">
                     <h1 className="text-[42px] font-black tracking-tighter text-slate-900 leading-none">Resource Command</h1>
                     <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-600 rounded-full border border-blue-100 text-[10px] font-black tracking-widest uppercase">
                        <Zap size={12} fill="currentColor" />
                        Smart Logistics Active
                     </div>
                  </div>
                  <p className="text-slate-500 text-lg font-medium max-w-2xl">
                     Real-time inventory management, predictive supply allocation, and cross-sector resource synchronization.
                  </p>
               </div>
            </div>

            <div className="flex items-center gap-4">
               <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black text-[13px] tracking-[0.1em] uppercase transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-3 group active:scale-95"
               >
                  <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add Resource
               </button>
            </div>
         </div>
      </div>

      {/* 2. Intelligence Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
         {[
           { title: 'Inventory Units', val: stats.total, sub: 'Global Stock', color: 'blue', icon: Package },
           { title: 'Critical Alert', val: stats.critical, sub: 'Immediate Action', color: 'rose', icon: AlertTriangle },
           { title: 'Low Inventory', val: stats.low, sub: 'Pending Restock', color: 'amber', icon: Zap },
           { title: 'Logistics Score', val: `${stats.efficiency}%`, sub: 'System Efficiency', color: 'emerald', icon: BarChart3 },
         ].map((stat) => (
           <div key={stat.title} className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
              <div className="flex items-center justify-between mb-6">
                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-${stat.color}-600 bg-${stat.color}-50 group-hover:scale-110 transition-transform`}>
                    <stat.icon size={24} />
                 </div>
                 <ArrowUpRight size={20} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.title}</p>
              <h2 className="text-[36px] font-black text-slate-900 leading-none">{stat.val}</h2>
              <p className="text-[13px] font-bold text-slate-500 mt-2">{stat.sub}</p>
           </div>
         ))}
      </div>

      {/* 3. Control Center: Search & Filter */}
      <div className="flex flex-col xl:flex-row gap-6 items-center">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={22} />
            <input 
              type="text" 
              placeholder="SEARCH BY RESOURCE NAME, CATEGORY, OR LOCATION" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-100 rounded-[28px] py-6 pl-16 pr-8 text-[15px] font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/5 transition-all shadow-sm placeholder:text-slate-300 placeholder:uppercase placeholder:tracking-widest"
            />
         </div>
         
         <div className="flex gap-4 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
            <div className="flex bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm gap-2">
               {['All', 'Critical', 'Low'].map(status => (
                  <button
                     key={status}
                     onClick={() => setSelectedStatus(status)}
                     className={`px-8 py-3 rounded-[20px] text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                        selectedStatus === status 
                        ? 'bg-slate-900 text-white shadow-xl' 
                        : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                     }`}
                  >
                     {status === 'All' ? 'All Inventory' : status}
                  </button>
               ))}
            </div>
            
            <select 
               value={selectedCategory} 
               onChange={(e) => setSelectedCategory(e.target.value)}
               className="bg-white border border-slate-100 rounded-[28px] px-8 py-4 text-[13px] font-black text-slate-700 outline-none shadow-sm cursor-pointer appearance-none hover:border-blue-200 transition-colors min-w-[180px]"
            >
               {categories.map(c => <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>)}
            </select>
         </div>
      </div>

      {/* 4. Main Resource Grid & AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
         
         {/* Inventory Grid */}
         <div className="lg:col-span-8 space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <AnimatePresence mode="popLayout">
                  {paginatedResources.map((res) => (
                    <ResourceCard 
                      key={res.id} 
                      resource={res} 
                      onSend={(r) => { setActiveResource(r); setIsSendModalOpen(true); }}
                      onRestock={(r) => { setActiveResource(r); setIsRestockModalOpen(true); }}
                    />
                  ))}
               </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 pt-6">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                   <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Page</span>
                   <span className="text-[18px] font-black text-slate-900">{currentPage} / {totalPages}</span>
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-14 h-14 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 disabled:opacity-30 transition-all shadow-sm"
                >
                  <ChevronRightIcon size={20} />
                </button>
              </div>
            )}
         </div>

         {/* Right Panel: Smart Logistics */}
         <div className="lg:col-span-4 space-y-10">
            <div className="bg-slate-900 rounded-[48px] p-10 text-white shadow-2xl relative overflow-hidden">
               <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl" />
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-10">
                     <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                        <Sparkles size={24} />
                     </div>
                     <h3 className="text-[20px] font-black uppercase tracking-tight">Smart Logistics</h3>
                  </div>

                  <div className="space-y-8">
                      {[
                        { title: 'Stock Surplus detected', hub: 'Surat Hub', action: 'Move 500 Food Packs', target: 'Vadodara Crisis Zone' },
                        { title: 'Critical Shortage predicted', hub: 'Bhopal Sector', action: 'Divert Water Supply', target: 'Route B-04' },
                      ].map((item, i) => (
                        <div 
                          key={i} 
                          onClick={() => showNotification("LOGISTICS DIVERTED", `Rerouting supplies from ${item.hub} to ${item.target} initiated.`)}
                          className="p-6 rounded-[32px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
                        >
                           <div className="flex justify-between items-start mb-4">
                              <div>
                                 <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-1">{item.title}</p>
                                 <h4 className="text-[16px] font-black">{item.hub}</h4>
                              </div>
                              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                 <ArrowUpRight size={14} />
                              </div>
                           </div>
                           <div className="flex items-center gap-3 text-[13px] font-bold text-slate-300">
                              <Truck size={14} /> {item.action} 
                              <span className="text-white">→ {item.target}</span>
                           </div>
                        </div>
                      ))}

                     <button 
                        onClick={() => showNotification("LOGISTICS OPTIMIZED", "AI has recalculated all delivery vectors for 98% efficiency.")}
                        className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[12px] shadow-xl shadow-blue-600/20 transition-all active:scale-95"
                      >
                         Optimize All Routes
                      </button>
                  </div>
               </div>
            </div>

            <div className="bg-white rounded-[48px] p-10 border border-slate-100 shadow-sm">
               <div className="flex items-center justify-between mb-10">
                  <h3 className="text-[18px] font-black uppercase tracking-tight text-slate-900">Recent Dispatches</h3>
                  <History size={20} className="text-slate-300" />
               </div>
               <div className="space-y-8">
                  {[
                    { label: 'Medical Kits', to: 'Sector 4', time: '2m ago', status: 'In Transit' },
                    { label: 'Water Pallets', to: 'Ahmedabad', time: '14m ago', status: 'Delivered' },
                    { label: 'Emergency Shelters', to: 'Surat', time: '1h ago', status: 'In Transit' },
                  ].map((log, i) => (
                    <div key={i} className="flex items-center justify-between">
                       <div className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${log.status === 'Delivered' ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
                          <div>
                             <p className="text-[14px] font-black text-slate-900">{log.label}</p>
                             <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{log.to} • {log.time}</p>
                          </div>
                       </div>
                       <ChevronRight size={16} className="text-slate-300" />
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
         {isAddModalOpen && (
           <Modal title="INTELLIGENT RESOURCE ENTRY" onClose={() => setIsAddModalOpen(false)}>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 const formData = new FormData(e.target);
                 const data = {
                    type: formData.get('type'),
                    quantity: parseInt(formData.get('quantity')),
                    location: formData.get('location'),
                    status: 'Available'
                 };
                 try {
                    const res = await resourceService.create(data);
                    setResources(prev => [...prev, res.data]);
                    showNotification("SUPPLY AUTHORIZED", "New resource entry has been synchronized globally.");
                    setIsAddModalOpen(false);
                 } catch (err) {
                    showNotification("ENTRY FAILED", "Unable to synchronize new resource with command center.", "error");
                 }
              }} className="space-y-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resource Name</label>
                    <input name="type" required type="text" placeholder="e.g. Oxygen Cylinders" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 focus:bg-white transition-all outline-none font-bold" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</label>
                       <select className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold">
                          {categories.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Storage Hub</label>
                       <select name="location" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold">
                          {Object.keys(cityCoordinates || {}).map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Initial Quantity</label>
                    <input name="quantity" required type="number" placeholder="Enter amount" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold" />
                 </div>
                 <button type="submit" className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-[0.98]">
                    Authorize Supply Entry
                 </button>
              </form>
           </Modal>
         )}

         {isSendModalOpen && (
           <Modal title="AUTHORIZE RESOURCE DISPATCH" onClose={() => setIsSendModalOpen(false)}>
              <div className="space-y-8">
                 <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm">
                       <Package size={32} />
                    </div>
                    <div>
                       <p className="text-[18px] font-black text-slate-900">{activeResource?.type}</p>
                       <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest">{activeResource?.quantity} Units Available</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Mission</label>
                    <select className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold">
                       <option>Mission SS-1045 Relief</option>
                       <option>Vadodara Emergency Case #442</option>
                       <option>Ahmedabad Flood Response</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Quantity</label>
                    <input id="dispatchQty" type="number" placeholder="Enter units to send" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold" />
                 </div>
                 <button 
                    onClick={async () => { 
                       const qtyInput = document.getElementById('dispatchQty');
                       const qty = parseInt(qtyInput.value);
                       if (!qty || qty <= 0) return;
                       
                       // Tactical Logic: Try backend, fallback to local for CSV items
                       try {
                          // Check if ID is numeric (real backend record)
                          const isNumericId = !isNaN(activeResource.id);
                          if (isNumericId) {
                             await resourceService.dispatch(activeResource.id, qty);
                          }
                          
                          setResources(prev => prev.map(r => r.id === activeResource.id ? { ...r, quantity: r.quantity - qty } : r));
                          showNotification("DISPATCH AUTHORIZED", "Resources are now in transit to the target sector."); 
                          setIsSendModalOpen(false); 
                       } catch (err) {
                          // If it failed but we have it locally, still update for demo purposes
                          setResources(prev => prev.map(r => r.id === activeResource.id ? { ...r, quantity: r.quantity - qty } : r));
                          showNotification("LOCAL DISPATCH", "Resource moved locally. Server sync pending for this unit.", "info");
                          setIsSendModalOpen(false);
                       }
                    }}
                    className="w-full py-6 bg-blue-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-[0.98]"
                 >
                    Confirm Dispatch
                 </button>
              </div>
           </Modal>
         )}

         {isRestockModalOpen && (
           <Modal title="SUPPLY REPLENISHMENT" onClose={() => setIsRestockModalOpen(false)}>
              <div className="space-y-8">
                 <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-sm">
                       <RefreshCcw size={32} />
                    </div>
                    <div>
                       <p className="text-[18px] font-black text-slate-900">{activeResource?.type}</p>
                       <p className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">Current Stock: {activeResource?.quantity}</p>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Restock Quantity</label>
                    <input id="restockQty" type="number" placeholder="Enter quantity received" className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-[24px] focus:border-blue-500/20 transition-all outline-none font-bold" />
                 </div>
                 <button 
                    onClick={async () => { 
                       const qtyInput = document.getElementById('restockQty');
                       const qty = parseInt(qtyInput.value);
                       if (!qty || qty <= 0) return;
                       
                       try {
                          const isNumericId = !isNaN(activeResource.id);
                          if (isNumericId) {
                             await resourceService.restock(activeResource.id, qty);
                          }
                          
                          setResources(prev => prev.map(r => r.id === activeResource.id ? { ...r, quantity: r.quantity + qty } : r));
                          showNotification("STOCK REPLENISHED", "Inventory levels have been updated globally."); 
                          setIsRestockModalOpen(false); 
                       } catch (err) {
                          setResources(prev => prev.map(r => r.id === activeResource.id ? { ...r, quantity: r.quantity + qty } : r));
                          showNotification("LOCAL RESTOCK", "Inventory updated locally. Server sync pending.", "info");
                          setIsRestockModalOpen(false);
                       }
                    }}
                    className="w-full py-6 bg-emerald-600 text-white rounded-[32px] font-black uppercase tracking-[0.2em] text-[13px] shadow-2xl shadow-emerald-600/30 hover:bg-emerald-700 transition-all active:scale-[0.98]"
                 >
                    Finalize Restock
                 </button>
              </div>
           </Modal>
         )}
      </AnimatePresence>
    </div>
  );
};

// Tactical Modal Wrapper
const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md">
     <motion.div 
       initial={{ opacity: 0, scale: 0.9, y: 40 }}
       animate={{ opacity: 1, scale: 1, y: 0 }}
       exit={{ opacity: 0, scale: 0.9, y: 40 }}
       className="w-full max-w-xl bg-white rounded-[48px] shadow-2xl overflow-hidden relative border border-white/20"
     >
        <div className="p-10 border-b border-slate-50 flex items-center justify-between">
           <h3 className="text-[20px] font-black uppercase tracking-tight text-slate-900">{title}</h3>
           <button onClick={onClose} className="w-12 h-12 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-all">
              <X size={24} />
           </button>
        </div>
        <div className="p-10">
           {children}
        </div>
     </motion.div>
  </div>
);

export default ResourcesPage;
