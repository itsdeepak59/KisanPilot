import { fetchText } from "@/lib/agent/tools/http";
import type { ToolResult } from "@/lib/agent/tools/types";

const SOURCE = "Official ICAR and IMD advisory pages";
const SOURCES = [
  { title: "ICAR Kharif agro-advisory for farmers", authority: "ICAR", season: "kharif", url: "https://icar.gov.in/en/kharif-agro-advisory-farmers" },
  { title: "ICAR Rabi agro-advisory for farmers", authority: "ICAR", season: "rabi", url: "https://icar.gov.in/en/icar-rabi-agro-advisory-farmers-0" },
  { title: "IMD Crop Specific Advisory", authority: "India Meteorological Department", season: "all seasons", url: "https://imdagrimet.gov.in/cropAdvisory_3.php" },
] as const;

type AdvisoryMatch = { title: string; authority: string; season: string; url: string; excerpt: string; relevance: number; fetched_at: string };
type Advisory = { topic: string; matches: AdvisoryMatch[] };

function cleanPageText(html: string): string {
  const withoutUnsafeBlocks = html.replace(/<(script|style|noscript)[^>]*>[\s\S]*?<\/\1>/gi, " ");
  return withoutUnsafeBlocks.replace(/<[^>]+>/g, " ").replace(/&nbsp;/gi, " ").replace(/&amp;/gi, "&").replace(/&quot;/gi, '"').replace(/&#39;/gi, "'").replace(/\s+/g, " ").trim();
}

function safeSentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter((sentence) => sentence.length >= 30).filter((sentence) => !/(pesticide|insecticide|fungicide|herbicide|kg\/ha|ml\/ha|dosage|spray|chemical)/i.test(sentence));
}

function topicWords(topic: string): string[] {
  return [...new Set(topic.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 3))];
}

function rankMatch(source: (typeof SOURCES)[number], text: string, topic: string, fetchedAt: string): AdvisoryMatch {
  const words = topicWords(topic);
  const sentences = safeSentences(text);
  const title = `${source.title} (${source.season})`;
  const ranked = sentences.map((sentence) => ({ sentence, relevance: words.reduce((score, word) => score + (sentence.toLowerCase().includes(word) ? 2 : 0), 0) + (sentence.toLowerCase().includes(source.season) ? 1 : 0) })).sort((left, right) => right.relevance - left.relevance);
  const selected = ranked.slice(0, 3).map((item) => item.sentence).join(" ").slice(0, 900);
  return { title, authority: source.authority, season: source.season, url: source.url, excerpt: selected || `${source.title} is available at the official source URL. Review the page for the current advisory content.`, relevance: ranked[0]?.relevance ?? 0, fetched_at: fetchedAt };
}

export async function getOfficialAdvisory(topic: string): Promise<ToolResult<Advisory>> {
  const fetchedAt = new Date().toISOString();
  const normalizedTopic = topic.trim().slice(0, 120);
  if (!normalizedTopic) return { ok: false, error: "An advisory topic is required", source: SOURCE, fetched_at: fetchedAt };
  const results = await Promise.all(SOURCES.map(async (source) => ({ source, response: await fetchText(source.url) })));
  const matches = results.flatMap((result) => result.response.ok ? [rankMatch(result.source, cleanPageText(result.response.data), normalizedTopic, fetchedAt)] : []).sort((left, right) => right.relevance - left.relevance).slice(0, 3);
  if (matches.length === 0) return { ok: false, error: "All approved official advisory sources are unavailable", source: SOURCE, fetched_at: fetchedAt };
  return { ok: true, data: { topic: normalizedTopic, matches }, source: SOURCE, fetched_at: fetchedAt };
}
