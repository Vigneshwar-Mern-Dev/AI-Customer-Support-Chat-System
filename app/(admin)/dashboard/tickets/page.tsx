"use client";

import { useEffect, useState } from "react";
import { TicketsTable } from "@/components/admin/TicketsTable";
import { TicketData, TicketStatus } from "@/types";

const STATUS_FILTERS: Array<{ label: string; value: TicketStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Open", value: "OPEN" },
  { label: "Pending", value: "PENDING" },
  { label: "Resolved", value: "RESOLVED" },
];

export default function TicketsPage() {
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<TicketStatus | "ALL">("ALL");

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then(setTickets)
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    filter === "ALL"
      ? tickets
      : tickets.filter((t) => t.status === filter);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Support Tickets</h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            {tickets.length} total · {tickets.filter((t) => t.status === "OPEN").length} open
          </p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-6">
        {STATUS_FILTERS.map((f) => {
          const count =
            f.value === "ALL"
              ? tickets.length
              : tickets.filter((t) => t.status === f.value).length;
          return (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all
                ${filter === f.value
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/25"
                  : "bg-[var(--surface)] border border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                }
              `}
            >
              {f.label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full ${
                  filter === f.value
                    ? "bg-indigo-500/20 text-indigo-400"
                    : "bg-[var(--surface-3)] text-[var(--muted-foreground)]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <TicketsTable tickets={filtered} loading={loading} />
    </div>
  );
}
