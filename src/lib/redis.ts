type RedisClient = {
  get: (key: string) => Promise<string | null>;
  setex: (key: string, ttl: number, value: string) => Promise<"OK">;
  del: (...keys: string[]) => Promise<number>;
  keys: (pattern: string) => Promise<string[]>;
  incr: (key: string) => Promise<number>;
  expire: (key: string, ttl: number) => Promise<number>;
  ttl: (key: string) => Promise<number>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  quit: () => Promise<"OK">;
};

let redisClient: RedisClient | null = null;
let isConnecting = false;

async function loadIORedis(): Promise<typeof import("ioredis") | null> {
  try {
    return await import("ioredis");
  } catch {
    return null;
  }
}

export async function getRedisClient(): Promise<RedisClient | null> {
  if (redisClient) return redisClient;

  if (isConnecting) {
    await new Promise((resolve) => setTimeout(resolve, 100));
    return getRedisClient();
  }

  if (!process.env.REDIS_URL) {
    return null;
  }

  isConnecting = true;

  try {
    const ioredis = await loadIORedis();
    if (!ioredis) return null;

    const client = new ioredis.Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        return Math.min(times * 100, 3000);
      },
    });

    client.on("error", (err: Error) => console.error("Redis Client Error:", err.message));
    client.on("connect", () => console.log("Redis connected"));
    client.on("close", () => console.log("Redis disconnected"));

    redisClient = client as unknown as RedisClient;
    return redisClient;
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    redisClient = null;
    return null;
  } finally {
    isConnecting = false;
  }
}

export async function closeRedisClient(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient();
  if (!redis) return null;

  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error("Cache set error:", error);
  }
}

export async function cacheSet<T>(key: string, value: T, ttlSeconds = 3600): Promise<void> {
  return setCache(key, value, ttlSeconds);
}

export async function deleteCache(key: string): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error("Cache delete error:", error);
  }
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const redis = await getRedisClient();
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error("Cache pattern delete error:", error);
  }
}

export async function incrementCache(key: string, ttlSeconds = 60): Promise<number> {
  const redis = await getRedisClient();
  if (!redis) return 0;

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, ttlSeconds);
    }
    return count;
  } catch {
    return 0;
  }
}

export function generateCacheKey(...parts: (string | number)[]): string {
  return parts.map(String).join(":");
}

export const CACHE_KEYS = {
  user: (id: string) => generateCacheKey("user", id),
  student: (id: string) => generateCacheKey("student", id),
  organization: (id: string) => generateCacheKey("org", id),
  university: (id: string) => generateCacheKey("university", id),
  course: (id: string) => generateCacheKey("course", id),
  career: (id: string) => generateCacheKey("career", id),
  universitySearch: (params: Record<string, string>) =>
    generateCacheKey("university:search", JSON.stringify(params)),
  courseSearch: (params: Record<string, string>) =>
    generateCacheKey("course:search", JSON.stringify(params)),
  aiResponse: (query: string) => generateCacheKey("ai", Buffer.from(query).toString("base64")),
  rateLimit: (prefix: string, ip: string, path: string) =>
    generateCacheKey("ratelimit", prefix, ip, path),
  settings: () => generateCacheKey("settings"),
  notifications: (userId: string) => generateCacheKey("notifications", userId),
} as const;
