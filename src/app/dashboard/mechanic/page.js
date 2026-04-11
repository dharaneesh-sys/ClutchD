"use client";

import { useEffect } from "react";

import dynamic from "next/dynamic";
import { ProfileEditor } from "../../../components/mechanic/ProfileEditor";
import { AvailabilityToggle } from "../../../components/mechanic/AvailabilityToggle";
import { IncomingJobs } from "../../../components/mechanic/IncomingJobs";
import { EarningsChart } from "../../../components/mechanic/EarningsChart";
import { ErrorBoundary } from "../../../components/ui/ErrorBoundary";
import { useAuthStore } from "../../../store/authStore";
import { LogOut, Wrench } from "lucide-react";

// Reuse MapView for mechanic's navigation view (simplified for demo)
const NavigationMap = dynamic(
  () => import("../../../components/dashboard/MapView"),
  { 
    ssr: false,
    loading: () => <div className="w-full h-full bg-[#0a2a1a] rounded-2xl animate-pulse" />
  }
);

export default function MechanicDashboard() {
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
            <span className="text-sm font-semibold text-white">{user?.name || "Mechanic"}</span>
            <span className="text-[10px] text-emerald-100/60 uppercase tracking-wider">Provider Mode</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-300">
            <Wrench size={18} />
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
          
          {/* Left Column (Profile & Earnings) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="h-auto">
              <ErrorBoundary fallbackLabel="Availability Toggle">
                <AvailabilityToggle />
              </ErrorBoundary>
            </div>
            <div className="flex-1 min-h-[300px]">
              <ErrorBoundary fallbackLabel="Profile Editor">
                <ProfileEditor />
              </ErrorBoundary>
            </div>
            <div className="h-[300px]">
              <ErrorBoundary fallbackLabel="Earnings Chart">
                <EarningsChart />
              </ErrorBoundary>
            </div>
          </div>
          
          {/* Middle/Right Column (Jobs & Map) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="flex-1 min-h-[400px]">
              <ErrorBoundary fallbackLabel="Incoming Jobs">
                <IncomingJobs />
              </ErrorBoundary>
            </div>
            
            <div className="h-[300px] rounded-2xl overflow-hidden relative shadow-2xl border border-white/10">
              <ErrorBoundary fallbackLabel="Navigation Map">
                <NavigationMap />
              </ErrorBoundary>
               <div className="absolute top-4 left-4 z-[400] bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-xs font-semibold text-white flex items-center gap-2">
                 <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                 Navigation
               </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
