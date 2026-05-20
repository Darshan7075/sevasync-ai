import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, Clock, MapPin, Users, Package, 
  Activity, AlertCircle, CheckCircle2, ChevronRight, 
  Zap, Shield, Radio, Send, MessageSquare, ShieldAlert,
  Compass, Briefcase, Award, Flame, Star, LayoutGrid,
  Download, BarChart3, ExternalLink, UserCog, Edit3, Mail, Phone, Calendar, Heart
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { reportService, volunteerService, chatService } from '../services/api';

const TacticalClock = () => {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const timer = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  return (
    <div className="absolute top-8 right-8 flex items-center gap-3 bg-white shadow-sm border border-slate-200 px-4 py-2 rounded-xl z-50 shadow-lg backdrop-blur-md">
       <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
       <span className="text-[10px] font-black text-slate-600 tracking-widest uppercase">
          {time.toLocaleTimeString('en-IN', { hour12: false })} IST • VADODARA SECTOR
       </span>
    </div>
  );
};

const VolunteerDashboard = ({ reports, setReports, resources, supplyOrders, setSupplyOrders, cityCoordinates, setNotifications, emergencyRequests = [], setEmergencyRequests }) => {

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMission, setSelectedMission] = useState(null);
  const [wsStatus, setWsStatus] = useState('DISCONNECTED');
  const [socket, setSocket] = useState(null);
  const [volunteerXP, setVolunteerXP] = useState(() => {
    const saved = localStorage.getItem('volunteerXP_demo');
    return saved ? parseInt(saved) : 350;
  });

  useEffect(() => {
    localStorage.setItem('volunteerXP_demo', volunteerXP.toString());
  }, [volunteerXP]);
  const [profileData, setProfileData] = useState({
    phone: '+91 98765 43210',
    sector: 'Vadodara Core Node',
    joined: 'August 2023',
    certifications: ['First Aid Certified', 'Logistics Expert', 'Crisis Management', 'Ham Radio Op', 'Heavy Vehicle License']
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState(profileData);
  const [supplyRequest, setSupplyRequest] = useState({
    foodPacks: 0,
    medicalKits: 0,
    oxygenCylinders: 0,
    waterBottles: 0
  });
  const [sosSearch, setSosSearch] = useState('');
  const [sosPage, setSosPage] = useState(1);
  const sosItemsPerPage = 6;
  const [reqLocation, setReqLocation] = useState('Vadodara');
  const [reqDestination, setReqDestination] = useState('Surat');
  const [reqUrgency, setReqUrgency] = useState('Medium');
  const [reqRemarks, setReqRemarks] = useState('');
  const [bloodRequestForm, setBloodRequestForm] = useState({
    type: 'O+',
    volume: '5',
    urgency: 'HIGH',
    target: 'VADODARA CIVIL HOSPITAL',
    remarks: ''
  });

  const handleBloodRequestSubmit = (e) => {
    e.preventDefault();
    if (!bloodRequestForm.target) {
      alert("Please select a target hospital.");
      return;
    }
    const newReq = {
      id: Date.now(),
      type: bloodRequestForm.type,
      volume: `${bloodRequestForm.volume} Units`,
      urgency: bloodRequestForm.urgency,
      target: bloodRequestForm.target.toUpperCase(),
      sector: 'SECTOR 1 • FIELD VOLUNTEER',
      status: 'Pending'
    };
    if (setEmergencyRequests) {
      setEmergencyRequests(prev => [newReq, ...prev]);
    }
    if (setNotifications) {
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'CRITICAL',
          category: 'Mission',
          title: 'Emergency Blood Request',
          message: `Required ${newReq.volume} of ${newReq.type} at ${newReq.target} (Requested by Volunteer ${user?.name || 'Field Agent'}).`,
          time: 'Just Now',
          iconName: 'AlertTriangle',
          color: 'text-rose-500',
          bg: 'bg-rose-50'
        },
        ...prev
      ]);
    }
    alert(`BLOOD REQUEST SUBMITTED: Emergency uplink sent to Command Center.`);
    setBloodRequestForm({
      type: 'O+',
      volume: '5',
      urgency: 'HIGH',
      target: 'VADODARA CIVIL HOSPITAL',
      remarks: ''
    });
  };

  const [chatMessages, setChatMessages] = useState([
    { sender: 'Command', text: 'Field Directive #1: Water levels stabilized in Vadodara Sector.', time: '15m ago' },
    { sender: 'Command', text: 'Task verification protocols authorized. Proceed carefully.', time: '5m ago' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [checkedTasks, setCheckedTasks] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isTyping]);
  
  const toggleTask = (missionId, idx) => {
    const key = `${missionId}-${idx}`;
    setCheckedTasks(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleProfileSave = async () => {
    setProfileData(profileForm);
    setIsEditingProfile(false);
    try {
      if (user?.id) {
        await volunteerService.updateProfile(user.id, profileForm);
      }
    } catch (e) {
      console.warn("Backend update failed, but local state updated.");
    }
  };



  useEffect(() => {
    setWsStatus('CONNECTING...');
    const ws = new WebSocket('ws://localhost:8000/ws/volunteer_node');
    ws.onopen = () => {
      setWsStatus('CONNECTED (SECURE)');
      setSocket(ws);
    };
    ws.onerror = () => {
      setWsStatus('LOCAL OFFLINE NODE');
    };
    return () => ws.close();
  }, []);

  const [now, setNow] = useState(Date.now());
  const orderStartTimes = useRef(JSON.parse(localStorage.getItem('orderStartTimes') || '{}'));

  // Simulation & Map Animation Loop (2 Hours delivery)
  useEffect(() => {
    const TOTAL_DURATION = 2 * 60 * 60 * 1000; // 2 hours
    const interval = setInterval(() => {
       const currentTime = Date.now();
       setNow(currentTime);
       
       let startTimesChanged = false;

       setSupplyOrders?.(prev => {
         let changed = false;
         const updated = prev.map(order => {
           if (order.status === 'Transit') {
             if (!orderStartTimes.current[order.id]) {
                orderStartTimes.current[order.id] = currentTime;
                startTimesChanged = true;
             }
             const elapsed = currentTime - orderStartTimes.current[order.id];
             if (elapsed >= TOTAL_DURATION) {
                changed = true;
                return { ...order, status: 'Delivered', time: 'Just Now' };
             }
           }
           return order;
         });
         
         if (startTimesChanged) {
             localStorage.setItem('orderStartTimes', JSON.stringify(orderStartTimes.current));
         }
         
         return changed ? updated : prev;
       });

    }, 2000); // Check and animate every 2 seconds
    return () => clearInterval(interval);
  }, [setSupplyOrders]);




  const currentLevel = volunteerXP >= 500 ? 3 : volunteerXP >= 200 ? 2 : 1;
  const xpTarget = currentLevel === 1 ? 200 : currentLevel === 2 ? 500 : 1000;

  const myMissions = useMemo(() => {
    return (reports || []).filter(r => r.status === 'Assigned' || r.status === 'In Progress');
  }, [reports]);

  const availableMissions = useMemo(() => {
    return (reports || []).filter(r => r.status === 'Pending');
  }, [reports]);

  const filteredSOS = useMemo(() => {
    return availableMissions.filter(m => 
      (m.issue || '').toLowerCase().includes(sosSearch.toLowerCase()) || 
      (m.area || '').toLowerCase().includes(sosSearch.toLowerCase())
    );
  }, [availableMissions, sosSearch]);

  const paginatedSOS = useMemo(() => {
    const start = (sosPage - 1) * sosItemsPerPage;
    return filteredSOS.slice(start, start + sosItemsPerPage);
  }, [filteredSOS, sosPage]);

  const totalSosPages = Math.ceil(filteredSOS.length / sosItemsPerPage);

  useEffect(() => {
    setSosPage(1);
  }, [sosSearch]);


  // FEATURE 1: SVG Analytics
  const categoryStock = useMemo(() => {
    const totals = { Food: 0, Water: 0, Medical: 0, Shelter: 0, Logistics: 0 };
    (resources || []).forEach(r => {
      const type = (r.type || '').toLowerCase();
      if (type.includes('food')) totals.Food += r.quantity;
      else if (type.includes('water')) totals.Water += r.quantity;
      else if (type.includes('med')) totals.Medical += r.quantity;
      else if (type.includes('shelter')) totals.Shelter += r.quantity;
      else totals.Logistics += r.quantity;
    });
    return Object.entries(totals);
  }, [resources]);

  const maxStock = useMemo(() => {
     return Math.max(...categoryStock.map(([_, qty]) => qty), 100);
  }, [categoryStock]);

  // FEATURE 3: CSV Download
  const exportToCSV = () => {
    const headers = ['Type', 'Quantity', 'Location'];
    const rows = (resources || []).map(r => [r.type, r.quantity, r.location]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "volunteer_logistics_manifest.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClaimMission = async (id) => {
    if (setReports) {
      setReports(prev => prev.map(r => r.id.toString() === id.toString() ? { ...r, status: 'In Progress' } : r));
      setVolunteerXP(prev => prev + 50);
      
      try {
        await reportService.updateStatus(id, 'In Progress');
      } catch (e) {
        console.warn("Database sync deferred.");
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
         socket.send(JSON.stringify({ type: 'CLAIM_MISSION', missionId: id, volunteer: user?.name || 'Volunteer' }));
      }
      if (setNotifications) {
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'INFO',
            category: 'Mission',
            title: 'Mission Claimed',
            message: `Volunteer ${user?.name || 'Field Agent'} claimed Emergency Mission ${id}.`,
            time: 'Just Now',
            iconName: 'Users',
            color: 'text-indigo-500',
            bg: 'bg-indigo-50'
          },
          ...prev
        ]);
      }
      alert('MISSION CLAIMED: Operational routing configured.');
    }
  };


  const handleUpdateStatus = async (id, newStatus) => {
    if (setReports) {
      setReports(prev => prev.map(r => r.id.toString() === id.toString() ? { ...r, status: newStatus } : r));
      if (newStatus === 'Resolved') {
        setVolunteerXP(prev => prev + 100);
      }
      
      try {
        await reportService.updateStatus(id, newStatus);
      } catch (e) {
        console.warn("Database sync deferred.");
      }

      if (socket && socket.readyState === WebSocket.OPEN) {
         socket.send(JSON.stringify({ type: 'UPDATE_STATUS', missionId: id, status: newStatus, volunteer: user?.name || 'Volunteer' }));
      }
      if (setNotifications) {
        setNotifications(prev => [
          {
            id: Date.now(),
            type: newStatus === 'Resolved' ? 'SUCCESS' : 'INFO',
            category: 'Mission',
            title: 'Mission Status Updated',
            message: `Volunteer ${user?.name || 'Field Agent'} updated Mission ${id} to ${newStatus}.`,
            time: 'Just Now',
            iconName: newStatus === 'Resolved' ? 'CheckCircle2' : 'Clock',
            color: newStatus === 'Resolved' ? 'text-emerald-500' : 'text-blue-500',
            bg: newStatus === 'Resolved' ? 'bg-emerald-50' : 'bg-blue-50'
          },
          ...prev
        ]);
      }
      alert(`MISSION UPDATED: Status changed to ${newStatus}.`);
    }
  };


  const handleSupplySubmit = (e) => {
    e.preventDefault();
    if (setSupplyOrders) {
      const requestedItems = [];
      if (supplyRequest.foodPacks > 0) requestedItems.push(`${supplyRequest.foodPacks}x Food`);
      if (supplyRequest.medicalKits > 0) requestedItems.push(`${supplyRequest.medicalKits}x Medical`);
      if (supplyRequest.oxygenCylinders > 0) requestedItems.push(`${supplyRequest.oxygenCylinders}x Oxygen`);
      if (supplyRequest.waterBottles > 0) requestedItems.push(`${supplyRequest.waterBottles}x Water`);
      
      const newOrder = {
        id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
        volunteer: user?.name || 'Field Agent',
        item: requestedItems.join(', ') || 'Emergency Supply Kits',
        location: reqLocation,
        destination: reqDestination,
        urgency: reqUrgency,
        remarks: reqRemarks,
        status: 'Transit',
        time: 'Just Now'
      };
      setSupplyOrders(prev => {
        const updated = [newOrder, ...(prev || [])];
        localStorage.setItem('supplyOrders', JSON.stringify(updated));
        return updated;
      });
      if (setNotifications) {
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'WARNING',
            category: 'Logistics',
            title: 'Supply Request Logged',
            message: `Volunteer ${user?.name || 'Field Agent'} requested ${newOrder.item} from ${newOrder.location} to ${newOrder.destination}.`,
            time: 'Just Now',
            iconName: 'Package',
            color: 'text-amber-500',
            bg: 'bg-amber-50'
          },
          ...prev
        ]);
      }
      alert('TACTICAL SUPPLY ORDER DISPATCHED TO COMMAND CENTER.');

    }
    setSupplyRequest({ foodPacks: 0, medicalKits: 0, oxygenCylinders: 0, waterBottles: 0 });
    setReqRemarks('');
  };



  const volunteerCoords = [22.3072, 73.1812];

  const createMarkerIcon = (color, isTruck = false, isStatic = false) => new L.divIcon({
    html: `<div class="relative flex items-center justify-center">
             ${!isStatic ? `<div class="absolute inset-0 w-12 h-12 -left-2 -top-2 rounded-full border-2 border-red-500/50 animate-ping" style="border-color: ${color}"></div>` : ''}
             ${!isStatic ? `<div class="absolute inset-0 w-8 h-8 rounded-full blur-md opacity-30 animate-pulse" style="background-color: ${color}"></div>` : ''}
             <div class="relative z-10 p-1.5 rounded-lg border-2 border-white shadow-xl" style="background-color: ${color}">
                ${isTruck ? '🚚' : ''}
                <div style="width: ${isTruck ? '0px' : '8px'}; height: ${isTruck ? '0px' : '8px'}; border-radius: 50%;"></div>
             </div>
           </div>`,
    className: 'custom-leaflet-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'my-missions', label: 'My Missions', icon: Target, count: myMissions.length },
    { id: 'explore', label: 'SOS Explorer', icon: Compass, count: availableMissions.length },
    { id: 'blood-ops', label: 'Blood Request Hub', icon: Heart },
    { id: 'logistics', label: 'Logistics Hub', icon: Package },
    { id: 'chat', label: 'Field Comms', icon: MessageSquare },
    { id: 'profile', label: 'My Profile', icon: UserCog }
  ];


  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden relative">
      
      {/* 1. SIDEBAR */}
      <div className="w-[280px] bg-white border-r border-slate-200 flex flex-col justify-between p-6 z-20 shadow-2xl">
        <div className="space-y-10">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-[17px] font-black text-slate-900 tracking-tighter leading-none uppercase italic">SevaSyncAI</h2>
              <p className="text-[9px] text-blue-400 font-black tracking-widest mt-1 uppercase">Field Operations</p>
            </div>
          </div>

          <div className="bg-white shadow-sm border border-slate-200 p-5 rounded-2xl space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-amber-400 flex items-center gap-1 tracking-wider">
                <Star size={14} className="fill-amber-400" /> LVL {currentLevel}
              </span>
              <span className="text-[9px] font-bold text-slate-500">{volunteerXP} XP</span>
            </div>
            <div className="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
              <div className="h-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" style={{ width: `${(volunteerXP / xpTarget) * 100}%` }} />
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl font-black text-[12px] uppercase tracking-widest transition-all ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                    : 'text-slate-500 hover:bg-white shadow-sm hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} />
                  <span>{item.label}</span>
                </div>
                {item.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-md text-[9px] font-black ${activeTab === item.id ? 'bg-white text-blue-600' : 'bg-blue-600/20 text-blue-400'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="px-2 pt-4 border-t border-slate-100 flex flex-col gap-2 text-[9px] font-black text-slate-500 tracking-widest uppercase">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${wsStatus.includes('CONNECTED') ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            <span>Link: {wsStatus}</span>
          </div>
          <span>Sector: Core Command</span>
        </div>
      </div>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 overflow-y-auto relative z-10 p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] z-0 pointer-events-none" />
        <TacticalClock />
        <div className="max-w-[1200px] mx-auto relative z-10 space-y-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="w-full space-y-8"
            >

          {/* VIEW 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div className="bg-white shadow-sm border border-slate-200 p-8 rounded-[32px] flex items-center justify-between gap-6 relative overflow-hidden">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-black uppercase shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                      {user?.name?.[0] || 'V'}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-[3px] border-white shadow-sm animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-[32px] font-black italic text-slate-900 leading-none mb-1">HELLO, {user?.name?.split(' ')[0] || 'AGENT'}</h1>
                    <p className="text-[11px] font-black tracking-widest text-blue-500 uppercase">Tactical Command Level {currentLevel} Field Coordinator</p>
                  </div>
                </div>
                <div className="hidden md:flex flex-col items-end text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Network Status</span>
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg border border-emerald-100">
                     <Radio size={14} className="animate-pulse" />
                     <span className="text-[11px] font-bold uppercase tracking-wider">Secured Connection</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-[24px] flex flex-col justify-between group hover:border-blue-400 transition-all hover:shadow-xl hover:shadow-blue-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Target size={22} /></div>
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md tracking-wider">↑ 12% RATE</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Deployments</span>
                    <div className="flex items-end gap-3 mt-1">
                      <p className="text-[36px] leading-none font-black text-slate-900">{myMissions.length}</p>
                      <span className="text-[11px] font-bold text-slate-400 mb-1 tracking-wider">/ 5 MAX</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-[24px] flex flex-col justify-between group hover:border-rose-400 transition-all hover:shadow-xl hover:shadow-rose-500/10">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform"><ShieldAlert size={22} className="text-emerald-500" /></div>
                    <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-1 rounded-md tracking-wider">URGENT</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Open SOS Requests</span>
                    <div className="flex items-end gap-3 mt-1">
                      <p className="text-[36px] leading-none font-black text-slate-900">{availableMissions.length}</p>
                      <span className="text-[11px] font-bold text-slate-400 mb-1 tracking-wider">QUEUED</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-slate-900 to-slate-800 shadow-sm border border-slate-700 p-6 rounded-[24px] flex flex-col justify-between group hover:shadow-xl transition-all relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10"><Award size={80} className="text-amber-400" /></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform"><Award size={22} /></div>
                    <span className="text-[10px] font-bold text-amber-300 bg-amber-900/50 border border-amber-700/50 px-2 py-1 rounded-md tracking-wider">{volunteerXP} XP</span>
                  </div>
                  <div className="relative z-10">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Current Standing</span>
                    <div className="flex items-end gap-3 mt-1">
                      <p className="text-[36px] leading-none font-black text-white">LEVEL {currentLevel}</p>
                    </div>
                    <div className="w-full h-1.5 bg-slate-700 rounded-full mt-3 overflow-hidden">
                       <div className="h-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" style={{ width: `${(volunteerXP % 100) + 20}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tactical Leaderboard Node */}
              <div className="bg-white shadow-sm border border-slate-200 rounded-[32px] p-8 space-y-6">
                <div>
                  <h3 className="text-[18px] font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                    <Award size={22} className="text-amber-400 animate-pulse" /> Top Field Operatives
                  </h3>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Global operational XP rankings</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { rank: 1, name: 'Arjun Mehta', xp: 850, city: 'Vadodara' },
                    { rank: 2, name: 'Sanya Iyer', xp: 720, city: 'Surat' },
                    { rank: 3, name: 'Kabir Shah', xp: 610, city: 'Bhopal' },
                    { rank: 4, name: user?.name || 'Active Agent', xp: volunteerXP, city: 'Sector A' }
                  ].map((agent, idx) => (
                    <div 
                      key={idx}
                      className={`flex justify-between items-center p-4 rounded-[20px] border transition-all ${
                        agent.rank === 4 ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white shadow-sm border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center leading-none ${
                          agent.rank === 1 ? 'bg-amber-100 text-amber-600' :
                          agent.rank === 2 ? 'bg-slate-100 text-slate-500' :
                          agent.rank === 3 ? 'bg-orange-100 text-orange-600' : 'bg-blue-600 text-white shadow-md'
                        }`}>
                          <span className="text-[10px] font-black uppercase opacity-70 mb-0.5">Rank</span>
                          <span className="text-[14px] font-black">#{agent.rank}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`hidden sm:flex w-8 h-8 rounded-full items-center justify-center text-[11px] font-black text-white ${
                              agent.rank === 1 ? 'bg-amber-500' :
                              agent.rank === 2 ? 'bg-slate-400' :
                              agent.rank === 3 ? 'bg-orange-500' : 'bg-blue-600'
                            }`}>
                             {agent.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className={`text-[13px] font-black ${agent.rank === 4 ? 'text-blue-900' : 'text-slate-900'}`}>{agent.name}</h4>
                            <p className={`text-[9px] font-bold uppercase tracking-widest ${agent.rank === 4 ? 'text-blue-500' : 'text-slate-500'}`}>{agent.city} Node</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-[14px] font-black ${agent.rank === 4 ? 'text-blue-700' : 'text-slate-700'}`}>{agent.xp} <span className="text-[10px] opacity-60">XP</span></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>


              <div className="flex justify-end pt-4">
                <button onClick={() => setActiveTab('my-missions')} className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl"><ChevronRight size={16} /> View Deployments</button>
              </div>
            </div>
          )}

          {/* VIEW 2: MY MISSIONS */}
          {activeTab === 'my-missions' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 flex flex-col h-full">
                <h2 className="text-[24px] font-black uppercase italic tracking-tight text-slate-900 mb-6">Active Missions</h2>
                <div className="space-y-6 max-h-[75vh] overflow-y-auto scrollbar-hide pr-2">
                  {myMissions.length === 0 ? (
                    <div className="bg-white shadow-sm border border-slate-200 p-12 rounded-[32px] text-center text-slate-500 text-[12px] font-black uppercase tracking-widest">
                      No active dispatches assigned.
                    </div>
                  ) : (
                    myMissions.map(mission => (
                      <div 
                        key={mission.id}
                        onClick={() => setSelectedMission(mission)}
                        className={`p-6 bg-white shadow-sm hover:bg-slate-50 border rounded-[32px] cursor-pointer transition-all relative ${selectedMission?.id === mission.id ? 'border-blue-500 shadow-xl shadow-blue-500/5' : 'border-slate-200'}`}
                      >
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400">SS-{mission.id}</span>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-md ${mission.urgency === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>{mission.urgency}</span>
                          </div>
                          <h3 className="text-[20px] font-black text-slate-900 leading-tight uppercase">{mission.issue}</h3>
                          
                          <div className="bg-white shadow-sm p-3 rounded-xl border border-slate-100 space-y-2">
                             <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{mission.description}</p>
                             <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                 <Users size={12} className="text-amber-400" /> {mission.people} Affected
                               </span>
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1">
                                 <MapPin size={12} className="text-blue-400" /> {mission.city}
                               </span>
                             </div>
                          </div>

                          <p className="text-[13px] font-bold text-slate-500 flex items-center gap-2"><MapPin size={16} className="text-emerald-400" /> {mission.area}</p>
                          <div className="pt-4 flex gap-2 border-t border-slate-100">
                            {mission.status === 'Assigned' && (
                              <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(mission.id, 'In Progress'); }} className="px-4 py-2 w-full bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all">Accept Dispatch</button>
                            )}
                            {mission.status === 'In Progress' && (
                              <button onClick={(e) => { e.stopPropagation(); handleUpdateStatus(mission.id, 'Resolved'); }} className="px-4 py-2 w-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all">Mark Resolved</button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                {selectedMission ? (
                  <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-[32px] space-y-6 sticky top-10">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2">
                      <Compass size={18} className="animate-spin-slow" /> Routing Telemetry
                    </h3>

                    {/* Advanced Timeline Bar */}
                    <div className="bg-white shadow-sm p-4 rounded-2xl border border-slate-100">
                      <span className="block text-[9px] uppercase tracking-[0.2em] text-slate-500 font-black mb-3">Deployment Phase</span>
                      <div className="flex justify-between items-center relative">
                        <div className="absolute top-[9px] left-[10%] right-[10%] h-0.5 bg-slate-50 z-0" />
                        <div 
                          className="absolute top-[9px] left-[10%] h-0.5 bg-blue-500 z-0 transition-all duration-500" 
                          style={{ width: selectedMission.status === 'Resolved' ? '80%' : selectedMission.status === 'In Progress' ? '40%' : '0%' }}
                        />
                        {['Assigned', 'In Progress', 'Resolved'].map((phase, pIdx) => {
                          const phaseMatch = selectedMission.status === phase;
                          const isPassed = (phase === 'Assigned') || (phase === 'In Progress' && selectedMission.status === 'Resolved') || phaseMatch;
                          return (
                            <div key={phase} className="flex flex-col items-center relative z-10">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                                phaseMatch ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-600/30' : 
                                isPassed ? 'bg-slate-800 border-slate-700 text-slate-500' : 'bg-white border-slate-200 text-slate-600'
                              }`}>
                                <span className="text-[9px] font-black">{pIdx + 1}</span>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-widest mt-2 ${phaseMatch ? 'text-blue-400' : 'text-slate-500'}`}>
                                {phase}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {selectedMission.lat && selectedMission.lng && (
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMission.lat},${selectedMission.lng}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-3 bg-white shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg transition-all"
                      >
                        <ExternalLink size={14} /> Open Google Maps Navigation
                      </a>
                    )}

                    <div className="h-[250px] rounded-2xl overflow-hidden relative border border-slate-100">

                      <MapContainer center={volunteerCoords} zoom={11} style={{ height: '100%', width: '100%' }} zoomControl={false} scrollWheelZoom={false}>
                        <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                        <Marker position={volunteerCoords} icon={createMarkerIcon('#10b981')} />
                        {selectedMission.lat && selectedMission.lng && (
                          <>
                            <Marker position={[selectedMission.lat, selectedMission.lng]} icon={createMarkerIcon('#ea4335')} />
                            <Polyline positions={[volunteerCoords, [selectedMission.lat, selectedMission.lng]]} pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '5, 10' }} />
                          </>
                        )}
                      </MapContainer>
                    </div>

                    {/* Checklist Advance Node */}
                    <div className="pt-4 border-t border-slate-100 space-y-3">
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Action Directives</h4>
                      {[
                        "Secure distribution sector parameters",
                        "Release resource units to ground hubs",
                        "Report status telemetry codes"
                      ].map((task, index) => {
                        const isChecked = checkedTasks[`${selectedMission.id}-${index}`];
                        return (
                          <div 
                            key={index} 
                            onClick={() => toggleTask(selectedMission.id, index)}
                            className="flex items-center gap-3 p-3 bg-white shadow-sm border border-slate-100 hover:border-blue-500/30 rounded-xl cursor-pointer transition-all"
                          >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${isChecked ? 'bg-blue-600 border-blue-600' : 'border-white/20'}`}>
                              {isChecked && <CheckCircle2 size={12} className="text-slate-900 flex-shrink-0" />}
                            </div>
                            <span className={`text-[11px] font-bold ${isChecked ? 'text-slate-500 line-through' : 'text-slate-700'}`}>{task}</span>
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ) : (
                  <div className="bg-white shadow-sm border border-slate-200 p-8 rounded-[32px] space-y-8 sticky top-10 flex flex-col h-[75vh]">
                     <div className="flex items-center gap-3">
                       <Radio size={24} className="text-blue-500 animate-pulse" />
                       <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-700">System Telemetry Standing By</h3>
                     </div>
                     
                     <div className="flex-1 rounded-[24px] overflow-hidden relative border border-slate-100 bg-white shadow-sm flex items-center justify-center">
                        <div className="absolute inset-0 flex items-center justify-center">
                           <div className="w-32 h-32 rounded-full border border-blue-500/20 animate-ping absolute" />
                           <div className="w-48 h-48 rounded-full border border-blue-500/10 animate-ping absolute" style={{ animationDelay: '0.5s' }} />
                           <Compass size={48} className="text-blue-500/30" />
                        </div>
                        <div className="relative z-10 text-center px-6">
                           <p className="text-[11px] font-black tracking-widest text-blue-400 uppercase mb-2">Awaiting Mission Selection</p>
                           <p className="text-[10px] text-slate-500 font-bold leading-relaxed max-w-[250px] mx-auto">
                              Select an active deployment from the sector list to access localized live-routing protocols, ground checklists, and dynamic tracking algorithms.
                           </p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white shadow-sm border border-slate-100 p-5 rounded-[20px]">
                           <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Queue Status</span>
                           <span className="text-[18px] font-black text-blue-400">{myMissions.length} Active</span>
                        </div>
                        <div className="bg-white shadow-sm border border-slate-100 p-5 rounded-[20px]">
                           <span className="block text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Link Integrity</span>
                           <span className="text-[18px] font-black text-emerald-400">100% Secure</span>
                        </div>
                     </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VIEW 3: SOS EXPLORER */}
          {activeTab === 'explore' && (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white shadow-sm border border-slate-200 p-6 rounded-[32px]">
                <div>
                  <h2 className="text-[24px] font-black uppercase italic tracking-tight text-slate-900">Open Rescue Claims</h2>
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Authorize ground action vectors.</p>
                </div>
                <div className="relative flex-1 max-w-md w-full">
                  <input 
                    type="text"
                    placeholder="Search by area or emergency..."
                    value={sosSearch}
                    onChange={(e) => setSosSearch(e.target.value)}
                    className="w-full bg-white shadow-sm border border-slate-200 rounded-2xl px-5 py-3 text-[12px] text-slate-900 font-bold outline-none focus:border-blue-500 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {paginatedSOS.length === 0 ? (
                  <div className="col-span-2 bg-white shadow-sm border border-slate-200 p-12 rounded-[32px] text-center text-slate-500 font-black text-[11px] uppercase">
                    No requests matching criteria.
                  </div>
                ) : (
                  paginatedSOS.map(mission => (
                    <div key={mission.id} className="p-6 bg-white shadow-sm border border-slate-200 hover:border-blue-500/30 rounded-[32px] flex flex-col justify-between gap-6 transition-all duration-300">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black px-2.5 py-1 rounded-md bg-slate-800 text-slate-500">SS-{mission.id}</span>
                          <span className={`text-[10px] font-black px-2.5 py-1 rounded-md ${mission.urgency === 'High' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>{mission.urgency} Urgency</span>
                        </div>
                        <div>
                          <h4 className="text-[18px] font-black text-slate-900 uppercase tracking-tight leading-tight mb-1">{mission.issue}</h4>
                          <p className="text-slate-500 font-bold text-[12px] flex items-center gap-2"><MapPin size={14} className="text-blue-500" /> {mission.area}, {mission.city}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 bg-white shadow-sm p-3 rounded-xl border border-slate-100 text-[11px]">
                           <div className="text-slate-500 font-bold">
                              <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-0.5">Impact Scope</span>
                              <span className="text-slate-700">{mission.people || 'Multiple'} Citizens</span>
                           </div>
                           <div className="text-slate-500 font-bold">
                              <span className="block text-[9px] uppercase tracking-widest text-slate-500 font-black mb-0.5">Vector Status</span>
                              <span className="text-emerald-400 flex items-center gap-1"><Radio size={10} className="animate-pulse" /> Dispatched Node</span>
                           </div>
                        </div>

                        <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                          <span className="block text-[9px] uppercase tracking-widest text-blue-400 font-black mb-1">Situation Briefing</span>
                          <p className="text-[11px] font-medium text-slate-600 leading-relaxed">{mission.description || 'Deployment assessment ongoing by Sector Command.'}</p>
                        </div>
                      </div>

                      <button onClick={() => handleClaimMission(mission.id)} className="w-full py-3.5 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl"><Zap size={14} /> Claim Task</button>
                    </div>
                  ))
                )}
              </div>

              {/* SOS Pagination */}
              {totalSosPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-4">
                  <button 
                    disabled={sosPage === 1}
                    onClick={() => setSosPage(p => p - 1)}
                    className="px-4 py-2 bg-white shadow-sm text-slate-500 disabled:opacity-30 font-black text-[11px] uppercase rounded-xl hover:text-slate-900 transition-all"
                  >
                    Prev
                  </button>
                  <span className="text-[12px] font-black text-slate-500">{sosPage} / {totalSosPages}</span>
                  <button 
                    disabled={sosPage === totalSosPages}
                    onClick={() => setSosPage(p => p + 1)}
                    className="px-4 py-2 bg-white shadow-sm text-slate-500 disabled:opacity-30 font-black text-[11px] uppercase rounded-xl hover:text-slate-900 transition-all"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}


          {/* VIEW 5: FIELD COMMS CHAT */}
          {activeTab === 'chat' && (
            <div className="max-w-2xl mx-auto bg-white shadow-sm border border-slate-200 rounded-[32px] p-8 flex flex-col h-[600px] justify-between">
              <div>
                <h2 className="text-[24px] font-black uppercase italic tracking-tight text-slate-900 flex items-center gap-2 mb-1">
                  <MessageSquare className="text-emerald-500 animate-pulse" /> SevaSync Rescue AI
                </h2>
                <p className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-6 border-b border-slate-100 pb-4">Powered by ChatGPT Intelligence</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide mb-6">
                {chatMessages.map((msg, idx) => (
                  <div key={idx} className={`flex w-full ${msg.sender === 'Volunteer' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex gap-3 max-w-[80%] ${msg.sender === 'Volunteer' ? 'flex-row-reverse' : 'flex-row'}`}>
                       {/* Avatar */}
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.sender === 'Volunteer' ? 'bg-blue-100 text-blue-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {msg.sender === 'Volunteer' ? <UserCog size={14} /> : <MessageSquare size={14} />}
                       </div>
                       {/* Bubble */}
                       <div className="flex flex-col">
                          <div className={`px-5 py-3 rounded-2xl font-medium text-[13px] leading-relaxed ${
                            msg.sender === 'Volunteer' 
                              ? 'bg-blue-600 text-white rounded-tr-none shadow-lg shadow-blue-600/20' 
                              : 'bg-white shadow-sm border border-slate-200 text-slate-700 rounded-tl-none'
                          }`}>
                            <p>{msg.text}</p>
                          </div>
                          <span className={`text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1.5 px-1 ${msg.sender === 'Volunteer' ? 'text-right' : 'text-left'}`}>
                            {msg.sender} • {msg.time}
                          </span>
                       </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex w-full justify-start">
                    <div className="flex gap-3 max-w-[80%] flex-row">
                       <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-emerald-100 text-emerald-600">
                          <MessageSquare size={14} className="animate-pulse" />
                       </div>
                       <div className="flex flex-col">
                          <div className="px-5 py-3 rounded-2xl font-medium text-[13px] bg-white shadow-sm border border-slate-200 text-slate-500 rounded-tl-none flex items-center gap-2">
                             <div className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                             </div>
                             <span className="text-[10px] uppercase tracking-widest ml-2 font-black text-emerald-600">AI is thinking...</span>
                          </div>
                       </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex flex-col gap-3">
                {/* AI Quick Prompts */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                   {['🚨 Report Emergency', '📦 Request Supplies', '📊 Current Area Status'].map(prompt => (
                      <button 
                         key={prompt}
                         type="button"
                         onClick={() => setNewMessage(prompt)}
                         className="px-4 py-2 bg-slate-50 border border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 text-[11px] font-bold rounded-full transition-colors whitespace-nowrap shadow-sm"
                      >
                         {prompt}
                      </button>
                   ))}
                </div>

                <form 
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newMessage.trim()) return;
                    const messageText = newMessage;
                    setChatMessages(prev => [...prev, { sender: 'Volunteer', text: messageText, time: 'Just Now' }]);
                    setNewMessage('');
                    setIsTyping(true);
                    try {
                      const response = await chatService.sendMessage(messageText);
                      setTimeout(() => {
                        setIsTyping(false);
                        setChatMessages(prev => [...prev, { sender: 'Rescue AI', text: response.data.reply, time: 'Just Now' }]);
                      }, 1200);
                    } catch (err) {
                      setTimeout(() => {
                        setIsTyping(false);
                        setChatMessages(prev => [...prev, { sender: 'Rescue AI', text: 'Error: Cannot reach AI server. Connection failed.', time: 'Just Now' }]);
                      }, 600);
                    }
                  }} 
                  className="flex gap-3 bg-white shadow-sm p-3 border border-slate-200 rounded-2xl focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 transition-all"
                >
                  <input 
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message Rescue AI..."
                    className="flex-1 bg-transparent outline-none px-3 text-[13px] text-slate-900 font-medium placeholder:text-slate-400"
                  />
                  <button type="submit" className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-all shadow-lg shadow-blue-500/20">
                  <Send size={16} />
                </button>
              </form>
            </div>
            </div>
          )}

          {/* VIEW 4: LOGISTICS (UPGRADED) */}

          {activeTab === 'logistics' && (
            <div className="space-y-10">
              
              {/* Header / FEATURE 3: CSV Download */}
              <div className="flex flex-col md:flex-row justify-between items-center bg-white shadow-sm border border-slate-200 p-8 rounded-[32px] gap-6">
                 <div>
                   <h2 className="text-[24px] font-black uppercase italic tracking-tight text-slate-900">Logistics Master Command</h2>
                   <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">Central supply access for field operatives.</p>
                 </div>
                 <button 
                    onClick={exportToCSV}
                    className="px-6 py-3.5 bg-slate-50 hover:bg-white/20 text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all"
                 >
                    <Download size={18} /> Export CSV Manifest
                 </button>
              </div>

              {/* FEATURE 1: Analytics Chart */}
              <div className="bg-white shadow-sm border border-slate-200 rounded-[32px] p-8">
                 <h3 className="text-[13px] font-black uppercase tracking-widest text-blue-400 flex items-center gap-2 mb-6">
                   <BarChart3 size={18} /> Supply Distribution Analytics
                 </h3>
                 <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                   {categoryStock.map(([cat, qty]) => {
                     const percentage = Math.round((qty / maxStock) * 100);
                     const getColor = (c) => {
                        if(c.includes('Food')) return 'bg-amber-500';
                        if(c.includes('Water')) return 'bg-cyan-500';
                        if(c.includes('Medical')) return 'bg-rose-500';
                        if(c.includes('Shelter')) return 'bg-indigo-500';
                        return 'bg-emerald-500';
                     };
                     const getIcon = (c) => {
                        if(c.includes('Food')) return <Package size={16} className="text-amber-500 opacity-50" />;
                        if(c.includes('Water')) return <Zap size={16} className="text-cyan-500 opacity-50" />;
                        if(c.includes('Medical')) return <Activity size={16} className="text-rose-500 opacity-50" />;
                        if(c.includes('Shelter')) return <Shield size={16} className="text-indigo-500 opacity-50" />;
                        return <Target size={16} className="text-emerald-500 opacity-50" />;
                     };
                     return (
                       <div key={cat} className="bg-white shadow-sm hover:bg-slate-50 transition-colors rounded-2xl p-5 border border-slate-100 relative overflow-hidden flex flex-col justify-between h-[120px]">
                         <div className="flex justify-between items-start">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{cat}</span>
                           {getIcon(cat)}
                         </div>
                         <div>
                           <p className="text-[24px] font-black text-slate-900 mt-1 leading-none">{qty.toLocaleString()}</p>
                         </div>
                         <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-3">
                            <div className={`h-full ${getColor(cat)} shadow-[0_0_10px_currentColor]`} style={{ width: `${percentage}%` }} />
                         </div>
                       </div>
                     );
                   })}
                 </div>
              </div>

              {/* Logistics Insights & Critical Alerts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* ALERT 1: CRITICAL ASSETS */}
                 <div className="bg-gradient-to-r from-rose-500/20 to-transparent border border-rose-500/30 p-6 rounded-[24px] space-y-3 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 animate-pulse" />
                    <h3 className="text-[13px] font-black uppercase tracking-widest text-rose-400 flex items-center gap-2">
                       <ShieldAlert size={18} className="animate-bounce" /> Critical Resource Warning
                    </h3>
                    <p className="text-[11px] font-medium text-slate-600 leading-relaxed">
                       Predictive diagnostics suggest <strong className="text-slate-900 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">Water Bottles</strong> and <strong className="text-slate-900 bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">Medical Kits</strong> will deplete across local hubs within 12 hours. Consider automated redistribution triggers.
                    </p>
                 </div>

                 {/* TIMELINE 2: REQUEST HISTORY */}
                 <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-[24px] space-y-3">
                    <div className="flex justify-between items-center">
                       <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-500">Dispatch Tracking History</h4>
                       <div className="flex gap-2">
                         <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">
                           {(supplyOrders || []).filter(o => o.status === 'Delivered').length} Delivered
                         </span>
                         <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded">
                           {(supplyOrders || []).filter(o => o.status === 'Transit').length} Transit
                         </span>
                       </div>
                    </div>
                    <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                       {(supplyOrders || []).map((req, rIdx) => (
                          <div key={rIdx} className="flex justify-between items-center text-[11px] p-2.5 bg-white shadow-sm border border-slate-100 rounded-xl font-bold">
                             <div className="flex items-center gap-3">
                                <span className={`w-2 h-2 rounded-full ${req.status === 'Delivered' ? 'bg-emerald-500' : req.status === 'Transit' ? 'bg-blue-500 animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
                                <span className="text-slate-700">{req.item}</span>
                             </div>
                             <span className="text-slate-500 uppercase text-[9px] tracking-wider">{req.status} • {req.time}</span>
                          </div>
                       ))}

                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                
                {/* Quick Form View */}
                <div className="lg:col-span-6 bg-white shadow-sm border border-slate-200 p-8 rounded-[32px] space-y-6 h-fit">
                  <h3 className="text-[14px] font-black uppercase tracking-tight text-slate-900 flex items-center gap-2">
                    <Package className="text-blue-400" /> Field Deployment Form
                  </h3>
                  <form onSubmit={handleSupplySubmit} className="space-y-5">
                     
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Dispatch Source Hub</label>
                          <select 
                            value={reqLocation}
                            onChange={(e) => setReqLocation(e.target.value)}
                            className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] text-slate-900 font-bold outline-none"
                          >
                            {cityCoordinates && Object.keys(cityCoordinates).map(city => (
                              <option key={city} value={city} className="bg-white text-slate-900">{city} Base</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Destination Sector</label>
                          <select 
                            value={reqDestination}
                            onChange={(e) => setReqDestination(e.target.value)}
                            className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] text-slate-900 font-bold outline-none"
                          >
                            {cityCoordinates && Object.keys(cityCoordinates).map(city => (
                              <option key={`dest-${city}`} value={city} className="bg-white text-slate-900">{city} Base</option>
                            ))}
                          </select>
                        </div>
                     </div>
                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Urgency Threshold</label>
                        <select 
                          value={reqUrgency}
                          onChange={(e) => setReqUrgency(e.target.value)}
                          className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] text-slate-900 font-bold outline-none"
                        >
                          {['Low', 'Medium', 'High'].map(u => (
                            <option key={u} value={u} className="bg-white text-slate-900">{u} Urgency</option>
                          ))}
                        </select>
                     </div>

                     <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">Situation Remarks</label>
                        <textarea 
                          value={reqRemarks}
                          onChange={(e) => setReqRemarks(e.target.value)}
                          placeholder="Log active requirement descriptions..."
                          className="w-full bg-white shadow-sm border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] text-slate-900 font-bold outline-none h-16 placeholder:text-slate-600 resize-none"
                        />
                     </div>

                     {[
                       { key: 'foodPacks', label: 'Food Packages', max: 50, icon: Package, color: 'text-amber-600 bg-amber-50 border-amber-100', fill: 'bg-amber-500 shadow-amber-500/30', border: 'border-amber-500', iconColor: 'text-amber-500' },
                       { key: 'medicalKits', label: 'Medical Kits', max: 20, icon: Activity, color: 'text-rose-600 bg-rose-50 border-rose-100', fill: 'bg-rose-500 shadow-rose-500/30', border: 'border-rose-500', iconColor: 'text-rose-500' },
                       { key: 'oxygenCylinders', label: 'Oxygen Tanks', max: 5, icon: Zap, color: 'text-cyan-600 bg-cyan-50 border-cyan-100', fill: 'bg-cyan-500 shadow-cyan-500/30', border: 'border-cyan-500', iconColor: 'text-cyan-500' },
                       { key: 'waterBottles', label: 'Water Bottles (L)', max: 100, icon: Target, color: 'text-blue-600 bg-blue-50 border-blue-100', fill: 'bg-blue-500 shadow-blue-500/30', border: 'border-blue-500', iconColor: 'text-blue-500' }
                     ].map(supply => {
                        const val = supplyRequest[supply.key];
                        const pct = (val / supply.max) * 100;
                        return (
                        <div key={supply.key} className="space-y-3 pt-2">
                           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                              <span className="text-slate-500 flex items-center gap-1.5">
                                 <supply.icon size={14} className={supply.iconColor} /> {supply.label}
                              </span>
                              <span className={`${supply.color} px-2 py-0.5 rounded-md border`}>
                                {val} <span className="opacity-50">/ {supply.max}</span>
                              </span>
                           </div>
                           <div className="relative w-full h-2.5 bg-slate-100 rounded-full cursor-pointer group">
                              <div 
                                className={`absolute top-0 left-0 h-full ${supply.fill} rounded-full shadow-[0_0_10px_currentColor] transition-all duration-75`} 
                                style={{ width: `${pct}%` }}
                              ></div>
                              <input 
                                 type="range" min="0" max={supply.max}
                                 value={val}
                                 onChange={(e) => setSupplyRequest({...supplyRequest, [supply.key]: parseInt(e.target.value)})}
                                 className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer z-10"
                              />
                              <div 
                                 className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-[4px] ${supply.border} rounded-full shadow-md pointer-events-none transition-all duration-75 group-hover:scale-125 z-0`} 
                                 style={{ left: `calc(${pct}% - 8px)` }}
                              ></div>
                           </div>
                        </div>
                     )})}
                     
                     {(() => {
                        const totalPayload = 
                           supplyRequest.foodPacks * 5 + 
                           supplyRequest.medicalKits * 2 + 
                           supplyRequest.oxygenCylinders * 15 + 
                           supplyRequest.waterBottles * 1;
                        const capacity = (totalPayload / 500) * 100;
                        return (
                           <div className="mt-4 p-5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-3 relative overflow-hidden">
                              <div className="absolute top-0 right-0 p-4 opacity-5"><Package size={40} /></div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 relative z-10">
                                 <span>Payload Capacity Analysis</span>
                                 <span className={totalPayload > 450 ? 'text-rose-500' : 'text-emerald-500'}>{totalPayload} KG / 500 KG</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden relative z-10">
                                 <div className={`h-full ${totalPayload > 450 ? 'bg-rose-500' : 'bg-emerald-500'} transition-all shadow-[0_0_8px_currentColor]`} style={{ width: `${Math.min(capacity, 100)}%` }}></div>
                              </div>
                           </div>
                        );
                     })()}
                     
                     <div className="pt-4">
                        <button 
                          type="submit" 
                          disabled={Object.values(supplyRequest).every(v => v === 0)} 
                          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-blue-500/20 disabled:shadow-none flex items-center justify-center gap-2 group"
                        >
                          <Send size={16} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                          Deploy Support Units
                        </button>
                     </div>
                  </form>
                </div>


                {/* FEATURE 2: Hub Visualizer Map */}
                <div className="lg:col-span-6 bg-white shadow-sm border border-slate-200 p-8 rounded-[32px] space-y-4">
                  <h3 className="text-[14px] font-black uppercase tracking-tight text-indigo-400 flex items-center gap-2">
                    <Compass size={20} /> Sector Inventory Hubs
                  </h3>
                  <div className="h-[280px] rounded-2xl overflow-hidden border border-slate-100">
                    <MapContainer center={[22.3072, 73.1812]} zoom={8} style={{ height: '100%', width: '100%' }} zoomControl={false}>
                       <TileLayer attribution='&copy; CARTO' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                       
                       {/* Hub Markers */}
                       {cityCoordinates && Object.entries(cityCoordinates).map(([city, coords]) => (
                          <Marker key={city} position={coords} icon={createMarkerIcon('#6366f1', false, true)}>
                             <Popup><span className="font-sans font-bold text-[12px] text-slate-800">{city} Base</span></Popup>
                          </Marker>
                       ))}

                       {/* Animated Transit Lines */}
                       {(supplyOrders || []).filter(o => o.status === 'Transit').map(order => {
                          const sourceCoords = cityCoordinates?.[order.location];
                          const destCoords = cityCoordinates?.[order.destination] || volunteerCoords;
                          if (!sourceCoords) return null;

                          const TOTAL_DURATION = 2 * 60 * 60 * 1000; // 2 Hours
                          const startTime = orderStartTimes.current[order.id] || now;
                          const elapsed = Math.min(now - startTime, TOTAL_DURATION);
                          const progress = elapsed / TOTAL_DURATION;

                          const currentLat = sourceCoords[0] + (destCoords[0] - sourceCoords[0]) * progress;
                          const currentLng = sourceCoords[1] + (destCoords[1] - sourceCoords[1]) * progress;
                          const remainingMins = Math.max(1, Math.ceil((TOTAL_DURATION - elapsed) / 60000));

                          return (
                             <React.Fragment key={order.id}>
                                <Polyline 
                                   positions={[sourceCoords, destCoords]} 
                                   color="#3b82f6" weight={3} dashArray="5, 10" opacity={0.6}
                                />
                                <Marker position={[currentLat, currentLng]} icon={createMarkerIcon('#f59e0b', true)}>
                                   <Popup>
                                      <div className="flex flex-col gap-1 text-center font-sans min-w-[120px]">
                                         <span className="text-[10px] font-black uppercase text-amber-600 bg-amber-100 rounded-full py-0.5">In Transit</span>
                                         <span className="text-[12px] font-bold text-slate-800">{order.item}</span>
                                         <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-bold mt-1 border-t border-slate-100 pt-1">
                                            <Clock size={10} /> 
                                            <span>ETA: {remainingMins} Mins</span>
                                         </div>
                                      </div>
                                   </Popup>
                                </Marker>
                             </React.Fragment>
                          );
                       })}

                       <Marker position={volunteerCoords} icon={createMarkerIcon('#10b981')} />
                    </MapContainer>
                  </div>
                </div>

              </div>
            </div>
          )}

            {/* VIEW: BLOOD REQUEST HUB */}
            {activeTab === 'blood-ops' && (
              <div className="space-y-8">
                {/* Header Banner */}
                <div className="bg-gradient-to-br from-[#9f1239] via-[#be123c] to-[#e11d48] rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                   <div className="absolute -right-20 -top-20 w-80 h-80 bg-rose-950/20 rounded-full blur-3xl" />
                   <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                         <div className="w-16 h-16 rounded-[22px] bg-white/10 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                            <Heart size={32} className="fill-current animate-pulse text-rose-200" />
                         </div>
                         <div>
                            <h1 className="text-[32px] font-black tracking-tight leading-none uppercase italic text-white">Tactical Blood Bank Link</h1>
                            <p className="text-[10px] text-rose-200 font-black tracking-[0.2em] uppercase mt-2">Emergency Hospital & Node Request Uplink</p>
                         </div>
                      </div>
                      <div className="bg-rose-950/40 border border-white/10 backdrop-blur-md px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-wider text-rose-200">
                         Central Node Connection: Established
                      </div>
                   </div>
                </div>

                {/* Grid Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                   {/* Left Column: Form */}
                   <div className="lg:col-span-5 bg-white shadow-xl shadow-rose-900/[0.02] border border-slate-200/80 p-8 rounded-[32px] space-y-6">
                      <h3 className="text-[14px] font-black uppercase tracking-widest text-rose-500 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                         <Heart size={18} /> Request Emergency Dispatch
                      </h3>

                      <form onSubmit={handleBloodRequestSubmit} className="space-y-5">
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Blood Archetype</label>
                               <select
                                  value={bloodRequestForm.type}
                                  onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, type: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all"
                               >
                                  {['A+', 'A-', 'B-', 'B+', 'AB-', 'AB+', 'O-', 'O+'].map(g => <option key={g} value={g}>{g}</option>)}
                               </select>
                            </div>
                            
                            <div className="space-y-2">
                               <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Required Units</label>
                               <input
                                  type="number"
                                  min="1"
                                  max="50"
                                  value={bloodRequestForm.volume}
                                  onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, volume: e.target.value })}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all"
                               />
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target Emergency Hub</label>
                            <select
                               value={bloodRequestForm.target}
                               onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, target: e.target.value })}
                               className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-bold text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all"
                            >
                               {['VADODARA CIVIL HOSPITAL', 'VADODARA CORE CLINIC', 'SSG HOSPITAL VADODARA', 'TRIAGE WARD BHADRAN', 'AHMEDABAD CIVIL HOSPITAL', 'SURAT EMERGENCY WARD'].map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-outfit">Urgency Vector</label>
                            <div className="grid grid-cols-4 gap-2">
                               {['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map(u => (
                                  <button
                                     key={u}
                                     type="button"
                                     onClick={() => setBloodRequestForm({ ...bloodRequestForm, urgency: u })}
                                     className={`py-3 rounded-xl text-[9px] font-black tracking-wider uppercase transition-all ${
                                        bloodRequestForm.urgency === u
                                        ? u === 'CRITICAL' ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                                          : u === 'HIGH' ? 'bg-orange-50 text-white shadow-lg shadow-orange-500/20'
                                          : u === 'MEDIUM' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                          : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                                        : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border border-slate-200/50'
                                     }`}
                                  >
                                     {u}
                                  </button>
                               ))}
                            </div>
                         </div>

                         <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest font-outfit">Remarks / Field Briefing</label>
                            <textarea
                               value={bloodRequestForm.remarks}
                               onChange={(e) => setBloodRequestForm({ ...bloodRequestForm, remarks: e.target.value })}
                               placeholder="e.g. Major accident case near node, immediate delivery requested."
                               rows={3}
                               className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-[13px] font-medium text-slate-700 outline-none focus:bg-white focus:ring-4 focus:ring-rose-500/5 transition-all placeholder:text-slate-300 resize-none"
                            />
                         </div>

                         <button
                            type="submit"
                            className="w-full py-5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black uppercase text-[12px] tracking-[0.2em] transition-all shadow-xl shadow-rose-500/20 active:scale-95 flex items-center justify-center gap-2 mt-4"
                         >
                            <Send size={16} /> DISPATCH BLOOD REQUEST
                         </button>
                      </form>
                   </div>

                   {/* Right Column: Live Status List */}
                   <div className="lg:col-span-7 bg-white shadow-xl shadow-rose-900/[0.02] border border-slate-200/80 p-8 rounded-[32px] space-y-6">
                      <h3 className="text-[14px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-4 mb-4 flex items-center gap-2">
                         <Activity size={18} className="text-rose-500" /> Live Blood Request Queues ({emergencyRequests.length})
                      </h3>

                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
                         {emergencyRequests.length > 0 ? (
                            emergencyRequests.map((req, i) => (
                               <div key={req.id || i} className="p-6 bg-slate-50 rounded-[28px] border border-slate-100/80 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-rose-100 transition-all hover:bg-white">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 rounded-[16px] bg-rose-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                                        {req.type}
                                     </div>
                                     <div>
                                        <div className="flex items-center gap-2">
                                           <h4 className="text-[15px] font-black text-slate-900">{req.volume}</h4>
                                           <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                                              req.urgency === 'CRITICAL' ? 'bg-red-50 text-red-600' :
                                              req.urgency === 'HIGH' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'
                                           }`}>
                                              {req.urgency}
                                           </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{req.target}</p>
                                     </div>
                                  </div>

                                  <div className="flex items-center gap-3">
                                     <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 border ${
                                        req.status === 'Dispatched' || req.status === 'Approved'
                                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                        : 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                                     }`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${
                                           req.status === 'Dispatched' || req.status === 'Approved' ? 'bg-emerald-500' : 'bg-amber-500 animate-ping'
                                        }`} />
                                        {req.status === 'Dispatched' || req.status === 'Approved' ? 'APPROVED & DISPATCHED' : 'PENDING ACTION'}
                                     </span>
                                  </div>
                               </div>
                            ))
                         ) : (
                            <div className="py-20 text-center font-bold text-[12px] uppercase text-slate-400 tracking-widest">
                               No Blood Requests Created Yet.
                            </div>
                         )}
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* VIEW 6: MY PROFILE */}
            {activeTab === 'profile' && (
            <div className="space-y-8">
              <div className="bg-white shadow-sm border border-slate-200 p-8 rounded-[32px] relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-36 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 opacity-90"></div>
                <div className="absolute top-0 left-0 right-0 h-36 bg-gradient-to-b from-transparent to-white/90"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-end pt-12">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[32px] bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-[56px] font-black text-white shadow-[0_0_40px_rgba(37,99,235,0.3)] border-4 border-white transform transition-transform group-hover:scale-105">
                      {user?.name?.[0] || 'V'}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-[4px] border-white shadow-md flex items-center justify-center">
                       <CheckCircle2 size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                      <div>
                        <h1 className="text-[36px] font-black italic text-slate-900 leading-tight uppercase tracking-tight">{user?.name || 'Field Agent'}</h1>
                        <div className="flex items-center gap-3 mt-2">
                           <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                             <Shield size={12} /> Command Level {currentLevel}
                           </span>
                           <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black tracking-widest uppercase flex items-center gap-1.5 shadow-sm">
                             <Activity size={12} /> Active Status
                           </span>
                        </div>
                      </div>
                      {!isEditingProfile ? (
                        <button 
                          onClick={() => { setProfileForm(profileData); setIsEditingProfile(true); }}
                          className="px-5 py-2.5 bg-slate-50 hover:bg-white/20 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-slate-200"
                        >
                          <Edit3 size={14} /> Edit Profile
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button 
                            onClick={() => setIsEditingProfile(false)}
                            className="px-5 py-2.5 bg-white shadow-sm hover:bg-slate-50 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all border border-slate-200"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={handleProfileSave}
                            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg"
                          >
                            Save Updates
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-8">
                  <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-[24px] space-y-6">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3">Operative Details</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                          <Mail size={18} />
                        </div>
                        <div className="overflow-hidden w-full">
                          <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Email Uplink</span>
                          <span className="text-[12px] font-bold text-slate-900 truncate block">{user?.email || 'agent@sevasync.ai'}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <Phone size={18} />
                        </div>
                        <div className="w-full">
                          <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Secure Comms</span>
                          {isEditingProfile ? (
                            <input 
                              type="text" 
                              value={profileForm.phone} 
                              onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 mt-1 text-[11px] text-slate-900 outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-[12px] font-bold text-slate-900">{profileData.phone}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400 shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div className="w-full">
                          <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Assigned Sector</span>
                          {isEditingProfile ? (
                            <input 
                              type="text" 
                              value={profileForm.sector} 
                              onChange={(e) => setProfileForm({...profileForm, sector: e.target.value})}
                              className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 mt-1 text-[11px] text-slate-900 outline-none focus:border-blue-500"
                            />
                          ) : (
                            <span className="text-[12px] font-bold text-slate-900">{profileData.sector}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 shrink-0">
                          <Calendar size={18} />
                        </div>
                        <div>
                          <span className="block text-[9px] font-black text-slate-500 uppercase tracking-widest">Joined Date</span>
                          <span className="text-[12px] font-bold text-slate-900">{profileData.joined}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/20 p-6 rounded-[24px] relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
                      <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform"><Award size={80} className="text-white" /></div>
                      <div className="relative z-10">
                        <span className="flex items-center gap-2 text-[10px] font-black text-amber-100 uppercase tracking-widest mb-2">
                           <Award size={14} /> Total Operational XP
                        </span>
                        <div className="flex items-end gap-2">
                          <p className="text-[48px] font-black text-white leading-none tracking-tighter">{volunteerXP}</p>
                          <span className="text-[14px] font-bold text-amber-200 mb-1">XP</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/20 rounded-full mt-4 overflow-hidden">
                           <div className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]" style={{ width: `${(volunteerXP % 100) + 20}%` }}></div>
                        </div>
                        <p className="text-[9px] font-bold text-amber-100 uppercase tracking-widest mt-2">{xpTarget - volunteerXP} XP to Next Level</p>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20 p-6 rounded-[24px] relative overflow-hidden group hover:-translate-y-1 transition-transform cursor-default">
                      <div className="absolute top-0 right-0 p-4 opacity-20 transform group-hover:scale-110 transition-transform"><Target size={80} className="text-white" /></div>
                      <div className="relative z-10">
                        <span className="flex items-center gap-2 text-[10px] font-black text-blue-200 uppercase tracking-widest mb-2">
                           <Target size={14} /> Missions Resolved
                        </span>
                        <div className="flex items-end gap-2">
                          <p className="text-[48px] font-black text-white leading-none tracking-tighter">{myMissions.filter(m => m.status === 'Resolved').length || 12}</p>
                          <span className="text-[14px] font-bold text-blue-200 mb-1">Total</span>
                        </div>
                        <div className="w-full h-1.5 bg-black/20 rounded-full mt-4 overflow-hidden">
                           <div className="h-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" style={{ width: '75%' }}></div>
                        </div>
                        <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest mt-2">75% Success Rate</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white shadow-sm border border-slate-200 p-6 rounded-[24px]">
                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-500 border-b border-slate-100 pb-3 mb-6">Expertise & Certifications</h3>
                    {isEditingProfile ? (
                      <div className="space-y-2">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Comma separated values</span>
                        <input 
                          type="text" 
                          value={profileForm.certifications.join(', ')} 
                          onChange={(e) => setProfileForm({...profileForm, certifications: e.target.value.split(',').map(s => s.trim())})}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-[12px] text-slate-900 outline-none focus:border-blue-500"
                        />
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-3">
                        {profileData.certifications.map((cert, i) => (
                          <span key={i} className="px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-[11px] font-black text-blue-600 shadow-sm flex items-center gap-2 hover:bg-blue-100 transition-colors cursor-default">
                            <CheckCircle2 size={12} className="text-blue-500" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;
