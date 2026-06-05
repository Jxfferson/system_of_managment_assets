export const sanitizeString = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/expression\(/gi, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .slice(0, 1000);
};

export const sanitizeText = (str) => {
  if (!str || typeof str !== 'string') return '';
  
  return str
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/on\w+=/gi, '')
    .replace(/expression\(/gi, '')
    .replace(/[\x00-\x1F\x7F]/g, '')
    .slice(0, 1000);
};

export const escapeHtml = (text) => {
  if (!text) return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  return text.replace(/[&<>"'`=\/]/g, (char) => map[char]);
};

export const isSafeInput = (str) => {
  if (!str) return true;
  
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /eval\s*\(/gi,
    /document\.(cookie|write|location)/gi,
    /window\.(location|open|close)/gi,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(str));
};