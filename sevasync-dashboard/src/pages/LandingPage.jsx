import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Zap, ShieldAlert, Activity, Globe, Database, Cpu, 
  ArrowRight, ChevronRight, CheckCircle2, Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const navigate = useNavigate();
  const { loginAsGuest, user } = useAuth();

  const handleDemo = () => {
    if (!user) {
      loginAsGuest();
    }
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden">
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <Activity className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight font-outfit">SevaSync AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How AI Works</a>
            <a href="#tech" className="hover:text-white transition-colors">Tech Stack</a>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/login')} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Log in
            </button>
            <button onClick={() => navigate('/signup')} className="text-sm font-bold text-slate-300 hover:text-white transition-colors">
              Sign up
            </button>
            <div className="w-px h-4 bg-white/20 hidden md:block" />
            <button onClick={handleDemo} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2">
              Try Demo <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <div className="relative pt-40 pb-20 px-6 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-blue-400 mb-8"
          >
            <Zap size={16} /> Empowering Crisis Response with Google Gemini AI
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl lg:text-7xl font-black tracking-tighter mb-8 leading-tight font-outfit"
          >
            SevaSync AI helps <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Rescue Teams</span><br />
            to Optimize Operations using <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">GenAI</span>.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto mb-12"
          >
            A real-time command center that uses predictive intelligence to automatically route blood, dispatch volunteers, and analyze crisis reports faster than humanly possible.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <button onClick={handleDemo} className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full text-lg font-bold transition-all shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center justify-center gap-2 group">
              Start Interactive Demo <Play size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <a href="https://github.com/Darshan7075/sevasync-ai" target="_blank" rel="noreferrer" className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-full text-lg font-bold transition-all flex items-center justify-center gap-2">
              View on GitHub
            </a>
          </motion.div>
        </div>

        {/* DASHBOARD PREVIEW */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="max-w-6xl mx-auto mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent z-10 bottom-0 h-1/2" />
          <div className="rounded-[32px] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(37,99,235,0.2)]">
             <div className="bg-slate-900 px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <div className="ml-4 text-xs font-mono text-slate-500">sevasync.app/dashboard</div>
             </div>
             {/* Mockup Dashboard Image / Abstract UI */}
             <div className="aspect-[16/9] bg-[#1e293b] p-8 flex flex-col gap-6">
                <div className="flex gap-6 h-32">
                   <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col justify-center">
                     <div className="text-3xl font-black text-blue-400">1,240</div>
                     <div className="text-sm font-bold text-slate-400 uppercase">Active Responders</div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col justify-center">
                     <div className="text-3xl font-black text-red-400">CRITICAL</div>
                     <div className="text-sm font-bold text-slate-400 uppercase">AI Threat Level</div>
                   </div>
                   <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 p-6 flex flex-col justify-center">
                     <div className="text-3xl font-black text-green-400">98.2%</div>
                     <div className="text-sm font-bold text-slate-400 uppercase">Resource Match Rate</div>
                   </div>
                </div>
                <div className="flex-1 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden p-6">
                   <div className="text-xl font-black text-white mb-4">LIVE TACTICAL MAP (MOCKUP)</div>
                   <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#1e293b] to-transparent" />
                </div>
             </div>
          </div>
        </motion.div>
      </div>

      {/* PROBLEM / SOLUTION */}
      <div className="py-24 bg-white/5" id="features">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
             <h2 className="text-sm font-bold text-red-400 uppercase tracking-widest mb-2">The Problem</h2>
             <h3 className="text-4xl font-black mb-6 leading-tight font-outfit">During a crisis, <br/>every second counts.</h3>
             <p className="text-slate-400 text-lg mb-8 leading-relaxed">
               Traditional disaster response relies on manual data entry, phone calls, and spreadsheets. Critical resources like blood and rescue volunteers are often misallocated due to lack of real-time intelligence and slow decision-making.
             </p>
             <div className="space-y-4">
               {['Delayed emergency response times', 'Wasted or misplaced medical resources', 'Lack of coordination between NGOs'].map((item, i) => (
                 <div key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                   <ShieldAlert className="text-red-400" size={20} /> {item}
                 </div>
               ))}
             </div>
          </div>
          <div className="bg-[#0F172A] p-10 rounded-[32px] border border-white/10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
             <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-2 relative z-10">The Solution: SevaSync AI</h2>
             <h3 className="text-3xl font-black mb-6 leading-tight font-outfit relative z-10">Autonomous intelligence for faster rescues.</h3>
             <p className="text-slate-400 text-lg mb-8 leading-relaxed relative z-10">
               SevaSync analyzes incoming SOS reports using Google's Gemini AI, automatically determining urgency, matching the right volunteers based on skills and location, and predictive routing for critical blood inventory.
             </p>
             <button onClick={handleDemo} className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full text-sm font-bold transition-all border border-white/20 relative z-10">
               Experience the Solution
             </button>
          </div>
        </div>
      </div>

      {/* HOW AI WORKS (KILLER FEATURE) */}
      <div className="py-24 px-6 relative" id="how-it-works">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-2">Our Killer Feature</h2>
          <h3 className="text-4xl lg:text-5xl font-black font-outfit mb-6">AI Predictive Urgency Detection</h3>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">We use Google's Gemini AI to read unstructured SOS texts from the community, instantly converting chaos into actionable priority data.</p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-8">
          {[
            { step: '01', title: 'Data Ingestion', desc: 'Raw SOS reports are received from the community via SMS, Web, or App.' },
            { step: '02', title: 'Gemini AI Analysis', desc: 'The model analyzes context, scale, and keywords to determine real-time threat levels.' },
            { step: '03', title: 'Auto-Dispatch', desc: 'High-priority tasks are automatically assigned to the nearest capable volunteer.' }
          ].map((item, i) => (
            <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
              <div className="text-6xl font-black text-white/5 absolute -top-4 -right-4 transition-transform group-hover:scale-110">{item.step}</div>
              <h4 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-sm">{item.step}</div>
                 {item.title}
              </h4>
              <p className="text-slate-400 relative z-10">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* TECH STACK */}
      <div className="py-32 bg-[#020617] relative border-y border-white/5" id="tech">
        {/* Abstract Background for Tech Stack */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[20%] left-[10%] w-72 h-72 bg-blue-600/10 rounded-full blur-[100px]" />
           <div className="absolute bottom-[20%] right-[10%] w-72 h-72 bg-teal-600/10 rounded-full blur-[100px]" />
           <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
             <h2 className="text-sm font-bold text-teal-400 uppercase tracking-widest mb-2">Architecture</h2>
             <h3 className="text-4xl lg:text-5xl font-black font-outfit mb-6 text-white">Built with Modern Tech</h3>
             <p className="text-slate-400 text-lg max-w-2xl mx-auto">A robust, scalable, and real-time architecture designed specifically for high-stress disaster response environments.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
             {[
               { name: 'React 18', desc: 'Frontend UI', icon: Globe, color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent', border: 'border-blue-500/20' },
               { name: 'Tailwind CSS', desc: 'Styling', icon: Zap, color: 'text-teal-400', bg: 'from-teal-500/10 to-transparent', border: 'border-teal-500/20' },
               { name: 'Python Flask', desc: 'Backend API', icon: Database, color: 'text-yellow-400', bg: 'from-yellow-500/10 to-transparent', border: 'border-yellow-500/20' },
               { name: 'Gemini AI', desc: 'Intelligence', icon: Cpu, color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent', border: 'border-purple-500/20' },
               { name: 'Framer Motion', desc: 'Animations', icon: Activity, color: 'text-pink-400', bg: 'from-pink-500/10 to-transparent', border: 'border-pink-500/20' },
             ].map((tech, i) => (
               <div key={i} className={`flex flex-col items-center justify-center text-center p-8 rounded-[32px] bg-gradient-to-b ${tech.bg} border ${tech.border} hover:-translate-y-2 transition-transform duration-300 backdrop-blur-sm`}>
                 <div className={`w-16 h-16 rounded-2xl bg-[#0F172A] border border-white/5 flex items-center justify-center shadow-xl mb-6 ${tech.color}`}>
                    <tech.icon size={28} />
                 </div>
                 <span className="font-black text-white text-lg mb-1">{tech.name}</span>
                 <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{tech.desc}</span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* FOOTER CTA */}
      <div className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-5xl font-black font-outfit mb-8">Ready to see SevaSync in action?</h2>
          <p className="text-xl text-slate-400 mb-10">Experience the dashboard from the perspective of an emergency commander.</p>
          <button onClick={handleDemo} className="bg-white text-slate-900 px-10 py-5 rounded-full text-xl font-black transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
            Open Command Center
          </button>
        </div>
      </div>

    </div>
  );
};

export default LandingPage;
