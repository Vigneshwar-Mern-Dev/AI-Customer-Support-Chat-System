import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/tickets/[id] — update ticket (admin only)
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const { id } = await params;
  const { status, priority, adminReply } = await req.json();

  const existingTicket = await prisma.ticket.findUnique({ where: { id } });
  if (!existingTicket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  let newMessage = null;

  if (adminReply !== undefined && adminReply.trim() !== "") {
    newMessage = await prisma.message.create({
      data: {
        conversationId: existingTicket.conversationId,
        role: "ASSISTANT",
        content: `**Support Admin:**\n${adminReply.trim()}`,
      },
    });
  }

  const ticket = await prisma.ticket.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(priority && { priority }),
      // Clear the adminReply field so it acts as a composer
      ...(adminReply !== undefined && { adminReply: "" }),
      updatedAt: new Date(),
    },
  });

  return NextResponse.json({
    id: ticket.id,
    status: ticket.status,
    priority: ticket.priority,
    adminReply: ticket.adminReply,
    updatedAt: ticket.updatedAt.toISOString(),
    newMessage: newMessage
      ? {
          id: newMessage.id,
          role: newMessage.role,
          content: newMessage.content,
          createdAt: newMessage.createdAt.toISOString(),
        }
      : null,
  });
}

// GET /api/tickets/[id] — get single ticket
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      conversation: {
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Non-admins can only see their own tickets
  if (session.user.role !== "ADMIN" && ticket.userId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json({
    id: ticket.id,
    conversationId: ticket.conversationId,
    userId: ticket.userId,
    subject: ticket.subject,
    status: ticket.status,
    priority: ticket.priority,
    adminReply: ticket.adminReply,
    createdAt: ticket.createdAt.toISOString(),
    updatedAt: ticket.updatedAt.toISOString(),
    user: ticket.user,
    conversation: {
      id: ticket.conversation.id,
      title: ticket.conversation.title,
      messages: ticket.conversation.messages.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      })),
    },
  });
}
