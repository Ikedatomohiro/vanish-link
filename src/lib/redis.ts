import { Redis } from "@upstash/redis";

let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
      throw new Error(
        "UPSTASH_REDIS_REST_URL と UPSTASH_REDIS_REST_TOKEN の環境変数を設定してください"
      );
    }
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return _redis;
}

export const TTL_OPTIONS = {
  "1h": 3600,
  "24h": 86400,
  "7d": 604800,
} as const;

export type TTLOption = keyof typeof TTL_OPTIONS;

export interface SecretRecord {
  encryptedData: string;
  hasPassword: boolean;
  salt?: string;
  createdAt: number;
}
