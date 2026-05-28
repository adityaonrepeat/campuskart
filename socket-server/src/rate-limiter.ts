import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

// 30 messages per user per minute (sliding window). Disabled if Redis isn't configured.
const messageLimiter =
  url && token
    ? new Ratelimit({
        redis: new Redis({ url, token }),
        limiter: Ratelimit.slidingWindow(30, "1 m"),
        prefix: "campuskart:socket:msg",
      })
    : null;

if (!messageLimiter) {
  console.warn(
    "[rate-limiter] UPSTASH_REDIS_REST_URL/TOKEN not set — message rate limiting disabled."
  );
}

export async function checkMessageRateLimit(userId: string): Promise<boolean> {
  if (!messageLimiter) return true; // not configured → allow
  try {
    const { success } = await messageLimiter.limit(userId);
    return success;
  } catch (err) {
    // Fail open: a limiter outage must not block chat entirely.
    console.error("[rate-limiter] limit check failed, allowing message:", err);
    return true;
  }
}
