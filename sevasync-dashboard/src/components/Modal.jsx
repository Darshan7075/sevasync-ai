import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

/**
 * Reusable modal overlay with animated entrance/exit.
 *
 * Extracted from InventoryPage – same pattern was hand-duplicated across
 * BloodBankPage, VolunteersPage, UsersPage, and ResourcesPage.
 *
 * @param {{ isOpen: boolean, title: string, onClose: () => void, children: React.ReactNode, maxWidth?: string }} props
 */
const Modal = ({ isOpen, title, onClose, children, maxWidth = 'max-w-xl' }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className={`bg-white rounded-[40px] w-full ${maxWidth} shadow-2xl overflow-hidden`}
        >
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-[18px] font-black text-slate-900 uppercase tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-900"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-10">{children}</div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export default Modal;
