import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import FormSection from '@/components/FormSection';
import FormField from '@/components/FormField';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/DatePicker';
import { useToast } from '@/components/ui/use-toast';
import Modal from '@/components/ui/Modal';

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
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    message: '',
    details: null
  });

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  }, [errors]);

  const validateForm = useCallback(() => {
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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const generateRequestId = useCallback(() => {
    return 'OTD-' + Date.now().toString(36).toUpperCase() + '-' + 
           Math.random().toString(36).substring(2, 6).toUpperCase();
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const missingFields = Object.keys(errors).map(key => {
        const fieldNames = {
          fullName: 'Full Name',
          identification: 'Identification',
          email: 'Email',
          campaign: 'Campaign',
          deviceType: 'Device Type',
          description: 'Description',
          requestDate: 'Request Date',
          priority: 'Priority'
        };
        return fieldNames[key] || key;
      });

      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Incomplete Form',
        message: `Please fill in all required fields: ${missingFields.join(', ')}`,
        details: null
      });

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
      
      const requestId = generateRequestId();
      
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Request Sent Successfully! ✓',
        message: 'Your support request has been submitted. A confirmation email has been sent to your inbox.',
        details: {
          email: formData.email,
          requestId: requestId
        }
      });

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
      }, 5000);
    }, 2000);
  }, [formData, errors, validateForm, generateRequestId, toast]);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  return (
    <section id="schedule" className="py-24 px-6 relative z-10">
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        type={modalState.type}
        title={modalState.title}
        message={modalState.message}
        details={modalState.details}
      />

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
                  <option value="">Select Campaign</option>
                  <option value="T-Mobile">T-Mobile</option>
                  <option value="AT&T">AT&T</option>
                  <option value="Verizon">Verizon</option>
                  <option value="Sprint">Sprint</option>
                  <option value="Comcast">Comcast</option>
                  <option value="Charter">Charter</option>
                  <option value="Cox">Cox</option>
                  <option value="Spectrum">Spectrum</option>
                  <option value="CenturyLink">CenturyLink</option>
                  <option value="Frontier">Frontier</option>
                  <option value="Other">Other</option>
                </Select>
              </FormField>
              <FormField label="Device Type" required error={errors.deviceType}>
                <Select 
                  name="deviceType" 
                  value={formData.deviceType} 
                  onChange={handleChange} 
                  className={errors.deviceType ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''}
                >
                  <option value="">Select Device</option>
                  <option value="Desktop Computer">Desktop Computer</option>
                  <option value="Laptop">Laptop</option>
                  <option value="Server">Server</option>
                  <option value="Network Equipment">Network Equipment</option>
                  <option value="Mobile Device">Mobile Device</option>
                  <option value="Printer">Printer</option>
                  <option value="Router">Router</option>
                  <option value="Other">Other</option>
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

          <FormSection index={3} title="Request Date & Priority" description="When was this request submitted?">
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
              <FormField label="Priority Level" required error={errors.priority}>
                <Select 
                  name="priority" 
                  value={formData.priority} 
                  onChange={handleChange} 
                  className={errors.priority ? 'border-red-400 focus:border-red-400 focus:ring-red-400 focus:shadow-[0_0_20px_rgba(248,113,113,0.3)]' : ''}
                >
                  <option value="">Select Priority</option>
                  <option value="Low">Low - No rush</option>
                  <option value="Medium">Medium - Affecting some work</option>
                  <option value="High">High - Blocking significant work</option>
                  <option value="Urgent">Urgent - System down / Critical</option>
                </Select>
              </FormField>
            </div>
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
      </div>
    </section>
  );
};

export default React.memo(ScheduleSupport);