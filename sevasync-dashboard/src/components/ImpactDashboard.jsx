import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Users, CheckCircle2, Globe, TrendingUp } from 'lucide-react';

const ImpactDashboard = ({ reports }) => {
  const resolved = reports.filter(r => r.status === 'Resolved').length;
  const totalImpact = reports.reduce((acc, r) => acc + (r.status === 'Resolved' ? r.people : 0), 0);

  return (
    <div className="google-card p-6 bg-[#34a853]/5 border-[#34a853]/20">
      <h3 className="text-[16px] font-medium text-[#137333] mb-6 flex items-center gap-2">
        <Heart size={18} className="text-[#34a853]" />
        Community impact
      </h3>

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#e6f4ea] text-[#34a853] rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-[12px] text-[#5f6368] font-medium uppercase tracking-tight">People Assisted</p>
            <p className="text-[24px] font-medium text-[#202124]">{totalImpact.toLocaleString()}+</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="p-3 bg-[#e6f4ea] text-[#34a853] rounded-xl">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-[12px] text-[#5f6368] font-medium uppercase tracking-tight">Resolved Cases</p>
            <p className="text-[24px] font-medium text-[#202124]">{resolved}</p>
          </div>
        </div>

        <div className="pt-6 border-t border-[#34a853]/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[13px] text-[#3c4043]">Platform Efficiency</span>
            <span className="text-[13px] font-medium text-[#34a853]">94%</span>
          </div>
          <div className="w-full bg-[#34a853]/10 h-1.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '94%' }}
              className="h-full bg-[#34a853] rounded-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImpactDashboard;
