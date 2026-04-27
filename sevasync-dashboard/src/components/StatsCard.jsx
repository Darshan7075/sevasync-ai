import React from 'react';
import { FileText, Package, Users, ClipboardCheck } from 'lucide-react';

const StatsCard = ({ title, value, type, trend }) => {
  const config = {
    reports: { icon: FileText, color: '#1a73e8', bg: '#e8f0fe' }, // Google Blue
    ngos: { icon: Package, color: '#fbbc04', bg: '#fef7e0' }, // Google Yellow
    volunteers: { icon: Users, color: '#34a853', bg: '#e6f4ea' }, // Google Green
    tasks: { icon: ClipboardCheck, color: '#ea4335', bg: '#fce8e6' }, // Google Red
  };

  const { icon: Icon, color, bg } = config[type];

  return (
    <div className="bg-white border border-[#dadce0] rounded-2xl p-6 hover:shadow-md transition-all cursor-default">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="p-3 rounded-2xl" style={{ backgroundColor: `${bg}20`, color: color }}>
            <Icon size={24} />
          </div>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${trend.startsWith('+') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {trend}
          </span>
        </div>
        <div className="space-y-1">
          <p className="text-[#5f6368] text-[13px] font-medium uppercase tracking-wider">{title}</p>
          <p className="text-[32px] font-semibold text-[#202124] tracking-tight">{value.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};


export default StatsCard;
