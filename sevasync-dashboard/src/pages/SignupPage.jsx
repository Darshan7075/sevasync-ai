import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Lock, ShieldCheck, ArrowRight, 
  Activity, CheckCircle2, AlertTriangle, 
  Terminal, Shield, Fingerprint, Radio,
  UserCog, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Volunteer'
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await signup(formData);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'REGISTRATION FAILED: PROTOCOL VIOLATION.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/20 to-slate-950" />
        <div className="text-center space-y-8 max-w-sm relative z-10">
          <motion.div 
             initial={{ scale: 0 }}
             animate={{ scale: 1 }}
             className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30"
          >
            <CheckCircle2 className="text-emerald-500 w-12 h-12" />
          </motion.div>
          <h2 className="text-[32px] font-black text-white uppercase tracking-tighter">Agent Registered</h2>
          <p className="text-slate-400 text-[14px] font-medium uppercase tracking-widest leading-relaxed">
             YOUR MISSION CREDENTIALS HAVE BEEN AUTHORIZED. SYNCHRONIZING WITH GLOBAL COMMAND...
          </p>
          <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2.5 }}
              className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981]"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* 1. Tactical Background Elements */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-blue-950/40 via-slate-950 to-indigo-950/30" />
         <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
         <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="w-full max-w-[550px] relative z-10">
        
        {/* Branding Header */}
        <motion.div 
           initial={{ y: -20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="flex flex-col items-center mb-10"
        >
           <div className="relative group cursor-default">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl relative z-10 border border-white/10">
                <Shield size={32} className="fill-white/10" />
              </div>
              <div className="absolute -left-2 -bottom-2 w-5 h-5 bg-blue-500 rounded-full border-4 border-[#020617] animate-pulse z-20" />
           </div>
           
           <div className="text-center mt-6">
              <h1 className="text-[32px] font-black text-white tracking-tighter leading-none mb-2 uppercase italic">SevaSyncAI</h1>
              <p className="text-blue-400 font-black text-[11px] uppercase tracking-[0.4em]">New Agent Registration</p>
           </div>
        </motion.div>

        {/* Auth Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <AnimatePresence>
               {error && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="bg-rose-500/10 border border-rose-500/20 px-5 py-4 rounded-2xl flex items-start gap-4"
                 >
                   <AlertTriangle className="text-rose-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                   <p className="text-rose-200 text-[13px] font-bold uppercase tracking-tight">{error}</p>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Full Agent Name</label>
                 <div className="relative group">
                   <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                   <input
                     id="name"
                     type="text"
                     required
                     value={formData.name}
                     onChange={handleChange}
                     placeholder="NAME SURNAME"
                     className="w-full bg-white/5 border border-white/10 text-white h-[60px] pl-14 pr-6 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px] font-bold placeholder:text-slate-600"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal ID</label>
                 <div className="relative group">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                   <input
                     id="email"
                     type="email"
                     required
                     value={formData.email}
                     onChange={handleChange}
                     placeholder="EMAIL@NODE.NET"
                     className="w-full bg-white/5 border border-white/10 text-white h-[60px] pl-14 pr-6 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px] font-bold placeholder:text-slate-600"
                   />
                 </div>
               </div>
            </div>

            <div className="space-y-2">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tactical Keyphrase</label>
               <div className="relative group">
                 <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                 <input
                   id="password"
                   type="password"
                   required
                   value={formData.password}
                   onChange={handleChange}
                   placeholder="CREATE SECURE KEY..."
                   className="w-full bg-white/5 border border-white/10 text-white h-[60px] pl-14 pr-6 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500/50 transition-all text-[14px] font-bold placeholder:text-slate-600"
                 />
               </div>
            </div>

            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Functional Specialization</label>
               <div className="grid grid-cols-3 gap-3">
                  {[
                    { val: 'Volunteer', label: 'Field Unit', icon: Radio },
                    { val: 'NGO Admin', label: 'NGO Lead', icon: ShieldCheck },
                    { val: 'Regional Ops', label: 'Command', icon: UserCog },
                  ].map((r) => (
                    <button
                      key={r.val}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.val })}
                      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${
                        formData.role === r.val 
                          ? 'bg-blue-600 border-blue-500 text-white shadow-lg' 
                          : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                       <r.icon size={20} />
                       <span className="text-[9px] font-black uppercase tracking-widest">{r.label}</span>
                    </button>
                  ))}
               </div>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[64px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Initialize Registration <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between">
                 <Link to="/login" className="text-blue-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors">
                   Existing Agent? Login
                 </Link>
                 <div className="flex items-center gap-2">
                    <Globe size={12} className="text-slate-500" />
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sector: GLOBAL</span>
                 </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
