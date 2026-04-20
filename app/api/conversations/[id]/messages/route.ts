import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAIResponse } from "@/lib/ai";
import { ChatMessage } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/conversations/[id]/messages
export async function GET(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Verify ownership
  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId:
        session.user.role === "ADMIN" ? undefined : session.user.id,
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      conversationId: m.conversationId,
      userId: m.userId,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}

// POST /api/conversations/[id]/messages — send message, get AI response
export async function POST(req: NextRequest, { params }: RouteParams) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { content } = await req.json();

  if (!content?.trim()) {
    return NextResponse.json(
      { error: "Message content is required" },
      { status: 400 }
    );
  }

  // Verify ownership
  const conversation = await prisma.conversation.findFirst({
    where: { id, userId: session.user.id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        take: 20,
      },
    },
  });

  if (!conversation) {
    return NextResponse.json(
      { error: "Conversation not found" },
      { status: 404 }
    );
  }

  // Save user message
  const userMessage = await prisma.message.create({
    data: {
      conversationId: id,
      userId: session.user.id,
      role: "USER",
      content: content.trim(),
    },
  });

  // Update conversation title from first message
  let currentTitle = conversation.title;
  if (conversation.messages.length === 0 && conversation.title === "New Conversation") {
    currentTitle =
      content.trim().slice(0, 50) + (content.length > 50 ? "..." : "");
    await prisma.conversation.update({
      where: { id },
      data: { title: currentTitle, updatedAt: new Date() },
    });
  } else {
    await prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  }

  // Build message history for AI
  const history: ChatMessage[] = conversation.messages.map((m) => ({
    role: m.role === "USER" ? "user" : "assistant",
    content: m.content,
  }));
  history.push({ role: "user", content: content.trim() });

  // Get AI response
  const aiResult = await getAIResponse(history);

  // Save AI response
  const aiMessage = await prisma.message.create({
    data: {
      conversationId: id,
      role: "ASSISTANT",
      content: aiResult.content,
    },
  });

  // Auto-create ticket if AI escalated/failed
  if (aiResult.shouldEscalate) {
    const existingTicket = await prisma.ticket.findUnique({
      where: { conversationId: id },
    });

    if (!existingTicket) {
      await prisma.ticket.create({
        data: {
          conversationId: id,
          userId: session.user.id,
          subject: `Escalated: ${currentTitle}`,
          priority: "HIGH",
        },
      });
    }
  }

  return NextResponse.json({
    userMessage: {
      id: userMessage.id,
      role: userMessage.role,
      content: userMessage.content,
      createdAt: userMessage.createdAt.toISOString(),
    },
    aiMessage: {
      id: aiMessage.id,
      role: aiMessage.role,
      content: aiResult.content,
      createdAt: aiMessage.createdAt.toISOString(),
    },
    shouldEscalate: aiResult.shouldEscalate,
  });
}
