"use client";

import { AdminOverview } from "../../components/admin/AdminOverview";

export default function AdminPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Platform Overview</h2>
        <p className="text-emerald-100/60">High-level metrics and urgent actions for ClutchD.</p>
      </div>
      
      <AdminOverview />
    </div>
  );
}
