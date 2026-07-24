'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const NeuButton = ({ children, onClick, active, className = "", disabled = false }: any) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      'relative px-4 py-2.5 rounded-[10px] font-bold text-sm transition-all duration-200',
      active
        ? 'bg-[#174CD2] text-white'
        : 'bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white border border-black/10 dark:border-white/10 hover:border-[#174CD2]/40',
      disabled ? 'opacity-50 cursor-not-allowed' : '',
      className
    )}
  >
    {children}
  </button>
);

export const NeuCard = ({ children, className = "" }: any) => (
  <div className={cn('bg-[#F7F6F3] dark:bg-[#0A0A2E] border border-black/5 dark:border-white/5 rounded-[16px] p-6 text-[#040028] dark:text-white', className)}>
    {children}
  </div>
);

export const NeuInput = ({ className = "", ...props }: any) => (
  <input
    {...props}
    className={cn("bg-white dark:bg-[#0A0A2E] border border-[#D9D9D9] dark:border-white/10 rounded-[10px] px-3 py-2.5 font-medium text-sm placeholder:text-[#8E8E8E] focus:outline-none focus:border-[#174CD2] focus:ring-2 focus:ring-[#174CD2]/15 transition-all w-full text-[#040028] dark:text-white", className)}
  />
);

export const NeuModal = ({ title, isOpen, onClose, children, maxWidth = "max-w-xl", className = "", headerClassName = "bg-[#174CD2] text-white", iconClassName = "text-white/80 hover:text-white" }: any) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#333333]/70 backdrop-blur-none"
                >
                    <motion.div
                        initial={{ scale: 0.96, opacity: 0, y: 10 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.96, opacity: 0, y: 10 }}
                        onClick={(e) => e.stopPropagation()}
                        className={cn("bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full overflow-hidden z-10 max-h-[90vh] flex flex-col", maxWidth, className)}
                    >
                        <div className={cn("px-5 py-4 flex justify-between items-center", headerClassName)}>
                            <span className="font-bold">{title}</span>
                            <button onClick={onClose} className={cn("transition-colors", iconClassName)}>
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="p-6 text-[#040028] dark:text-white overflow-y-auto">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
