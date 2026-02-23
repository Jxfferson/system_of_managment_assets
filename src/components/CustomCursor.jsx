import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

const CustomCursor = () => {
  const [isHovering, setIsHovering] = useState(false);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring physics for the cursor following
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Add hide-cursor class to html to prevent default cursor
    document.documentElement.classList.add('hide-cursor');

    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      // Check if hovering over clickable elements
      if (
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button' ||
        target.tagName.toLowerCase() === 'input' ||
        target.tagName.toLowerCase() === 'select' ||
        target.tagName.toLowerCase() === 'textarea' ||
        target.closest('a, button')
      ) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    return () => {
      document.documentElement.classList.remove('hide-cursor');
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, [mouseX, mouseY]);

  return (
    <>
      {/* Horizontal Crosshair Line */}
      <motion.div
        className="fixed top-0 left-0 h-[1px] bg-[#0EA5E9] pointer-events-none z-[9999] mix-blend-screen"
        style={{
          y: cursorY,
          width: '100vw',
          opacity: isHovering ? 0.8 : 0.3,
          boxShadow: isHovering ? '0 0 10px #0EA5E9' : 'none',
        }}
      />
      {/* Vertical Crosshair Line */}
      <motion.div
        className="fixed top-0 left-0 w-[1px] bg-[#0EA5E9] pointer-events-none z-[9999] mix-blend-screen"
        style={{
          x: cursorX,
          height: '100vh',
          opacity: isHovering ? 0.8 : 0.3,
          boxShadow: isHovering ? '0 0 10px #0EA5E9' : 'none',
        }}
      />
      {/* Center Dot / Distortion effect */}
      <motion.div
        className="fixed top-0 left-0 w-4 h-4 rounded-full border border-[#0EA5E9] pointer-events-none z-[10000] mix-blend-screen transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        style={{
          x: cursorX,
          y: cursorY,
          backgroundColor: isHovering ? 'rgba(14,165,233,0.2)' : 'transparent',
          scale: isHovering ? 1.5 : 1,
          boxShadow: isHovering ? '0 0 15px rgba(14,165,233,0.8)' : '0 0 5px rgba(14,165,233,0.5)',
        }}
        animate={{
          rotate: isHovering ? 180 : 0,
          borderRadius: isHovering ? ["50%", "30% 70% 70% 30%", "50%"] : "50%"
        }}
        transition={{ duration: 0.5, repeat: isHovering ? Infinity : 0 }}
      >
        <div className="w-1 h-1 bg-[#0EA5E9] rounded-full" />
      </motion.div>
    </>
  );
};

export default CustomCursor;