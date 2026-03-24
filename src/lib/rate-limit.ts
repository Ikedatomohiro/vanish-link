import { Ratelimit } from "@upstash/ratelimit";
import { getRedis } from "./redis";

let _ratelimit: Ratelimit | null = null;

export function getRatelimit(): Ratelimit {
  if (!_ratelimit) {
    _ratelimit = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, "1 m"),
      analytics: true,
      prefix: "vanish-link:ratelimit",
    });
  }
  return _ratelimit;
}
