"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; 

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Lock scroll
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = ''; 
    }, 2500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-black"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" } 
          }}
        >
          <div className="flex items-center justify-center gap-1 md:gap-2"> 
            
            {/* LOGO IMAGE */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { 
                  duration: 0.8, 
                  ease: [0.34, 1.56, 0.64, 1], 
                  delay: 0.2 
                }
              }}
              className="relative w-12 h-12 md:w-20 md:h-20"
            >
              <Image 
                src="/assets/WiggleLogo.png" 
                alt="EasyPost Logo"
                fill
                className="object-contain"
                priority
              />
            </motion.div>

            {/* TEXT ANIMATION */}
            <motion.div 
              className="text-4xl md:text-6xl font-black text-[#3C48F6] flex overflow-hidden pb-1 md:pb-2 tracking-tighter"
              initial="hidden"
              animate="visible"
            >
              {"asyPost".split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { y: "100%", opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        delay: 0.6 + (index * 0.08), 
                        duration: 0.5,
                        ease: "easeOut"
                      }
                    }
                  }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;