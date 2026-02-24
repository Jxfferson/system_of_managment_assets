import React from 'react';
import { motion } from 'framer-motion';

const LoadingAnimation = () => {
  return (
    <div className="flex items-center justify-center bg-[#0B1120] w-full h-full">
      <motion.div
        className="relative w-16 h-16"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#0EA5E9]"
          style={{
            boxShadow: "0 0 20px rgba(14, 165, 233, 0.5)"
          }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-4 border-transparent border-t-[#06B6D4]"
          animate={{ rotate: -360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear"
          }}
          style={{
            boxShadow: "0 0 15px rgba(6, 182, 212, 0.5)"
          }}
        />
      </motion.div>
    </div>
  );
};

export default LoadingAnimation;