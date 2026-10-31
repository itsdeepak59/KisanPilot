import { timingSafeEqual } from "node:crypto";
import { createServerSupabaseClient } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/telegram";
import { withDatabaseRetry } from "@/lib/db";

type TelegramUpdate = {
  message?: { text?: unknown; chat?: { id?: string | number } };
};

export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const receivedSecret = request.headers.get("x-telegram-bot-api-secret-token");
  if (!secret) return Response.json({ ok: false, error: "Telegram webhook is not configured" }, { status: 503 });
  if (!receivedSecret || receivedSecret.length !== secret.length || !timingSafeEqual(Buffer.from(receivedSecret), Buffer.from(secret))) {
    return Response.json({ ok: false, error: "Unauthorized Telegram webhook" }, { status: 401 });
  }

  let update: TelegramUpdate;
  try {
    update = (await request.json()) as TelegramUpdate;
  } catch {
    return Response.json({ ok: false, error: "Invalid Telegram update" }, { status: 400 });
  }

  const text = typeof update.message?.text === "string" ? update.message.text.trim() : "";
  const chatId = update.message?.chat?.id;
  const match = text.match(/^\/link\s+([^\s]{1,128})$/);
  if (!match || chatId === undefined) return Response.json({ ok: true, ignored: true });

  const deviceId = match[1];
  try {
    const client = createServerSupabaseClient();
    const { data, error } = await withDatabaseRetry(() => client.from("farmers").update({ telegram_chat_id: String(chatId) }).eq("device_id", deviceId).select("id").maybeSingle());
    if (error || !data) return Response.json({ ok: false, error: "Profile was not found for this device" }, { status: 404 });
    const reply = await sendTelegramMessage(String(chatId), "KisanPilot is linked to this farm profile.");
    if (!reply.ok) return Response.json(reply, { status: 503 });
    return Response.json({ ok: true, linked: true });
  } catch {
    return Response.json({ ok: false, error: "Telegram linking is unavailable" }, { status: 503 });
  }
}
