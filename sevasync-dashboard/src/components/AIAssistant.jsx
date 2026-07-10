import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, Brain, Info } from 'lucide-react';

const AIAssistant = ({ reports }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hello! I'm SevaSync AI. How can I help you manage community resources today?", isBot: true }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg = { text: input, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // AI Logic
    setTimeout(() => {
      let response = "I'm analyzing the data... ";
      const query = input.toLowerCase();

      if (query.includes('urgent') || query.includes('priority')) {
        const highUrgency = reports.filter(r => r.urgency === 'High').length;
        response = `There are currently ${highUrgency} high-priority reports. The most critical issue is in ${reports[0]?.area || 'the main sector'}.`;
      } else if (query.includes('today') || query.includes('recent')) {
        response = `Today, we've received ${reports.length} reports. Most common issue is ${reports[0]?.issue || 'Infrastructure'}.`;
      } else if (query.includes('action') || query.includes('suggest')) {
        response = "I suggest deploying volunteers to the eastern sector where water shortages are rising. 3 volunteers are available nearby.";
      } else {
        response = "I can help you identify urgent areas, suggest action plans, or summarize today's reports. What would you like to know?";
      }

      setMessages(prev => [...prev, { text: response, isBot: true }]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-8 right-8 z-[9999]">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-[#dadce0] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a73e8] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h4 className="font-medium text-sm">SevaSync AI</h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    <span className="text-[10px] text-white/80">Active Intelligence</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fa]">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-[13px] ${
                    msg.isBot 
                    ? 'bg-white border border-[#dadce0] text-[#3c4043] rounded-tl-none shadow-sm' 
                    : 'bg-[#1a73e8] text-white rounded-tr-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-[#dadce0]">
              <div className="flex items-center gap-2 bg-[#f1f3f4] p-1 rounded-full border border-transparent focus-within:border-[#1a73e8] focus-within:bg-white transition-all">
                <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask SevaSync AI..."
                  className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-[13px] placeholder:text-[#5f6368]"
                />
                <button 
                  onClick={handleSend}
                  className="p-2 bg-[#1a73e8] text-white rounded-full hover:bg-[#1557b0] transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`p-4 rounded-full shadow-lg flex items-center justify-center transition-all ${
          isOpen ? 'bg-[#ea4335] text-white' : 'bg-[#1a73e8] text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default AIAssistant;
