"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TicketDetail } from "@/components/admin/TicketDetail";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { TicketData } from "@/types";

export default function TicketDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [ticket, setTicket] = useState<TicketData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/tickets/${params.id}`)
      .then((r) => r.json())
      .then(setTicket)
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="p-8 text-center">
        <p className="text-[var(--muted)]">Ticket not found</p>
        <Button onClick={() => router.back()} variant="secondary" className="mt-4" id="back-btn">
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/tickets")}
          id="back-to-tickets-btn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          All Tickets
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-[var(--foreground)]">{ticket.subject}</h1>
            <Badge
              label={ticket.status}
              variant={ticket.status.toLowerCase() as "open" | "pending" | "resolved"}
              showDot
              pulse={ticket.status === "OPEN"}
            />
            <Badge
              label={ticket.priority}
              variant={ticket.priority.toLowerCase() as "low" | "medium" | "high" | "urgent"}
            />
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-1">
            #{ticket.id.slice(-12)} · Opened by {ticket.user.name}
          </p>
        </div>
      </div>

      <TicketDetail
        ticket={ticket}
        onUpdate={(updated) => setTicket((prev) => prev ? { ...prev, ...updated } : prev)}
      />
    </div>
  );
}
