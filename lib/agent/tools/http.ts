const REQUEST_TIMEOUT_MS = 8_000;
const RETRY_DELAY_MS = 500;

export async function fetchJson<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  let lastError = "Request failed";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { signal: controller.signal, headers: { accept: "application/json" } });
      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
      } else {
        return { ok: true, data: (await response.json()) as T };
      }
    } catch (error) {
      lastError = error instanceof Error && error.name === "AbortError" ? "Request timed out" : error instanceof Error ? error.message : "Request failed";
    } finally {
      clearTimeout(timeout);
    }

    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }

  return { ok: false, error: lastError };
}

export async function fetchText(url: string): Promise<{ ok: true; data: string } | { ok: false; error: string }> {
  let lastError = "Request failed";

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: { accept: "text/html,application/xhtml+xml" },
      });
      if (!response.ok) {
        lastError = `HTTP ${response.status}`;
      } else {
        return { ok: true, data: await response.text() };
      }
    } catch (error) {
      lastError = error instanceof Error && error.name === "AbortError" ? "Request timed out" : error instanceof Error ? error.message : "Request failed";
    } finally {
      clearTimeout(timeout);
    }

    if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
  }

  return { ok: false, error: lastError };
}
