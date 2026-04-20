"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/Button";

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  onEscalate: () => Promise<void>;
  disabled?: boolean;
  hasTicket?: boolean;
}

export function ChatInput({ onSend, onEscalate, disabled, hasTicket }: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [escalating, setEscalating] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || sending || disabled) return;

    setSending(true);
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSend(trimmed);
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [message, sending, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-resize
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = Math.min(el.scrollHeight, 120) + "px";
    }
  };

  const handleEscalate = async () => {
    setEscalating(true);
    try {
      await onEscalate();
    } finally {
      setEscalating(false);
    }
  };

  return (
    <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)]">
      {/* Escalate hint */}
      {!hasTicket && (
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-xs text-[var(--muted-foreground)]">
            Press <kbd className="px-1.5 py-0.5 bg-[var(--surface-3)] border border-[var(--border)] rounded text-[10px] font-mono">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 bg-[var(--surface-3)] border border-[var(--border)] rounded text-[10px] font-mono">Shift+Enter</kbd> for new line
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleEscalate}
            loading={escalating}
            disabled={disabled}
            id="escalate-btn"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Escalate to Human
          </Button>
        </div>
      )}

      {hasTicket && (
        <div className="flex items-center gap-2 mb-2 px-1 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <svg className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span className="text-xs text-amber-400">Support ticket created — our team will reply soon</span>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="message-input"
            value={message}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            rows={1}
            disabled={disabled || sending}
            className="
              w-full bg-[var(--surface-2)] border border-[var(--border)] rounded-xl
              px-4 py-3 text-sm text-[var(--foreground)] placeholder-[var(--muted-foreground)]
              focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50
              transition-all duration-200 resize-none min-h-[44px] max-h-[120px]
              disabled:opacity-50
            "
          />
        </div>
        <Button
          id="send-btn"
          onClick={handleSend}
          loading={sending}
          disabled={!message.trim() || disabled}
          className="h-11 w-11 !px-0 !py-0 flex-shrink-0 rounded-xl"
        >
          {!sending && (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </Button>
      </div>
    </div>
  );
}
