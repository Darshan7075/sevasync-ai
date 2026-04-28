import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings as SettingsIcon, Shield, Bell, Zap, 
  Map as MapIcon, Users, Lock, Eye, 
  Save, RefreshCw, ChevronRight, Globe,
  Terminal, Database, Cpu, HardDrive
} from 'lucide-react';
import { settingsService } from '../services/api';

const SettingsPage = ({ isCrisisMode, toggleCrisisMode }) => {
  const [activeTab, setActiveTab] = useState('General');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    platformName: 'SevaSync AI Hub',
    hubRegion: 'Western Gujarat Node',
    triageSensitivity: 'High',
    autoAllocation: true,
    encryption: 'Enabled',
    ipCloaking: 'Active',
    biometricOverride: 'Standby'
  });

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsService.getSettings();
        if (res.data && res.data.length > 0) {
          const loaded = {};
          res.data.forEach(s => {
            if (s.key === 'autoAllocation') loaded[s.key] = s.value === 'true';
            else loaded[s.key] = s.value;
          });
          setSettings(prev => ({ ...prev, ...loaded }));
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        settingsService.updateSetting('platformName', settings.platformName, 'General'),
        settingsService.updateSetting('hubRegion', settings.hubRegion, 'General'),
        settingsService.updateSetting('triageSensitivity', settings.triageSensitivity, 'General'),
        settingsService.updateSetting('autoAllocation', settings.autoAllocation.toString(), 'General'),
        settingsService.updateSetting('encryption', settings.encryption, 'Security'),
        settingsService.updateSetting('ipCloaking', settings.ipCloaking, 'Security'),
        settingsService.updateSetting('biometricOverride', settings.biometricOverride, 'Security')
      ]);
      window.dispatchEvent(new CustomEvent('settingsUpdated', { detail: settings }));
      alert('SYSTEM INTELLIGENCE & SECURITY SYNCED SUCCESSFULLY');
    } catch (err) {
      alert('SYNC FAILED: Check backend connection');
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (key, val) => {
    setSettings(prev => ({ ...prev, [key]: val }));
  };

  const settingsCategories = [
    { id: 'General', icon: Globe, label: 'System Intel' },
    { id: 'Security', icon: Shield, label: 'Security Protocols' },
  ];

  return (
    <div className="p-8 space-y-8 animate-fade-in max-w-[1600px] mx-auto pb-24">
      
      {/* 1. Tactical Settings Header */}
      <div className="bg-[#0f172a] rounded-[40px] p-10 text-white shadow-2xl relative overflow-hidden">
         <div className="absolute top-0 right-0 p-16 opacity-5 pointer-events-none">
            <SettingsIcon size={250} />
         </div>
         <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div>
               <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-400 border border-blue-400/20">
                     <Terminal size={20} />
                  </div>
                  <span className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em]">System Configuration</span>
               </div>
               <h1 className="text-[48px] font-black tracking-tighter uppercase leading-none">Command Parameters</h1>
               <p className="text-slate-400 text-[16px] mt-4 max-w-xl font-medium">
                  Adjusting core mission logic, security encryption levels, and regional deployment sensitivity.
               </p>
            </div>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-10 py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] font-black uppercase tracking-widest text-[13px] shadow-2xl shadow-blue-600/40 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50"
            >
               {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
               {isSaving ? 'Syncing...' : 'Apply Config'}
            </button>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         
         {/* 2. Control Navigation */}
         <div className="xl:col-span-3 space-y-4">
            {settingsCategories.map((cat) => (
               <button
                  key={cat.id}
                  onClick={() => setActiveTab(cat.id)}
                  className={`w-full flex items-center justify-between px-8 py-6 rounded-[28px] transition-all duration-300 ${
                     activeTab === cat.id 
                     ? 'bg-white text-blue-600 shadow-xl shadow-slate-200/50 border border-slate-100 scale-[1.02]' 
                     : 'text-slate-400 hover:bg-white/50 hover:text-slate-600'
                  }`}
               >
                  <div className="flex items-center gap-5">
                     <div className={`p-3 rounded-xl transition-colors ${activeTab === cat.id ? 'bg-blue-50' : 'bg-slate-50'}`}>
                        <cat.icon size={22} />
                     </div>
                     <span className="text-[14px] font-black uppercase tracking-tight">{cat.label}</span>
                  </div>
                  <ChevronRight size={18} className={activeTab === cat.id ? 'opacity-100' : 'opacity-0'} />
               </button>
            ))}

         </div>

         {/* 3. Settings Panel */}
         <div className="xl:col-span-9 bg-white rounded-[48px] shadow-sm border border-slate-100 overflow-hidden min-h-[600px]">
            <AnimatePresence mode="wait">
               {activeTab === 'General' && (
                  <motion.div 
                     key="general"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="p-12 space-y-12"
                  >
                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                           <h2 className="text-lg font-black tracking-widest uppercase">System Intelligence</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                           <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Platform Name</label>
                              <input 
                                 type="text" 
                                 value={settings.platformName} 
                                 onChange={(e) => updateField('platformName', e.target.value)}
                                 className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-[14px] font-bold border-none focus:ring-4 ring-blue-500/5 transition-all outline-none" 
                              />
                           </div>
                           <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Command Hub Region</label>
                              <select 
                                 value={settings.hubRegion}
                                 onChange={(e) => updateField('hubRegion', e.target.value)}
                                 className="w-full px-6 py-4 bg-slate-50 rounded-2xl text-[14px] font-bold border-none focus:ring-4 ring-blue-500/5 transition-all outline-none cursor-pointer"
                              >
                                 <option>Western Gujarat Node</option>
                                 <option>Maharashtra Central Hub</option>
                                 <option>Delhi Strategic Center</option>
                              </select>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Triage Sensitivity</label>
                              <div className="flex gap-4">
                                 {['Standard', 'High', 'Extreme'].map(lvl => (
                                    <button 
                                       key={lvl} 
                                       onClick={() => updateField('triageSensitivity', lvl)}
                                       className={`flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${settings.triageSensitivity === lvl ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}`}
                                    >
                                       {lvl}
                                    </button>
                                 ))}
                              </div>
                           </div>
                           <div className="space-y-3">
                              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Auto-Allocation Agent</label>
                              <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                                 <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                       <Cpu size={20} />
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700">Autonomous Logic</span>
                                 </div>
                                 <button 
                                    onClick={() => updateField('autoAllocation', !settings.autoAllocation)}
                                    className={`w-12 h-6 rounded-full relative transition-all ${settings.autoAllocation ? 'bg-blue-600' : 'bg-slate-300'}`}
                                 >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.autoAllocation ? 'right-1' : 'left-1'}`} />
                                 </button>
                              </div>
                           </div>
                        </div>
                     </section>

                     <section className="space-y-8 pt-8 border-t border-slate-50">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-8 bg-emerald-600 rounded-full" />
                           <h2 className="text-lg font-black tracking-widest uppercase">Communication Links</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                           {[
                              { label: 'Emergency Broadcast (SMS)', status: 'ACTIVE', color: 'text-emerald-500' },
                              { label: 'NGO Direct Comms Link', status: 'STABLE', color: 'text-emerald-500' },
                              { label: 'Volunteer App Push Node', status: 'CRITICAL', color: 'text-rose-500' },
                              { label: 'Global News Feed Integration', status: 'OFFLINE', color: 'text-slate-400' },
                           ].map((link, i) => (
                              <div key={i} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-3xl border border-slate-100">
                                 <span className="text-[13px] font-black text-slate-700 uppercase">{link.label}</span>
                                 <span className={`text-[10px] font-black uppercase tracking-widest ${link.color}`}>{link.status}</span>
                              </div>
                           ))}
                        </div>
                     </section>
                  </motion.div>
               )}

               {activeTab === 'Security' && (
                  <motion.div 
                     key="security"
                     initial={{ opacity: 0, x: 20 }}
                     animate={{ opacity: 1, x: 0 }}
                     exit={{ opacity: 0, x: -20 }}
                     className="p-12 space-y-12"
                  >
                     <section className="space-y-8">
                        <div className="flex items-center gap-4">
                           <div className="w-1.5 h-8 bg-rose-600 rounded-full" />
                           <h2 className="text-lg font-black tracking-widest uppercase">System Fortification</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           {[
                              { key: 'encryption', label: 'AES-256 Encryption', icon: Lock },
                              { key: 'ipCloaking', label: 'Tactical IP Cloaking', icon: Eye },
                              { key: 'biometricOverride', label: 'Bio-Metric Override', icon: Shield },
                           ].map((s, i) => (
                              <div key={i} className="p-8 rounded-[32px] bg-slate-900 text-white space-y-6 border border-white/5 hover:border-blue-500/30 transition-all group">
                                 <s.icon size={24} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                 <div>
                                    <p className="text-[13px] font-black uppercase mb-1">{s.label}</p>
                                    <p className={`text-[10px] font-black uppercase tracking-widest ${settings[s.key] === 'Disabled' ? 'text-rose-500' : 'text-slate-400'}`}>
                                       {settings[s.key]}
                                    </p>
                                 </div>
                                 <button 
                                    onClick={() => {
                                       const statuses = ['Enabled', 'Active', 'Standby', 'Disabled'];
                                       const currentIdx = statuses.indexOf(settings[s.key]);
                                       const nextIdx = (currentIdx + 1) % (s.key === 'biometricOverride' ? 3 : 2); // Simplified cycle
                                       const nextStatus = s.key === 'biometricOverride' 
                                          ? ['Standby', 'Active', 'Disabled'][ (['Standby', 'Active', 'Disabled'].indexOf(settings[s.key]) + 1) % 3 ]
                                          : (settings[s.key] === 'Enabled' || settings[s.key] === 'Active' ? 'Disabled' : (s.key === 'encryption' ? 'Enabled' : 'Active'));
                                       
                                       updateField(s.key, nextStatus);
                                    }}
                                    className="w-full py-3 bg-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
                                 >
                                    Cycle Protocol
                                 </button>
                              </div>
                           ))}
                        </div>
                     </section>
                  </motion.div>
               )}
            </AnimatePresence>
         </div>
      </div>
    </div>
  );
};

export default SettingsPage;
