import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useNavigate, useLocation } from 'react-router-dom';

const Navigation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');

  const navItems = useMemo(() => [
    { id: 'home', label: 'Home' },
    { id: 'schedule', label: 'Schedule' },
    { id: 'contact', label: 'Contact' }
  ], []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isAdminRoute) return;

    const observerOptions = {
      root: null,
      rootMargin: '-100px 0px -100px 0px',
      threshold: 0.2
    };

    const observerCallback = entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    navItems.forEach(item => {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [isAdminRoute, navItems]);

  useEffect(() => {
    if (!isAdminRoute) {
      setActiveSection('home');
    }
  }, [isAdminRoute]);

  const scrollToSection = useCallback((sectionId) => {
    if (isAdminRoute) {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
      }
    }
  }, [isAdminRoute, navigate]);

  const goToHome = useCallback(() => {
    if (isAdminRoute) {
      navigate('/');
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setActiveSection('home');
    }
  }, [isAdminRoute, navigate]);

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'py-3 bg-[#0B1120]/80 backdrop-blur-xl shadow-2xl'
          : 'py-6 bg-transparent'
      )}
    >
      <div className="container mx-auto px-6 relative h-full">
        <div className="flex items-center justify-center">

          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="absolute left-6 text-2xl font-bold tracking-tighter text-white cursor-pointer flex items-center gap-2"
            onClick={goToHome}
          >
            <span className="mt-12 text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 font-bold">
              OTD
            </span>
            <span className="mt-12 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              Support
            </span>
          </motion.div>

          {/* Navegación principal */}
          {!isAdminRoute && (
            <ul className="flex items-center space-x-2 bg-slate-900/50 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/5">
              {navItems.map(item => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToSection(item.id)}
                    className={cn(
                      'relative px-5 py-2 text-sm font-medium transition-colors rounded-full',
                      activeSection === item.id
                        ? 'text-white'
                        : 'text-slate-400 hover:text-white'
                    )}
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
          )}

          {/* Botones de la derecha (Admin / Get Support) */}
          <div className="absolute right-8 flex items-center gap-4">
            {!isAdminRoute && (
              <button
                onClick={() => navigate('/admin')}
                className="hidden md:block px-4 py-2 text-sm font-semibold rounded-full transition-all border bg-slate-800/80 hover:bg-slate-700 text-white border-white/10"
              >
                Admin
              </button>
            )}

            {!isAdminRoute && (
              <button
                className="hidden md:block px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full hover:shadow-[0_0_20px_rgba(34,211,238,0.4)] transition-all hover:scale-105"
                onClick={() => scrollToSection('schedule')}
              >
                Get Support
              </button>
            )}
          </div>

          {/* Admin Panel Badge - Posicionado independiente a la derecha */}
          {isAdminRoute && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute right-0 top-2"
            >
              <span className="flex text-sm font-medium text-cyan-400 bg-cyan-500/10 px-6 py-2 rounded-full border border-cyan-500/20 shadow-lg shadow-cyan-500/10">
                Admin Panel
              </span>
            </motion.div>
          )}

          {/* Botón móvil */}
          <button className="md:hidden text-white p-2 absolute right-4 top-1/2 -translate-y-1/2">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

        </div>
      </div>
    </motion.nav>
  );
};

export default Navigation;