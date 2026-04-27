import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplet, AlertTriangle, Users, History, Plus, Search, 
  Activity, Package, MessageCircle, MapPin, Wind, 
  Zap, Navigation, ShieldAlert, TrendingUp, Clock, CheckCircle2, ChevronRight, Send,
  Heart, Info, ExternalLink, RefreshCw, Eye, Bell, Settings, Filter
} from 'lucide-react';
import { bloodService } from '../services/api';

const BloodBankPage = ({ bloodDonors = [], setBloodDonors, bloodInventory: backendInventory = [], setBloodInventory }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [selectedGroup, setSelectedGroup] = useState('AB+');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeNotification, setActiveNotification] = useState(null);

  // Blood compatibility logic
  const compatibility = {
    'A+': { receive: ['A+', 'A-', 'O+', 'O-'], donate: ['A+', 'AB+'] },
    'A-': { receive: ['A-', 'O-'], donate: ['A+', 'A-', 'AB+', 'AB-'] },
    'B+': { receive: ['B+', 'B-', 'O+', 'O-'], donate: ['B+', 'AB+'] },
    'B-': { receive: ['B-', 'O-'], donate: ['B+', 'B-', 'AB+', 'AB-'] },
    'O+': { receive: ['O+', 'O-'], donate: ['O+', 'A+', 'B+', 'AB+'] },
    'O-': { receive: ['O-'], donate: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'] },
    'AB+': { receive: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], donate: ['AB+'] },
    'AB-': { receive: ['A-', 'B-', 'AB-', 'O-'], donate: ['AB+', 'AB-'] },
  };

  const bloodInventory = useMemo(() => {
    const groups = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
    return groups.map(group => {
      const backendItem = backendInventory.find(item => item.blood_group === group);
      let units = backendItem ? backendItem.units_available : 0;
      if (backendInventory.length === 0) {
        units = bloodDonors.filter(d => d.bloodGroup === group && d.available).length;
      }
      let status = 'STABLE STOCK';
      let statusColor = 'text-green-500';
      let barColor = '#22c55e';
      if (units < 50) {
        status = 'CRITICAL STOCK';
        statusColor = 'text-red-500';
        barColor = '#ef4444';
      } else if (units < 100) {
        status = 'LOW STOCK';
        statusColor = 'text-orange-500';
        barColor = '#f97316';
      }
      return { group, units, status, statusColor, barColor, trend: Math.floor(Math.random() * 15) + 2 };
    });
  }, [bloodDonors, backendInventory]);

  const emergencyRequests = [
    { type: 'AB+', volume: '5 Units', urgency: 'CRITICAL', target: 'VADODARA CIVIL HOSPITAL', sector: 'SECTOR 7 • DISPATCH NODE' },
    { type: 'O-', volume: '3 Units', urgency: 'CRITICAL', target: 'SURAT TRAUMA CENTER', sector: 'SECTOR 2 • DISPATCH NODE' },
    { type: 'O+', volume: '8 Units', urgency: 'HIGH', target: 'RAJKOT EMERGENCY WARD', sector: 'SECTOR 4 • DISPATCH NODE' },
    { type: 'B+', volume: '6 Units', urgency: 'MEDIUM', target: 'AHMEDABAD GENERAL HOSPITAL', sector: 'SECTOR 1 • DISPATCH NODE' },
  ];

  const nearbyDonors = useMemo(() => {
    return bloodDonors
      .filter(d => d.available && d.bloodGroup === selectedGroup)
      .slice(0, 4)
      .map(d => ({
        id: d.id,
        name: d.name,
        type: d.bloodGroup,
        city: d.city,
        distance: `${(Math.random() * 5 + 0.5).toFixed(1)} KM`,
        match: `${Math.floor(Math.random() * 10 + 90)}% MATCH`
      }));
  }, [bloodDonors, selectedGroup]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [donorsRes, inventoryRes] = await Promise.all([
        bloodService.getDonors(),
        bloodService.getInventory()
      ]);
      if (donorsRes.data) setBloodDonors(donorsRes.data);
      if (inventoryRes.data) setBloodInventory(inventoryRes.data);
      showNotification("SYSTEM SYNC COMPLETE", "All blood logistics data has been synchronized with the regional database.", "success");
    } catch (error) {
      showNotification("SYNC FAILED", "Unable to reach tactical backend. Check network connection.", "error");
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  const showNotification = (title, message, type = 'info') => {
    setActiveNotification({ title, message, type });
    setTimeout(() => setActiveNotification(null), 4000);
  };

  const handleDispatch = (target) => {
    showNotification("DISPATCH INITIATED", `Tactical routing established for ${target}. Units are in transit.`, "success");
  };

  const handleDonate = async (donorId) => {
    const unitsStr = prompt("Enter units donated:", "1");
    if (!unitsStr) return;
    const units = parseInt(unitsStr);
    try {
      const res = await bloodService.recordDonation(donorId, units);
      showNotification("DONATION RECORDED", `Added ${units} units to stock. New total: ${res.data.new_total}`, "success");
      handleRefresh();
    } catch (error) {
      showNotification("ERROR", "Failed to record donation in tactical database.", "error");
    }
  };

  const openMap = (city) => {
    window.open(`https://www.google.com/maps/search/${encodeURIComponent(city + " Hospital")}`, '_blank');
  };

  const sendWhatsApp = (donor) => {
    const text = encodeURIComponent(`🚨 *SEVASYNC BLOOD SOS*\n\nEmergency dispatch needed for blood group ${donor.type} in ${donor.city}.\n\nDonor: ${donor.name}\n\nPlease report to the nearest hub.`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-6 lg:p-10 font-sans text-[#1A1A1A] animate-fade-in relative overflow-hidden">
      
      {/* GLOBAL NOTIFICATION OVERLAY */}
      <AnimatePresence>
        {activeNotification && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className={`fixed top-0 left-1/2 -translate-x-1/2 z-[1000] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[350px] border ${
              activeNotification.type === 'error' ? 'bg-red-600 text-white border-red-500' : 
              activeNotification.type === 'success' ? 'bg-green-600 text-white border-green-500' : 'bg-slate-900 text-white border-slate-800'
            }`}
          >
            {activeNotification.type === 'error' ? <AlertTriangle size={24} /> : <CheckCircle2 size={24} />}
            <div>
              <p className="text-[11px] font-black tracking-widest uppercase">{activeNotification.title}</p>
              <p className="text-xs opacity-90">{activeNotification.message}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-[1700px] mx-auto space-y-8">
        
        {/* TOP STATUS BAR */}
        <motion.div className="bg-[#FEF2F2] border border-red-100 rounded-full px-6 py-2.5 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-700 text-[11px] font-black tracking-widest uppercase font-outfit">
              AB+ BLOOD CRITICALLY LOW IN GUJARAT BASE • EMERGENCY LEVELS DETECTED
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={handleRefresh}
              className={`text-slate-400 hover:text-slate-600 transition-all p-2 hover:bg-slate-100 rounded-full ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={() => showNotification("SOS BROADCAST", "Sent emergency notification to all registered O- and AB+ donors.", "success")}
              className="bg-[#F87171] text-white text-[10px] font-black px-5 py-2 rounded-full hover:bg-red-500 transition-all uppercase tracking-widest shadow-sm active:scale-95"
            >
              Dispatch Request
            </button>
          </div>
        </motion.div>

        {/* HERO SECTION */}
        <div className="bg-[#0F172A] rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl border border-white/5">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
          
          <div className="relative z-10 flex items-center gap-8">
            <motion.div 
              whileHover={{ rotate: 15, scale: 1.1 }}
              className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-700 rounded-3xl flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)] border border-white/20 cursor-pointer"
            >
               <Droplet size={40} className="text-white" fill="white" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tighter uppercase mb-2 font-outfit">BLOOD COMMAND CENTER</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-green-500/20 px-3 py-1 rounded-full border border-green-500/30">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.2em] text-green-400 uppercase">AI TACTICAL LINK ACTIVE</span>
                </div>
                <div className="flex gap-2">
                   <button onClick={() => showNotification("SECURITY", "AES-256 Encryption active. All tactical comms are secure.", "info")} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"><ShieldAlert size={16}/></button>
                   <button onClick={() => showNotification("ALERTS", "Viewing system notifications...", "info")} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"><Bell size={16}/></button>
                   <button onClick={() => showNotification("SETTINGS", "Opening tactical configuration...", "info")} className="p-1.5 hover:bg-white/10 rounded-lg text-slate-500 hover:text-white transition-all"><Settings size={16}/></button>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 flex bg-white/5 p-2 rounded-[24px] backdrop-blur-xl border border-white/10 shadow-inner">
            {['Dashboard', 'Tactical Hub', 'Responders'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  showNotification("VIEW SWITCH", `Switching to ${tab} interface...`, "info");
                }}
                className={`px-8 py-3.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${
                  activeTab === tab 
                    ? 'bg-red-500 text-white shadow-[0_10px_20px_rgba(239,68,68,0.3)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* STRATEGIC INVENTORY MATRIX */}
          <div className="xl:col-span-2 bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-red-600 rounded-full" />
                <h2 className="text-lg font-black tracking-widest uppercase font-outfit">STRATEGIC INVENTORY MATRIX</h2>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => showNotification("FILTER", "Opening inventory filter...", "info")}
                  className="p-2.5 bg-slate-50 text-slate-400 hover:text-slate-900 rounded-xl border border-slate-100 transition-all"
                >
                  <Filter size={18} />
                </button>
                <div className="flex items-center gap-2 px-4 py-1.5 bg-green-50 rounded-full border border-green-100">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span className="text-[10px] font-black text-green-700 uppercase tracking-widest">BACKEND CONNECTED</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {bloodInventory.map((item) => (
                <motion.div 
                  key={item.group} 
                  whileHover={{ y: -8, scale: 1.02 }}
                  onClick={() => {
                    setSelectedGroup(item.group);
                    showNotification("GROUP SELECTED", `Viewing real-time logistics for Blood Group ${item.group}`, "info");
                  }}
                  className={`p-8 rounded-[32px] border-2 cursor-pointer transition-all duration-300 ${
                    selectedGroup === item.group ? 'border-red-500 bg-red-50/10 shadow-xl' : 'border-slate-50 bg-white hover:border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-3xl font-black text-slate-900 font-outfit">{item.group}</span>
                    <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-lg">
                      <TrendingUp size={14} className="text-green-500" />
                      <span className="text-[11px] font-black text-green-600">+{item.trend}%</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <span className="text-5xl font-black text-slate-900 tracking-tighter">{item.units}</span>
                    <span className="text-[12px] font-bold text-slate-400 ml-3 uppercase tracking-widest">UNITS</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mb-4 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((item.units / 600) * 100, 100)}%` }}
                      className="h-full rounded-full transition-all duration-1000 shadow-sm" 
                      style={{ backgroundColor: item.barColor }}
                    />
                  </div>
                  <span className={`text-[10px] font-black tracking-[0.15em] uppercase ${item.statusColor}`}>
                    {item.status}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* AI OPERATIONAL INSIGHTS (RED CARD) */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-red-600 rounded-[40px] p-10 text-white relative overflow-hidden group shadow-2xl shadow-red-200"
          >
            <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:bg-white/20 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-600 to-red-700" />
            
            <div className="relative z-10 h-full flex flex-col justify-between space-y-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button className="p-2 bg-white/10 rounded-xl border border-white/10 hover:bg-white/20 transition-all">
                    <ChevronRight size={20} className="text-white" />
                  </button>
                  <span className="text-[12px] font-black tracking-[0.2em] uppercase font-outfit">AI OPERATIONAL INSIGHTS</span>
                </div>
                <button onClick={() => showNotification("AI ENGINE", "Analyzing demand vectors across 10 regional nodes...", "info")}>
                   <Zap size={24} className="text-white/80 animate-pulse" />
                </button>
              </div>

              <div>
                <span className="text-[11px] font-bold text-white/60 tracking-[0.3em] uppercase block mb-3">DEMAND VECTOR</span>
                <h3 className="text-5xl font-black tracking-tighter uppercase font-outfit leading-tight">RISING<br/>TREND</h3>
              </div>

              <div className="bg-white/10 backdrop-blur-2xl rounded-[28px] p-8 border border-white/20 shadow-inner">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                  <span className="text-[11px] font-black text-red-100 tracking-widest uppercase">PREDICTIVE SHORTAGE</span>
                </div>
                <p className="text-2xl font-black leading-tight tracking-tight uppercase">POTENTIAL {selectedGroup} CRISIS WITHIN 48H.</p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-[11px] text-white/60 font-bold uppercase italic tracking-wider leading-relaxed">
                    "AI DETECTED INCREASED TRAUMA REPORTS NEAR VADODARA NODE."
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4">
                <button 
                  onClick={() => showNotification("SOS BROADCAST", "Emergency broadcast sent to all donors in Sector 4.", "success")}
                  className="w-full bg-white text-red-600 py-5 rounded-[22px] text-[12px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-slate-50 transition-all active:scale-95"
                >
                  PRE-EMPTIVE BROADCAST
                </button>
                <button 
                  onClick={() => showNotification("AUTO-ALLOCATION", "Routing 50 units from Rajkot Hub to Vadodara...", "success")}
                  className="w-full bg-transparent text-white border-2 border-white/20 py-5 rounded-[22px] text-[12px] font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-all"
                >
                  AUTO ALLOCATE BLOOD
                </button>
              </div>
            </div>
          </motion.div>

        </div>

        {/* SECOND ROW GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* ACTIVE EMERGENCY REQUESTS */}
          <div className="xl:col-span-2 bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                <h2 className="text-lg font-black tracking-widest uppercase font-outfit">ACTIVE EMERGENCY REQUESTS</h2>
              </div>
              <div className="relative group cursor-help">
                 <div className="bg-slate-50 px-4 py-2 rounded-xl text-[11px] font-bold text-slate-500 uppercase tracking-widest border border-slate-100 flex items-center gap-2">
                   LIVE QUEUE: 4 TOTAL <Info size={12} />
                 </div>
                 <div className="absolute right-0 top-full mt-2 w-48 p-3 bg-slate-900 text-white text-[10px] rounded-xl opacity-0 group-hover:opacity-100 transition-opacity z-10 font-medium">
                   Current pending requests from priority hospitals in the region.
                 </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-slate-100">
                    <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">ARCHETYPE</th>
                    <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">VOLUME</th>
                    <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">URGENCY</th>
                    <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">TARGET HUB</th>
                    <th className="pb-6 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">OPERATIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {emergencyRequests.map((req, i) => (
                    <tr key={i} className="group hover:bg-slate-50/50 transition-all">
                      <td className="py-8">
                        <div className="w-14 h-14 bg-slate-900 rounded-[18px] flex items-center justify-center text-white font-black text-base shadow-lg shadow-slate-200">
                          {req.type}
                        </div>
                      </td>
                      <td className="py-8">
                        <span className="text-lg font-black text-slate-900">{req.volume}</span>
                      </td>
                      <td className="py-8">
                        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black tracking-[0.1em] uppercase ${
                          req.urgency === 'CRITICAL' ? 'bg-red-100 text-red-600 border border-red-200' : 
                          req.urgency === 'HIGH' ? 'bg-orange-100 text-orange-600 border border-orange-200' : 'bg-blue-100 text-blue-600 border border-blue-200'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            req.urgency === 'CRITICAL' ? 'bg-red-600' : 
                            req.urgency === 'HIGH' ? 'bg-orange-600' : 'bg-blue-600'
                          }`} />
                          {req.urgency}
                        </div>
                      </td>
                      <td className="py-8">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2 group/target cursor-pointer" onClick={() => openMap(req.target)}>
                             <span className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover/target:text-blue-600 transition-colors">{req.target}</span>
                             <ExternalLink size={12} className="text-slate-300 group-hover/target:text-blue-600" />
                          </div>
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{req.sector}</span>
                        </div>
                      </td>
                      <td className="py-8">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleDispatch(req.target)}
                            className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-md flex items-center gap-2"
                          >
                            <Send size={14} /> DISPATCH
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedGroup(req.type);
                              showNotification("LOCATING DONORS", `Filtering database for ${req.type} donors near ${req.target}...`, "info");
                            }}
                            className="bg-white border border-slate-200 text-slate-600 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 flex items-center gap-2"
                          >
                            <Search size={14} /> FIND DONOR
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* LIVE ACTIVITY FEED */}
          <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <Activity size={22} className="text-blue-600" />
                <h2 className="text-lg font-black tracking-widest uppercase font-outfit">LIVE ACTIVITY FEED</h2>
              </div>
            </div>

            <div className="space-y-10 relative">
              <div className="absolute left-7 top-2 bottom-2 w-0.5 bg-slate-50" />
              {[
                { type: 'match', title: 'DONOR MATCHED FOR O- REQUEST', time: '2M AGO', icon: Heart, color: 'red' },
                { type: 'dispatch', title: 'DISPATCH STARTED FOR CITY GENERAL', time: '10M AGO', icon: Send, color: 'blue' },
                { type: 'emergency', title: 'NEW EMERGENCY REQUEST: AB+', time: '15M AGO', icon: AlertTriangle, color: 'orange' },
                { type: 'sync', title: 'BLOOD STOCK SYNCED WITH GUJARAT BASE', time: '1H AGO', icon: RefreshCw, color: 'green' },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="flex gap-8 relative group cursor-pointer"
                  onClick={() => showNotification("LOG ENTRY", `Viewing details for: ${item.title}`, "info")}
                >
                  <div className={`w-14 h-14 rounded-[20px] flex items-center justify-center relative z-10 shrink-0 transition-all group-hover:scale-110 shadow-sm ${
                    item.color === 'red' ? 'bg-red-50 text-red-500' :
                    item.color === 'blue' ? 'bg-blue-50 text-blue-500' :
                    item.color === 'orange' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'
                  }`}>
                    <item.icon size={22} />
                  </div>
                  <div className="pt-3">
                    <h4 className="text-xs font-black text-slate-900 tracking-tight uppercase group-hover:text-blue-600 transition-colors">{item.title}</h4>
                    <span className="text-[10px] font-bold text-slate-400 uppercase mt-2 block tracking-widest">{item.time}</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => showNotification("AUDIT LOGS", "Loading full system audit logs...", "info")}
                className="w-full mt-6 py-4 bg-slate-50 text-slate-500 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all border border-slate-100 flex items-center justify-center gap-2"
              >
                <Eye size={14} /> VIEW ALL LOGS
              </button>
            </div>
          </div>

        </div>

        {/* THIRD ROW GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* AVAILABLE DONORS */}
          <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-2 bg-blue-50 rounded-xl">
                <Users size={20} className="text-blue-600" />
              </div>
              <h2 className="text-lg font-black tracking-widest uppercase font-outfit">AVAILABLE DONORS ({selectedGroup})</h2>
            </div>

            <div className="space-y-5">
              {nearbyDonors.length > 0 ? nearbyDonors.map((donor, i) => (
                <div key={i} className="flex items-center justify-between p-5 rounded-[24px] bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all border border-transparent hover:border-slate-100 group">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-red-600 font-black text-[12px] group-hover:scale-110 transition-transform">
                      {donor.type}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-tight">{donor.name}</h4>
                      <span className="text-[10px] font-bold text-slate-400 uppercase mt-1 block tracking-wider">{donor.distance} • {donor.match}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDonate(donor.id)}
                      className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all shadow-sm"
                      title="Record Donation"
                    >
                      <Plus size={16} />
                    </button>
                    <button 
                      onClick={() => sendWhatsApp(donor)}
                      className="p-2.5 bg-[#25D366]/10 text-[#128C7E] rounded-xl hover:bg-[#25D366] hover:text-white transition-all shadow-sm"
                      title="Contact via WhatsApp"
                    >
                      <MessageCircle size={16} />
                    </button>
                    <button 
                      onClick={() => openMap(donor.city)}
                      className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="View Location"
                    >
                      <Navigation size={16} />
                    </button>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase border-2 border-dashed border-slate-50 rounded-[32px]">
                  No {selectedGroup} donors found.
                </div>
              )}
            </div>
          </div>

          {/* WHO CAN DONATE? */}
          <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-2 bg-red-50 rounded-xl">
                <ShieldAlert size={20} className="text-red-600" />
              </div>
              <h2 className="text-lg font-black tracking-widest uppercase font-outfit">WHO CAN DONATE?</h2>
            </div>

            <div className="space-y-8">
              <div className="p-8 bg-gradient-to-br from-red-50 to-white rounded-[32px] border border-red-100 shadow-inner">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-14 h-14 bg-red-600 rounded-[20px] flex items-center justify-center text-white font-black text-lg shadow-lg shadow-red-200">
                    {selectedGroup}
                  </div>
                  <div>
                    <span className="text-[11px] font-black text-red-700 uppercase tracking-[0.2em] block mb-1">ACTIVE SELECTION</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">TACTICAL COMPATIBILITY</span>
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Info size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CAN RECEIVE FROM:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {compatibility[selectedGroup]?.receive.map(g => (
                        <button 
                          key={g} 
                          onClick={() => {
                            setSelectedGroup(g);
                            showNotification("SWITCHING GROUP", `Analyzing logistics for Blood Group ${g}...`, "info");
                          }}
                          className="px-3 py-1.5 bg-white border border-slate-100 rounded-lg text-[10px] font-black text-slate-700 shadow-sm hover:border-red-200 transition-all"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-px bg-red-100/50" />
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ExternalLink size={14} className="text-slate-400" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">CAN DONATE TO:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {compatibility[selectedGroup]?.donate.map(g => (
                        <button 
                          key={g} 
                          onClick={() => {
                            setSelectedGroup(g);
                            showNotification("SWITCHING GROUP", `Analyzing logistics for Blood Group ${g}...`, "info");
                          }}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[10px] font-black shadow-md hover:bg-red-700 transition-all"
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SHORTAGE FORECAST */}
          <div className="bg-white rounded-[40px] p-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="flex items-center gap-4 mb-10">
              <div className="p-2 bg-orange-50 rounded-xl">
                <TrendingUp size={20} className="text-orange-600" />
              </div>
              <h2 className="text-lg font-black tracking-widest uppercase font-outfit">SHORTAGE FORECAST</h2>
            </div>

            <div className="space-y-10">
              {bloodInventory.filter(item => item.units < 100).length > 0 ? (
                bloodInventory.filter(item => item.units < 100).slice(0, 4).map((item, i) => (
                  <div key={i} className="space-y-3 group cursor-help" onClick={() => showNotification("FORECAST DETAIL", `Inventory for ${item.group} is decreasing due to local hospital demand.`, "info")}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest">{item.group} SHORTAGE</h4>
                        <span className="text-[10px] font-bold text-slate-400 uppercase mt-1.5 block tracking-widest">PREDICTED IN {item.units < 50 ? '24H' : '72H'}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-900">{Math.min(100, 100 - item.units)}% RISK</span>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-slate-50 rounded-full overflow-hidden p-0.5 border border-slate-100">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, 100 - item.units)}%` }}
                        className={`h-full rounded-full ${item.units < 50 ? 'bg-red-600' : 'bg-orange-500'} shadow-sm`} 
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-20 text-center">
                  <CheckCircle2 size={40} className="text-green-500 mx-auto mb-4" />
                  <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">All stocks above safety threshold.</p>
                </div>
              )}
            </div>
            <p className="mt-10 text-[10px] font-bold text-slate-400 uppercase italic text-center leading-relaxed opacity-60">
              * ALGORITHMIC PREDICTION BASED ON HISTORICAL TRENDS.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};

export default BloodBankPage;
