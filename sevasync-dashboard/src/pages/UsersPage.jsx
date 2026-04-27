import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users as UsersIcon, UserPlus, Shield, Lock, 
  Eye, EyeOff, MoreVertical, Trash2, Edit3, 
  CheckCircle2, Clock, Globe, ShieldAlert,
  Search, Filter, ChevronRight, X, Mail, Phone,
  UserCheck, Zap, Activity
} from 'lucide-react';

const UsersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const personnel = [
    { id: 1, name: 'Darshan Panchal', role: 'Mission Commander', status: 'Online', email: 'darshan@sevasync.ai', access: 'Full System', lastActive: 'Now' },
    { id: 2, name: 'Devanshi', role: 'Logistics Officer', status: 'In Mission', email: 'devanshi@sevasync.ai', access: 'Inventory/NGOs', lastActive: '12m ago' },
    { id: 3, name: 'Rahul Sharma', role: 'Field Lead', status: 'Offline', email: 'rahul@sevasync.ai', access: 'Cases Only', lastActive: '2h ago' },
    { id: 4, name: 'Priya Singh', role: 'Medical Coordinator', status: 'Online', email: 'priya@sevasync.ai', access: 'Blood Bank/Cases', lastActive: '5m ago' },
  ];

  const [permissions, setPermissions] = useState([
    { module: 'Global Dashboard Operations', roles: ['Commander', 'Lead'], access: 'High' },
    { module: 'Tactical Resource Dispatch', roles: ['Commander', 'Logistics'], access: 'High' },
    { module: 'Personnel Recruitment', roles: ['Commander'], access: 'Restricted' },
    { module: 'Mission Log Access', roles: ['All Personnel'], access: 'Public' },
  ]);

  const [logs, setLogs] = useState([
    { user: 'Darshan', action: 'Accessed Security Protocols', time: '2m ago' },
    { user: 'Devanshi', action: 'Updated Resource Stock', time: '14m ago' },
    { user: 'System', action: 'New Agent Authorized', time: '1h ago' },
    { user: 'Darshan', action: 'Triggered Crisis Mode', time: '3h ago' },
  ]);

  const addLog = (action) => {
    setLogs(prev => [{ user: 'Darshan', action, time: 'Now' }, ...prev].slice(0, 8));
  };

  const cycleClearance = (index) => {
    const levels = ['High', 'Restricted', 'Public'];
    setPermissions(prev => prev.map((p, i) => {
      if (i === index) {
        const currentIdx = levels.indexOf(p.access);
        const nextIdx = (currentIdx + 1) % levels.length;
        const nextStatus = levels[nextIdx];
        addLog(`Updated ${p.module} to ${nextStatus}`);
        return { ...p, access: nextStatus };
      }
      return p;
    }));
  };

  const filteredPersonnel = personnel.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                       p.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       p.access.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === 'All' || 
                       (statusFilter === 'Online' && (p.status === 'Online' || p.status === 'In Mission')) ||
                       (statusFilter === 'Offline' && p.status === 'Offline');
    return matchSearch && matchStatus;
  });

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1700px] mx-auto pb-24">
      
      {/* 1. Tactical Header */}
      <div className="bg-[#0f172a] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
          <UsersIcon size={280} className="text-blue-500" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">Personnel Management Matrix</span>
            </div>
            <h1 className="text-[48px] font-black tracking-tighter uppercase leading-none font-outfit">Staff & Agents</h1>
            <p className="text-slate-400 text-[16px] mt-4 max-w-xl font-medium">
               Authorized personnel directory and access control center. Manage mission-critical permissions and monitor agent activity.
            </p>
          </div>
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-blue-600/40 transition-all flex items-center gap-3 active:scale-95"
          >
             <UserPlus size={18} /> Recruit Agent
          </button>
        </div>
      </div>

      {/* 2. Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search by agent name, role, or access level..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border border-slate-100 rounded-[28px] py-5 pl-16 pr-8 text-[15px] font-bold text-slate-700 outline-none focus:ring-4 ring-blue-500/5 transition-all shadow-sm"
          />
        </div>
        <div className="flex gap-4">
          <div className="flex bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
             {['All', 'Online', 'Offline'].map(status => (
                <button 
                   key={status} 
                   onClick={() => setStatusFilter(status)}
                   className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                >
                   {status}
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* 3. Personnel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
        {filteredPersonnel.map((user, i) => (
          <motion.div 
            key={user.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedUser(user)}
            className="bg-white rounded-[40px] p-8 border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group cursor-pointer relative overflow-hidden"
          >
             <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical size={20} className="text-slate-300" />
             </div>
             
             <div className="flex flex-col items-center text-center space-y-6">
                <div className="relative">
                   <div className="w-24 h-24 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner">
                      <img 
                        src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=128&bold=true`} 
                        className="w-full h-full rounded-[32px] object-cover" 
                        alt="avatar"
                      />
                   </div>
                   <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 border-white ${user.status === 'Online' ? 'bg-emerald-500' : user.status === 'In Mission' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                </div>

                <div>
                   <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{user.name}</h3>
                   <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-1">{user.role}</p>
                </div>

                <div className="w-full pt-6 border-t border-slate-50 grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access</p>
                      <p className="text-[12px] font-bold text-slate-700 truncate">{user.access}</p>
                   </div>
                   <div className="space-y-1">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                      <p className={`text-[12px] font-black uppercase ${user.status === 'Online' ? 'text-emerald-500' : 'text-slate-400'}`}>{user.status}</p>
                   </div>
                </div>

                <div className="w-full flex items-center justify-between pt-4 group-hover:translate-x-2 transition-transform">
                   <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Last Active: {user.lastActive}</span>
                   <ChevronRight size={16} className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
             </div>
          </motion.div>
        ))}
      </div>

      {/* 4. Access Matrix & Activity Log */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         
         {/* System Permissions Matrix */}
         <div className="xl:col-span-8 bg-white rounded-[40px] border border-slate-100 shadow-sm p-10">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-blue-600 rounded-full" />
                  <h3 className="text-[20px] font-black text-slate-900 uppercase tracking-tight">System Access Matrix</h3>
               </div>
               <Shield className="text-slate-200" size={24} />
            </div>

            <div className="space-y-6">
               {permissions.map((mod, i) => (
                  <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100 hover:bg-white hover:shadow-lg transition-all group cursor-default">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors">
                           <Lock size={20} />
                        </div>
                        <div>
                           <p className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{mod.module}</p>
                           <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized: {mod.roles.join(', ')}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clearance</p>
                           <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${mod.access === 'High' ? 'text-emerald-500' : mod.access === 'Restricted' ? 'text-amber-500' : 'text-rose-500'}`}>{mod.access}</span>
                        </div>
                        <button 
                           onClick={() => cycleClearance(i)}
                           className="px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95"
                        >
                           Update
                        </button>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Security Feed (Audit Log) */}
         <div className="xl:col-span-4 bg-slate-900 rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <Activity size={120} />
            </div>
            <h3 className="text-lg font-black uppercase tracking-widest mb-10 flex items-center gap-3">
               <Zap size={22} className="text-blue-400" />
               Audit Matrix
            </h3>
            <div className="space-y-8 relative">
               <div className="absolute left-3 top-2 bottom-2 w-px bg-white/10" />
               {logs.map((log, i) => (
                  <div key={i} className="flex gap-6 relative group">
                     <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center relative z-10 group-hover:bg-blue-600 transition-colors">
                        <div className="w-2 h-2 rounded-full bg-blue-400 group-hover:bg-white" />
                     </div>
                     <div className="flex-1">
                        <h4 className="text-[12px] font-black uppercase tracking-tight leading-tight">{log.action}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1.5">{log.user} • {log.time}</p>
                     </div>
                  </div>
               ))}
               <button className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5">
                  View Full Audit Log
               </button>
            </div>
         </div>
      </div>

      {/* 5. User Detail Modal */}
      <AnimatePresence>
         {selectedUser && (
           <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-[48px] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[75vh]"
              >
                 {/* Left Panel */}
                 <div className="w-full md:w-1/3 bg-slate-900 p-12 text-white flex flex-col justify-between">
                    <div>
                       <div className="w-28 h-28 bg-white/10 rounded-[40px] p-2 mb-10 border border-white/10">
                          <img src={`https://ui-avatars.com/api/?name=${selectedUser.name}&background=6366f1&color=fff&size=256&bold=true`} className="w-full h-full rounded-[32px] object-cover" alt="p" />
                       </div>
                       <h2 className="text-[42px] font-black leading-none mb-4 tracking-tighter uppercase font-outfit">{selectedUser.name}</h2>
                       <p className="text-blue-400 font-black uppercase tracking-widest text-[13px] mb-12">{selectedUser.role}</p>

                       <div className="space-y-8">
                          <div className="flex items-center gap-5 text-slate-400">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Mail size={18} />
                             </div>
                             <span className="text-[14px] font-bold uppercase tracking-wide">{selectedUser.email}</span>
                          </div>
                          <div className="flex items-center gap-5 text-slate-400">
                             <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                                <Phone size={18} />
                             </div>
                             <span className="text-[14px] font-bold uppercase tracking-wide">+91 SECURE LINE</span>
                          </div>
                       </div>
                    </div>

                    <div className="space-y-4">
                       <button className="w-full py-5 bg-rose-600 rounded-[24px] font-black uppercase tracking-widest text-[12px] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/30">
                          Revoke Access
                       </button>
                    </div>
                 </div>

                 {/* Right Panel */}
                 <div className="flex-1 p-12 overflow-y-auto">
                    <div className="flex justify-between items-start mb-12">
                       <h3 className="text-[20px] font-black text-slate-900 uppercase tracking-widest font-outfit">Agent Profile</h3>
                       <button onClick={() => setSelectedUser(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                          <X size={24} />
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-8 mb-16">
                       <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Primary Access</p>
                          <p className="text-[22px] font-black text-slate-900 uppercase tracking-tight">{selectedUser.access}</p>
                       </div>
                       <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Mission Authority</p>
                          <p className="text-[22px] font-black text-slate-900 uppercase tracking-tight">Level {selectedUser.id === 1 ? '10' : '05'}</p>
                       </div>
                    </div>

                    <div className="space-y-8">
                       <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-3">
                          <Clock size={18} className="text-blue-600" />
                          Recent Session Logs
                       </h4>
                       <div className="space-y-6">
                          {[1,2,3].map(i => (
                             <div key={i} className="flex items-center justify-between p-6 bg-white rounded-3xl border border-slate-50 shadow-sm">
                                <div className="flex items-center gap-4">
                                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                   <span className="text-[14px] font-black text-slate-800 uppercase">Operational Login Sector {i}</span>
                                </div>
                                <span className="text-[11px] font-black text-slate-300 uppercase tracking-widest">{i}h ago</span>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
              </motion.div>
           </div>
         )}
      </AnimatePresence>

    </div>
  );
};

export default UsersPage;
