
import React from 'react';
import { FileText, Building2, Users, ClipboardCheck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <motion.div 
    whileHover={{ y: -4, transition: { duration: 0.2 } }}
    className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
        <Icon size={24} />
      </div>
      <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
        {trend >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {Math.abs(trend)}%
      </div>
    </div>
    <div>
      <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  </motion.div>
);

const StatsGrid = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Reports" 
        value={stats.totalReports} 
        icon={FileText} 
        trend={12.5} 
        color="bg-blue-500"
      />
      <StatCard 
        title="Total NGOs" 
        value={stats.totalNGOs} 
        icon={Building2} 
        trend={8.2} 
        color="bg-purple-500"
      />
      <StatCard 
        title="Total Volunteers" 
        value={stats.totalVolunteers} 
        icon={Users} 
        trend={24.8} 
        color="bg-orange-500"
      />
      <StatCard 
        title="Total Tasks" 
        value={stats.totalTasks} 
        icon={ClipboardCheck} 
        trend={-3.1} 
        color="bg-emerald-500"
      />
    </div>
  );
};

export default StatsGrid;
