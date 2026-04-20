// Types shared across the application

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AIResponse {
  content: string;
  shouldEscalate: boolean;
}

export type TicketStatus = "OPEN" | "PENDING" | "RESOLVED";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";
export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type UserRole = "USER" | "ADMIN";

export interface ConversationWithPreview {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: {
    content: string;
    role: MessageRole;
    createdAt: string;
  };
  ticket?: {
    id: string;
    status: TicketStatus;
  } | null;
}

export interface MessageData {
  id: string;
  conversationId: string;
  userId?: string | null;
  role: MessageRole;
  content: string;
  createdAt: string;
}

export interface TicketData {
  id: string;
  conversationId: string;
  userId: string;
  subject: string;
  status: TicketStatus;
  priority: Priority;
  adminReply?: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  conversation: {
    id: string;
    title: string;
    messages: MessageData[];
  };
}

export interface AdminStats {
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  resolvedTickets: number;
  totalUsers: number;
  totalMessages: number;
  recentTickets: TicketData[];
}
