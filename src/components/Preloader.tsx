import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Animation variants for Framer Motion
const preloaderVariants = {
  initial: { opacity: 1 },
  exit: { 
    opacity: 0,
    transition: { duration: 0.5, ease: "easeInOut" }
  },
};

const svgVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.1,
      // Stagger the animation of the children (the path and the text)
      staggerChildren: 0.3,
    },
  },
};

const pathVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: {
    pathLength: 1,
    opacity: 1,
    transition: {
      duration: 1.5,
      ease: 'easeInOut',
    },
  },
};

const textVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
};

// Main Preloader Component
interface PreloaderProps {
  isLoading: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-50 dark:bg-gray-900"
          variants={preloaderVariants}
          initial="initial"
          exit="exit"
        >
          <motion.svg
            width="320"
            height="80"
            viewBox="0 0 320 80"
            variants={svgVariants}
            initial="hidden"
            animate="visible"
          >
            {/* The "E" logomark path. I've recreated it as an SVG path. */}
            <motion.path
              d="M62.6,71.2C49.9,71,43.3,60.5,43.4,49c0.1-13.3,11.5-22.1,23.1-20.9c6.1,0.6,12,5.2,12.7,11.2c0.9,7.6-3.8,14.7-10.7,16.8 c-7.4,2.2-15.5-0.1-20.1-6.1C44,44.2,46.5,37,52,34.4c8-3.8,17.2-0.1,21.3,7.2c3.4,6.2,2.3,14-2.8,18.9 c-7.3,7-18.1,7.9-26.6,2.8C35,58,31,48.2,33.5,38.5C36.8,26,48.2,16.6,60.8,18.7"
              fill="none"
              stroke="#3C48F6" // Your brand color
              strokeWidth="10"
              strokeLinecap="round"
              variants={pathVariants}
            />
            
            {/* The "AsyPost" text, split into individual letters for animation */}
            <g transform="translate(100, 55)" fontSize="50" fontWeight="bold" fill="#3C48F6">
              {'AsyPost'.split('').map((char, i) => (
                <motion.text
                  key={i}
                  x={i * 30} // Spacing between letters
                  custom={i}
                  variants={textVariants}
                >
                  {char}
                </motion.text>
              ))}
            </g>
          </motion.svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;