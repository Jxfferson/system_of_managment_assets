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
          <motion.div initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          duration: 0.8,
          ease: "easeOut"
        }} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900/60 border border-cyan-500/30 backdrop-blur-md mb-8">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-cyan-100"></span>
          </motion.div>

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
            Advanced Technical <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 pb-2">
              Support Solutions
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
            Empower your business with fast, secure, and reliable IT assistance. We handle the complex technical challenges so you can focus on growth.
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
              <span className="relative z-10">Schedule Consultation</span>
              <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800/80 border border-slate-700 hover:border-slate-500 text-white text-lg font-medium rounded-full transition-all backdrop-blur-sm">
              View Services
            </button>
          </motion.div>

          {/* Animated Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
            {icons.map(({
            Icon,
            label,
            color
          }, index) => <motion.div key={index} initial={{
            opacity: 0,
            y: 40
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8,
            delay: 0.5 + index * 0.1
          }} whileHover={{
            y: -5
          }} className="flex flex-col items-center p-6 rounded-2xl bg-slate-900/30 border border-white/5 backdrop-blur-md">
                <div className={`w-14 h-14 rounded-xl mb-4 flex items-center justify-center bg-gradient-to-br ${color} shadow-lg`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white">{label} Infrastructure</h3>
              </motion.div>)}
          </div>
        </div>
      </div>
      
      {/* Decorative gradient floor */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-cyan-900/10 to-transparent" />
    </section>;
};
export default Hero;