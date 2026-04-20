import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.ticket.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();

  const adminEmail = process.env.ADMIN_EMAIL || "admin@support.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin@123";

  const adminHash = await bcrypt.hash(adminPassword, 12);
  const userHash = await bcrypt.hash("User@123", 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: "Support Admin",
      email: adminEmail,
      password: adminHash,
      role: "ADMIN",
    },
  });

  // Create demo user
  const user = await prisma.user.create({
    data: {
      name: "John Doe",
      email: "user@example.com",
      password: userHash,
      role: "USER",
    },
  });

  // Create a sample conversation
  const conversation = await prisma.conversation.create({
    data: {
      userId: user.id,
      title: "Billing Issue",
    },
  });

  // Add sample messages
  await prisma.message.createMany({
    data: [
      {
        conversationId: conversation.id,
        userId: user.id,
        role: "USER",
        content: "Hi, I have an issue with my subscription billing.",
      },
      {
        conversationId: conversation.id,
        role: "ASSISTANT",
        content:
          "Hello! I'm sorry to hear you're having billing issues. Could you please provide more details about what specifically went wrong? For example, were you charged an incorrect amount, or is there a charge you don't recognize?",
      },
      {
        conversationId: conversation.id,
        userId: user.id,
        role: "USER",
        content: "I was charged twice this month for the same subscription.",
      },
    ],
  });

  // Create a sample ticket
  await prisma.ticket.create({
    data: {
      conversationId: conversation.id,
      userId: user.id,
      subject: "Duplicate billing charge - Urgent",
      status: "OPEN",
      priority: "HIGH",
    },
  });

  console.log("✅ Seed complete!");
  console.log(`   Admin: ${adminEmail} / ${adminPassword}`);
  console.log("   User:  user@example.com / User@123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
