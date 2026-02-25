import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import Hero from '@/components/Hero';
import ScheduleSupport from '@/components/ScheduleSupport';
import LoadingAnimation from '@/components/LoadingAnimation';

// Lazy load secciones no críticas
const ContactUs = lazy(() => import('@/components/ContactUs'));
const TermsConditions = lazy(() => import('@/components/TermsConditions'));

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

      <AnimatePresence>
        {isLoaded && (
          <motion.main 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 1 }}
            className="relative z-10"
          >
            <section id="home" className="scroll-mt-20">
              <Hero />
            </section>

            <section id="schedule" className="scroll-mt-20">
              <ScheduleSupport />
            </section>

            <section id="contact" className="scroll-mt-20">
              <Suspense fallback={<div className="h-96 flex items-center justify-center bg-[#0B1120]"><LoadingAnimation /></div>}>
                <ContactUs />
              </Suspense>
            </section>

            <Suspense fallback={<div className="bg-[#0B1120]" />}>
              <TermsConditions />
            </Suspense>
          </motion.main>
        )}
      </AnimatePresence>
    </>
  );
};

export default HomePage;