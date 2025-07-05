import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis
  ) {}

  async set(key: string, payload: any) {
    await this.redis.lpush(key, JSON.stringify(payload));
  }

  async get(key: string): Promise<any[]> {
    const values = await this.redis.lrange(key, 0, -1);
    return values.map(v => JSON.parse(v));
  }

  async clear(key: string) {
    await this.redis.del(key);
  }

  async clearMultiple(keys: string[]) {
    if (keys.length === 0) return;
    await this.redis.del(...keys);
 }
}
