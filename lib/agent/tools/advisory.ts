import { fetchText } from "@/lib/agent/tools/http";
import type { ToolResult } from "@/lib/agent/tools/types";

const ICAR_ADVISORY_URL = "https://icar.gov.in/en/kharif-agro-advisory-farmers";
const SOURCE = "ICAR official Kharif agro-advisory page";

type Advisory = {
  title: string;
  url: string;
  excerpt: string;
  scope: "official_page";
};

function cleanPageText(html: string): string {
  const withoutUnsafeBlocks = html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  const text = withoutUnsafeBlocks
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();

  return text
    .split(/(?<=[.!?])\s+/)
    .filter((sentence) => !/(pesticide|insecticide|fungicide|herbicide|kg\/ha|ml\/ha|dosage|spray)/i.test(sentence))
    .join(" ")
    .slice(0, 900);
}

export async function getOfficialAdvisory(topic: string): Promise<ToolResult<Advisory>> {
  const fetchedAt = new Date().toISOString();
  const normalizedTopic = topic.trim().slice(0, 120);
  if (!normalizedTopic) {
    return { ok: false, error: "An advisory topic is required", source: SOURCE, fetched_at: fetchedAt };
  }

  const response = await fetchText(ICAR_ADVISORY_URL);
  if (!response.ok) {
    return { ok: false, error: `Official advisory unavailable: ${response.error}`, source: SOURCE, fetched_at: fetchedAt };
  }

  const excerpt = cleanPageText(response.data);
  if (!excerpt) {
    return { ok: false, error: `No readable official advisory content found for “${normalizedTopic}”`, source: SOURCE, fetched_at: fetchedAt };
  }

  return {
    ok: true,
    data: {
      title: "Kharif agro-advisory for farmers",
      url: ICAR_ADVISORY_URL,
      excerpt,
      scope: "official_page",
    },
    source: SOURCE,
    fetched_at: fetchedAt,
  };
}
