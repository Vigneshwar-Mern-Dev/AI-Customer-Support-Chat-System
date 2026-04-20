"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { ChatInput } from "@/components/chat/ChatInput";
import { Badge } from "@/components/ui/Badge";
import { MessageData } from "@/types";

export default function ChatPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [hasTicket, setHasTicket] = useState(false);
  const [ticketStatus, setTicketStatus] = useState<string | null>(null);
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());
  const [title, setTitle] = useState("Conversation");

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/conversations/${id}/messages`);
      if (res.ok) {
        const data: MessageData[] = await res.json();
        setMessages(data);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchConversationMeta = useCallback(async () => {
    const res = await fetch("/api/conversations");
    if (res.ok) {
      const convs = await res.json();
      const conv = convs.find((c: { id: string; title: string; ticket?: { status: string } | null }) => c.id === id);
      if (conv) {
        setTitle(conv.title);
        if (conv.ticket) {
          setHasTicket(true);
          setTicketStatus(conv.ticket.status);
        }
      }
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setHasTicket(false);
    setTicketStatus(null);
    fetchMessages();
    fetchConversationMeta();
  }, [id, fetchMessages, fetchConversationMeta]);

  const handleSend = async (content: string) => {
    setIsTyping(true);
    try {
      const res = await fetch(`/api/conversations/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const data = await res.json();
        const newIds = new Set<string>([data.userMessage.id, data.aiMessage.id]);
        setNewMessageIds(newIds);
        setMessages((prev) => [...prev, data.userMessage, data.aiMessage]);
        setTitle((prev) => (prev === "New Conversation" ? content.slice(0, 40) : prev));

        // Auto-escalate if AI suggests it
        if (data.shouldEscalate && !hasTicket) {
          await createTicket(content);
        }

        // Clear new message animation after 1s
        setTimeout(() => setNewMessageIds(new Set()), 1000);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const createTicket = async (subject?: string) => {
    const ticketSubject = subject
      ? subject.slice(0, 80)
      : messages[0]?.content?.slice(0, 80) || "Support Request";

    const res = await fetch("/api/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        conversationId: id,
        subject: ticketSubject,
        priority: "MEDIUM",
      }),
    });

    if (res.ok) {
      setHasTicket(true);
      setTicketStatus("OPEN");
    }
  };

  const handleEscalate = async () => {
    if (hasTicket) return;
    await createTicket();
  };

  return (
    <>
      {/* Header */}
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-[var(--foreground)] truncate max-w-xs">
            {title}
          </h2>
          {hasTicket && ticketStatus && (
            <Badge
              label={`Ticket: ${ticketStatus}`}
              variant={ticketStatus.toLowerCase() as "open" | "pending" | "resolved"}
              showDot
              pulse={ticketStatus === "OPEN"}
            />
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-[var(--muted-foreground)]">AI Active</span>
        </div>
      </div>

      {/* Chat Window */}
      <ChatWindow
        messages={messages}
        loading={loading}
        isTyping={isTyping}
        newMessageIds={newMessageIds}
      />

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        onEscalate={handleEscalate}
        disabled={loading}
        hasTicket={hasTicket}
      />
    </>
  );
}
