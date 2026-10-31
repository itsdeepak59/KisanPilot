const TELEGRAM_TIMEOUT_MS = 8_000;

export async function sendTelegramMessage(chatId: string, text: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return { ok: false, error: "TELEGRAM_BOT_TOKEN is not configured" };

  let lastError = "Telegram request failed";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS);
    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text }),
        signal: controller.signal,
      });
      if (response.ok) return { ok: true };
      lastError = `Telegram HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error && error.name === "AbortError" ? "Telegram request timed out" : "Telegram request failed";
    } finally {
      clearTimeout(timeout);
    }
    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return { ok: false, error: lastError };
}
