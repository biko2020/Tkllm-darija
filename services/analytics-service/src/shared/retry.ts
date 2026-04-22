/**
 * Retry logic with exponential backoff.
 * Useful for DB queries, Kafka operations, or external API calls.
 */

export async function retry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 500
): Promise<T> {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await fn();
    } catch (err) {
      attempt++;
      if (attempt >= retries) throw err;
      const backoff = delayMs * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, backoff));
    }
  }
  throw new Error("Retry failed after max attempts");
}
