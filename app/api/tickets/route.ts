import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/tickets — list tickets
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = session.user.role === "ADMIN";

  const tickets = await prisma.ticket.findMany({
    where: isAdmin ? {} : { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      conversation: {
        select: {
          id: true,
          title: true,
          messages: {
            orderBy: { createdAt: "asc" },
            take: 5,
          },
        },
      },
    },
  });

  return NextResponse.json(
    tickets.map((t) => ({
      id: t.id,
      conversationId: t.conversationId,
      userId: t.userId,
      subject: t.subject,
      status: t.status,
      priority: t.priority,
      adminReply: t.adminReply,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
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
    }))
  );
}

// POST /api/tickets — create ticket
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { conversationId, subject, priority } = await req.json();

  if (!conversationId || !subject) {
    return NextResponse.json(
      { error: "conversationId and subject are required" },
      { status: 400 }
    );
  }

  // Check if ticket already exists
  const existing = await prisma.ticket.findUnique({
    where: { conversationId },
  });

  if (existing) {
    return NextResponse.json(existing, { status: 200 });
  }

  // Verify user owns conversation
  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId, userId: session.user.id },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const ticket = await prisma.ticket.create({
    data: {
      conversationId,
      userId: session.user.id,
      subject,
      priority: priority || "MEDIUM",
    },
  });

  return NextResponse.json(
    {
      id: ticket.id,
      conversationId: ticket.conversationId,
      subject: ticket.subject,
      status: ticket.status,
      priority: ticket.priority,
      createdAt: ticket.createdAt.toISOString(),
    },
    { status: 201 }
  );
}
