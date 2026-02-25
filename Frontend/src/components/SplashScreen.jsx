import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const SplashScreen = ({ onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2500); // 2.5 segundos
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1120] overflow-hidden"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute w-[40vw] h-[40vw] rounded-full bg-[#0EA5E9]/20 blur-[100px]"
        initial={{ scale: 0.8, opacity: 0, x: -100 }}
        animate={{ scale: 1.2, opacity: 1, x: 50 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />
      <motion.div
        className="absolute w-[30vw] h-[30vw] rounded-full bg-[#06B6D4]/20 blur-[100px]"
        initial={{ scale: 0.8, opacity: 0, x: 100, y: 100 }}
        animate={{ scale: 1.5, opacity: 1, x: -50, y: -50 }}
        transition={{ duration: 2.2, ease: "easeOut" }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4]"
          style={{ textShadow: '0 0 30px rgba(14,165,233,0.3)' }}
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          OTD AMERICAS
        </motion.h1>
        <motion.div
          className="h-1 bg-gradient-to-r from-[#0EA5E9] to-[#06B6D4] mt-6 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 1.3, delay: 0.6, ease: "easeInOut" }}
          style={{ boxShadow: '0 0 20px rgba(14,165,233,0.5)' }}
        />
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;