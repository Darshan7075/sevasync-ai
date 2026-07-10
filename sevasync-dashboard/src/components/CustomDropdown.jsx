import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CustomDropdown = ({ options, value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-white border border-[#dadce0] px-4 py-2 rounded-md hover:bg-[#f8f9fa] transition-all min-w-[160px] justify-between group shadow-sm"
      >
        <div className="flex items-center gap-2 overflow-hidden">
           <MapPin size={14} className="text-[#5f6368]" />
           <span className="text-[14px] text-[#3c4043] truncate">{value}</span>
        </div>
        <ChevronDown size={14} className={`text-[#5f6368] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 mt-1 min-w-full w-max bg-white border border-[#dadce0] rounded-md shadow-lg z-[999] overflow-hidden"
          >
            <div className="max-h-[240px] overflow-y-auto py-1">
              {options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => {
                    onChange(opt);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-[14px] transition-colors ${value === opt ? 'bg-[#e8f0fe] text-[#1967d2] font-medium' : 'text-[#3c4043] hover:bg-[#f1f3f4]'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default CustomDropdown;
