const DATABASE_TIMEOUT_MS = 8_000;

export async function withDatabaseRetry<T>(operation: () => PromiseLike<T>): Promise<T> {
  let lastError: unknown = new Error("Database request failed");
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Database request timed out")), DATABASE_TIMEOUT_MS)),
      ]);
    } catch (error) {
      lastError = error;
      if (attempt === 0) await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
  throw lastError;
}
