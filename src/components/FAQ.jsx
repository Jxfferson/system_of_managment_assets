import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
];

  return (
    <section id="help" className="">
      <div className="container mx-auto max-w-3xl">

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div key={index} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
              <GlassCard hover={false} className={`transition-all duration-300 ${openIndex === index ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)] bg-slate-900/60' : ''}`}>
                <button onClick={() => setOpenIndex(openIndex === index ? null : index)} className="w-full px-6 py-6 flex items-center justify-between text-left group">
                  <span className={`text-lg font-semibold transition-colors ${openIndex === index ? 'text-cyan-400' : 'text-white group-hover:text-cyan-200'}`}>
                    {faq.question}
                  </span>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openIndex === index ? 'bg-cyan-500/20 text-cyan-400' : 'bg-white/5 text-slate-400 group-hover:bg-white/10'}`}>
                    {openIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </div>
                </button>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;