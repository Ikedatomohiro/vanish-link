import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { getRedis } from "./redis";

const useInMemory =
  !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;

let _ratelimit: Ratelimit | null = null;

interface RatelimitResult {
  success: boolean;
}

export function getRatelimit(): { limit: (id: string) => Promise<RatelimitResult> } {
  if (useInMemory) {
    // インメモリモードではレート制限をスキップ
    return { limit: async () => ({ success: true }) };
  }

  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: getRedis() as Redis,
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "vanish-link:ratelimit",
    });
  }
  return _ratelimit;
}
