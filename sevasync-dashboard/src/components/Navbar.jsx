import React from 'react';
import { 
  Search, 
  Bell, 
  Menu, 
  User, 
  Settings, 
  LogOut,
  ChevronDown,
  Globe,
  Zap,
  ShieldAlert,
  Terminal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

import { useNavigate } from 'react-router-dom';

const Navbar = ({ toggleSidebar, isCrisisMode, toggleCrisisMode }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const [tacticalNote, setTacticalNote] = React.useState(null);

  const handleTacticalAction = (label) => {
    if (label === 'Admin Settings') {
      navigate('/settings');
    } else {
      setTacticalNote(`${label} system engaged. Sector authorization level: ALPHA.`);
      setTimeout(() => setTacticalNote(null), 3000);
    }
    setIsProfileOpen(false);
  };

  return (
    <nav className={`h-16 border-b flex items-center justify-between px-6 sticky top-0 z-[30] transition-all duration-500 ${
      isCrisisMode ? 'bg-[#c5221f] border-transparent' : 'bg-white border-[#f0f0f0]'
    }`}>
      
      {/* Tactical Notification Overlay */}
      <AnimatePresence>
        {tacticalNote && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[350px]"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
               <Zap size={20} className="animate-pulse" />
            </div>
            <div>
               <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Tactical Alert</p>
               <p className="text-white text-[13px] font-bold mt-0.5">{tacticalNote}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Left: Search */}
      <div className="flex items-center gap-4 flex-1">
        <button 
          onClick={toggleSidebar}
          className={`lg:hidden p-2 rounded-lg ${isCrisisMode ? 'text-white hover:bg-white/10' : 'text-[#64748b] hover:bg-[#f8fafc]'}`}
        >
          <Menu size={20} />
        </button>
        <div className="relative max-w-md w-full hidden md:block">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${isCrisisMode ? 'text-white/60' : 'text-[#94a3b8]'}`} size={16} />
          <input 
            type="text" 
            placeholder="Quick search (⌘+K)" 
            className={`w-full py-2 pl-10 pr-4 text-[13px] rounded-xl outline-none transition-all ${
              isCrisisMode 
                ? 'bg-white/10 text-white placeholder:text-white/40 focus:bg-white/20' 
                : 'bg-[#f8fafc] text-[#1e293b] placeholder:text-[#94a3b8] focus:bg-white focus:ring-1 ring-[#e2e8f0]'
            }`}
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        
        {/* CRISIS MODE SWITCH */}
        <button 
          onClick={toggleCrisisMode}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest transition-all ${
            isCrisisMode 
              ? 'bg-white text-[#c5221f] shadow-lg shadow-white/20' 
              : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'
          }`}
        >
          <ShieldAlert size={14} className={isCrisisMode ? 'animate-pulse' : ''} />
          {isCrisisMode ? 'CRISIS MODE ACTIVE' : 'ACTIVATE CRISIS MODE'}
        </button>

        <div className={`h-8 w-[1px] mx-2 ${isCrisisMode ? 'bg-white/20' : 'bg-[#f0f0f0]'}`} />

        <button className={`p-2 rounded-xl transition-colors relative ${isCrisisMode ? 'text-white hover:bg-white/10' : 'text-[#64748b] hover:bg-[#f8fafc]'}`}>
          <Bell size={20} />
          <span className={`absolute top-2 right-2 w-2 h-2 rounded-full border-2 ${isCrisisMode ? 'bg-white border-[#c5221f]' : 'bg-[#ea4335] border-white'}`} />
        </button>
        
        <button className={`p-2 rounded-xl transition-colors ${isCrisisMode ? 'text-white hover:bg-white/10' : 'text-[#64748b] hover:bg-[#f8fafc]'}`}>
          <Globe size={20} />
        </button>

        <div className="relative">
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className={`flex items-center gap-3 ml-2 p-1 rounded-xl transition-all ${isCrisisMode ? 'hover:bg-white/10' : 'hover:bg-[#f8fafc]'} cursor-pointer group`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[12px] shadow-sm ${
              isCrisisMode ? 'bg-white text-[#c5221f]' : 'bg-[#1a73e8] text-white'
            }`}>
              {user?.name?.[0] || 'D'}
            </div>
            <div className="hidden sm:block text-left pr-2">
              <p className={`text-[12px] font-bold leading-none ${isCrisisMode ? 'text-white' : 'text-[#1e293b]'}`}>{user?.name || 'Authorized Agent'}</p>
              <p className={`text-[10px] font-medium mt-1 ${isCrisisMode ? 'text-white/60' : 'text-[#94a3b8]'}`}>Admin</p>
            </div>
            <ChevronDown size={14} className={`${isCrisisMode ? 'text-white/40' : 'text-[#94a3b8]'}`} />
          </div>

          <AnimatePresence>
            {isProfileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} />
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-50 mb-1">
                    <p className="text-[13px] font-bold text-slate-900">{user?.name || 'Authorized Agent'}</p>
                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">System Administrator</p>
                  </div>

                  {/* New: Tactical Stats Section */}
                  <div className="px-4 py-3 bg-slate-50/50 mx-2 my-2 rounded-xl border border-slate-100">
                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Mission Pulse</p>
                     <div className="grid grid-cols-2 gap-3">
                        <div>
                           <p className="text-[14px] font-black text-blue-600 leading-none">12</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Authorized</p>
                        </div>
                        <div className="border-l border-slate-200 pl-3">
                           <p className="text-[14px] font-black text-emerald-600 leading-none">08</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Field Units</p>
                        </div>
                     </div>
                  </div>

                  {[
                    { icon: User, label: 'Tactical Profile', color: 'text-slate-600' },
                    { icon: Terminal, label: 'Stealth Console', color: 'text-slate-600' },
                    { icon: Settings, label: 'Admin Settings', color: 'text-slate-600' },
                  ].map((item, i) => (
                    <button 
                      key={i} 
                      onClick={() => handleTacticalAction(item.label)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 transition-all text-[13px] font-medium"
                    >
                      <item.icon size={16} className="text-slate-400" />
                      {item.label}
                    </button>
                  ))}
                  <div className="h-px bg-slate-50 my-1" />
                  <button 
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-all text-[13px] font-bold"
                  >
                    <LogOut size={16} />
                    Deauthorize System
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
