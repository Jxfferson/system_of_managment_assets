import { useEffect } from 'react';

export const useKeyboardShortcut = (keyCombo, callback, options = {}) => {
  const {
    preventDefault = true,
    enableOnInput = false,
    enabled = true
  } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event) => {
      if (!enableOnInput) {
        const target = event.target;
        const tagName = target.tagName.toLowerCase();
        const isEditable = target.isContentEditable || tagName === 'input' || tagName === 'textarea' || tagName === 'select';
        if (isEditable) return;
      }

      const keys = keyCombo.toLowerCase().split('+').map(k => k.trim());
      
      const matchCtrl = keys.includes('ctrl') ? (event.ctrlKey || event.metaKey) : !keys.includes('ctrl');
      const matchAlt = keys.includes('alt') ? event.altKey : !keys.includes('alt');
      const matchShift = keys.includes('shift') ? event.shiftKey : !keys.includes('shift');
      const matchKey = keys.some(k => ['ctrl', 'alt', 'shift'].includes(k) ? false : k === event.key.toLowerCase());
      
      if (matchCtrl && matchAlt && matchShift && matchKey) {
        if (preventDefault) event.preventDefault();
        callback(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [keyCombo, callback, preventDefault, enableOnInput, enabled]);
};

export default useKeyboardShortcut;