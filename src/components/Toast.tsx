import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, action?: Toast['action']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info', action?: Toast['action']) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, action }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 2500); // Changed to 2.5s per spec
  }, []);

  const getTypeStyles = (type: ToastType) => {
    switch (type) {
      case 'success': return 'border-l-success';
      case 'error': return 'border-l-danger';
      case 'warning': return 'border-l-warning';
      case 'info': return 'border-l-accent';
      default: return 'border-l-border';
    }
  };

  const getTypeIcon = (type: ToastType) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'error': return <XCircle className="w-4 h-4 text-danger" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'info': return <Info className="w-4 h-4 text-accent" />;
      default: return null;
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-4 left-0 right-0 z-[100] flex flex-col items-center space-y-2 pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className={`pointer-events-auto flex items-center justify-between w-full max-w-sm bg-bg-elevated border border-border border-l-[4px] shadow-lg rounded-[8px] p-[10px_16px] ${getTypeStyles(toast.type)}`}
            >
              <div className="flex items-center space-x-2.5">
                {getTypeIcon(toast.type)}
                <span className="text-[13px] font-medium text-text-primary">{toast.message}</span>
              </div>
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action!.onClick();
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  className="ml-4 text-[11px] font-semibold text-accent hover:text-accent-hover uppercase tracking-[0.5px] transition-colors"
                >
                  {toast.action.label}
                </button>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
