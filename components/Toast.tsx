'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: Toast = { id, message, type };

    setToasts(prev => [...prev, newToast]);

    // 3초 후 자동 제거
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, 3000);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const getToastStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400';
      case 'error':
        return 'bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30 text-red-400';
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400';
      case 'info':
      default:
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400';
    }
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}

      {/* Toast Container */}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.8 }}
              transition={{ duration: 0.3 }}
              className={`glass border rounded-lg p-4 shadow-lg cursor-pointer ${getToastStyle(toast.type)}`}
              onClick={() => removeToast(toast.id)}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">{getIcon(toast.type)}</span>
                <p className="text-sm font-semibold flex-1">{toast.message}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}
