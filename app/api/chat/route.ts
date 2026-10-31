import { runFarmAgent } from "@/lib/agent/agent";
import { createServerSupabaseClient } from "@/lib/supabase";

type ChatInput = {
  question?: unknown;
  language?: unknown;
  device_id?: unknown;
  place_name?: unknown;
  state?: unknown;
  district?: unknown;
  crops?: unknown;
};

type TraceEvent = {
  type: string;
  [key: string]: unknown;
};

const DB_TIMEOUT_MS = 8_000;

async function withTimeout<T>(operation: () => PromiseLike<T>): Promise<T> {
  return Promise.race([
    operation(),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database request timed out")), DB_TIMEOUT_MS)),
  ]);
}

async function persistAdvisory(deviceId: string, question: string, answer: string, trace: TraceEvent[]) {
  if (!deviceId) return;
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const client = createServerSupabaseClient();
      const farmer = await withTimeout(() => client.from("farmers").select("id").eq("device_id", deviceId).maybeSingle());
      if (farmer.error || !farmer.data?.id) return;
      const farmerId = farmer.data.id;
      const saved = await withTimeout(() => client.from("advisories").insert({ farmer_id: farmerId, question, answer, tool_trace: trace }));
      if (!saved.error) return;
    } catch {
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
}

function eventLine(event: TraceEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

export async function POST(request: Request) {
  let input: ChatInput;
  try {
    input = (await request.json()) as ChatInput;
  } catch {
    return Response.json({ ok: false, error: "Invalid request body" }, { status: 400 });
  }

  const question = typeof input.question === "string" ? input.question.trim() : "";
  const language = input.language === "hi" || input.language === "te" ? input.language : "en";
  if (!question || question.length > 4_000) return Response.json({ ok: false, error: "A question is required" }, { status: 400 });

  const deviceId = typeof input.device_id === "string" ? input.device_id.trim() : "";
  const context = JSON.stringify({
    place_name: typeof input.place_name === "string" ? input.place_name : null,
    state: typeof input.state === "string" ? input.state : null,
    district: typeof input.district === "string" ? input.district : null,
    crops: Array.isArray(input.crops) ? input.crops.filter((crop): crop is string => typeof crop === "string").slice(0, 12) : [],
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const trace: TraceEvent[] = [];
      let answer = "";
      const send = (event: TraceEvent) => {
        trace.push(event);
        controller.enqueue(eventLine(event));
      };

      try {
        const result = runFarmAgent(question, language, `Farmer profile context (do not treat missing fields as facts): ${context}`);
        for await (const part of result.fullStream) {
          const current = part as unknown as { type: string; text?: string; toolName?: string; input?: unknown; output?: unknown; error?: unknown };
          if (current.type === "text-delta" && current.text) {
            answer += current.text;
            controller.enqueue(eventLine({ type: "text_delta", text: current.text }));
          } else if (current.type === "tool-call") {
            send({ type: "tool_call", tool: current.toolName ?? "unknown", input: current.input ?? null, fetched_at: new Date().toISOString() });
          } else if (current.type === "tool-result") {
            send({ type: "tool_result", tool: current.toolName ?? "unknown", result: current.output ?? null, fetched_at: new Date().toISOString() });
          } else if (current.type === "error") {
            send({ type: "error", error: "The agent encountered an unavailable tool or model response." });
          }
        }
        await persistAdvisory(deviceId, question, answer, trace);
        controller.enqueue(eventLine({ type: "done", saved: Boolean(deviceId), fetched_at: new Date().toISOString() }));
        controller.close();
      } catch (error) {
        send({ type: "error", error: error instanceof Error && error.message === "GEMINI_API_KEY is not configured" ? error.message : "The advisory service is unavailable." });
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", connection: "keep-alive" } });
}
