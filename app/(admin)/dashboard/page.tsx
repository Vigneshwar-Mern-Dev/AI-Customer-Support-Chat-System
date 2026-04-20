"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { StatsCards } from "@/components/admin/StatsCards";
import { TicketsTable } from "@/components/admin/TicketsTable";
import { AdminStats, TicketData } from "@/types";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
      })
      .finally(() => setLoadingStats(false));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Overview of your support system
        </p>
      </div>

      {/* Stats */}
      <section className="mb-8">
        <StatsCards stats={stats} loading={loadingStats} />
      </section>

      {/* Recent Tickets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[var(--foreground)]">Recent Tickets</h2>
          <Link
            href="/dashboard/tickets"
            className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            View all →
          </Link>
        </div>
        <TicketsTable
          tickets={(stats?.recentTickets ?? []) as TicketData[]}
          loading={loadingStats}
        />
      </section>
    </div>
  );
}
