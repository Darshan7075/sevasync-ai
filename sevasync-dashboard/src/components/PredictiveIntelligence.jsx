import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, AlertTriangle, ArrowUpRight, BarChart3, Zap } from 'lucide-react';

const PredictiveIntelligence = ({ reports }) => {
  const trends = useMemo(() => {
    const issues = {};
    reports.forEach(r => {
      issues[r.issue] = (issues[r.issue] || 0) + 1;
    });

    const sorted = Object.entries(issues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);
    
    return sorted.map(([name, count]) => ({
      name,
      count,
      prediction: count > 10 ? 'High probability of increase' : 'Stable',
      urgency: count > 10 ? 'urgent' : 'normal'
    }));
  }, [reports]);

  return (
    <div className="google-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-[16px] font-medium text-[#202124] flex items-center gap-2">
          <TrendingUp size={18} className="text-[#1a73e8]" />
          Predictive intelligence
        </h3>
        <div className="px-2 py-0.5 bg-[#f8f9fa] rounded text-[10px] text-[#5f6368] font-bold uppercase tracking-wider border border-[#dadce0]">
          ML Engine v4
        </div>
      </div>

      <div className="space-y-4">
        {trends.map((trend, i) => (
          <motion.div 
            key={trend.name}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-4 rounded-xl border border-[#dadce0] hover:border-[#1a73e8]/30 transition-all bg-white group"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-[14px] font-medium text-[#3c4043]">{trend.name}</h4>
                <p className="text-[11px] text-[#5f6368]">{trend.count} current reports</p>
              </div>
              <div className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                trend.urgency === 'urgent' ? 'bg-[#fce8e6] text-[#ea4335]' : 'bg-[#e8f0fe] text-[#1a73e8]'
              }`}>
                {trend.prediction}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4 text-[12px] font-medium text-[#1a73e8] hover:underline cursor-pointer">
              <span>View suggested action</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-[#f1f3f4] rounded-xl flex items-center gap-3">
        <div className="p-2 bg-white rounded-lg text-[#fbbc04]">
          <Zap size={16} fill="currentColor" />
        </div>
        <div>
          <h5 className="text-[12px] font-bold text-[#3c4043]">AI Readiness Advisory</h5>
          <p className="text-[11px] text-[#5f6368]">Current data suggests potential resource gap in Sector 4 within 72 hours.</p>
        </div>
      </div>
    </div>
  );
};

export default PredictiveIntelligence;
