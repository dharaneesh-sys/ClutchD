"use client";

import { JobMonitor } from "../../../components/admin/JobMonitor";

export default function JobsPage() {
  return (
    <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Active Jobs Monitor</h2>
        <p className="text-emerald-100/60">Live view of all service requests across the platform.</p>
      </div>
      
      <div className="flex-1 min-h-[500px]">
        <JobMonitor />
      </div>
    </div>
  );
}
