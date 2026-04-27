import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Brain, Zap, Shield, Cpu, ChevronRight, MessageCircle } from 'lucide-react';

const IntelligenceBriefing = ({ reports, volunteers }) => {
  const [currentText, setCurrentText] = useState('');
  const [index, setIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const briefings = useMemo(() => [
    `${reports?.length || 0} active reports are currently being monitored across the SevaSync network.`,
    `${volunteers?.filter(v => v.availability === 'AM' || v.availability === 'Full')?.length || 0} volunteer units are tactical-ready for immediate deployment.`,
    `AI identifies ${reports?.filter(r => r.urgency === 'High')?.length || 0} high-priority zones requiring immediate resource allocation.`,
    `System health check completed. All communication nodes are performing optimally.`
  ], [reports?.length, volunteers?.length]);

  useEffect(() => {
    if (!briefings[index]) {
      setIndex(0);
      return;
    }

    let charIndex = 0;
    setIsTyping(true);
    setCurrentText('');

    const typingInterval = setInterval(() => {
      const currentBriefing = briefings[index];
      if (currentBriefing && charIndex < currentBriefing.length) {
        setCurrentText(prev => prev + currentBriefing[charIndex]);
        charIndex++;
      } else {
        clearInterval(typingInterval);
        setIsTyping(false);
        const nextBriefingTimeout = setTimeout(() => {
          setIndex(prev => (prev + 1) % briefings.length);
        }, 6000);
        return () => clearTimeout(nextBriefingTimeout);
      }
    }, 30);

    return () => clearInterval(typingInterval);
  }, [index, briefings]);

  return (
    <div className="google-card p-6 relative overflow-hidden bg-[#e8f0fe]/30 border-[#1a73e8]/20">
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-[#1a73e8] text-white rounded-lg">
                 <Sparkles size={18} />
              </div>
              <h4 className="text-[14px] font-medium text-[#1a73e8]">Platform insights</h4>
           </div>
           <div className="flex items-center gap-1.5 px-2 py-0.5 bg-[#ffffff] rounded-full border border-[#dadce0]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#34a853] animate-pulse" />
              <span className="text-[10px] text-[#5f6368] font-medium uppercase">Live</span>
           </div>
        </div>

        <div className="flex-1 bg-white p-4 rounded-xl border border-[#1a73e8]/10 shadow-sm min-h-[100px]">
           <p className="text-[14px] text-[#3c4043] leading-relaxed">
              {currentText}
              {isTyping && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="inline-block w-1.5 h-4 ml-1 bg-[#1a73e8] align-middle" />}
           </p>
        </div>

         <div className="mt-4 flex items-center gap-3 p-3 bg-[#e6f4ea] rounded-xl border border-[#34a853]/20">
            <div className="p-1.5 bg-[#128C7E] text-white rounded-lg">
               <MessageCircle size={14} />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-[#137333] uppercase">WhatsApp Intake</span>
                  <span className="text-[9px] text-[#5f6368] font-mono animate-pulse">Parsing...</span>
               </div>
               <div className="w-full bg-white/50 h-1 rounded-full mt-1 overflow-hidden">
                  <motion.div 
                    animate={{ x: [-100, 200] }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-1/3 h-full bg-[#128C7E]" 
                  />
               </div>
            </div>
         </div>

        <div className="mt-6 flex justify-between gap-4">
           {[
             { label: 'System status', val: 'Healthy', color: 'text-[#34a853]' },
             { label: 'Data sync', val: '100%', color: 'text-[#1a73e8]' }
           ].map((stat, i) => (
             <div key={i} className="flex flex-col">
                <p className="text-[10px] text-[#5f6368] font-medium uppercase tracking-tight">{stat.label}</p>
                <p className={`text-[13px] font-medium ${stat.color}`}>{stat.val}</p>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};


export default IntelligenceBriefing;
