'use client';

import React from 'react';
import { createPortal } from 'react-dom';
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
      className,
      disabled ? '!bg-[#F5F5F5] dark:!bg-white/5 !text-[#B0B0B0] dark:!text-white/30 !border-transparent cursor-not-allowed pointer-events-none' : ''
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
    const [mounted, setMounted] = React.useState(false);
    React.useEffect(() => setMounted(true), []);

    if (!mounted) return null;

    return createPortal(
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
                        className={cn("bg-white dark:bg-[#0A0A2E] rounded-[16px] shadow-[0_20px_60px_rgba(0,0,0,0.2)] w-full overflow-hidden z-10 max-h-[90dvh] flex flex-col", maxWidth, className)}
                    >
                        <div className={cn("px-5 py-4 flex justify-between items-center shrink-0", headerClassName)}>
                            <span className="font-bold">{title}</span>
                            <button onClick={onClose} className={cn("transition-colors", iconClassName)}>
                                <X size={20}/>
                            </button>
                        </div>
                        <div className="p-6 text-[#040028] dark:text-white overflow-y-auto">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export const ConfirmModal = ({
    isOpen, onClose, onConfirm, title, message, confirmLabel, cancelLabel, isConfirming = false,
}: {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    isConfirming?: boolean;
}) => (
    <NeuModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        headerClassName="bg-white dark:bg-[#0A0A2E] text-[#040028] dark:text-white"
        iconClassName="text-[#040028]/70 hover:text-[#040028] dark:text-white/70 dark:hover:text-white"
    >
        <div className="space-y-5">
            <p className="text-sm text-[#040028]/80 dark:text-white/80 leading-relaxed">{message}</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-black/5 dark:border-white/5">
                <NeuButton onClick={onClose} className="hover:border-[#040028]/40">{cancelLabel}</NeuButton>
                <NeuButton
                    onClick={onConfirm}
                    active
                    disabled={isConfirming}
                    className="bg-red-500 hover:bg-red-600 text-white"
                >
                    {confirmLabel}
                </NeuButton>
            </div>
        </div>
    </NeuModal>
);
