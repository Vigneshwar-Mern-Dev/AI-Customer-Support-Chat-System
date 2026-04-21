import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET /api/conversations — list user's conversations
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        ticket: {
          select: { id: true, status: true },
        },
      },
    });

    const result = conversations.map((conv) => ({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt.toISOString(),
      updatedAt: conv.updatedAt.toISOString(),
      lastMessage: conv.messages[0]
        ? {
            content: conv.messages[0].content,
            role: conv.messages[0].role,
            createdAt: conv.messages[0].createdAt.toISOString(),
          }
        : undefined,
      ticket: conv.ticket
        ? { id: conv.ticket.id, status: conv.ticket.status }
        : null,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET Conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json().catch(() => ({}));

    const conversation = await prisma.conversation.create({
      data: {
        userId: session.user.id,
        title: title || "New Conversation",
      },
    });

    return NextResponse.json(
      {
        id: conversation.id,
        title: conversation.title,
        createdAt: conversation.createdAt.toISOString(),
        updatedAt: conversation.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST Conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
