
import React, { useState } from 'react';
import StatsCard from '../components/StatsCard';
import Charts from '../components/Charts';
import MapView from '../components/MapView';
import Table from '../components/Table';
import { 
  communityReports, 
  stats, 
  urgencyDistribution, 
  issueTypes,
  taskStatusDistribution,
  volunteers,
  ngos
} from '../data/mockData';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const Dashboard = () => {
  const [selectedCity, setSelectedCity] = useState('All Cities');

  const filteredReports = selectedCity === 'All Cities' 
    ? communityReports 
    : communityReports.filter(r => r.area === selectedCity);

  const filteredVolunteers = selectedCity === 'All Cities'
    ? volunteers
    : volunteers.filter(v => v.city === selectedCity);

  const filteredNGOs = selectedCity === 'All Cities'
    ? ngos
    : ngos.filter(n => n.city === selectedCity);

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 bg-slate-50">
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* Header with City Filter */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Main Dashboard</h1>
            <p className="text-slate-500 font-medium">Real-time overview of community support operations.</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-slate-500 uppercase">Filter By City:</span>
             <select 
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl text-sm font-semibold px-4 py-2.5 focus:ring-2 focus:ring-blue-500 shadow-sm cursor-pointer outline-none"
              >
                <option value="All Cities">All Cities</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Delhi">Delhi</option>
                <option value="Indore">Indore</option>
                <option value="Bhopal">Bhopal</option>
                <option value="Pune">Pune</option>
                <option value="Vadodara">Vadodara</option>
              </select>
          </div>
        </div>

        {/* High Urgency Alert */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-200 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl">
              <AlertTriangle size={28} />
            </div>
            <div>
              <h4 className="font-bold text-xl">Critical Action Required</h4>
              <p className="opacity-90">There are {communityReports.filter(r => r.urgency === 'High').length} high-priority cases pending in the region. Immediate attention recommended.</p>
            </div>
          </div>
          <button className="hidden md:block bg-white text-rose-600 px-6 py-3 rounded-2xl font-bold hover:bg-opacity-90 transition-all">
            Review Now
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard title="Total Reports" value={stats.totalReports} type="reports" trend="+12%" />
          <StatsCard title="Total NGOs" value={stats.totalNGOs} type="ngos" trend="+5%" />
          <StatsCard title="Total Volunteers" value={stats.totalVolunteers} type="volunteers" trend="+18%" />
          <StatsCard title="Total Tasks" value={stats.totalTasks} type="tasks" trend="-2%" />
        </div>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2">
            <MapView reports={filteredReports} />
          </div>
          <div>
            <Charts 
              urgencyData={urgencyDistribution} 
              statusData={taskStatusDistribution} 
              issueData={issueTypes} 
            />
          </div>
        </div>

        {/* Data Tables */}
        <div className="space-y-8">
          <Table 
            title="Recent Community Reports" 
            data={filteredReports} 
            type="reports" 
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Table 
              title="Volunteer Roster" 
              data={filteredVolunteers} 
              type="volunteers" 
            />
            <Table 
              title="Partner NGOs" 
              data={filteredNGOs} 
              type="ngos" 
            />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
