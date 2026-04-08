"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LoginCard } from "../../components/auth/LoginCard";
import { SignUpCard } from "../../components/auth/SignUpCard";

export default function AuthPage() {
  const [isLoginView, setIsLoginView] = useState(true);

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7742/ingest/6df102a3-018b-4c90-a04c-3daa6827d6d1',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'ab7357'},body:JSON.stringify({sessionId:'ab7357',runId:'pre-fix',hypothesisId:'H6',location:'src/app/auth/page.js:12',message:'Auth page mounted',data:{path:typeof window!=='undefined'?window.location.pathname:null},timestamp:Date.now()})}).catch(()=>{fetch('/api/debug',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({sessionId:'ab7357',runId:'pre-fix',hypothesisId:'H6',location:'src/app/auth/page.js:12',message:'Auth page mounted (proxy fallback)',data:{path:typeof window!=='undefined'?window.location.pathname:null},timestamp:Date.now()})}).catch(()=>{});});
    // #endregion
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-emerald-500/20 rounded-full blur-[100px] float-slow pointer-events-none" />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-teal-400/20 rounded-full blur-[120px] float-medium pointer-events-none" />

      {/* Main Content */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center px-4 relative z-10">
        
        {/* Left Column (Brand/Marketing) */}
        <div className="order-2 lg:order-1 flex flex-col justify-center text-center lg:text-left lg:pr-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md hidden sm:inline-flex">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-100">Now live in Coimbatore</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white tracking-tight mb-6 leading-[1.1]">
              Vehicle Service,<br />
              <span className="gradient-text">On Demand.</span>
            </h1>
            
            <p className="text-lg text-emerald-100/80 mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Connect instantly with top-rated mechanics and premium garages nearby. 
              Real-time tracking, transparent pricing, and trusted professionals.
            </p>

            {/* Feature list */}
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto lg:mx-0 text-left">
              {[
                { title: "24/7 Support", desc: "Always available" },
                { title: "Live Tracking", desc: "See mechanic on map" },
                { title: "Verified Pros", desc: "Background checked" },
                { title: "Upfront Pricing", desc: "No hidden fees" }
              ].map((feat, idx) => (
                <div key={idx} className="flex flex-col p-4 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                  <span className="font-semibold text-emerald-300 mb-1">{feat.title}</span>
                  <span className="text-sm text-white/50">{feat.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Right Column (Forms) */}
        <div className="order-1 lg:order-2 flex flex-col items-center lg:items-end w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full flex justify-center lg:justify-end"
          >
            <AnimatePresence mode="wait">
              {isLoginView ? (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex justify-center lg:justify-end"
                >
                  <LoginCard />
                </motion.div>
              ) : (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                  transition={{ duration: 0.3 }}
                  className="w-full flex justify-center lg:justify-end"
                >
                  <SignUpCard />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-6 text-center lg:text-right w-full lg:max-w-md lg:mr-2"
          >
            <p className="text-emerald-100/70">
              {isLoginView ? "Don't have an account?" : "Already have an account?"}
              <button
                onClick={() => setIsLoginView(!isLoginView)}
                className="ml-2 font-semibold text-emerald-400 hover:text-emerald-300 transition-colors focus:outline-none"
              >
                {isLoginView ? "Sign Up" : "Log In"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
