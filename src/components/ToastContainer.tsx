/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toast, closeToast } = useApp();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full p-4 pointer-events-none">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg shadow-xl border backdrop-blur-md ${
              toast.type === 'success'
                ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                : toast.type === 'error'
                ? 'bg-rose-50 text-rose-950 border-rose-200'
                : 'bg-amber-50 text-amber-950 border-amber-200'
            }`}
          >
            <div className="mt-0.5">
              {toast.type === 'success' && <CheckCircle className="h-5 w-5 text-emerald-600" />}
              {toast.type === 'error' && <AlertCircle className="h-5 w-5 text-rose-600" />}
              {toast.type === 'info' && <Info className="h-5 w-5 text-amber-600" />}
            </div>
            
            <div className="flex-1 text-sm font-medium">
              {toast.message}
            </div>

            <button
              onClick={closeToast}
              className="p-0.5 text-gray-500 hover:text-gray-800 rounded-md hover:bg-black/5 transition-colors cursor-pointer"
              aria-label="Dismiss toast"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
