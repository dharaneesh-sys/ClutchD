import { useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../lib/utils";

export function Modal({ isOpen, onClose, title, children, className, maxWidth = "max-w-md" }) {
  // Prevent scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle ESC key — only when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 py-12 px-4 sm:px-6 overflow-y-auto w-full h-full pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              className={cn(
                "relative w-full rounded-2xl border border-white/20 bg-[#064e3b]/95 p-6 shadow-2xl backdrop-blur-3xl pointer-events-auto",
                maxWidth,
                className
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white tracking-tight">{title}</h2>
                <button
                  onClick={onClose}
                  className="rounded-full p-1.5 text-white/60 hover:bg-white/10 hover:text-white transition-colors focus:outline-none"
                >
                  <X size={20} />
                </button>
              </div>

               {/* Content */}
               <div className="max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 custom-scrollbar">
                {children}
               </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
