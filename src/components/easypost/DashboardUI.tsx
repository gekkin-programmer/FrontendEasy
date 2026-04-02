'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export const NeuButton = ({ children, onClick, active, className = "", disabled = false }: any) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={`relative px-4 py-2 font-black text-xs uppercase tracking-wider transition-all duration-150 border-2 border-black ${
      active 
        ? 'bg-[#3C48F5] text-white translate-x-[2px] translate-y-[2px] shadow-none' 
        : 'bg-white dark:bg-zinc-900 text-black dark:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none'
    } ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} ${className}`}
  >
    {children}
  </button>
);

export const NeuCard = ({ children, className = "" }: any) => (
  <div className={`bg-white dark:bg-zinc-900 border-2 border-black dark:border-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] p-6 text-black dark:text-white ${className}`}>
    {children}
  </div>
);

export const NeuInput = (props: any) => (
  <input 
    {...props} 
    className="bg-white dark:bg-zinc-800 border-2 border-black dark:border-white p-2 font-bold text-sm placeholder:text-gray-400 focus:outline-none focus:bg-blue-50 dark:focus:bg-zinc-700 focus:shadow-[4px_4px_0px_0px_#000] dark:focus:shadow-[4px_4px_0px_0px_#fff] transition-all w-full font-mono text-black dark:text-white" 
  />
);

export const NeuModal = ({ title, isOpen, onClose, children }: any) => {
    if (!isOpen) return null;
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white dark:bg-zinc-900 border-4 border-black dark:border-white shadow-[12px_12px_0px_0px_#000] dark:shadow-[12px_12px_0px_0px_#fff] w-full max-w-md overflow-hidden z-10">
                        <div className="bg-[#3C48F5] text-white p-4 border-b-4 border-black dark:border-white flex justify-between items-center">
                            <span className="font-black uppercase tracking-wider">{title}</span>
                            <button onClick={onClose} className="text-white hover:bg-black/20 p-1 transition-colors">
                                <X size={24} strokeWidth={3}/>
                            </button>
                        </div>
                        <div className="p-6 text-black dark:text-white">{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
