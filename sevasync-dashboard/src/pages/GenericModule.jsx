import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, ArrowUpRight, Search, Filter } from 'lucide-react';

const GenericModule = ({ title, description, icon: Icon, data, stats, color = "#1a73e8" }) => {
  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
      
      {/* Hero Section */}
      <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <Icon size={200} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">System Module</span>
            </div>
            <h1 className="text-[36px] font-bold tracking-tight uppercase">{title}</h1>
            <p className="text-slate-400 text-[15px] mt-2">{description}</p>
         </div>
      </div>

      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="premium-card p-6 flex items-center gap-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-slate-50 border border-slate-100" style={{ color: color }}>
                   <s.icon size={24} />
                </div>
                <div>
                   <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
                   <p className="text-[24px] font-black text-slate-900">{s.val}</p>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Main Content Area */}
      <div className="premium-card p-8">
         <div className="flex justify-between items-center mb-10">
            <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">Active Records</h3>
            <div className="flex gap-4">
               <div className="relative w-64">
                  <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="text" placeholder="Search..." className="w-full pl-12 pr-4 py-3 bg-slate-50 border-none rounded-xl text-sm" />
               </div>
               <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:text-slate-900 transition-all"><Filter size={20} /></button>
            </div>
         </div>

         <div className="space-y-4">
            {data && data.length > 0 ? data.slice(0, 8).map((item, i) => (
              <div key={i} className="p-5 bg-white border border-slate-100 rounded-[24px] hover:border-blue-200 hover:shadow-lg transition-all group flex items-center justify-between">
                 <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                       <Icon size={20} />
                    </div>
                    <div>
                       <p className="text-[14px] font-black text-slate-900">{item.name || item.id || 'System Event'}</p>
                       <p className="text-[12px] font-bold text-slate-400 uppercase">{item.sub || 'Operational Detail'}</p>
                    </div>
                 </div>
                 <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                       <p className="text-[11px] font-bold text-slate-400 uppercase mb-1">Status</p>
                       <span className="text-[12px] font-black text-emerald-500">OPTIMAL</span>
                    </div>
                    <ChevronRight size={20} className="text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                 </div>
              </div>
            )) : (
              <div className="py-20 text-center space-y-4 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                 <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm text-slate-200">
                    <Icon size={32} />
                 </div>
                 <p className="text-slate-400 font-bold text-[14px]">No active data found for this module</p>
              </div>
            )}
         </div>
      </div>

    </div>
  );
};

export default GenericModule;
