import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users as UsersIcon, UserPlus, Shield, Lock, 
  Eye, EyeOff, MoreVertical, Trash2, Edit3, 
  CheckCircle2, Clock, Globe, ShieldAlert,
  Search, Filter, ChevronRight, ChevronLeft, X, Mail, Phone,
  UserCheck, Zap, Activity
} from 'lucide-react';

import { volunteerService } from '../services/api';
import { createNotification } from '../utils/notifications';
import { useAuth } from '../context/AuthContext';


const UsersPage = ({ volunteers = [], setVolunteers, setNotifications }) => {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('detail'); // 'detail' or 'compact'
  const [currentPage, setCurrentPage] = useState(1);
  const [removedUsers, setRemovedUsers] = useState(() => {
    const saved = localStorage.getItem('deactivated_users');
    if (saved) return JSON.parse(saved);
    return [];
  });
  const [auditTab, setAuditTab] = useState('logs'); // 'logs' or 'deactivated'
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState('staff'); // 'staff' or 'web-users'
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    try {
      const saved = localStorage.getItem('sevasync_registered_users');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [newAgentForm, setNewAgentForm] = useState({
    name: '',
    role: 'Field Agent',
    city: 'Vadodara',
    access: 'Cases Only'
  });

  useEffect(() => {
    localStorage.setItem('deactivated_users', JSON.stringify(removedUsers));
  }, [removedUsers]);


  const personnel = useMemo(() => {
    const baseCore = [
      { id: 'core-1', name: 'Darshan Panchal', role: 'Mission Commander', status: 'Online', email: 'darshan@sevasync.ai', access: 'Full System', lastActive: 'Now' },
      { id: 'core-2', name: 'Devanshi', role: 'Logistics Officer', status: 'In Mission', email: 'devanshi@sevasync.ai', access: 'Inventory/NGOs', lastActive: '12m ago' },
      { id: 'core-3', name: 'Rahul Sharma', role: 'Field Lead', status: 'Offline', email: 'rahul@sevasync.ai', access: 'Cases Only', lastActive: '2h ago' },
      { id: 'core-4', name: 'Priya Singh', role: 'Medical Coordinator', status: 'Online', email: 'priya@sevasync.ai', access: 'Blood Bank/Cases', lastActive: '5m ago' },
    ];

    const mappedVolunteers = volunteers.map((v, idx) => ({
      id: v.id || `vol-${idx}`,
      name: v.name,
      role: v.role || 'Field Agent',
      status: v.status === 'Active' || v.status === 'Available' || v.status === 'Online' ? 'Online' : v.status === 'On Task' || v.status === 'Mission Active' ? 'In Mission' : 'Offline',
      email: `${v.name.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '')}@sevasync.ai`,
      access: v.role === 'Medical' || v.role === 'Doctor' ? 'Blood Bank/Cases' : 'Cases Only',
      lastActive: v.history > 10 ? 'Now' : '15m ago'
    }));

    const deactivatedNames = new Set(removedUsers.map(u => u.name));
    return [...baseCore, ...mappedVolunteers].filter(p => !deactivatedNames.has(p.name));
  }, [volunteers, removedUsers]);

  const [permissions, setPermissions] = useState([
    { module: 'Global Dashboard Operations', roles: ['Commander', 'Lead'], access: 'High' },
    { module: 'Tactical Resource Dispatch', roles: ['Commander', 'Logistics'], access: 'High' },
    { module: 'Personnel Recruitment', roles: ['Commander'], access: 'Restricted' },
    { module: 'Mission Log Access', roles: ['All Personnel'], access: 'Public' },
  ]);

  const [logs, setLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('sevasync_audit_logs');
      return saved ? JSON.parse(saved) : [
        { user: 'Darshan', action: 'Accessed Security Protocols', time: '2m ago' },
        { user: 'Devanshi', action: 'Updated Resource Stock', time: '14m ago' },
        { user: 'System', action: 'New Agent Authorized', time: '1h ago' },
        { user: 'Darshan', action: 'Triggered Crisis Mode', time: '3h ago' },
      ];
    } catch (e) {
      return [
        { user: 'Darshan', action: 'Accessed Security Protocols', time: '2m ago' },
        { user: 'Devanshi', action: 'Updated Resource Stock', time: '14m ago' },
        { user: 'System', action: 'New Agent Authorized', time: '1h ago' },
        { user: 'Darshan', action: 'Triggered Crisis Mode', time: '3h ago' },
      ];
    }
  });

  const addLog = (action) => {
    const activeUser = currentUser?.name?.split(' ')[0] || 'Darshan';
    setLogs(prev => {
      const updated = [{ user: activeUser, action, time: 'Just Now' }, ...prev].slice(0, 15);
      localStorage.setItem('sevasync_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  const handleRecruitSubmit = async (e) => {
    e.preventDefault();
    if (!newAgentForm.name) {
      alert("Please enter agent name.");
      return;
    }
    const backendPayload = {
      name: newAgentForm.name,
      skill: newAgentForm.role,
      location: newAgentForm.city,
      availability: 'Active',
      contact: `${newAgentForm.name.toLowerCase().replace(/\s+/g, '')}@sevasync.ai`,
      rating: 5.0
    };
    try {
      const res = await volunteerService.create(backendPayload);
      const createdVol = {
        id: res.data.id,
        name: res.data.name,
        role: res.data.skill,
        city: res.data.location,
        status: res.data.availability === 'Active' || res.data.availability === 'Available' || res.data.availability === 'Online' ? 'Online' : 'Offline',
        rating: res.data.rating,
        history: res.data.tasks_completed || 0
      };
      if (setVolunteers) {
        setVolunteers(prev => [createdVol, ...prev]);
      }
      addLog(`Recruited naya agent: ${newAgentForm.name}`);
      if (setNotifications) {
        setNotifications(prev => [
          createNotification({ type: 'SUCCESS', category: 'Personnel', title: 'New Agent Recruited', message: `${newAgentForm.name} is now authorized as a ${newAgentForm.role} in ${newAgentForm.city}.`, iconName: 'UserCheck', color: 'text-emerald-500', bg: 'bg-emerald-50' }),
          ...prev
        ]);
      }
      alert(`AGENT AUTHORIZED: ${newAgentForm.name} successfully deployed to active roster.`);
      setNewAgentForm({
        name: '',
        role: 'Field Agent',
        city: 'Vadodara',
        access: 'Cases Only'
      });
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Failed to recruit agent to database:", error);
      alert("Failed to recruit agent to database. Please make sure the backend is active.");
    }
  };

  const handleDeactivateUser = (user) => {
    if (user.id.toString().startsWith('core')) {
      alert("Cannot deactivate core system administrators.");
      return;
    }
    if (window.confirm(`Are you absolutely sure you want to deactivate ${user.name}? This will permanently remove their active access.`)) {
      const originalVolunteer = volunteers.find(v => (v.id && v.id.toString() === user.id.toString()) || v.name === user.name);
      
      if (setVolunteers) {
        setVolunteers(prev => prev.filter(v => v.id.toString() !== user.id.toString()));
      }
      addLog(`Deactivated user: ${user.name}`);
      setRemovedUsers(prev => [
        {
          name: user.name,
          role: user.role,
          email: user.email || `${user.name.toLowerCase().replace(/\s+/g, '')}@sevasync.ai`,
          removedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          originalVolunteer: originalVolunteer || null
        },
        ...prev
      ]);
      if (setNotifications) {
        setNotifications(prev => [
          createNotification({ type: 'WARNING', category: 'Personnel', title: 'User Deactivated', message: `${user.name} has been deactivated.`, iconName: 'ShieldAlert', color: 'text-rose-500', bg: 'bg-rose-50' }),
          ...prev
        ]);
      }
      setSelectedUser(null);
      alert(`USER DEACTIVATED: ${user.name} has been successfully deactivated.`);
    }
  };

  const handleReactivateUser = (user) => {
    const deactivatedEntry = removedUsers.find(u => u.name === user.name);
    if (setVolunteers) {
      setVolunteers(prev => {
        if (prev.some(v => v.name === user.name)) {
          return prev;
        }
        const restoredVolunteer = (deactivatedEntry && deactivatedEntry.originalVolunteer) || {
          id: user.id || `vol-${Date.now()}`,
          name: user.name,
          role: user.role || 'Field Agent',
          status: 'Active',
          city: 'Vadodara',
          rating: 5.0,
          history: 0
        };
        return [restoredVolunteer, ...prev];
      });
    }
    
    setRemovedUsers(prev => prev.filter(u => u.name !== user.name));
    addLog(`Reactivated user: ${user.name}`);
    
    if (setNotifications) {
      setNotifications(prev => [
        createNotification({ type: 'SUCCESS', category: 'Personnel', title: 'User Reactivated', message: `${user.name} has been restored to the active roster.`, iconName: 'UserCheck', color: 'text-emerald-500', bg: 'bg-emerald-50' }),
        ...prev
      ]);
    }
    alert(`USER REACTIVATED: ${user.name} is now restored to the active roster.`);
  };

  const handleUpdateAccess = (userId, newAccess) => {
    if (userId.toString().startsWith('core')) return;
    setSelectedUser(prev => prev ? { ...prev, access: newAccess } : null);
    if (setVolunteers) {
      setVolunteers(prev => prev.map(v => {
        if (v.id.toString() === userId.toString()) {
          return { ...v, role: v.role }; // update state trigger
        }
        return v;
      }));
    }
    addLog(`Clearance of agent ${userId} set to ${newAccess}`);
  };

  const handleUpdateRole = (userId, newRole) => {
    if (userId.toString().startsWith('core')) return;
    setSelectedUser(prev => prev ? { ...prev, role: newRole } : null);
    if (setVolunteers) {
      setVolunteers(prev => prev.map(v => {
        if (v.id.toString() === userId.toString()) {
          return { ...v, role: newRole };
        }
        return v;
      }));
    }
    addLog(`Promoted/demoted agent ${userId} to ${newRole}`);
  };

  const handleUpdateWebUserRole = (email, newRole) => {
    const updated = registeredUsers.map(u => {
      if (u.email === email) {
        return { ...u, role: newRole };
      }
      return u;
    });
    setRegisteredUsers(updated);
    localStorage.setItem('sevasync_registered_users', JSON.stringify(updated));
    addLog(`Updated web user ${email} role to ${newRole}`);
    if (setNotifications) {
      setNotifications(prev => [
        createNotification({ 
          type: 'SUCCESS', 
          category: 'Personnel', 
          title: 'Role Updated', 
          message: `${email}'s role is now ${newRole}.`, 
          iconName: 'UserCheck', 
          color: 'text-emerald-500', 
          bg: 'bg-emerald-50' 
        }),
        ...prev
      ]);
    }
  };

  const handleDeleteWebUser = (email) => {
    if (window.confirm(`Are you absolutely sure you want to delete the registered account for ${email}? This will permanently remove their web access.`)) {
      const updated = registeredUsers.filter(u => u.email !== email);
      setRegisteredUsers(updated);
      localStorage.setItem('sevasync_registered_users', JSON.stringify(updated));
      addLog(`Deleted web account for ${email}`);
      if (setNotifications) {
        setNotifications(prev => [
          createNotification({ 
            type: 'WARNING', 
            category: 'Personnel', 
            title: 'Account Deleted', 
            message: `Web account for ${email} has been removed.`, 
            iconName: 'ShieldAlert', 
            color: 'text-rose-500', 
            bg: 'bg-rose-50' 
          }),
          ...prev
        ]);
      }
    }
  };

  const handleApproveAdmin = (email) => {
    const updated = registeredUsers.map(u => {
      if (u.email === email) {
        return { ...u, status: 'approved' };
      }
      return u;
    });
    setRegisteredUsers(updated);
    localStorage.setItem('sevasync_registered_users', JSON.stringify(updated));
    addLog(`Approved admin access for ${email}`);
    if (setNotifications) {
      setNotifications(prev => [
        createNotification({ 
          type: 'SUCCESS', 
          category: 'Personnel', 
          title: 'Access Approved', 
          message: `${email} is now approved as an Administrator.`, 
          iconName: 'UserCheck', 
          color: 'text-emerald-500', 
          bg: 'bg-emerald-50' 
        }),
        ...prev
      ]);
    }
    alert(`ADMIN ACCESS GRANTED: Account for ${email} is now approved and active.`);
  };

  const handleRejectAdmin = (email) => {
    if (window.confirm(`Are you sure you want to reject and delete the admin access request for ${email}?`)) {
      const updated = registeredUsers.filter(u => u.email !== email);
      setRegisteredUsers(updated);
      localStorage.setItem('sevasync_registered_users', JSON.stringify(updated));
      addLog(`Rejected and deleted access request for ${email}`);
      if (setNotifications) {
        setNotifications(prev => [
          createNotification({ 
            type: 'WARNING', 
            category: 'Personnel', 
            title: 'Request Rejected', 
            message: `Admin access request for ${email} has been rejected.`, 
            iconName: 'ShieldAlert', 
            color: 'text-rose-500', 
            bg: 'bg-rose-50' 
          }),
          ...prev
        ]);
      }
      alert(`ADMIN ACCESS REJECTED: Request for ${email} has been deleted.`);
    }
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

  const filteredWebUsers = useMemo(() => {
    return registeredUsers.filter(u => u.status !== 'pending').filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u.role || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [registeredUsers, searchTerm]);

  const pendingAdmins = useMemo(() => {
    return registeredUsers.filter(u => u.role === 'admin' && u.status === 'pending');
  }, [registeredUsers]);

  const filteredPendingAdmins = useMemo(() => {
    return pendingAdmins.filter(u => {
      const matchSearch = (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
      return matchSearch;
    });
  }, [pendingAdmins, searchTerm]);

  const itemsPerPage = viewMode === 'compact' ? 16 : 8;
  const totalPages = Math.ceil(filteredPersonnel.length / itemsPerPage);

  const paginatedPersonnel = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredPersonnel.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredPersonnel, currentPage, itemsPerPage]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);
  };

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1700px] mx-auto pb-24">
      
      {/* 1. Tactical Header */}
      <div className={`${'bg-[#0f172a] border-white/5'} rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden border`}>
        <div className="absolute top-0 right-0 p-16 opacity-10 pointer-events-none">
          <UsersIcon size={280} className={'text-blue-500'} />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-2 h-2 rounded-full ${'bg-blue-500'} animate-pulse`} />
              <span className={`text-[11px] font-black ${'text-blue-400'} uppercase tracking-[0.3em]`}>Personnel Management Matrix</span>
            </div>
            <h1 className="text-[48px] font-black tracking-tighter uppercase leading-none font-outfit">Staff & Agents</h1>
            <p className="text-slate-400 text-[16px] mt-4 max-w-xl font-medium">
               Authorized personnel directory and access control center. Manage mission-critical permissions and monitor agent activity.
            </p>
          </div>
          <button 
             onClick={() => setIsAddModalOpen(true)}
             className={`px-10 py-5 ${'bg-blue-600 hover:bg-blue-700 shadow-blue-600/40'} text-white rounded-[24px] font-black uppercase tracking-widest text-[12px] shadow-2xl transition-all flex items-center gap-3 active:scale-95`}
          >
             <UserPlus size={18} /> Recruit Agent
          </button>
        </div>
      </div>

      {/* Sub-Tab Selection Bar */}
      <div className="flex border-b border-slate-100 pb-1">
        <button
          onClick={() => {
            setActiveSubTab('staff');
            setCurrentPage(1);
          }}
          className={`pb-4 px-6 text-[12px] font-black uppercase tracking-widest border-b-2 transition-all ${
            activeSubTab === 'staff'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
          }`}
        >
          Active Staff ({filteredPersonnel.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('web-users');
            setCurrentPage(1);
          }}
          className={`pb-4 px-6 text-[12px] font-black uppercase tracking-widest border-b-2 transition-all ${
            activeSubTab === 'web-users'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
          }`}
        >
          Registered Web Accounts ({filteredWebUsers.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('access-requests');
            setCurrentPage(1);
          }}
          className={`pb-4 px-6 text-[12px] font-black uppercase tracking-widest border-b-2 transition-all ${
            activeSubTab === 'access-requests'
              ? 'border-blue-600 text-blue-600 font-black'
              : 'border-transparent text-slate-400 hover:text-slate-600 font-bold'
          }`}
        >
          Access Requests ({pendingAdmins.length})
        </button>
      </div>

      {/* 2. Control Bar */}
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <div className="relative flex-1 group">
          <Search className={`absolute left-6 top-1/2 -translate-y-1/2 ${'text-slate-300 group-focus-within:text-blue-500'} transition-colors`} size={20} />
          <input 
            type="text" 
            placeholder={activeSubTab === 'staff' ? "Search by agent name, role, or access level..." : "Search registered users by name, email, or role..."} 
            value={searchTerm}
            onChange={handleSearchChange}
            className={`w-full ${'bg-white border border-slate-100 text-slate-700 ring-blue-500/5'} rounded-[28px] py-5 pl-16 pr-8 text-[15px] font-bold outline-none focus:ring-4 transition-all shadow-sm`}
          />
        </div>
        {activeSubTab === 'staff' && (
          <div className="flex gap-4 flex-wrap justify-center">
            <div className={`flex ${'bg-white border-slate-100'} p-1.5 rounded-full border shadow-sm`}>
               {['All', 'Online', 'Offline'].map(status => (
                  <button 
                     key={status} 
                     onClick={() => handleStatusFilterChange(status)}
                     className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === status ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
                  >
                     {status}
                  </button>
               ))}
            </div>

            <div className={`flex ${'bg-white border-slate-100'} p-1.5 rounded-full border shadow-sm gap-1`}>
               <button
                  type="button"
                  onClick={() => handleViewModeChange('detail')}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                     viewMode === 'detail' 
                     ? ('bg-blue-600 text-white shadow-lg') 
                     : ('text-slate-400 hover:text-slate-600')
                  }`}
               >
                  Grid
               </button>
               <button
                  type="button"
                  onClick={() => handleViewModeChange('compact')}
                  className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                     viewMode === 'compact' 
                     ? ('bg-blue-600 text-white shadow-lg') 
                     : ('text-slate-400 hover:text-slate-600')
                  }`}
               >
                  Compact
               </button>
            </div>
          </div>
        )}
      </div>


      {/* 3. Personnel Grid / Compact List */}
      <div className="space-y-8">
        {activeSubTab === 'staff' ? (
          <>
            <div className={viewMode === 'compact' ? "grid grid-cols-1 xl:grid-cols-2 gap-4" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8"}>
              {paginatedPersonnel.map((user, i) => {
                 if (viewMode === 'compact') {
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: (i % 16) * 0.03 }}
                        onClick={() => setSelectedUser(user)}
                        className={`rounded-3xl border ${'bg-white border-slate-100 hover:border-blue-500 hover:shadow-lg text-slate-900'} transition-all p-5 flex items-center justify-between gap-6 cursor-pointer group`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shadow-inner">
                              <img 
                                src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=128&bold=true`} 
                                alt={user.name} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                              />
                            </div>
                            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 ${'border-white'} ${
                              user.status === 'Online' ? 'bg-emerald-500' : user.status === 'In Mission' ? 'bg-blue-500' : 'bg-slate-300'
                            }`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className={`text-[16px] font-black leading-tight ${'text-slate-900 group-hover:text-blue-600'} transition-colors uppercase tracking-tight truncate`}>
                              {user.name}
                            </h4>
                            <p className={`text-[10px] font-black ${'text-blue-600'} uppercase tracking-widest mt-1`}>
                              {user.role}
                            </p>
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-8 flex-shrink-0">
                          <div className="w-36">
                            <p className={`text-[9px] font-black ${'text-slate-300'} uppercase tracking-widest mb-0.5`}>Access clearance</p>
                            <span className={`text-[12px] font-black uppercase ${'text-slate-700 bg-slate-50 border-slate-100'} px-3 py-1 rounded-lg border`}>
                              {user.access}
                            </span>
                          </div>
                          <div className="w-24">
                            <p className={`text-[9px] font-black ${'text-slate-300'} uppercase tracking-widest mb-0.5`}>Status</p>
                            <span className={`text-[12px] font-black uppercase tracking-wider ${
                              user.status === 'Online' ? 'text-emerald-500' : user.status === 'In Mission' ? 'text-blue-500' : 'text-slate-400'
                            }`}>
                              {user.status}
                            </span>
                          </div>
                          <div className="w-24">
                            <p className={`text-[9px] font-black ${'text-slate-300'} uppercase tracking-widest mb-0.5`}>Active</p>
                            <span className={`text-[11px] font-bold ${'text-slate-400'} uppercase tracking-widest`}>
                              {user.lastActive}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 flex items-center gap-2">
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               setSelectedUser(user);
                             }}
                             className={`px-4 py-2.5 ${'bg-slate-50 hover:bg-blue-600 border-slate-100 hover:border-blue-600 text-slate-600 hover:text-white'} rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5`}
                           >
                              Manage
                           </button>
                        </div>
                      </motion.div>
                    );
                 }

                 return (
                   <motion.div 
                     key={user.id}
                     initial={{ opacity: 0, y: 20 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: (i % 8) * 0.05 }}
                     onClick={() => setSelectedUser(user)}
                     className={`rounded-[40px] p-8 border transition-all duration-500 group cursor-pointer relative overflow-hidden ${'bg-white border border-slate-100 shadow-sm hover:shadow-2xl'}`}
                   >
                      <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity">
                         <MoreVertical size={20} className={'text-slate-300'} />
                      </div>
                      
                      <div className="flex flex-col items-center text-center space-y-6">
                         <div className="relative">
                            <div className={`w-24 h-24 rounded-[32px] ${'bg-slate-50 border-slate-100'} border flex items-center justify-center text-blue-600 group-hover:bg-rose-600 group-hover:text-white transition-all duration-500 shadow-inner overflow-hidden`}>
                               <img 
                                 src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff&size=128&bold=true`} 
                                 className="w-full h-full rounded-[32px] object-cover" 
                                 alt="avatar"
                               />
                            </div>
                            <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-4 ${'border-white'} ${user.status === 'Online' ? 'bg-emerald-500' : user.status === 'In Mission' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                         </div>

                         <div>
                            <h3 className={`text-xl font-black transition-colors uppercase tracking-tight ${'text-slate-900 group-hover:text-blue-600'}`}>{user.name}</h3>
                            <p className={`text-[11px] font-black ${'text-blue-600'} uppercase tracking-widest mt-1`}>{user.role}</p>
                         </div>

                         <div className={`w-full pt-6 border-t ${'border-slate-50'} grid grid-cols-2 gap-4`}>
                            <div className="space-y-1">
                               <p className={`text-[9px] font-black ${'text-slate-400'} uppercase tracking-widest`}>Access</p>
                               <p className={`text-[12px] font-bold ${'text-slate-700'} truncate`}>{user.access}</p>
                            </div>
                            <div className="space-y-1">
                               <p className={`text-[9px] font-black ${'text-slate-400'} uppercase tracking-widest`}>Status</p>
                               <p className={`text-[12px] font-black uppercase ${user.status === 'Online' ? 'text-emerald-500' : 'text-slate-400'}`}>{user.status}</p>
                            </div>
                         </div>

                         <div className="w-full flex items-center justify-between pt-4 group-hover:translate-x-2 transition-transform">
                            <span className={`text-[10px] font-black ${'text-slate-300'} uppercase tracking-widest`}>Last Active: {user.lastActive}</span>
                            <ChevronRight size={16} className={`${'text-blue-600'} opacity-0 group-hover:opacity-100 transition-opacity`} />
                         </div>
                      </div>
                   </motion.div>
                 );
              })}
            </div>

            {/* Tactical Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-6 pt-4 pb-12">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95"
                >
                  <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-black text-slate-900 uppercase tracking-widest">Page</span>
                  <div className="px-5 py-2.5 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-500/20">
                    {currentPage}
                  </div>
                  <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">of {totalPages}</span>
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-sm active:scale-95"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            )}
          </>
        ) : activeSubTab === 'web-users' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             {filteredWebUsers.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 font-bold uppercase tracking-wider">
                   No registered web accounts found matching your query.
                </div>
             ) : (
                filteredWebUsers.map((u, i) => (
                   <motion.div
                      key={u.id || u.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i % 8) * 0.05 }}
                      className="rounded-[40px] p-8 border bg-white border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col justify-between"
                   >
                      <div className="flex flex-col items-center text-center space-y-6">
                         <div className="relative">
                            <div className="w-20 h-20 rounded-[28px] bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-inner overflow-hidden">
                               <img 
                                 src={`https://ui-avatars.com/api/?name=${u.name}&background=3b82f6&color=fff&size=128&bold=true`} 
                                 className="w-full h-full rounded-[28px] object-cover" 
                                 alt={u.name} 
                               />
                            </div>
                         </div>

                         <div>
                            <h3 className="text-lg font-black transition-colors uppercase tracking-tight text-slate-900 group-hover:text-blue-600">{u.name}</h3>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wider mt-1">{u.email}</p>
                         </div>

                         <div className="w-full pt-6 border-t border-slate-100/80 flex items-center justify-between gap-4">
                            <div className="flex flex-col items-start gap-1">
                               <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Access Role</span>
                               <select
                                  value={u.role}
                                  onChange={(e) => handleUpdateWebUserRole(u.email, e.target.value)}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all uppercase tracking-wider"
                               >
                                  <option value="Volunteer">Volunteer</option>
                                  <option value="admin">Admin</option>
                                </select>
                            </div>

                            <button
                               onClick={() => handleDeleteWebUser(u.email)}
                               className="px-4 py-2.5 bg-rose-50 hover:bg-rose-600 border border-rose-100 hover:border-rose-600 text-rose-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1.5"
                            >
                               <Trash2 size={14} /> Delete
                            </button>
                         </div>
                      </div>
                   </motion.div>
                ))
             )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
             {filteredPendingAdmins.length === 0 ? (
                <div className="col-span-full py-16 text-center text-slate-400 font-bold uppercase tracking-wider">
                   No pending access requests found.
                </div>
             ) : (
                filteredPendingAdmins.map((u, i) => (
                   <motion.div
                      key={u.id || u.email}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: (i % 8) * 0.05 }}
                      className="rounded-[40px] p-8 border bg-white border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col justify-between border-t-4 border-amber-500"
                   >
                      <div className="flex flex-col items-center text-center space-y-6">
                         <div className="relative">
                            <div className="w-20 h-20 rounded-[28px] bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-500 shadow-inner overflow-hidden">
                               <ShieldAlert size={36} className="text-amber-500 group-hover:text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-500 animate-pulse border-2 border-white" />
                         </div>

                         <div>
                            <h3 className="text-lg font-black transition-colors uppercase tracking-tight text-slate-900 group-hover:text-amber-600">{u.name}</h3>
                            <p className="text-[11px] font-bold text-slate-400 tracking-wider mt-1">{u.email}</p>
                            <span className="inline-block mt-3 px-3 py-1 bg-amber-50 border border-amber-100 text-amber-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                               Pending Admin Access
                            </span>
                         </div>

                         <div className="w-full pt-6 border-t border-slate-100/80 flex items-center justify-between gap-4">
                            <button
                               onClick={() => handleApproveAdmin(u.email)}
                               className="flex-1 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-600 border border-emerald-100 hover:border-emerald-600 text-emerald-600 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                               <UserCheck size={14} /> Approve
                            </button>
                            <button
                               onClick={() => handleRejectAdmin(u.email)}
                               className="flex-1 px-4 py-2.5 bg-rose-50 hover:bg-rose-600 border border-rose-100 hover:border-rose-600 text-rose-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-1.5"
                            >
                               <X size={14} /> Reject
                            </button>
                         </div>
                      </div>
                   </motion.div>
                ))
             )}
          </div>
        )}
      </div>

      {/* 4. Access Matrix & Activity Log */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         
         {/* System Permissions Matrix */}
         <div className={`xl:col-span-8 ${'bg-white border-slate-100 shadow-sm'} rounded-[40px] border p-10`}>
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center gap-4">
                  <div className={`w-1.5 h-10 ${'bg-blue-600'} rounded-full`} />
                  <h3 className={`text-[20px] font-black ${'text-slate-900'} uppercase tracking-tight`}>System Access Matrix</h3>
               </div>
               <Shield className={'text-slate-200'} size={24} />
            </div>

            <div className="space-y-6">
               {permissions.map((mod, i) => (
                  <div key={i} className={`flex items-center justify-between p-6 ${'bg-slate-50/50 border-slate-100 hover:bg-white hover:shadow-lg'} rounded-3xl border transition-all group cursor-default`}>
                     <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl ${'bg-white border-slate-100 text-slate-400 group-hover:text-blue-600'} border flex items-center justify-center transition-colors`}>
                           <Lock size={20} />
                        </div>
                        <div>
                           <p className={`text-[15px] font-black ${'text-slate-900'} uppercase tracking-tight`}>{mod.module}</p>
                           <p className={`text-[11px] font-bold ${'text-slate-400'} uppercase tracking-widest mt-1`}>Authorized: {mod.roles.join(', ')}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-8">
                        <div className="text-right">
                           <p className={`text-[10px] font-black ${'text-slate-400'} uppercase tracking-widest mb-1`}>Clearance</p>
                           <span className={`text-[11px] font-black uppercase tracking-[0.2em] ${mod.access === 'High' ? 'text-emerald-500' : mod.access === 'Restricted' ? 'text-amber-500' : 'text-rose-500'}`}>{mod.access}</span>
                        </div>
                        <button 
                           onClick={() => cycleClearance(i)}
                           className={`px-5 py-2.5 ${'bg-white border-slate-200 text-slate-700 hover:bg-blue-600 hover:text-white'} rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95`}
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
            
            {/* Header with Tabs */}
            <div className="flex flex-col space-y-4 mb-8">
               <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-3">
                  <Zap size={22} className="text-blue-400" />
                  Audit Matrix
               </h3>
               <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
                  <button
                     onClick={() => setAuditTab('logs')}
                     className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        auditTab === 'logs' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                     }`}
                  >
                     Active Feed
                  </button>
                  <button
                     onClick={() => setAuditTab('deactivated')}
                     className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                        auditTab === 'deactivated' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                     }`}
                  >
                     Deactivated ({removedUsers.length})
                  </button>
               </div>
            </div>

            {auditTab === 'logs' ? (
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
                  <button 
                     onClick={() => setIsAuditModalOpen(true)}
                     className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/5"
                  >
                     View Full Audit Log
                  </button>
               </div>
            ) : (
               <div className="space-y-6 relative">
                  {removedUsers.length === 0 ? (
                     <div className="py-12 text-center text-slate-500 font-bold uppercase text-[11px] tracking-widest">
                        No deactivated users yet.
                     </div>
                  ) : (
                     <div className="space-y-4 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                        {removedUsers.map((u, i) => (
                           <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                              <div className="flex items-center gap-3">
                                 <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center font-black text-[12px]">
                                    {u.name ? u.name[0] : 'U'}
                                 </div>
                                 <div>
                                    <h4 className="text-[12px] font-black uppercase tracking-tight">{u.name}</h4>
                                    <p className="text-[9px] text-slate-500 font-bold uppercase">{u.role}</p>
                                 </div>
                              </div>
                              <div className="flex items-center gap-4">
                                 <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">
                                    {u.removedAt}
                                 </span>
                                 <button
                                    onClick={() => handleReactivateUser(u)}
                                    className="px-3 py-1.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white border border-emerald-500/20 hover:border-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-1"
                                 >
                                    <UserCheck size={12} /> Reactivate
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  )}
                  <div className="pt-2 border-t border-white/5 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
                     <span>Total Deactivated</span>
                     <span className="text-white text-[12px] font-black bg-rose-600/30 px-2.5 py-1 rounded-lg border border-rose-500/20">
                        {removedUsers.length} Users
                     </span>
                  </div>
               </div>
            )}
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
                       <button onClick={() => handleDeactivateUser(selectedUser)} className="w-full py-5 bg-rose-600 rounded-[24px] font-black uppercase tracking-widest text-[12px] hover:bg-rose-700 transition-all shadow-2xl shadow-rose-600/30">
                          Deactivate User
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
                       <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-between">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Clearance Clearance Level</p>
                          {selectedUser.id.toString().startsWith('core') ? (
                             <p className="text-[20px] font-black text-slate-900 uppercase tracking-tight">{selectedUser.access}</p>
                          ) : (
                             <select
                               value={selectedUser.access}
                               onChange={(e) => handleUpdateAccess(selectedUser.id, e.target.value)}
                               className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all mt-2"
                             >
                                {['Cases Only', 'Inventory/NGOs', 'Blood Bank/Cases', 'Full System'].map(a => <option key={a} value={a}>{a}</option>)}
                             </select>
                          )}
                       </div>
                       <div className="p-8 bg-slate-50 rounded-[32px] border border-slate-100 flex flex-col justify-between">
                          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Operational Role</p>
                          {selectedUser.id.toString().startsWith('core') ? (
                             <p className="text-[20px] font-black text-slate-900 uppercase tracking-tight">{selectedUser.role}</p>
                          ) : (
                             <select
                               value={selectedUser.role}
                               onChange={(e) => handleUpdateRole(selectedUser.id, e.target.value)}
                               className="w-full bg-white border border-slate-200 rounded-xl p-3 text-[13px] font-bold text-slate-700 outline-none focus:ring-4 focus:ring-blue-500/5 transition-all mt-2"
                             >
                                {['Field Agent', 'Logistics Officer', 'Crisis Operator', 'Medical Coordinator', 'Doctor'].map(r => <option key={r} value={r}>{r}</option>)}
                             </select>
                          )}
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

      {/* 6. Recruit Agent Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl font-sans">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden p-10 border border-slate-100/50"
            >
              <div className="flex justify-between items-start mb-8 font-sans">
                <div>
                  <h3 className="text-[22px] font-black text-slate-900 uppercase tracking-widest font-outfit">Recruit Field Agent</h3>
                  <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest mt-1">Personnel Authorization Uplink</p>
                </div>
                <button onClick={() => setIsAddModalOpen(false)} className="p-3 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleRecruitSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Agent Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Enter agent's full name..."
                    value={newAgentForm.name}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tactical Role</label>
                    <select
                      value={newAgentForm.role}
                      onChange={(e) => setNewAgentForm({ ...newAgentForm, role: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                    >
                      {['Field Agent', 'Logistics Officer', 'Crisis Operator', 'Medical Coordinator', 'Doctor'].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Assigned Sector (City)</label>
                    <select
                      value={newAgentForm.city}
                      onChange={(e) => setNewAgentForm({ ...newAgentForm, city: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                    >
                      {['Vadodara', 'Ahmedabad', 'Surat', 'Rajkot'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Clearance Level</label>
                  <select
                    value={newAgentForm.access}
                    onChange={(e) => setNewAgentForm({ ...newAgentForm, access: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
                  >
                    {['Cases Only', 'Inventory/NGOs', 'Blood Bank/Cases', 'Full System'].map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 mt-4"
                >
                  <UserCheck size={18} /> AUTHORIZE & DEPLOY AGENT
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. Global Audit Matrix Modal */}
      <AnimatePresence>
        {isAuditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-slate-950 text-white rounded-[40px] w-full max-w-2xl shadow-2xl p-10 border border-white/10 font-sans"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-[22px] font-black uppercase tracking-widest flex items-center gap-3">
                    <Zap size={22} className="text-blue-400" />
                    Global Audit Matrix
                  </h3>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mt-1">Full system operations history</p>
                </div>
                <button onClick={() => setIsAuditModalOpen(false)} className="p-3 hover:bg-white/5 rounded-full transition-colors text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {logs.length === 0 ? (
                  <div className="py-12 text-center text-slate-500 font-bold uppercase text-[11px] tracking-widest">
                    No logs available.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex gap-6 relative group border-b border-white/5 pb-4 last:border-0 last:pb-0">
                      <div className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                        <Activity size={16} className="text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-[13px] font-bold uppercase tracking-tight text-white leading-tight">{log.action}</h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{log.user} • {log.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="flex gap-4 mt-8 border-t border-white/10 pt-6 font-sans">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Are you sure you want to clear the audit history?")) {
                      setLogs([]);
                      localStorage.setItem('sevasync_audit_logs', JSON.stringify([]));
                    }
                  }}
                  className="px-6 py-4 bg-rose-900/30 hover:bg-rose-900 border border-rose-800 text-rose-300 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex-1"
                >
                  Clear History
                </button>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(false)}
                  className="px-6 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex-1"
                >
                  Close Console
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UsersPage;
