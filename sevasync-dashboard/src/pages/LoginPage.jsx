import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, Eye, EyeOff, Lock, Mail, ArrowRight, 
  Activity, AlertTriangle, Terminal, Zap,
  Fingerprint, ShieldCheck, Globe, Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'AUTHORIZATION FAILED: INVALID CREDENTIALS.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* 1. Tactical Background Elements */}
      <div className="absolute inset-0 z-0">
         <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-slate-950 to-blue-950/30" />
         <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-[500px] relative z-10">
        
        {/* Branding Header */}
        <motion.div 
           initial={{ y: -20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="flex flex-col items-center mb-10"
        >
           <div className="relative group cursor-default">
              <div className="absolute inset-0 bg-blue-600 rounded-2xl blur-xl opacity-20 group-hover:opacity-40 transition-all duration-500" />
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center text-white shadow-2xl relative z-10 border border-white/10 group-hover:scale-105 transition-all">
                <Shield size={32} className="fill-white/10" />
              </div>
              <div className="absolute -right-2 -top-2 w-5 h-5 bg-emerald-500 rounded-full border-4 border-[#020617] animate-pulse z-20" />
           </div>
           
           <div className="text-center mt-6">
              <h1 className="text-[32px] font-black text-white tracking-tighter leading-none mb-2 uppercase italic">SevaSyncAI</h1>
              <div className="flex items-center gap-2 justify-center">
                 <div className="h-[1px] w-8 bg-blue-500/30" />
                 <p className="text-blue-400 font-black text-[11px] uppercase tracking-[0.4em]">Command Authentication</p>
                 <div className="h-[1px] w-8 bg-blue-500/30" />
              </div>
           </div>
        </motion.div>

        {/* Auth Container */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[40px] p-10 shadow-2xl overflow-hidden relative"
        >
          {/* Internal Glowing Line */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <AnimatePresence>
               {error && (
                 <motion.div 
                   initial={{ height: 0, opacity: 0 }}
                   animate={{ height: 'auto', opacity: 1 }}
                   exit={{ height: 0, opacity: 0 }}
                   className="bg-rose-500/10 border border-rose-500/20 px-5 py-4 rounded-2xl flex items-start gap-4 mb-4"
                 >
                   <AlertTriangle className="text-rose-500 w-5 h-5 flex-shrink-0 mt-0.5" />
                   <p className="text-rose-200 text-[13px] font-bold uppercase tracking-tight leading-snug">{error}</p>
                 </motion.div>
               )}
            </AnimatePresence>

            <div className="space-y-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Universal Identifier</label>
                 <div className="relative group">
                   <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                   <input
                     type="email"
                     required
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     placeholder="EMAIL@COMMAND.CENTER"
                     className="w-full bg-white/5 border border-white/10 text-white h-[64px] pl-14 pr-6 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 ring-blue-500/5 transition-all text-[14px] font-bold placeholder:text-slate-600 uppercase"
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Tactical Keyphrase</label>
                 <div className="relative group">
                   <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                   <input
                     type={showPassword ? "text" : "password"}
                     required
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     placeholder="••••••••••••"
                     className="w-full bg-white/5 border border-white/10 text-white h-[64px] pl-14 pr-14 rounded-2xl outline-none focus:bg-white/10 focus:border-blue-500/50 focus:ring-4 ring-blue-500/5 transition-all text-[14px] font-bold placeholder:text-slate-600"
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute inset-y-0 right-0 pr-5 flex items-center text-slate-500 hover:text-white transition-colors"
                   >
                     {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                   </button>
                 </div>
               </div>
            </div>

            <div className="flex flex-col gap-6 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[64px] bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl font-black text-[13px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-blue-600/20 active:scale-[0.98] flex items-center justify-center gap-3 group overflow-hidden relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Authorize System Access <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between">
                 <Link to="/signup" className="text-blue-400 text-[11px] font-black uppercase tracking-widest hover:text-white transition-colors flex items-center gap-2">
                   <Fingerprint size={14} /> New Agent Registration
                 </Link>
                 <a href="#" className="text-slate-500 text-[11px] font-bold uppercase tracking-widest hover:text-slate-300 transition-colors">Recover Access</a>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Footer Telemetry */}
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 0.5 }}
           className="mt-12 flex flex-col md:flex-row justify-between items-center gap-6 px-4"
        >
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Global Node: ACTIVE</span>
              </div>
              <div className="flex items-center gap-2">
                 <Radio size={12} className="text-blue-500 animate-pulse" />
                 <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Uplink: ENCRYPTED</span>
              </div>
           </div>
           <div className="flex gap-6 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">
             <a href="#" className="hover:text-white transition-colors">Protocols</a>
             <a href="#" className="hover:text-white transition-colors">Privacy</a>
             <a href="#" className="hover:text-white transition-colors">v4.0.2</a>
           </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
