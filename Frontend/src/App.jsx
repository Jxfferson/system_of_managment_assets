import React, { useState } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import SplashScreen from './components/SplashScreen';
import Navigation from './components/Navigation';
import AnimatedBackground from './components/AnimatedBackground';
import LightRays from './components/LightRays';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <ScrollToTop />
      <Navigation />

      {/* Fondos globales */}
      <AnimatedBackground />
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
          raysColor="#38BDF8"
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

      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Contenedor principal transparente para que se vean los rayos */}
      <div className="min-h-screen text-slate-200 pt-20 relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </div>

      <Toaster />
    </Router>
  );
}

export default App;