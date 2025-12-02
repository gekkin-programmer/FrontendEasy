"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Lock body scroll when loading
    document.body.style.overflow = 'hidden';

    // 2. Timer to stop loading (2.5 seconds)
    const timer = setTimeout(() => {
      setIsLoading(false);
      document.body.style.overflow = 'unset'; // Unlock scroll
    }, 2500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white dark:bg-gray-900"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            transition: { duration: 0.5, ease: "easeInOut" } // Fade out entire screen
          }}
        >
          <div className="flex items-center justify-center gap-2">
            {/* --- LOGO ICON (WIGGLE EFFECT) --- */}
            <motion.svg
              width="80"
              height="80"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M62.6,71.2C49.9,71,43.3,60.5,43.4,49c0.1-13.3,11.5-22.1,23.1-20.9c6.1,0.6,12,5.2,12.7,11.2c0.9,7.6-3.8,14.7-10.7,16.8 c-7.4,2.2-15.5-0.1-20.1-6.1C44,44.2,46.5,37,52,34.4c8-3.8,17.2-0.1,21.3,7.2c3.4,6.2,2.3,14-2.8,18.9 c-7.3,7-18.1,7.9-26.6,2.8C35,58,31,48.2,33.5,38.5C36.8,26,48.2,16.6,60.8,18.7"
                stroke="#3C48F6"
                strokeWidth="6" // Made slightly thinner for elegance
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: 1,
                  transition: { 
                    duration: 2, 
                    ease: "easeInOut",
                    delay: 0.2 
                  }
                }}
              />
            </motion.svg>

            {/* --- TEXT ANIMATION --- */}
            <motion.div 
              className="text-5xl font-extrabold text-[#3C48F6] flex overflow-hidden"
              initial="hidden"
              animate="visible"
            >
              {"asyPost".split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        delay: 0.8 + (index * 0.1), // Starts after logo draws
                        duration: 0.4,
                        ease: "easeOut"
                      }
                    }
                  }}
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