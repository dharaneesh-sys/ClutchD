"use client";

import { UserTable } from "../../../components/admin/UserTable";

export default function UsersPage() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white tracking-tight mb-2">Users & Providers</h2>
        <p className="text-emerald-100/60">Manage all registered accounts on the platform.</p>
      </div>
      
      <UserTable />
    </div>
  );
}
