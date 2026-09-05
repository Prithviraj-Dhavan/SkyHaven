import Redis from 'ioredis';
import { env } from './env.js';

class InMemoryCache {
  private store = new Map<string, { value: string; expiry: number | null }>();

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) return null;
    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    let expiry: number | null = null;
    if (mode === 'EX' && duration) {
      expiry = Date.now() + duration * 1000;
    }
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  async flushall(): Promise<'OK'> {
    this.store.clear();
    return 'OK';
  }
}

let redisClient: Redis | null = null;
let useInMemory = false;
const inMemoryCache = new InMemoryCache();

if (env.REDIS_URL) {
  try {
    redisClient = new Redis(env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      retryStrategy: (times) => {
        if (times > 2) {
          useInMemory = true;
          return null; // Stop retrying and fall back to memory
        }
        return 1000;
      },
    });

    redisClient.on('error', (err) => {
      if (!useInMemory) {
        console.warn('⚠️ Redis connection error, switching to fast In-Memory Cache fallback:', err.message);
        useInMemory = true;
      }
    });

    redisClient.on('connect', () => {
      console.log('⚡ Redis Cache connected successfully.');
    });
  } catch {
    useInMemory = true;
  }
} else {
  useInMemory = true;
}

export const cache = {
  async get(key: string): Promise<string | null> {
    if (useInMemory || !redisClient || redisClient.status !== 'ready') {
      return inMemoryCache.get(key);
    }
    try {
      return await redisClient.get(key);
    } catch {
      return inMemoryCache.get(key);
    }
  },

  async set(key: string, value: string, ttlSeconds = 300): Promise<void> {
    if (useInMemory || !redisClient || redisClient.status !== 'ready') {
      await inMemoryCache.set(key, value, 'EX', ttlSeconds);
      return;
    }
    try {
      await redisClient.set(key, value, 'EX', ttlSeconds);
    } catch {
      await inMemoryCache.set(key, value, 'EX', ttlSeconds);
    }
  },

  async del(key: string): Promise<void> {
    if (useInMemory || !redisClient || redisClient.status !== 'ready') {
      await inMemoryCache.del(key);
      return;
    }
    try {
      await redisClient.del(key);
    } catch {
      await inMemoryCache.del(key);
    }
  },
};

export async function connectRedis() {
  if (redisClient && !useInMemory) {
    try {
      await redisClient.connect();
    } catch {
      console.warn('⚠️ Redis not reachable at configured URL. Using resilient In-Memory Cache.');
      useInMemory = true;
    }
  } else {
    console.log('⚡ Using In-Memory Cache layer.');
  }
}
