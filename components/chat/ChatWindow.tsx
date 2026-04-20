"use client";

import { useRef, useEffect } from "react";
import { MessageData } from "@/types";
import { MessageBubble, TypingIndicator } from "./MessageBubble";
import { Spinner } from "@/components/ui/Spinner";

interface ChatWindowProps {
  messages: MessageData[];
  loading: boolean;
  isTyping: boolean;
  newMessageIds?: Set<string>;
}

export function ChatWindow({ messages, loading, isTyping, newMessageIds }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Spinner size="lg" />
          <p className="text-sm text-[var(--muted-foreground)]">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (messages.length === 0 && !isTyping) {
    return (
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            How can I help you?
          </h3>
          <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">
            Ask me anything about your account, billing, technical issues, or product features. I'm here 24/7.
          </p>
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {["Billing issue", "Reset password", "Technical error", "Cancel subscription"].map((hint) => (
              <span
                key={hint}
                className="text-xs px-3 py-1.5 rounded-full bg-[var(--surface-3)] border border-[var(--border)] text-[var(--muted)] cursor-default"
              >
                {hint}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isNew={newMessageIds?.has(msg.id)}
        />
      ))}
      {isTyping && <TypingIndicator />}
      <div ref={bottomRef} />
    </div>
  );
}
