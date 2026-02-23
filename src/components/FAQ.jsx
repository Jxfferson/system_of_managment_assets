import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { question: 'What types of technical support do you provide?', answer: 'We offer comprehensive enterprise IT support including software troubleshooting, network configuration, security audits, server maintenance, and cloud infrastructure management.' },
    { question: 'What is your guaranteed response time?', answer: 'For critical Priority 1 issues, we guarantee a 15-minute response time. Standard requests are addressed within 2 hours during normal business operations.' },
    { question: 'Do you offer remote support?', answer: 'Yes, 95% of our support is handled securely via remote access, enabling faster resolution times. On-site dispatch is available for hardware failures.' },
    { question: 'How do you ensure data security?', answer: 'We use military-grade AES-256 encryption, MFA, and strict Zero Trust access protocols. All our engineers are certified and undergo regular security clearances.' },
  ];

  return (
    <section id="help" className="py-24 px-6 relative">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-4xl md:text-5xl font-bold text-white mb-6">
            Common <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Inquiries</span>
          </motion.h2>
        </div>

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
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
                      <div className="px-6 pb-6 text-slate-300 leading-relaxed border-t border-white/5 pt-4">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;