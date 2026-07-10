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

  React.useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleDemo = () => {
    if (!user) {
      loginAsGuest();
    }
    navigate('/dashboard');
  };

  const [averages, setAverages] = React.useState({
    activeResponders: 1240,
    threatLevel: 'CRITICAL',
    matchRate: 98.2
  });

  const [logs, setLogs] = React.useState([
    { id: 1, time: '19:20:01', tag: 'SYSTEM', text: 'SevaSync Command Core Initialized.', color: 'text-blue-400' },
    { id: 2, time: '19:20:03', tag: 'GEMINI AI', text: 'Disaster response models loaded. Awaiting community feeds...', color: 'text-purple-400' },
    { id: 3, time: '19:20:05', tag: 'NETWORK', text: 'Listening on channels SMS/Web/Call/SOS.', color: 'text-slate-400' }
  ]);

  const [activeStep, setActiveStep] = React.useState(0);

  const logTemplates = [
    { tag: 'SOS INGEST', text: 'SOS: "Flood water entering house in Sector 4. Family trapped on roof."', color: 'text-yellow-400' },
    { tag: 'GEMINI AI', text: 'Analyzed SOS: Priority CRITICAL. Needs: Water Rescue. Geolocation matched Sector 4.', color: 'text-purple-400' },
    { tag: 'ROUTING', text: 'Searching nearest active Responders. Dispatched Volunteer "Aarav Patel" (Distance: 1.2km).', color: 'text-blue-400' },
    { tag: 'INVENTORY', text: 'Blood Bank: Command 2 has surplus O-. Routed 2 units to Sector 4 field hospital.', color: 'text-red-400' },
    { tag: 'VOLUNTEER', text: 'Volunteer Aarav Patel status: Transit -> Arrived at Sector 4.', color: 'text-green-400' },
    { tag: 'SUCCESS', text: 'Incident #491 resolved. Family evacuated safely. Incident logged.', color: 'text-emerald-400' },
    { tag: 'SOS INGEST', text: 'SOS: "Need urgent O-negative blood for surgery at Civil Hospital."', color: 'text-yellow-400' },
    { tag: 'GEMINI AI', text: 'Analyzed SOS: Priority HIGH. Needs: Blood Supply. Geolocation matched Ward A.', color: 'text-purple-400' },
    { tag: 'ROUTING', text: 'Alerted 3 matching nearby blood donors with type O-negative.', color: 'text-blue-400' },
    { tag: 'VOLUNTEER', text: 'Donor "Priya Sharma" accepted request. Dispatched transit coordinator.', color: 'text-green-400' },
    { tag: 'SUCCESS', text: 'Blood delivery completed at Civil Hospital. Incident marked resolved.', color: 'text-emerald-400' },
    { tag: 'SOS INGEST', text: 'SOS: "Road blockages at High Street, medical supply van stuck."', color: 'text-yellow-400' },
    { tag: 'GEMINI AI', text: 'Analyzed SOS: Priority HIGH. Action: Clear path or dispatch drone route.', color: 'text-purple-400' },
    { tag: 'ROUTING', text: 'Rerouting initialized. Dispatched Volunteer Team Bravo with heavy equipment.', color: 'text-blue-400' },
    { tag: 'SUCCESS', text: 'Debris cleared. Supply van routed safely. Incident resolved.', color: 'text-emerald-400' }
  ];

  const mapAlerts = [
    { id: 1, name: 'Sector 4 (Flood)', x: 90, y: 160, active: activeStep === 0 || activeStep === 1 || activeStep === 2, priority: 'CRITICAL', color: 'stroke-red-500 fill-red-500' },
    { id: 2, name: 'Volunteer Base', x: 260, y: 80, active: false, priority: 'BASE', color: 'stroke-blue-400 fill-blue-400' },
    { id: 3, name: 'Blood Bank', x: 170, y: 40, active: false, priority: 'BANK', color: 'stroke-green-400 fill-green-400' },
    { id: 4, name: 'Incident #492', x: 310, y: 190, active: activeStep === 3, priority: 'HIGH', color: 'stroke-yellow-500 fill-yellow-500' }
  ];

  React.useEffect(() => {
    let logCounter = 4;
    const interval = setInterval(() => {
      const template = logTemplates[Math.floor(Math.random() * logTemplates.length)];
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      setLogs(prev => {
        const next = [...prev, { id: logCounter++, time: timeStr, tag: template.tag, text: template.text, color: template.color }];
        if (next.length > 5) {
          next.shift();
        }
        return next;
      });

      setAverages(prev => ({
        activeResponders: Math.max(1210, Math.min(1270, prev.activeResponders + (Math.random() > 0.5 ? 1 : -1))),
        threatLevel: Math.random() > 0.8 ? 'CRITICAL' : 'HIGH',
        matchRate: Math.min(99.9, Math.max(97.0, Number((prev.matchRate + (Math.random() > 0.5 ? 0.05 : -0.05)).toFixed(1))))
      }));

      setActiveStep(prev => (prev + 1) % 4);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden">
      <style>{`
        @keyframes scan {
          0% { transform: translateY(-30px); }
          100% { transform: translateY(220px); }
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animate-dash {
          stroke-dasharray: 5, 5;
          animation: dash 1.5s linear infinite;
        }
        .animate-scan {
          animation: scan 4s linear infinite;
        }
      `}</style>
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
             <div className="bg-[#0f172a] p-4 lg:p-8 flex flex-col gap-6">
                {/* Top metrics dashboard cards */}
                <div className="grid grid-cols-3 gap-4 lg:gap-6">
                   <div className="bg-white/5 rounded-2xl border border-white/10 p-4 lg:p-6 flex flex-col justify-center transition-all duration-300 hover:bg-white/10 hover:border-blue-500/30">
                     <div className="text-xl lg:text-3xl font-black text-blue-400 font-mono tracking-tight">{averages.activeResponders}</div>
                     <div className="text-[9px] lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Active Responders</div>
                   </div>
                   <div className="bg-white/5 rounded-2xl border border-white/10 p-4 lg:p-6 flex flex-col justify-center transition-all duration-300 hover:bg-white/10 hover:border-red-500/30">
                     <div className="text-xl lg:text-3xl font-black text-red-400 font-mono tracking-tight">{averages.threatLevel}</div>
                     <div className="text-[9px] lg:text-sm font-bold text-slate-400 uppercase tracking-wider">AI Threat Level</div>
                   </div>
                   <div className="bg-white/5 rounded-2xl border border-white/10 p-4 lg:p-6 flex flex-col justify-center transition-all duration-300 hover:bg-white/10 hover:border-green-500/30">
                     <div className="text-xl lg:text-3xl font-black text-green-400 font-mono tracking-tight">{averages.matchRate}%</div>
                     <div className="text-[9px] lg:text-sm font-bold text-slate-400 uppercase tracking-wider">Resource Match Rate</div>
                   </div>
                </div>

                {/* Simulated Tactical Map & Console Side-by-Side */}
                <div className="flex flex-col lg:flex-row gap-6 min-h-[260px]">
                   {/* SVG Interactive Map Grid */}
                   <div className="flex-[2] bg-slate-950/70 rounded-2xl border border-white/10 relative overflow-hidden p-4 flex flex-col justify-between group hover:border-blue-500/20 transition-all duration-300 shadow-inner">
                      <div className="flex justify-between items-center z-10">
                         <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest font-mono">LIVE TACTICAL TELEMETRY</span>
                         </div>
                         <span className="text-[9px] font-mono text-slate-500 font-semibold bg-white/5 px-2 py-0.5 rounded-full">GRID: VADODARA-SEC4</span>
                      </div>

                      {/* Actual Map Drawing */}
                      <div className="w-full h-44 lg:h-52 relative mt-2 z-10 flex items-center justify-center">
                         <svg className="w-full h-full" viewBox="0 0 400 220" preserveAspectRatio="none">
                            <defs>
                               <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                                  <stop offset="95%" stopColor="#3b82f6" stopOpacity="0.05" />
                                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.25" />
                               </linearGradient>
                            </defs>

                            {/* Grid Lines */}
                            <g stroke="white" strokeWidth="0.5" strokeOpacity="0.04">
                               <line x1="0" y1="36" x2="400" y2="36" />
                               <line x1="0" y1="72" x2="400" y2="72" />
                               <line x1="0" y1="108" x2="400" y2="108" />
                               <line x1="0" y1="144" x2="400" y2="144" />
                               <line x1="0" y1="180" x2="400" y2="180" />
                               
                               <line x1="50" y1="0" x2="50" y2="220" />
                               <line x1="100" y1="0" x2="100" y2="220" />
                               <line x1="150" y1="0" x2="150" y2="220" />
                               <line x1="200" y1="0" x2="200" y2="220" />
                               <line x1="250" y1="0" x2="250" y2="220" />
                               <line x1="300" y1="0" x2="300" y2="220" />
                               <line x1="350" y1="0" x2="350" y2="220" />
                            </g>

                            {/* Faint River Flow */}
                            <path d="M 0,100 C 100,80 150,140 200,130 C 250,120 300,170 400,150" fill="none" stroke="rgba(59,130,246,0.15)" strokeWidth="6" />

                            {/* Faint Roads Grid */}
                            <path d="M 50,0 Q 120,110 280,220" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />
                            <path d="M 0,180 Q 200,90 400,70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1.5" />

                            {/* Interactive curved dispatch routes */}
                            <path d="M 260,80 Q 180,100 90,160" fill="none" stroke="#2563eb" strokeWidth="2.5" className="animate-dash" strokeOpacity={activeStep === 0 || activeStep === 1 || activeStep === 2 ? 0.95 : 0.15} style={{ transition: 'stroke-opacity 0.5s ease-in-out' }} />
                            <path d="M 170,40 Q 120,80 90,160" fill="none" stroke="#10b981" strokeWidth="2" className="animate-dash" strokeOpacity={activeStep === 1 || activeStep === 2 ? 0.95 : 0.15} style={{ transition: 'stroke-opacity 0.5s ease-in-out' }} />
                            <path d="M 260,80 Q 290,130 310,190" fill="none" stroke="#f59e0b" strokeWidth="2" className="animate-dash" strokeOpacity={activeStep === 3 ? 0.95 : 0.15} style={{ transition: 'stroke-opacity 0.5s ease-in-out' }} />

                            {/* Map Alert Points */}
                            {mapAlerts.map(alert => (
                               <g key={alert.id}>
                                  {/* Outer pulsing ring */}
                                  <circle cx={alert.x} cy={alert.y} r={alert.active ? 15 : 7} fill="none" className={alert.priority === 'CRITICAL' ? 'stroke-red-500/30' : alert.priority === 'HIGH' ? 'stroke-yellow-500/30' : alert.priority === 'BASE' ? 'stroke-blue-400/20' : 'stroke-green-400/20'} strokeWidth="1.5">
                                     <animate attributeName="r" values="3;16;3" dur="2.5s" repeatCount="indefinite" />
                                     <animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite" />
                                  </circle>
                                  
                                  {/* Core dot */}
                                  <circle cx={alert.x} cy={alert.y} r={alert.active ? 6 : 4} className={`${alert.color} transition-all duration-300`} />
                                  
                                  {/* Mini Dot Label */}
                                  <text x={alert.x} y={alert.y - 12} fill="white" fillOpacity="0.75" fontSize="7.5" fontWeight="bold" textAnchor="middle" className="font-sans select-none pointer-events-none">
                                     {alert.name}
                                  </text>
                               </g>
                            ))}

                            {/* Scanning Laser Line */}
                            <line x1="0" y1="0" x2="400" y2="0" stroke="#3b82f6" strokeWidth="1.5" strokeOpacity="0.8" className="animate-scan pointer-events-none" />
                            <rect x="0" y="-30" width="400" height="30" fill="url(#radarGradient)" className="animate-scan pointer-events-none" />
                         </svg>
                      </div>
                      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 to-transparent pointer-events-none" />
                   </div>

                   {/* Gemini AI Live Scrollable Terminal */}
                   <div className="flex-1 bg-slate-950 rounded-2xl border border-white/10 p-4 flex flex-col font-mono text-[9px] lg:text-[10px] min-h-[160px] lg:min-h-0 select-none shadow-inner group hover:border-purple-500/30 transition-all duration-300 relative overflow-hidden">
                      <div className="flex justify-between items-center border-b border-white/10 pb-2 mb-3">
                         <div className="flex items-center gap-1.5">
                            <div className="w-2.5 h-2.5 bg-purple-500/20 text-purple-400 rounded flex items-center justify-center font-bold text-[8px]">★</div>
                            <span className="font-bold text-slate-300 tracking-wide uppercase">GEMINI AUTO-COMMAND LOGS</span>
                         </div>
                         <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                         </div>
                      </div>

                      <div className="flex-1 flex flex-col gap-2.5 overflow-y-hidden justify-end">
                         {logs.map((log) => (
                            <div key={log.id} className="flex flex-col gap-0.5 border-l-2 border-white/5 pl-2 leading-relaxed transition-all duration-300">
                               <div className="flex items-center justify-between text-[8px] font-semibold text-slate-500">
                                  <span className={`${log.color} bg-white/5 px-1.5 py-0.5 rounded font-bold`}>{log.tag}</span>
                                  <span>{log.time}</span>
                               </div>
                               <span className="text-slate-300 font-medium font-sans mt-0.5 text-[10px]">{log.text}</span>
                            </div>
                         ))}
                      </div>
                      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none" />
                   </div>
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
          <div className="bg-[#0F172A] p-10 rounded-[32px] border border-white/10 hover:border-blue-500/30 hover:shadow-[0_0_50px_rgba(59,130,246,0.15)] shadow-2xl relative overflow-hidden transition-all duration-300">
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
            <div key={i} className="bg-white/5 p-8 rounded-3xl border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 hover:shadow-[0_0_30px_rgba(6,182,212,0.15)] transition-all duration-300">
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
               { name: 'React 18', desc: 'Frontend UI', icon: Globe, color: 'text-blue-400', bg: 'from-blue-500/10 to-transparent', border: 'border-blue-500/20', glow: 'hover:shadow-[0_0_30px_rgba(56,189,248,0.15)] hover:border-blue-400/40' },
               { name: 'Tailwind CSS', desc: 'Styling', icon: Zap, color: 'text-teal-400', bg: 'from-teal-500/10 to-transparent', border: 'border-teal-500/20', glow: 'hover:shadow-[0_0_30px_rgba(45,212,191,0.15)] hover:border-teal-400/40' },
               { name: 'Python Flask', desc: 'Backend API', icon: Database, color: 'text-yellow-400', bg: 'from-yellow-500/10 to-transparent', border: 'border-yellow-500/20', glow: 'hover:shadow-[0_0_30px_rgba(250,204,21,0.15)] hover:border-yellow-400/40' },
               { name: 'Gemini AI', desc: 'Intelligence', icon: Cpu, color: 'text-purple-400', bg: 'from-purple-500/10 to-transparent', border: 'border-purple-500/20', glow: 'hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] hover:border-purple-400/40' },
               { name: 'Framer Motion', desc: 'Animations', icon: Activity, color: 'text-pink-400', bg: 'from-pink-500/10 to-transparent', border: 'border-pink-500/20', glow: 'hover:shadow-[0_0_30px_rgba(244,114,182,0.15)] hover:border-pink-400/40' },
             ].map((tech, i) => (
               <div key={i} className={`flex flex-col items-center justify-center text-center p-8 rounded-[32px] bg-gradient-to-b ${tech.bg} border ${tech.border} ${tech.glow} hover:-translate-y-2 transition-all duration-300 backdrop-blur-sm`}>
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
