"use client";

import { useEffect } from "react";

import { useAuthStore } from "../../../store/authStore";
import { LogOut, Building2 } from "lucide-react";
import { GarageProfile } from "../../../components/garage/GarageProfile";
import { GarageJobQueue } from "../../../components/garage/GarageJobQueue";
import { GarageAnalytics } from "../../../components/garage/GarageAnalytics";

export default function GarageDashboard() {
  const { user, logout, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#09090b]"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="h-screen w-full flex flex-col p-4 sm:p-6 pb-0 overflow-hidden relative z-10 gap-6">
      
      {/* Top Navbar */}
      <header className="flex justify-between items-center px-6 py-4 bg-white/5 border border-white/10 backdrop-blur-xl rounded-2xl flex-shrink-0">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold tracking-tighter">M</div>
           <h1 className="text-xl font-bold text-white tracking-tight hidden sm:block">ClutchD</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold text-white">{user?.name || "Auto Garage"}</span>
            <span className="text-[10px] text-emerald-100/60 uppercase tracking-wider">Business Mode</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
            <Building2 size={18} />
          </div>
          <button 
            onClick={logout}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 flex items-center justify-center text-white/70 hover:text-red-400 transition-colors ml-2"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 overflow-y-auto custom-scrollbar pb-6 pr-2 lg:pr-0">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-[800px]">
          
          {/* Left Column (Profile & Analytics) */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
            <div className="flex-1 min-h-[400px]">
              <GarageProfile />
            </div>
            <div className="h-[450px]">
               <GarageAnalytics />
            </div>
          </div>
          
          {/* Middle/Right Column (Job Queue dispatching) */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
            <div className="flex-1 min-h-[800px]">
              <GarageJobQueue />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
