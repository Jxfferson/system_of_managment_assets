import React, { useState } from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import SplashScreen from './components/SplashScreen';
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <ScrollToTop />

      {/* Splash Screen Overlay */}
      <AnimatePresence>
        {showSplash && (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* Main App Content - Only render visible when splash completes to save performance, but mounted to avoid flash */}
      <div style={{ opacity: showSplash ? 0 : 1, transition: 'opacity 0.5s ease-in-out' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </div>
      
      <Toaster />
    </Router>
  );
}

export default App;