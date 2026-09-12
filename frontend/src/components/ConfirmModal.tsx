import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'CONFIRM EXECUTION',
  cancelText = 'ABORT [ESC]',
  isDanger = true,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 selection:bg-[#D4FF3F] selection:text-[#050505] font-mono">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-[#050505]/80 backdrop-blur-xs"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.15 }}
            className={`relative w-full max-w-md bg-[#0a0b0e] border p-6 space-y-6 shadow-2xl z-10 ${
              isDanger ? 'border-[#FF3B30]' : 'border-[#D4FF3F]'
            }`}
          >
            {/* Corner Ticks */}
            <span className={`absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 ${isDanger ? 'border-[#FF3B30]' : 'border-[#D4FF3F]'}`} />
            <span className={`absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 ${isDanger ? 'border-[#FF3B30]' : 'border-[#D4FF3F]'}`} />
            <span className={`absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 ${isDanger ? 'border-[#FF3B30]' : 'border-[#D4FF3F]'}`} />
            <span className={`absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 ${isDanger ? 'border-[#FF3B30]' : 'border-[#D4FF3F]'}`} />

            {/* Title Header */}
            <div className="space-y-1 border-b border-[#1a1c23] pb-3">
              <div className="text-[10px] text-[#8E929F] uppercase tracking-widest flex items-center justify-between">
                <span>SYSTEM ACTION // CONFIRMATION REQUIRED</span>
                <span className={isDanger ? 'text-[#FF3B30]' : 'text-[#D4FF3F]'}>CRITICAL</span>
              </div>
              <h3 className="text-sm font-bold text-[#F5F5F7] uppercase tracking-wider">
                {title}
              </h3>
            </div>

            {/* Message Body */}
            <div className="text-xs text-[#8E929F] tracking-wide uppercase leading-relaxed bg-[#050505] p-3 border border-[#1a1c23]">
              {message}
            </div>

            {/* Actions Footer */}
            <div className="grid grid-cols-2 gap-3 text-xs tracking-wider font-bold">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="py-2.5 bg-[#050505] hover:bg-[#111318] border border-[#1a1c23] text-[#8E929F] hover:text-[#F5F5F7] uppercase cursor-pointer transition-colors"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`py-2.5 uppercase cursor-pointer transition-all ${
                  isDanger
                    ? 'bg-[#FF3B30] hover:bg-[#e03126] text-[#050505] font-bold'
                    : 'bg-[#D4FF3F] hover:bg-[#c2ef30] text-[#050505] font-bold'
                } disabled:opacity-50`}
              >
                {loading ? 'EXECUTING...' : confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
