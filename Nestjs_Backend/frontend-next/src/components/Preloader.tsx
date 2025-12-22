"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image'; // Import Next.js Image

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
          <div className="flex items-center justify-center gap-1"> {/* Gap-1 keeps the E close to text */}
            
            {/* --- LOGO IMAGE (The "E") --- */}
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -45 }}
              animate={{ 
                scale: 1, 
                opacity: 1, 
                rotate: 0,
                transition: { 
                  duration: 0.8, 
                  ease: [0.34, 1.56, 0.64, 1], // "Pop" / Bouncy effect
                  delay: 0.2 
                }
              }}
            >
              <Image 
                src="/assets/WiggleLogo.png" // Make sure the image is saved here!
                alt="E"
                width={70} 
                height={70}
                className="object-contain"
                priority
              />
            </motion.div>

            {/* --- TEXT ANIMATION ("asyPost") --- */}
            <motion.div 
              className="text-5xl font-extrabold text-[#3C48F6] flex overflow-hidden pb-2" // pb-2 fixes font clipping
              initial="hidden"
              animate="visible"
            >
              {"asyPost".split("").map((char, index) => (
                <motion.span
                  key={index}
                  variants={{
                    hidden: { y: 40, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        delay: 0.6 + (index * 0.1), // Starts after logo pops in
                        duration: 0.5,
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