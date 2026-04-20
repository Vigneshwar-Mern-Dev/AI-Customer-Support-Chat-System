"use client";

import { useRouter } from "next/navigation";
import { TicketData } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";

interface TicketsTableProps {
  tickets: TicketData[];
  loading: boolean;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketsTable({ tickets, loading }: TicketsTableProps) {
  const router = useRouter();

  if (loading) {
    return (
      <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-16 border-b border-[var(--border)] bg-[var(--surface)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-12 text-center">
        <div className="w-12 h-12 rounded-2xl bg-[var(--surface-3)] flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">No tickets found</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-3 bg-[var(--surface-2)] border-b border-[var(--border)]">
        {["Subject", "User", "Status", "Priority", "Created"].map((h) => (
          <span key={h} className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {tickets.map((ticket, i) => (
        <div
          key={ticket.id}
          onClick={() => router.push(`/dashboard/tickets/${ticket.id}`)}
          className={`
            grid grid-cols-[2fr_1fr_1fr_1fr_1fr] gap-4 px-5 py-4 items-center
            cursor-pointer hover:bg-[var(--surface-3)] transition-colors duration-150
            ${i < tickets.length - 1 ? "border-b border-[var(--border)]" : ""}
            bg-[var(--surface)]
          `}
        >
          {/* Subject */}
          <div>
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {ticket.subject}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
              #{ticket.id.slice(-8)}
            </p>
          </div>

          {/* User */}
          <div className="flex items-center gap-2 min-w-0">
            <Avatar name={ticket.user.name} size="sm" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-[var(--foreground)] truncate">
                {ticket.user.name}
              </p>
            </div>
          </div>

          {/* Status */}
          <div>
            <Badge
              label={ticket.status}
              variant={ticket.status.toLowerCase() as "open" | "pending" | "resolved"}
              showDot
              pulse={ticket.status === "OPEN"}
            />
          </div>

          {/* Priority */}
          <div>
            <Badge
              label={ticket.priority}
              variant={ticket.priority.toLowerCase() as "low" | "medium" | "high" | "urgent"}
            />
          </div>

          {/* Date */}
          <p className="text-xs text-[var(--muted-foreground)]">
            {formatDate(ticket.createdAt)}
          </p>
        </div>
      ))}
    </div>
  );
}
