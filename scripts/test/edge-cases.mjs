const baseUrl = (process.env.KISANPILOT_BASE_URL || "").replace(/\/$/, "");
if (!baseUrl) throw new Error("Set KISANPILOT_BASE_URL to the deployed app before running edge checks");

async function request(path, options) { return fetch(`${baseUrl}${path}`, { ...options, signal: AbortSignal.timeout(30_000) }); }
const empty = await request("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "" }) });
const long = await request("/api/chat", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: "x".repeat(4_001) }) });
const unknownAlert = await request("/api/alerts/check", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ device_id: `edge-${Date.now()}` }) });
const cron = await request("/api/alerts/run");
const telegram = await request("/api/telegram", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ update_id: 0 }) });
const checks = [["empty question", empty.status, 400], ["long question", long.status, 400], ["unknown alert profile", unknownAlert.status, 404], ["unauthorized cron", cron.status, 401], ["unsigned Telegram webhook", telegram.status, 401]];
for (const [name, actual, expected] of checks) { if (actual !== expected) throw new Error(`${name}: expected ${expected}, got ${actual}`); console.log(`${name}: ${actual}`); }
