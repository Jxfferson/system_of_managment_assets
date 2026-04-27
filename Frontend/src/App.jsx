import React, { useState } from 'react';
import { 
  Route, 
  Routes, 
  BrowserRouter as Router,
  Navigate 
} from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import ScrollToTop from './components/ScrollToTop';
import AdminPage from './pages/AdminPage';
import SplashScreen from './components/SplashScreen'; 
import AnimatedBackground from './components/AnimatedBackground';
import LightRays from './components/LightRays';
import { Toaster } from '@/components/ui/toaster';
import ItemDetailPage from '@/components/item-detail/ItemDetailPage';

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <Router>
      <ScrollToTop />

      <AnimatedBackground />
      <div style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 1,
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

      <div className="min-h-screen text-slate-200 relative z-20">
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={<AdminPage />} />
          
          <Route path="/admin/statistics" element={<AdminPage />} />
          
          <Route path="/admin/items/:itemName" element={<ItemDetailPage />} />
        </Routes>
      </div>

      <Toaster />
    </Router>
  );
}

export default App;