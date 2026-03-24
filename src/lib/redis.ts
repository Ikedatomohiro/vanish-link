import { Redis } from "@upstash/redis";

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

/** Upstash Redis互換のインメモリストア（ローカル開発用） */
class InMemoryRedis {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async set(key: string, value: string, opts?: { ex?: number }): Promise<void> {
    const expiresAt = opts?.ex
      ? Date.now() + opts.ex * 1000
      : Number.MAX_SAFE_INTEGER;
    this.store.set(key, { value, expiresAt });
  }

  async get<T = string>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async getdel<T = string>(key: string): Promise<T | null> {
    const result = await this.get<T>(key);
    if (result !== null) {
      this.store.delete(key);
    }
    return result;
  }

  async exists(key: string): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return 0;
    }
    return 1;
  }
}

const useInMemory =
  !process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN;

let _redis: Redis | null = null;
let _memoryRedis: InMemoryRedis | null = null;

export function getRedis(): Redis | InMemoryRedis {
  if (useInMemory) {
    if (!_memoryRedis) {
      console.warn(
        "[Vanish Link] Upstash Redis未設定のため、インメモリストアを使用します（開発用）"
      );
      _memoryRedis = new InMemoryRedis();
    }
    return _memoryRedis;
  }

  if (!_redis) {
    _redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return _redis;
}
