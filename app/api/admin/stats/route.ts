import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/admin/stats
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const [
    totalTickets,
    openTickets,
    pendingTickets,
    resolvedTickets,
    totalUsers,
    totalMessages,
    recentTickets,
  ] = await Promise.all([
    prisma.ticket.count(),
    prisma.ticket.count({ where: { status: "OPEN" } }),
    prisma.ticket.count({ where: { status: "PENDING" } }),
    prisma.ticket.count({ where: { status: "RESOLVED" } }),
    prisma.user.count({ where: { role: "USER" } }),
    prisma.message.count(),
    prisma.ticket.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, email: true } },
        conversation: { select: { id: true, title: true, messages: { take: 1 } } },
      },
    }),
  ]);

  return NextResponse.json({
    totalTickets,
    openTickets,
    pendingTickets,
    resolvedTickets,
    totalUsers,
    totalMessages,
    recentTickets: recentTickets.map((t) => ({
      id: t.id,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      createdAt: t.createdAt.toISOString(),
      user: t.user,
      conversation: {
        id: t.conversation.id,
        title: t.conversation.title,
        messages: t.conversation.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
        })),
      },
    })),
  });
}
