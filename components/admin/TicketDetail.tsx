"use client";

import { useState } from "react";
import { TicketData, TicketStatus, Priority } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { Avatar } from "@/components/ui/Avatar";

interface TicketDetailProps {
  ticket: TicketData;
  onUpdate: (updated: Partial<TicketData>) => void;
}

const statusOptions: TicketStatus[] = ["OPEN", "PENDING", "RESOLVED"];
const priorityOptions: Priority[] = ["LOW", "MEDIUM", "HIGH", "URGENT"];

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TicketDetail({ ticket, onUpdate }: TicketDetailProps) {
  const [status, setStatus] = useState<TicketStatus>(ticket.status);
  const [priority, setPriority] = useState<Priority>(ticket.priority);
  const [reply, setReply] = useState(ticket.adminReply || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/tickets/${ticket.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, priority, adminReply: reply }),
      });
      if (res.ok) {
        const updated = await res.json();
        
        // If a new message was created, append it to the local conversation state
        if (updated.newMessage) {
          updated.conversation = {
            ...ticket.conversation,
            messages: [...ticket.conversation.messages, updated.newMessage]
          };
          // Clear the reply input box
          setReply("");
        }

        onUpdate(updated);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Conversation Thread */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--foreground)]">{ticket.subject}</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Conversation #{ticket.conversationId.slice(-8)} · {formatTime(ticket.createdAt)}
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 max-h-[400px]">
            {ticket.conversation.messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "USER" ? "flex-row-reverse" : "flex-row"}`}
              >
                {msg.role === "USER" ? (
                  <Avatar name={ticket.user.name} size="sm" />
                ) : (
                  <Avatar name="AI" isAI size="sm" />
                )}
                <div
                  className={`
                    max-w-[75%] px-4 py-3 rounded-2xl text-sm
                    ${msg.role === "USER"
                      ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm"
                      : "bg-[var(--surface-3)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-sm"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${msg.role === "USER" ? "text-indigo-200" : "text-[var(--muted-foreground)]"}`}>
                    {formatTime(msg.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Reply */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <h4 className="text-sm font-semibold text-[var(--foreground)] mb-3">Admin Reply</h4>
          <Textarea
            id="admin-reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Write a reply to the user..."
            rows={4}
          />
          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs transition-opacity ${saved ? "text-emerald-400 opacity-100" : "opacity-0"}`}>
              ✓ Saved successfully
            </span>
            <Button onClick={handleSave} loading={saving} id="save-ticket-btn">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar — Ticket Meta */}
      <div className="flex flex-col gap-4">
        {/* User info */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-4">Customer</h4>
          <div className="flex items-center gap-3">
            <Avatar name={ticket.user.name} size="md" />
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{ticket.user.name}</p>
              <p className="text-xs text-[var(--muted-foreground)]">{ticket.user.email}</p>
            </div>
          </div>
        </div>

        {/* Status */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Status</h4>
          <div className="grid grid-cols-1 gap-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`
                  px-3 py-2 rounded-xl text-xs font-medium text-left transition-all
                  ${status === s
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400"
                    : "bg-[var(--surface-3)] border border-[var(--border)] text-[var(--muted)] hover:border-indigo-500/30"
                  }
                `}
              >
                <div className="flex items-center gap-2">
                  <Badge
                    label={s}
                    variant={s.toLowerCase() as "open" | "pending" | "resolved"}
                    showDot
                  />
                  {status === s && <span className="ml-auto">✓</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Priority */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5">
          <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider mb-3">Priority</h4>
          <div className="grid grid-cols-2 gap-2">
            {priorityOptions.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`
                  px-3 py-2 rounded-xl text-xs font-medium transition-all
                  ${priority === p
                    ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-400"
                    : "bg-[var(--surface-3)] border border-[var(--border)] text-[var(--muted)] hover:border-indigo-500/30"
                  }
                `}
              >
                <Badge
                  label={p}
                  variant={p.toLowerCase() as "low" | "medium" | "high" | "urgent"}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
          <h4 className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Details</h4>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Ticket ID</p>
            <p className="text-xs text-[var(--foreground)] font-mono mt-0.5">#{ticket.id.slice(-12)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Created</p>
            <p className="text-xs text-[var(--foreground)] mt-0.5">{formatTime(ticket.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--muted-foreground)]">Last Updated</p>
            <p className="text-xs text-[var(--foreground)] mt-0.5">{formatTime(ticket.updatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
