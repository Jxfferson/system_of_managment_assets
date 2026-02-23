import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedBackground from '@/components/AnimatedBackground';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import ScheduleSupport from '@/components/ScheduleSupport';
import FAQ from '@/components/FAQ';
import ContactUs from '@/components/ContactUs';
import TermsConditions from '@/components/TermsConditions';
import LightRays from '@/components/LightRays';

const HomePage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <>
      <Helmet>
        <title>OTD Management Assets</title>
        <meta name="description" content="Next-generation enterprise IT support. Secure, fast, and reliable technical solutions." />
        <link rel="icon" href="../images/onetouch.png" />
      </Helmet>

      <div className="min-h-screen bg-[#0B1120] text-slate-200 selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
        <AnimatedBackground />
        
        {/* LightRays - Versión más luminosa */}
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          zIndex: 2,
          pointerEvents: 'none',
          opacity: 0.9
        }}>
          <LightRays
            raysOrigin="top-center"
            raysColor="#38BDF8" // Color más brillante
            raysSpeed={1.2}
            lightSpread={2.5}
            rayLength={3.5}
            followMouse={true}
            mouseInfluence={0.25}
            noiseAmount={0.08}
            distortion={0.5}
            fadeDistance={1.5}
            saturation={1.2}
          />
        </div>

        <Navigation />
        
        <AnimatePresence>
          {isLoaded && (
            <motion.main 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ duration: 1 }}
              className="relative z-10"
            >
              <Hero />
              <ScheduleSupport />
              <FAQ />
              <ContactUs />
              <TermsConditions />
            </motion.main>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="relative z-10 border-t border-white/10 bg-[#0B1120]/80 backdrop-blur-xl pt-16 pb-8">
          <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 text-xl font-bold text-white mb-6">
              <div className="w-6 h-6 rounded bg-gradient-to-br" />
              OTD Support
            </div>
            <p className="text-slate-500 text-sm">
              © 2026 OTD Support. All rights reserved.<br/>
              Enterprise-Grade IT Infrastructure Management.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default HomePage;