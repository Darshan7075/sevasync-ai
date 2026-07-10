import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Users, Activity, 
  MapPin, AlertTriangle, CheckCircle2, Clock, 
  ArrowUpRight, ArrowDownRight, Layers, Target,
  ShieldCheck
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const AnalyticsPage = ({ reports, volunteers, resources }) => {
  
  const reportStats = useMemo(() => {
    const counts = {};
    (reports || []).forEach(r => {
      counts[r.area] = (counts[r.area] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).slice(0, 6);
  }, [reports]);

  const urgencyData = useMemo(() => {
    const high = (reports || []).filter(r => r.urgency === 'High').length;
    const med = (reports || []).filter(r => r.urgency === 'Medium').length;
    const low = (reports || []).filter(r => r.urgency === 'Low').length;
    return [
      { name: 'High', value: high, color: '#ef4444' },
      { name: 'Medium', value: med, color: '#f59e0b' },
      { name: 'Low', value: low, color: '#10b981' },
    ];
  }, [reports]);

  const timelineData = [
    { name: '08:00', reports: 12, resolved: 8 },
    { name: '10:00', reports: 18, resolved: 12 },
    { name: '12:00', reports: 35, resolved: 20 },
    { name: '14:00', reports: 25, resolved: 22 },
    { name: '16:00', reports: 42, resolved: 30 },
    { name: '18:00', reports: 30, resolved: 28 },
    { name: '20:00', reports: 15, resolved: 14 },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
      
      {/* Hero Section */}
      <div className="bg-[#0f172a] rounded-[32px] p-8 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <BarChart3 size={200} />
         </div>
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
               <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
               <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Intelligence Data Console</span>
            </div>
            <h1 className="text-[36px] font-bold tracking-tight uppercase">Operational Analytics</h1>
            <p className="text-slate-400 text-[15px] mt-2">Quantitative analysis of mission performance and incident reports</p>
         </div>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         {[
           { label: 'Response Rate', val: '94%', change: '+2.4%', up: true, icon: Activity, color: '#1a73e8' },
           { label: 'Avg. Resolution', val: '42m', change: '-5m', up: true, icon: Clock, color: '#10b981' },
           { label: 'Resource Efficiency', val: '88%', change: '+12%', up: true, icon: Target, color: '#a855f7' },
           { label: 'Critical Handled', val: '1.2K', change: '+18%', up: true, icon: ShieldCheck, color: '#ef4444' },
         ].map((s) => (
           <div key={s.label} className="premium-card p-6">
              <div className="flex justify-between items-start mb-4">
                 <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center" style={{ color: s.color }}>
                    <s.icon size={20} />
                 </div>
                 <div className={`flex items-center gap-1 text-[11px] font-black ${s.up ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {s.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {s.change}
                 </div>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-[28px] font-black text-slate-900">{s.val}</p>
           </div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         {/* Main Chart */}
         <div className="lg:col-span-8 premium-card p-8">
            <div className="flex justify-between items-center mb-10">
               <div>
                  <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">Mission Timeline</h3>
                  <p className="text-[12px] font-bold text-slate-400">Reports vs Resolution (24h period)</p>
               </div>
               <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest bg-white shadow-sm text-slate-900">24H</button>
                  <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-400">7D</button>
                  <button className="px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-400">30D</button>
               </div>
            </div>
            <div className="h-[400px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timelineData}>
                     <defs>
                        <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#1a73e8" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#1a73e8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 600, fill: '#94a3b8'}} />
                     <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                     />
                     <Area type="monotone" dataKey="reports" stroke="#1a73e8" strokeWidth={3} fillOpacity={1} fill="url(#colorReports)" />
                     <Area type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorResolved)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Distribution Chart */}
         <div className="lg:col-span-4 premium-card p-8">
            <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight mb-2">Urgency Matrix</h3>
            <p className="text-[12px] font-bold text-slate-400 mb-10">Incident priority distribution</p>
            <div className="h-[300px] w-full flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={urgencyData}
                        innerRadius={80}
                        outerRadius={100}
                        paddingAngle={10}
                        dataKey="value"
                     >
                        {urgencyData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                        ))}
                     </Pie>
                     <Tooltip />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute flex flex-col items-center">
                  <p className="text-[12px] font-bold text-slate-400 uppercase">Total</p>
                  <p className="text-[32px] font-black text-slate-900">{reports?.length || 0}</p>
               </div>
            </div>
            <div className="space-y-4 mt-8">
               {urgencyData.map(d => (
                 <div key={d.name} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3">
                       <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} />
                       <span className="text-[13px] font-bold text-slate-700">{d.name} Priority</span>
                    </div>
                    <span className="text-[14px] font-black text-slate-900">{d.value}</span>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Regional Report */}
         <div className="premium-card p-8">
            <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight mb-8">Regional Hotspots</h3>
            <div className="h-[350px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportStats}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 600, fill: '#94a3b8'}} />
                     <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                     <Bar dataKey="value" fill="#1a73e8" radius={[6, 6, 0, 0]} barSize={32} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Resource Analytics */}
         <div className="premium-card p-8">
            <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight mb-8">Resource Readiness</h3>
            <div className="space-y-6">
               {(resources || []).slice(0, 5).map(r => (
                 <div key={r.id} className="space-y-2">
                    <div className="flex justify-between items-end">
                       <div>
                          <p className="text-[14px] font-black text-slate-900 leading-none">{r.type}</p>
                          <p className="text-[11px] font-bold text-slate-400 mt-1 uppercase">{r.location}</p>
                       </div>
                       <p className="text-[16px] font-black text-slate-900">{r.quantity} Units</p>
                    </div>
                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                       <div 
                          className={`h-full rounded-full ${r.quantity > 30 ? 'bg-emerald-500' : r.quantity > 10 ? 'bg-amber-500' : 'bg-rose-500'}`} 
                          style={{ width: `${Math.min(r.quantity, 100)}%` }} 
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
};

export default AnalyticsPage;
