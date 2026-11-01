import crypto from "node:crypto";

const timeoutMs = 60_000;
const args = process.argv.slice(2);
function value(name) { const index = args.indexOf(name); return index >= 0 ? args[index + 1]?.trim() : ""; }
const baseUrl = value("--base-url") || process.env.KISANPILOT_BASE_URL || "";
const place = value("--place");
const state = value("--state");
const district = value("--district");
const crop = value("--crop");
const deviceId = value("--device-id") || `warm-${crypto.randomUUID()}`;
if (!baseUrl || !place || !state || !district || !crop) throw new Error("Usage: npm run warm -- --base-url <url> --place <place> --state <state> --district <district> --crop <crop> [--device-id <id>]");

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), timeoutMs);
try {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/chat`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ question: `Check live weather, soil, mandi price, and official advisory information for my ${crop} farm.`, language: "en", device_id: deviceId, place_name: place, state, district, crops: [crop] }), signal: controller.signal });
  const body = await response.text();
  if (!response.ok) throw new Error(`Chat warm call failed with HTTP ${response.status}`);
  if (!body.includes('"type":"done"')) throw new Error("Chat warm call did not complete");
  if (body.includes('"type":"error"')) throw new Error("Chat warm call emitted an error event");
  console.log(`Warm call completed for the operator-supplied place and crop. HTTP ${response.status}.`);
} finally { clearTimeout(timeout); }
