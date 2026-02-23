import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import GlassCard from '@/components/GlassCard';

const ContactUs = () => {
  return (
    <section id="contact" className="py-24 px-6 relative">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Connect?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Our support team is available 24/7 to help you with your issues. Contact us directly or submit a request, and we'll get back to you as soon as possible.
            </p>
            
            <div className="space-y-6">
              {[
                { icon: Phone, title: 'Emergency Hotlines', desc: '+1 (833) 844-3020' },
                { icon: Mail, title: 'Support Email', desc: 'info@onetouchdirect.com' },
                { icon: MapPin, title: 'Global HQ', desc: '4902 W Sligh Ave, Tampa, FL 33634' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-6 h-6 text-cyan-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-lg">{item.title}</h4>
                    <p className="text-slate-400 whitespace-pre-line mt-1">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <GlassCard className="p-8 md:p-10">
              <h3 className="text-2xl font-bold text-white mb-6">Send a Quick Message</h3>
              <form className="space-y-6">
                <div>
                  <input type="text" placeholder="Your Name" className="input-premium" />
                </div>
                <div>
                  <input type="email" placeholder="Work Email" className="input-premium" />
                </div>
                <div>
                  <textarea placeholder="How can we assist you today?" rows={4} className="input-premium resize-none" />
                </div>
                <button type="button" className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-semibold flex items-center justify-center gap-2 transition-all">
                  Send Message <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactUs;