import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";

const http = httpRouter();

http.route({
  path: "/telegram",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const body = await request.json();
    
    // Check if this is a message
    if (body.message && body.message.text) {
      const text = body.message.text;
      const chatId = body.message.chat.id;
      const username = body.message.chat.title || body.message.chat.username || "Unknown Channel";

      // LOGIC: The user will send "/start <workspace_id>"
      if (text.startsWith("/start ")) {
        const workspaceId = text.split(" ")[1];
        
        if (workspaceId) {
          // Call internal mutation to link this chat to the workspace
          await ctx.runMutation(internal.accounts.linkTelegramInternal, {
            workspaceId: workspaceId,
            chatId: String(chatId),
            username: username,
          });

          // Send success message back to Telegram
          await sendTelegramReply(chatId, "✅ Connected to EasyPost! You can now schedule posts to this chat.");
        }
      }
    }

    return new Response(null, { status: 200 });
  }),
});

// Helper to reply to user
async function sendTelegramReply(chatId: number, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

export default http;