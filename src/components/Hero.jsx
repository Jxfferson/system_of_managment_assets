import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Server, ChevronRight } from 'lucide-react';
const Hero = () => {
  const icons = [{
    Icon: ShieldCheck,
    label: "Secure",
    color: "from-emerald-400 to-emerald-600"
  }, {
    Icon: Zap,
    label: "Fast",
    color: "from-amber-400 to-orange-500"
  }, {
    Icon: Server,
    label: "Reliable",
    color: "from-cyan-400 to-blue-600"
  }];
  const scrollToSchedule = () => {
    document.getElementById('schedule')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  };
  return <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-32 pb-20">
      <div className="container mx-auto px-6 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1 initial={{
          opacity: 0,
          y: 40
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.1
        }} className="text-6xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-[1.1]">
            IT Equipment <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 pb-2">
              Suppor t
            </span>
          </motion.h1>

          <motion.p initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.2
        }} className="text-xl md:text-2xl text-slate-400 mb-12 max-w-3xl mx-auto font-light">
              Streamlined hardware repair and replacement for your team.
              Agents can request assistance for faulty equipment. We track every asset with unique entry and exit serials, ensuring full visibility from reception to resolution.
          </motion.p>

          <motion.div initial={{
          opacity: 0,
          y: 30
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          duration: 0.8,
          delay: 0.3
        }} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={scrollToSchedule} className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-lg font-semibold rounded-full overflow-hidden shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(34,211,238,0.6)] flex items-center gap-2">
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10">Request Hardware Support</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative gradient floor */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-900/10 to-transparent" />
    </section>;
};
export default Hero;