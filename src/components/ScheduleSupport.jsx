import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Send } from 'lucide-react';
import FormSection from '@/components/FormSection';
import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/use-toast';

const ScheduleSupport = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    fullName: '',
    identification: '',
    email: '',
    campaign: '',
    deviceType: '',
    deviceModel: '',
    serialNumber: '',
    description: '',
    affectedServices: '',
    requestDate: '',
    priority: '',
    businessImpact: '',
    additionalNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.identification.trim()) newErrors.identification = 'Identification Number is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.campaign) newErrors.campaign = 'Campaign is required';
    if (!formData.deviceType) newErrors.deviceType = 'Device Type is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.requestDate) newErrors.requestDate = 'Request Date is required';
    if (!formData.priority) newErrors.priority = 'Priority is required';
    if (!formData.businessImpact) newErrors.businessImpact = 'Business Impact is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ 
        title: "Validation Error", 
        description: "Please fill in all required fields correctly.", 
        variant: "destructive" 
      });
      const firstError = document.querySelector('.text-red-400');
      if (firstError) firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      toast({ 
        title: "Request Sent ✓", 
        description: "Our team will contact you shortly." 
      });
      setTimeout(() => {
        setFormData({
          fullName: '',
          identification: '',
          email: '',
          campaign: '',
          deviceType: '',
          deviceModel: '',
          serialNumber: '',
          description: '',
          affectedServices: '',
          requestDate: '',
          priority: '',
          businessImpact: '',
          additionalNotes: ''
        });
        setIsSubmitted(false);
      }, 5000);
    }, 2000);
  };

  return (
    <section id="schedule" className="py-24 px-6 relative z-10">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Comprehensive <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Support Request</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }} 
            transition={{ delay: 0.1 }} 
            className="text-slate-400 text-lg"
          >
            Please provide detailed information to help us resolve your issue efficiently.
          </motion.p>
        </div>

        {isSubmitted ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="text-center py-20 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"
          >
            <div className="w-24 h-24 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-cyan-400" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Request Confirmed</h3>
            <p className="text-slate-400 text-lg max-w-md mx-auto">
              We've received your comprehensive support request. A specialist will be assigned to your case immediately.
            </p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <FormSection index={0} title="Personal Information" description="Your contact details for this request.">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField label="Full Name" required error={errors.fullName}>
                  <Input 
                    name="fullName" 
                    value={formData.fullName} 
                    onChange={handleChange} 
                    className={errors.fullName ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''} 
                    placeholder="John Doe" 
                  />
                </FormField>
                <FormField label="Email Address" required error={errors.email}>
                  <Input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    className={errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''} 
                    placeholder="john@example.com" 
                  />
                </FormField>
                <FormField label="Identification Number" required error={errors.identification}>
                  <Input 
                    name="identification" 
                    value={formData.identification} 
                    onChange={handleChange} 
                    className={errors.identification ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''} 
                    placeholder="ID-12345678" 
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection index={1} title="Campaign & Device Information" description="Details about your campaign and affected equipment.">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField label="Campaign" required error={errors.campaign}>
                  <Select 
                    name="campaign" 
                    value={formData.campaign} 
                    onChange={handleChange} 
                    className={errors.campaign ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''}
                  >
                    <option value="" className="bg-slate-900 text-white">Select Campaign</option>
                    <option value="T-Mobile" className="bg-slate-900 text-white">T-Mobile</option>
                    <option value="AT&T" className="bg-slate-900 text-white">AT&T</option>
                    <option value="Verizon" className="bg-slate-900 text-white">Verizon</option>
                    <option value="Sprint" className="bg-slate-900 text-white">Sprint</option>
                    <option value="Comcast" className="bg-slate-900 text-white">Comcast</option>
                    <option value="Charter" className="bg-slate-900 text-white">Charter</option>
                    <option value="Cox" className="bg-slate-900 text-white">Cox</option>
                    <option value="Spectrum" className="bg-slate-900 text-white">Spectrum</option>
                    <option value="CenturyLink" className="bg-slate-900 text-white">CenturyLink</option>
                    <option value="Frontier" className="bg-slate-900 text-white">Frontier</option>
                    <option value="Other" className="bg-slate-900 text-white">Other</option>
                  </Select>
                </FormField>
                <FormField label="Device Type" required error={errors.deviceType}>
                  <Select 
                    name="deviceType" 
                    value={formData.deviceType} 
                    onChange={handleChange} 
                    className={errors.deviceType ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''}
                  >
                    <option value="" className="bg-slate-900 text-white">Select Device</option>
                    <option value="Desktop Computer" className="bg-slate-900 text-white">Desktop Computer</option>
                    <option value="Laptop" className="bg-slate-900 text-white">Laptop</option>
                    <option value="Server" className="bg-slate-900 text-white">Server</option>
                    <option value="Network Equipment" className="bg-slate-900 text-white">Network Equipment</option>
                    <option value="Mobile Device" className="bg-slate-900 text-white">Mobile Device</option>
                    <option value="Printer" className="bg-slate-900 text-white">Printer</option>
                    <option value="Router" className="bg-slate-900 text-white">Router</option>
                    <option value="Other" className="bg-slate-900 text-white">Other</option>
                  </Select>
                </FormField>
                <FormField label="Device Model/Brand" error={errors.deviceModel}>
                  <Input 
                    name="deviceModel" 
                    value={formData.deviceModel} 
                    onChange={handleChange} 
                    placeholder="e.g. Dell XPS, MacBook Pro" 
                  />
                </FormField>
                <FormField label="Serial Number/Asset ID" helpText="Optional, but helps speed up diagnostics.">
                  <Input 
                    name="serialNumber" 
                    value={formData.serialNumber} 
                    onChange={handleChange} 
                    placeholder="e.g. ABC123XYZ" 
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection index={2} title="Issue Details" description="Describe the problem you're experiencing.">
              <div className="space-y-6">
                <FormField label="Detailed Description" required error={errors.description}>
                  <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={4} 
                    className={errors.description ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''} 
                    placeholder="Please provide as much detail as possible..." 
                  />
                </FormField>
                <FormField label="Affected Services/Systems">
                  <Input 
                    name="affectedServices" 
                    value={formData.affectedServices} 
                    onChange={handleChange} 
                    placeholder="e.g. Email, Internal CRM, Wi-Fi" 
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection index={3} title="Request Date" description="When was this request submitted?">
              <div className="grid md:grid-cols-1 gap-6">
                <FormField label="Request Date" required error={errors.requestDate}>
                  <DatePicker 
                    name="requestDate" 
                    value={formData.requestDate} 
                    onChange={handleChange} 
                    max={new Date().toISOString().split('T')[0]} 
                    className={errors.requestDate ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''} 
                  />
                </FormField>
              </div>
            </FormSection>

            <FormSection index={4} title="Priority & Additional" description="Assess the impact on your operations.">
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <FormField label="Priority Level" required error={errors.priority}>
                  <Select 
                    name="priority" 
                    value={formData.priority} 
                    onChange={handleChange} 
                    className={errors.priority ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''}
                  >
                    <option value="" className="bg-slate-900 text-white">Select Priority</option>
                    <option value="Low" className="bg-slate-900 text-white">Low - No rush</option>
                    <option value="Medium" className="bg-slate-900 text-white">Medium - Affecting some work</option>
                    <option value="High" className="bg-slate-900 text-white">High - Blocking significant work</option>
                    <option value="Urgent" className="bg-slate-900 text-white">Urgent - System down / Critical</option>
                  </Select>
                </FormField>
                <FormField label="Business Impact" required error={errors.businessImpact}>
                  <Select 
                    name="businessImpact" 
                    value={formData.businessImpact} 
                    onChange={handleChange} 
                    className={errors.businessImpact ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''}
                  >
                    <option value="" className="bg-slate-900 text-white">Select Impact</option>
                    <option value="No Impact" className="bg-slate-900 text-white">No Impact</option>
                    <option value="Minor" className="bg-slate-900 text-white">Minor - Few users affected</option>
                    <option value="Moderate" className="bg-slate-900 text-white">Moderate - Team/Department affected</option>
                    <option value="Critical" className="bg-slate-900 text-white">Critical - Entire organization affected</option>
                  </Select>
                </FormField>
              </div>
              <FormField label="Additional Notes">
                <Textarea 
                  name="additionalNotes" 
                  value={formData.additionalNotes} 
                  onChange={handleChange} 
                  rows={2} 
                  placeholder="Any other relevant details?" 
                />
              </FormField>
            </FormSection>

            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }} 
              className="pt-4"
            >
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white py-5 rounded-2xl font-bold text-xl transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,211,238,0.5)] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Submitting Request...</span>
                ) : (
                  <>
                    <Send className="w-6 h-6" /> Submit Support Request
                  </>
                )}
              </button>
            </motion.div>
          </form>
        )}
      </div>
    </section>
  );
};

export default ScheduleSupport;