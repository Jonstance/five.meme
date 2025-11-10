import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  message,
  type,
  onClose
}) => {
  const typeStyles = {
    success: 'bg-accent-green border-accent-green/20 text-white',
    error: 'bg-accent-red border-accent-red/20 text-white',
    warning: 'bg-primary border-primary/20 text-white',
    info: 'bg-accent-blue border-accent-blue/20 text-white'
  };
  
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [id, onClose]);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -50, scale: 0.9 }}
      className={`
        fixed top-4 right-4 z-50 
        flex items-center gap-3 
        px-4 py-3 rounded-xl 
        border backdrop-blur-sm
        shadow-lg max-w-sm
        ${typeStyles[type]}
      `}
    >
      <span className="text-lg">{icons[type]}</span>
      <span className="font-medium">{message}</span>
      <button
        onClick={() => onClose(id)}
        className="ml-2 text-white/70 hover:text-white transition-colors"
      >
        ✕
      </button>
    </motion.div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastProps[] }> = ({ toasts }) => {
  return (
    <AnimatePresence>
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} />
      ))}
    </AnimatePresence>
  );
};