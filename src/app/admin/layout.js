"use client";

import { useEffect } from "react";
import { Sidebar } from "../../components/admin/Sidebar";
import { usePathname } from "next/navigation";
import { useAuthStore } from "../../store/authStore";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = "/auth";
    } else if (user && user.role !== "admin") {
      window.location.href = `/dashboard/${user.role}`;
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated || !user || user.role !== "admin") {
    return <div className="h-screen w-full flex items-center justify-center bg-[#09090b]"><div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="h-screen w-full flex bg-[#09090b] overflow-hidden text-white relative z-10 p-4 gap-6">
      <div className="rounded-2xl overflow-hidden border border-white/5 shadow-2xl h-full">
         <Sidebar currentPath={pathname} />
      </div>
      
      <main className="flex-1 rounded-2xl bg-white/5 border border-white/5 shadow-2xl overflow-y-auto custom-scrollbar p-8">
        {children}
      </main>
    </div>
  );
}
