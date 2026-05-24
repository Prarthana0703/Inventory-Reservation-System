import Redis from "ioredis";

const globalForRedis = globalThis as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(process.env.REDIS_URL!);

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

export async function acquireLock(key: string, ttlSeconds: number): Promise<boolean> {
  const lockKey = `lock:${key}`;
  const result = await redis.set(lockKey, "1", "EX", ttlSeconds, "NX");
  return result === "OK";
}

export async function releaseLock(key: string): Promise<void> {
  const lockKey = `lock:${key}`;
  await redis.del(lockKey);
}

export async function getIdempotencyResult(key: string): Promise<string | null> {
  return redis.get(`idempotency:${key}`);
}

export async function setIdempotencyResult(key: string, value: string): Promise<void> {
  await redis.set(`idempotency:${key}`, value, "EX", 86400);
}
