"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { ConversationWithPreview } from "@/types";

interface ChatSidebarProps {
  activeConversationId?: string;
  onClose?: () => void;
}

export function ChatSidebar({ activeConversationId, onClose }: ChatSidebarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Refresh sidebar every 30 seconds
    const interval = setInterval(fetchConversations, 30000);
    return () => clearInterval(interval);
  }, [pathname]);

  const handleNewChat = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "New Conversation" }),
      });
      if (res.ok) {
        const conv = await res.json();
        router.push(`/chat/${conv.id}`);
        fetchConversations();
        onClose?.();
      }
    } finally {
      setCreating(false);
    }
  };

  function formatTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${Math.floor(diffHours)}h ago`;
    if (diffDays < 7) return `${Math.floor(diffDays)}d ago`;
    return date.toLocaleDateString();
  }

  return (
    <aside className="w-72 sm:w-80 lg:w-72 flex flex-col h-full border-r border-[var(--border)] bg-[var(--surface)] shadow-2xl lg:shadow-none">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <span className="font-semibold text-[var(--foreground)]">SupportAI</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="lg:hidden p-2 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <Button
          onClick={handleNewChat}
          loading={creating}
          className="w-full"
          id="new-chat-btn"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Conversation
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto py-2">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner />
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-3)] flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[var(--muted-foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">No conversations yet</p>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">Start a new conversation above</p>
          </div>
        ) : (
          conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => {
                router.push(`/chat/${conv.id}`);
                onClose?.();
              }}
              className={`
                w-full text-left px-4 py-3 hover:bg-[var(--surface-3)] transition-all duration-150
                border-l-2 group
                ${activeConversationId === conv.id
                  ? "bg-[var(--surface-3)] border-indigo-500"
                  : "border-transparent"
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-medium truncate ${
                      activeConversationId === conv.id
                        ? "text-indigo-400"
                        : "text-[var(--foreground)]"
                    }`}>
                      {conv.title}
                    </p>
                    {conv.ticket && (
                      <Badge
                        label={conv.ticket.status.toLowerCase()}
                        variant={conv.ticket.status.toLowerCase() as "open" | "pending" | "resolved"}
                        showDot
                        pulse={conv.ticket.status === "OPEN"}
                      />
                    )}
                  </div>
                  {conv.lastMessage && (
                    <p className="text-xs text-[var(--muted-foreground)] truncate mt-0.5">
                      {conv.lastMessage.role === "ASSISTANT" ? "AI: " : "You: "}
                      {conv.lastMessage.content}
                    </p>
                  )}
                </div>
                <span className="text-xs text-[var(--muted-foreground)] flex-shrink-0 mt-0.5">
                  {formatTime(conv.updatedAt)}
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-3">
          <Avatar name={session?.user?.name || "User"} size="sm" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--foreground)] truncate">
              {session?.user?.name}
            </p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">
              {session?.user?.email}
            </p>
          </div>
          <button
            onClick={() => {
              onClose?.();
              signOut({ callbackUrl: "/login" });
            }}
            className="p-1.5 rounded-lg hover:bg-[var(--surface-3)] text-[var(--muted-foreground)] hover:text-red-400 transition-colors"
            title="Sign out"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
