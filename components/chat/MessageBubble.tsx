"use client";

import { MessageData } from "@/types";
import { Avatar } from "@/components/ui/Avatar";
import { useSession } from "next-auth/react";

interface MessageBubbleProps {
  message: MessageData;
  isNew?: boolean;
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Simple markdown-like renderer
function renderContent(content: string): string {
  return content
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, "<code>$1</code>")
    .replace(/\n/g, "<br />")
    .replace(/^• /gm, "• ");
}

export function MessageBubble({ message, isNew = false }: MessageBubbleProps) {
  const { data: session } = useSession();
  const isUser = message.role === "USER";
  const isAI = message.role === "ASSISTANT";

  return (
    <div
      className={`flex items-end gap-3 ${isNew ? "animate-slide-up" : ""} ${
        isUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      {/* Avatar */}
      {isAI && <Avatar name="SupportAI" isAI size="sm" />}
      {isUser && (
        <Avatar name={session?.user?.name || "User"} size="sm" />
      )}

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        {isAI && (
          <span className="text-xs text-[var(--muted-foreground)] px-1 font-medium">
            SupportAI
          </span>
        )}

        <div
          className={`
            relative px-4 py-3 rounded-2xl shadow-sm text-sm leading-relaxed
            ${isUser
              ? "bg-gradient-to-br from-indigo-500 to-violet-600 text-white rounded-br-sm shadow-lg shadow-indigo-500/20"
              : "bg-[var(--surface-3)] text-[var(--foreground)] border border-[var(--border)] rounded-bl-sm"
            }
          `}
        >
          <div
            className="message-content"
            dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
          />
        </div>

        <span className="text-[10px] text-[var(--muted-foreground)] px-1">
          {formatTime(message.createdAt)}
        </span>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 animate-fade-in">
      <Avatar name="SupportAI" isAI size="sm" />
      <div className="bg-[var(--surface-3)] border border-[var(--border)] rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="bounce-dot w-2 h-2 rounded-full bg-indigo-400 inline-block"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
