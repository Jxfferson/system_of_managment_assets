import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0A0B1A]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#13113C] via-[#0A0B1A] to-[#0A0B1A]" />
      
      {/* Blur reducido y animación solo con transform */}
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-purple-600/10"
        style={{ filter: 'blur(60px)', willChange: 'transform' }}
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute top-[20%] right-[-20%] w-[50vw] h-[50vw] rounded-full bg-cyan-500/15"
        style={{ filter: 'blur(70px)', willChange: 'transform' }}
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] rounded-full bg-blue-600/15"
        style={{ filter: 'blur(65px)', willChange: 'transform' }}
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -100, 0],
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-50" />
    </div>
  );
};

export default AnimatedBackground;