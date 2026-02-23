import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  const navItems = [{
    id: 'home',
    label: 'Home'
  }, {
    id: 'schedule',
    label: 'Schedule'
  },{
    id: 'contact',
    label: 'Contact'
  }];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Modificamos las opciones del observer para mejor detección
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -35% 0px', // Ajustado para mejor detección
      threshold: 0.1 // Un pequeño threshold ayuda
    };

    const observerCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          console.log('Sección visible:', entry.target.id); // Para debug
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observamos todas las secciones
    navItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) {
        observer.observe(element);
        console.log('Observando:', item.id); // Para debug
      } else {
        console.warn('Elemento no encontrado:', item.id); // Para debug
      }
    });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observer.disconnect();
    };
  }, []); // Dependencias vacías

  const scrollToSection = sectionId => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Altura del navbar
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <motion.nav 
      initial={{
        y: -100,
        opacity: 0
      }} 
      animate={{
        y: 0,
        opacity: 1
      }} 
      transition={{
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      }} 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled 
          ? 'py-3 bg-[#0B1120]/80 backdrop-blur-xl shadow-2xl' 
          : 'py-6 bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <motion.div 
            whileHover={{
              scale: 1.05
            }} 
            className="text-2xl font-bold tracking-tighter text-white cursor-pointer flex items-center gap-2" 
            onClick={() => scrollToSection('home')}
          >
            OTD
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Support
            </span>
          </motion.div>

          <ul className="hidden md:flex items-center space-x-2 bg-slate-900/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/5">
            {navItems.map(item => (
              <li key={item.id}>
                <button 
                  onClick={() => scrollToSection(item.id)} 
                  className={`relative px-5 py-2 text-sm font-medium transition-colors rounded-full ${
                    activeSection === item.id 
                      ? 'text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span className="relative z-10">{item.label}</span>
                  {activeSection === item.id && (
                    <motion.div 
                      layoutId="nav-pill" 
                      className="absolute inset-0 bg-white/10 rounded-full" 
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.6
                      }} 
                    />
                  )}
                </button>
              </li>
            ))}
          </ul>

          <button 
            className="hidden md:block px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:scale-105" 
            onClick={() => scrollToSection('schedule')}
          >
            Get Support
          </button>
          <button className="md:hidden text-white p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;