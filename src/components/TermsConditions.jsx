import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const TermsConditions = () => {
  return (
    <section id="terms" className="py-24 px-6 relative border-t border-white/5">
      <div className="container mx-auto max-w-4xl text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12">
          <ShieldCheck className="w-16 h-16 text-cyan-400 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Service Level Agreement</h2>
          <p className="text-slate-400">Review our enterprise terms, data protection policies, and compliance standards.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <GlassCard className="p-8 text-left text-slate-300 space-y-6">
            <div>
              <h4 className="text-white font-bold text-lg mb-2">1. Data Privacy & Compliance</h4>
              <p className="text-sm leading-relaxed">All support operations comply with SOC2, ISO 27001, and GDPR standards. Client data accessed during diagnostic sessions is sandboxed and destroyed immediately post-resolution.</p>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div>
              <h4 className="text-white font-bold text-lg mb-2">2. SLA Guarantees</h4>
              <p className="text-sm leading-relaxed">Our 99.99% uptime guarantee covers all managed services. Failure to meet Priority 1 response times results in automatic service credits applied to your account.</p>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div>
              <h4 className="text-white font-bold text-lg mb-2">3. Confidentiality</h4>
              <p className="text-sm leading-relaxed">Strict NDAs cover all engineering staff. We employ Zero Trust architecture for remote access, ensuring your proprietary systems remain fully isolated from unauthorized entry.</p>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </section>
  );
};

export default TermsConditions;