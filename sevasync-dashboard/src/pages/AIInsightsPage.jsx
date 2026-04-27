import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, Zap, Target, AlertCircle, 
  Brain, Lightbulb, TrendingUp, Shield,
  ChevronRight, ArrowRight, MessageSquare, ZapOff,
  Users
} from 'lucide-react';

const AIInsightsPage = ({ reports, volunteers, resources }) => {
  
  const insights = [
    {
      title: 'Resource Optimization',
      desc: 'Predictive model suggests moving 50 units of Medical Kits from Surat to Ahmedabad due to increasing report density.',
      impact: 'High',
      category: 'Logistics',
      icon: Zap
    },
    {
      title: 'Volunteer Deployment',
      desc: 'Detected 12 agents with "Rescue" skills currently idle in Bhopal. Suggest immediate standby for Sector-4 operations.',
      impact: 'Medium',
      category: 'Personnel',
      icon: Users
    },
    {
      title: 'Crisis Probability',
      desc: 'Historical data analysis indicates a 72% chance of flash floods in the Navsari region within the next 48 hours.',
      impact: 'Critical',
      category: 'Risk',
      icon: AlertCircle
    }
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-20">
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-[32px] p-12 text-white shadow-2xl relative overflow-hidden border border-white/5">
         <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
            <Brain size={300} />
         </div>
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
               <div className="p-2 bg-indigo-500/20 rounded-lg backdrop-blur-md">
                  <Sparkles size={24} className="text-indigo-400" />
               </div>
               <span className="text-[12px] font-black text-indigo-300 uppercase tracking-[0.3em]">Neural Intelligence Active</span>
            </div>
            <h1 className="text-[48px] font-black tracking-tight leading-none mb-6">AI INSIGHTS & <br/>PREDICTIONS</h1>
            <p className="text-slate-400 text-[18px] leading-relaxed">Our proprietary AI engine analyzes live data streams to provide strategic recommendations and risk assessments.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {insights.map((insight, i) => (
           <motion.div 
             key={i}
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.1 }}
             className="premium-card p-8 group hover:border-indigo-500/30 transition-all"
           >
              <div className="flex justify-between items-start mb-8">
                 <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-500">
                    <insight.icon size={28} />
                 </div>
                 <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${
                    insight.impact === 'Critical' ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-indigo-50 text-indigo-600 border-indigo-100'
                 }`}>
                    {insight.impact} IMPACT
                 </div>
              </div>

              <div className="space-y-4 mb-10">
                 <p className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">{insight.category}</p>
                 <h3 className="text-[22px] font-black text-slate-900">{insight.title}</h3>
                 <p className="text-[14px] text-slate-500 leading-relaxed">{insight.desc}</p>
              </div>

              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-[13px] tracking-widest uppercase flex items-center justify-center gap-2 group-hover:bg-indigo-600 transition-all">
                 Accept Recommendation <ArrowRight size={18} />
              </button>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 premium-card p-10 bg-slate-50 border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-5">
               <TrendingUp size={200} />
            </div>
            <div className="relative z-10">
               <h3 className="text-[20px] font-black text-slate-900 uppercase tracking-tight mb-4">Sentiment & Trend Analysis</h3>
               <p className="text-[14px] text-slate-500 mb-10 max-w-xl">Analyzing social signals and report frequency to detect emerging crises before they escalate.</p>
               
               <div className="space-y-8">
                  {[
                    { label: 'Public Sentiment', val: 78, color: '#10b981', status: 'Positive' },
                    { label: 'Crisis Probability', val: 32, color: '#f59e0b', status: 'Stable' },
                    { label: 'Relief Efficiency', val: 91, color: '#1a73e8', status: 'Optimal' },
                  ].map(s => (
                    <div key={s.label} className="space-y-3">
                       <div className="flex justify-between items-end">
                          <p className="text-[14px] font-black text-slate-900">{s.label}</p>
                          <span className="text-[12px] font-bold" style={{ color: s.color }}>{s.status} ({s.val}%)</span>
                       </div>
                       <div className="h-3 bg-white rounded-full overflow-hidden shadow-inner">
                          <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${s.val}%` }}
                             transition={{ duration: 1.5, ease: "easeOut" }}
                             className="h-full rounded-full shadow-lg"
                             style={{ backgroundColor: s.color }}
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
         </div>

         <div className="lg:col-span-4 premium-card p-10 flex flex-col justify-between border-indigo-500/20 bg-indigo-50/30">
            <div>
               <h3 className="text-[18px] font-black text-indigo-900 uppercase tracking-tight mb-6">Ask SevaSync AI</h3>
               <p className="text-[14px] text-indigo-700/70 mb-8">Get instant answers about your operational data and resource status.</p>
               <div className="space-y-3">
                  {[
                    "What's the current water supply in Indore?",
                    "Identify the most active volunteer in Mumbai.",
                    "Show trend of medical reports for past 7 days."
                  ].map((q, i) => (
                    <button key={i} className="w-full p-4 bg-white/80 border border-indigo-100 rounded-xl text-[13px] text-indigo-900 font-medium text-left hover:bg-white hover:shadow-md transition-all flex items-center justify-between">
                       {q} <ChevronRight size={16} className="text-indigo-300" />
                    </button>
                  ))}
               </div>
            </div>
            <div className="mt-10 relative">
               <input 
                  type="text" 
                  placeholder="Ask anything..." 
                  className="w-full bg-white border border-indigo-100 rounded-2xl py-4 pl-6 pr-14 text-[14px] outline-none shadow-lg focus:ring-2 ring-indigo-500/20"
               />
               <button className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition-all">
                  <MessageSquare size={18} />
               </button>
            </div>
         </div>
      </div>

    </div>
  );
};

export default AIInsightsPage;
