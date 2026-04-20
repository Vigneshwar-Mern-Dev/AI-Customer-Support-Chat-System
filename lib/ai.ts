import { ChatMessage, AIResponse } from "@/types";

// Phrases that indicate the AI lacks confidence or needs escalation
const ESCALATION_TRIGGERS = [
  "i don't know",
  "i'm not sure",
  "i cannot help",
  "i can't help",
  "please contact support",
  "contact our team",
  "speak to a human",
  "transfer you to",
  "escalate this",
  "beyond my knowledge",
  "i apologize, but i",
  "i'm unable to",
  "i cannot provide",
];

const SYSTEM_PROMPT = `You are a helpful and professional customer support AI assistant for our software platform. 
Your role is to:
- Answer questions about account management, billing, technical issues, and product features
- Be friendly, concise, and solution-oriented
- If you genuinely cannot answer a question or if it requires account-specific access, say: "I'll escalate this to our support team who can help you better."
- Keep responses under 200 words unless explaining complex steps
- Never make up information about account balances, order details, or personal data you don't have access to`;

// Smart mock responses for when no OpenAI key is present
const MOCK_RESPONSES: Record<string, string> = {
  billing:
    "I can help with billing questions! Common issues include:\n\n• **Duplicate charges** — usually resolve within 3-5 business days\n• **Subscription upgrades** — changes take effect immediately\n• **Refunds** — processed within 5-7 business days\n\nCould you tell me more specifically what's happening with your billing?",
  password:
    "To reset your password:\n\n1. Go to the login page\n2. Click **'Forgot Password'**\n3. Enter your email address\n4. Check your inbox for the reset link (valid for 24 hours)\n\nIf you don't receive the email, check your spam folder. Need more help?",
  account:
    "I can assist with account-related questions! You can manage your account settings, update your profile, change your email, or adjust notification preferences from the **Account Settings** page.\n\nWhat specific account issue are you experiencing?",
  cancel:
    "I understand you'd like to cancel your subscription. Before we proceed, I want to make sure we can't resolve any issues you're having!\n\nIf you're sure, you can cancel from **Settings → Subscription → Cancel Plan**. Your access continues until the end of your billing period.\n\nIs there anything specific that made you want to cancel?",
  refund:
    "Our refund policy allows refunds within **30 days** of purchase for annual plans. Monthly subscriptions are non-refundable but you can cancel anytime.\n\nTo request a refund, I'll escalate this to our support team who can help you better.",
  error:
    "I'm sorry you're experiencing an error! To help troubleshoot:\n\n1. **Refresh the page** and try again\n2. **Clear your browser cache** (Ctrl+Shift+R)\n3. **Try a different browser**\n4. Check our **status page** for any ongoing incidents\n\nCould you describe what error message you're seeing?",
  slow: "Performance issues can be frustrating! Here's what typically helps:\n\n• Clear your browser cache and cookies\n• Disable browser extensions temporarily\n• Try on a different network\n• Check your internet connection speed\n\nIf the issue persists, it might be on our end — I'll escalate this to our support team who can help you better.",
};

function getMockResponse(messages: ChatMessage[]): AIResponse {
  const lastUserMessage = [...messages]
    .reverse()
    .find((m) => m.role === "user");
  const content = lastUserMessage?.content.toLowerCase() || "";

  for (const [keyword, response] of Object.entries(MOCK_RESPONSES)) {
    if (content.includes(keyword)) {
      const shouldEscalate = response.toLowerCase().includes("escalate");
      return { content: response, shouldEscalate };
    }
  }

  // Default response
  return {
    content: `Thank you for reaching out! I'm here to help with any questions about your account, billing, technical issues, or product features.\n\nCould you provide more details about what you need help with? The more specific you are, the better I can assist you!`,
    shouldEscalate: false,
  };
}

function checkShouldEscalate(content: string): boolean {
  const lower = content.toLowerCase();
  return ESCALATION_TRIGGERS.some((trigger) => lower.includes(trigger));
}

export async function getAIResponse(
  messages: ChatMessage[]
): Promise<AIResponse> {
  // Use mock if no API key
  if (!process.env.OPENAI_API_KEY) {
    // Simulate a small delay to feel realistic
    await new Promise((resolve) => setTimeout(resolve, 800));
    return getMockResponse(messages);
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages.slice(-10),
        ],
        max_tokens: 400,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const content: string =
      data.choices?.[0]?.message?.content ||
      "I apologize, but I couldn't generate a response. Please try again.";

    return {
      content,
      shouldEscalate: checkShouldEscalate(content),
    };
  } catch (error) {
    console.error("OpenAI error, falling back to mock:", error);
    return getMockResponse(messages);
  }
}
