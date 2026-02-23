import React from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0A0B1A]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-[#13113C] via-[#0A0B1A] to-[#0A0B1A]" />
      <motion.div
        className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-[40%_60%_70%_30%] bg-purple-600/10 blur-[120px]"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          rotate: [0, 90, 0],
          scale: [1, 1.2, 1],
          borderRadius: ["40% 60% 70% 30%", "30% 70% 50% 50%", "40% 60% 70% 30%"]
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute top-[20%] right-[-20%] w-[50vw] h-[50vw] rounded-[60%_40%_30%_70%] bg-cyan-500/15 blur-[140px]"
        animate={{
          x: [0, -100, 0],
          y: [0, 100, 0],
          rotate: [0, -90, 0],
          scale: [1, 1.3, 1],
          borderRadius: ["60% 40% 30% 70%", "50% 50% 70% 30%", "60% 40% 30% 70%"]
        }}
        transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute bottom-[-20%] left-[20%] w-[55vw] h-[55vw] rounded-[50%_50%_60%_40%] bg-blue-600/15 blur-[130px]"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, -100, 0],
          rotate: [0, 180, 0],
          scale: [1, 1.1, 1],
          borderRadius: ["50% 50% 60% 40%", "70% 30% 50% 50%", "50% 50% 60% 40%"]
        }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIvPjxwYXRoIGQ9Ik0wIDEwaDQwTTEwIDB2NDAiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIi8+PC9zdmc+')] opacity-50" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay bg-[url('data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjAwIDIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC42NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNhKSIvPjwvc3ZnPg==')]" />
    </div>
  );
};

export default AnimatedBackground;