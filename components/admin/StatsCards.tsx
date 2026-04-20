"use client";

import { AdminStats } from "@/types";
import { Spinner } from "@/components/ui/Spinner";

interface StatsCardsProps {
  stats: AdminStats | null;
  loading: boolean;
}

interface StatCard {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  borderColor: string;
  subtitle: string;
}

export function StatsCards({ stats, loading }: StatsCardsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-[var(--surface)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const cards: StatCard[] = [
    {
      label: "Total Tickets",
      value: stats.totalTickets,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      subtitle: `${stats.totalUsers} users`,
    },
    {
      label: "Open",
      value: stats.openTickets,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      subtitle: "Needs attention",
    },
    {
      label: "Pending",
      value: stats.pendingTickets,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      subtitle: "In progress",
    },
    {
      label: "Resolved",
      value: stats.resolvedTickets,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "text-slate-400",
      bgColor: "bg-slate-500/10",
      borderColor: "border-slate-500/20",
      subtitle: `${stats.totalMessages} messages total`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className={`stat-card p-5 rounded-2xl bg-[var(--surface)] border ${card.borderColor} flex flex-col gap-3`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">
              {card.label}
            </span>
            <div className={`w-8 h-8 rounded-xl ${card.bgColor} flex items-center justify-center ${card.color}`}>
              {card.icon}
            </div>
          </div>
          <div>
            <p className={`text-3xl font-bold ${card.color}`}>
              {card.value}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
              {card.subtitle}
            </p>
          </div>
          {/* Progress bar */}
          {stats.totalTickets > 0 && card.label !== "Total Tickets" && (
            <div className="h-1 bg-[var(--surface-3)] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  card.label === "Open"
                    ? "bg-emerald-500"
                    : card.label === "Pending"
                    ? "bg-amber-500"
                    : "bg-slate-500"
                }`}
                style={{
                  width: `${Math.round((card.value / stats.totalTickets) * 100)}%`,
                }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
