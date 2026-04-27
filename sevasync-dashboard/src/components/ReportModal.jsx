import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, Users, MapPin, FileText, Send, Zap, Activity, ShieldAlert, Cpu, CheckCircle2, Wifi, Database } from 'lucide-react';

const ReportModal = ({ isOpen, onClose, onSave, initialLocation }) => {
  const [formData, setFormData] = useState({
    issue: 'Food',
    people: '',
    area: '',
    description: '',
    urgency: 'Medium',
    status: 'Pending'
  });

  const [step, setStep] = useState('input'); // input | transmitting | success
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (initialLocation) {
      setFormData(prev => ({ 
        ...prev, 
        area: initialLocation.city || '', 
        lat: initialLocation.lat,
        lng: initialLocation.lng
      }));
    }
  }, [initialLocation]);

  useEffect(() => {
    if (step === 'transmitting') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('success'), 500);
            return 100;
          }
          return prev + 2;
        });
      }, 30);
      return () => clearInterval(interval);
    }
  }, [step]);

  const aiPreviewScore = useMemo(() => {
    const people = parseInt(formData.people) || 0;
    const urgencyMultiplier = formData.urgency === 'High' ? 1.5 : formData.urgency === 'Medium' ? 1 : 0.5;
    const categoryFactor = formData.issue === 'Medical' ? 20 : formData.issue === 'Rescue' ? 15 : 10;
    return Math.min(100, Math.round((people / 10) * urgencyMultiplier + categoryFactor));
  }, [formData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.area || !formData.description || formData.people <= 0) return;
    setStep('transmitting');
  };

  const handleComplete = () => {
    onSave({
      ...formData,
      id: Math.floor(Math.random() * 9000) + 1000,
      score: aiPreviewScore,
      timestamp: new Date().toISOString().split('T')[0]
    });
    setStep('input');
    setProgress(0);
    setFormData({ issue: 'Food', people: '', area: '', description: '', urgency: 'Medium', status: 'Pending' });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-white/90 backdrop-blur-3xl"
          />
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 40 }}
            className="relative bg-white w-full max-w-2xl rounded-2xl shadow-[0_0_150px_rgba(0,0,0,0.9)] border border-white/5 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {step === 'input' && (
              <>
                <div className="p-8 border-b border-white/5 bg-gradient-to-r from-blue-600/5 to-transparent">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                       <div className="relative">
                          <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse" />
                          <div className="relative p-4 bg-slate-50 text-blue-400 rounded-2xl border border-slate-200">
                             <Cpu size={28} />
                          </div>
                       </div>
                       <div>
                          <h2 className="text-3xl font-black text-slate-900 tracking-tighter">Satellite Intelligence Log</h2>
                          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mt-1.5 flex items-center gap-2">
                            <Activity size={10} className="text-emerald-500" /> Neural Uplink Est. 99.8%
                          </p>
                       </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all group border border-slate-200">
                       <X size={20} className="text-slate-600 group-hover:text-slate-900" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
                  <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="bg-slate-50/90 border border-slate-200 p-6 rounded-2xl space-y-4">
                       <div className="flex items-center justify-between px-2">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                            <ShieldAlert size={14} className="text-blue-500" /> AI Impact Severity Projection
                          </p>
                          <span className={`text-sm font-black tracking-widest ${aiPreviewScore > 70 ? 'text-rose-500' : aiPreviewScore > 40 ? 'text-amber-500' : 'text-blue-500'}`}>
                            {aiPreviewScore}% SEVERITY
                          </span>
                       </div>
                       <div className="h-3 w-full bg-white rounded-full overflow-hidden p-1 shadow-inner">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${aiPreviewScore}%` }}
                            className={`h-full rounded-full shadow-[0_0_15px] ${
                              aiPreviewScore > 70 ? 'bg-rose-500 shadow-rose-500/30' : 
                              aiPreviewScore > 40 ? 'bg-amber-500 shadow-amber-500/30' : 
                              'bg-blue-500 shadow-blue-500/30'
                            }`}
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                           <Zap size={12} className="text-amber-500" /> Asset Required
                        </label>
                        <select 
                          value={formData.issue}
                          onChange={(e) => setFormData({...formData, issue: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm font-bold outline-none focus:ring-4 ring-blue-500/10 text-slate-900 cursor-pointer appearance-none transition-all"
                        >
                          <option value="Food">Food / Ration Clusters</option>
                          <option value="Water">Clean Water Logistics</option>
                          <option value="Medical">Trauma/Medical Response</option>
                          <option value="Shelter">Modular Infrastructure</option>
                          <option value="Rescue">Tactical Search & Rescue</option>
                        </select>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                           <Users size={12} className="text-blue-500" /> Bio-Impact (People)
                        </label>
                        <input 
                          type="number"
                          required
                          min="1"
                          placeholder="EST. Impacted Souls..."
                          value={formData.people}
                          onChange={(e) => setFormData({...formData, people: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm font-bold outline-none focus:ring-4 ring-blue-500/10 text-slate-900 placeholder:text-slate-700 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                         <MapPin size={12} className="text-rose-500" /> Deployment Sector
                      </label>
                      <div className="relative">
                        <input 
                          type="text"
                          required
                          placeholder="Enter Global Coord or Area..."
                          value={formData.area}
                          onChange={(e) => setFormData({...formData, area: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 pl-14 text-sm font-bold outline-none focus:ring-4 ring-blue-500/10 text-slate-900 placeholder:text-slate-700 transition-all"
                        />
                        <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-3 ml-2">
                         <FileText size={12} className="text-blue-500" /> Detailed Situational Intel
                      </label>
                      <textarea 
                        rows="4"
                        required
                        placeholder="Provide granular tactical intelligence for field agents..."
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 text-sm font-bold outline-none focus:ring-4 ring-blue-500/10 text-slate-900 placeholder:text-slate-700 resize-none h-40 leading-relaxed transition-all"
                      />
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-2">Tactical Priority Level</label>
                      <div className="flex gap-6">
                        {['Low', 'Medium', 'High'].map(item => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFormData({...formData, urgency: item})}
                            className={`flex-1 py-5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all border duration-300 ${
                              formData.urgency === item 
                                ? `bg-blue-600 text-white border-white/20 shadow-sm scale-105`
                                : `bg-slate-50 text-slate-500 border-slate-200 hover:bg-white`
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 space-y-6 pb-4">
                       <button 
                        type="submit"
                        className="w-full bg-blue-600 text-white py-7 rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-[0_20px_60px_rgba(37,99,235,0.3)] hover:bg-blue-500 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-4 border border-blue-400/20 group"
                       >
                         <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> 
                         Transmit Encrypted Intelligence
                       </button>
                    </div>
                  </form>
                </div>
              </>
            )}

            {step === 'transmitting' && (
              <div className="p-20 flex flex-col items-center justify-center space-y-12">
                 <div className="relative">
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: 'linear' }} className="w-32 h-32 border-4 border-slate-200 border-t-blue-500 rounded-full" />
                    <div className="absolute inset-0 flex items-center justify-center">
                       <Wifi size={32} className="text-blue-500 animate-pulse" />
                    </div>
                 </div>
                 <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 uppercase tracking-widest">Uplinking Data...</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em]">SevaSync Neural Bridge: {progress}% Complete</p>
                 </div>
                 <div className="w-full max-w-sm h-1.5 bg-slate-50 rounded-full overflow-hidden border border-slate-200">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" />
                 </div>
                 <div className="grid grid-cols-2 gap-8 w-full">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                       <Database size={16} className="text-blue-500" />
                       <span className="text-[10px] font-black text-slate-900 uppercase">Buffer Encrypted</span>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                       <CheckCircle2 size={16} className="text-emerald-500" />
                       <span className="text-[10px] font-black text-slate-900 uppercase">Sector Verified</span>
                    </div>
                 </div>
              </div>
            )}

            {step === 'success' && (
              <div className="p-20 flex flex-col items-center justify-center space-y-8 animate-fade-in">
                 <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-sm shadow-emerald-500/10">
                    <CheckCircle2 size={48} />
                 </div>
                 <div className="text-center space-y-3">
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Transmission Complete</h3>
                    <p className="text-sm font-bold text-slate-600 italic">Incident #INC-{Math.floor(Math.random()*9000)+1000} has been logged to the tactical feed.</p>
                 </div>
                 <button 
                  onClick={handleComplete}
                  className="bg-emerald-600 text-white px-12 py-5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-sm shadow-emerald-900/20 hover:scale-105 transition-all mt-6"
                 >
                   Establish Confirmation
                 </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ReportModal;
