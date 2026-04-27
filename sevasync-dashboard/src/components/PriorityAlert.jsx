
import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const PriorityAlert = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-rose-50 border border-rose-100 p-6 rounded-3xl mb-8 flex flex-col md:flex-row items-center justify-between gap-6"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-rose-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-rose-200">
          <AlertCircle size={24} />
        </div>
        <div>
          <h4 className="text-rose-900 font-bold text-lg">Critical Emergency: Indore Medical Crisis</h4>
          <p className="text-rose-700 text-sm">Large-scale medical support needed at Central Indore. 100+ people affected. Urgency: CRITICAL.</p>
        </div>
      </div>
      <button className="px-6 py-3 bg-rose-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-rose-700 transition-colors shrink-0">
        Dispatch Team <ArrowRight size={18} />
      </button>
    </motion.div>
  );
};

export default PriorityAlert;
