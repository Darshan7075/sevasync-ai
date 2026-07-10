import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

/**
 * Reusable toast notification overlay.
 *
 * Supports two display modes:
 *   - With `notification.title` → renders title + message (detailed)
 *   - Without title           → renders a category label + message (simple)
 *
 * @param {{ notification: { title?: string, message: string, type: string } | null, label?: string }} props
 */
const NotificationToast = ({ notification, label = 'System Update' }) => {
  if (!notification) return null;

  const colorMap = {
    error: 'bg-rose-600 text-white border-rose-500',
    success: 'bg-emerald-600 text-white border-emerald-500',
    info: 'bg-blue-600 text-white border-blue-500',
    warning: 'bg-amber-600 text-white border-amber-500',
  };

  const Icon = notification.type === 'error' ? AlertTriangle
    : notification.type === 'success' ? ShieldCheck
    : CheckCircle2;

  const colors = colorMap[notification.type] || colorMap.info;

  return (
    <AnimatePresence>
      {notification && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 20, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className={`fixed top-10 left-1/2 -translate-x-1/2 z-[1000] px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 min-w-[400px] border ${colors}`}
        >
          <Icon size={24} />
          <div className="flex-1">
            <p className="text-[11px] font-black tracking-widest uppercase opacity-80">
              {notification.title || label}
            </p>
            <p className="text-sm font-bold">{notification.message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NotificationToast;
