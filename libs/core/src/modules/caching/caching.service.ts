import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { promisify } from 'util';
import { createClient } from 'redis';
import { Cache } from 'cache-manager';
import { ConfigApiService } from '../config-api';
import { Constants } from '../../utils';
import { MultiversXApiService } from '../multiversx-api';

@Injectable()
export class CachingService {
  private client = createClient(6379, this.configApiService.getRedisUrl());
  private asyncSet = promisify(this.client.set).bind(this.client);
  private asyncGet = promisify(this.client.get).bind(this.client);
  private asyncMGet = promisify(this.client.mget).bind(this.client);
  private asyncIncr = promisify(this.client.incr).bind(this.client);

  private asyncDel = promisify(this.client.del).bind(this.client);
  private asyncKeys = promisify(this.client.keys).bind(this.client);

  private static cache: Cache;

  private readonly logger: Logger;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly multiversXApiService: MultiversXApiService,
    private readonly configApiService: ConfigApiService,
  ) {
    CachingService.cache = this.cache;
    this.logger = new Logger(CachingService.name);
  }

  async setCacheRemote<T>(key: string, value: T, ttl: number): Promise<T> {
    await this.asyncSet(key, JSON.stringify(value), 'EX', ttl);
    return value;
  }

  async getCacheRemote<T>(key: string): Promise<T | undefined> {
    const response = await this.asyncGet(key);
    if (response === undefined || response === null) {
      return undefined;
    }

    return JSON.parse(response);
  }

  async incrementRemote(key: string): Promise<number> {
    return await this.asyncIncr(key);
  }

  async setCacheLocal<T>(key: string, value: T, ttl: number): Promise<T> {
    return await CachingService.cache.set<T>(key, value, { ttl });
  }

  async getCacheLocal<T>(key: string): Promise<T | undefined> {
    return await CachingService.cache.get<T>(key);
  }

  public async getCache<T>(key: string): Promise<T | undefined> {
    const value = await this.getCacheLocal<T>(key);
    if (value) {
      return value;
    }

    return await this.getCacheRemote<T>(key);
  }

  async setCache<T>(key: string, value: T, ttl: number): Promise<T> {
    await this.setCacheLocal<T>(key, value, ttl);
    await this.setCacheRemote<T>(key, value, ttl);
    return value;
  }

  async getOrSetCache<T>(
    key: string,
    promise: () => Promise<T>,
    remoteTtl: number,
  ): Promise<T> {
    const cachedValue = await this.getCacheLocal<T>(key);
    if (cachedValue !== undefined) {
      return cachedValue;
    }

    const cached = await this.getCacheRemote<T>(key);
    if (cached !== undefined && cached !== null) {
      // we only set ttl to half because we don't know what the real ttl of the item is and we want it to work good in most scenarios
      await this.setCacheLocal<T>(key, cached, remoteTtl / 2);
      return cached;
    }

    const value = await promise();

    if (remoteTtl > 0) {
      await this.setCacheLocal<T>(key, value, remoteTtl);
      await this.setCacheRemote<T>(key, value, remoteTtl);
    }
    return value;
  }

  async deleteInCacheLocal(key: string) {
    await CachingService.cache.del(key);
  }

  async deleteInCache(key: string): Promise<string[]> {
    const invalidatedKeys = [];

    if (key.includes('*')) {
      const allKeys = await this.asyncKeys(key);
      for (const key of allKeys) {
        await CachingService.cache.del(key);
        await this.asyncDel(key);
        invalidatedKeys.push(key);
      }
    } else {
      await CachingService.cache.del(key);
      await this.asyncDel(key);
      invalidatedKeys.push(key);
    }

    return invalidatedKeys;
  }

  async delCache(key: string): Promise<any> {
    return await this.asyncDel(key);
  }

  async getKeys(pattern: string): Promise<string[]> {
    return await this.asyncKeys(pattern);
  }

  async getCacheMultiple<T>(keys: string[]): Promise<{ [key: string]: T }> {
    if (keys.length === 0) {
      return {};
    }

    const values = await this.asyncMGet(keys);

    const result: { [key: string]: T } = {};

    for (const [index, value] of values.entries()) {
      if (value !== undefined && value !== null) {
        result[keys[index]] = JSON.parse(value);
      }
    }

    return result;
  }

  async getSecondsRemainingUntilNextRound(): Promise<number> {
    const genesisTimestamp = await this.getGenesisTimestamp();
    const currentTimestamp = Math.round(Date.now() / 1000);

    let result = 6 - ((currentTimestamp - genesisTimestamp) % 6);
    if (result === 6) {
      result = 0;
    }

    return result;
  }

  private async getGenesisTimestamp(): Promise<number> {
    return await this.getOrSetCache(
      'genesisTimestamp',
      async () => await this.getGenesisTimestampRaw(),
      Constants.oneWeek(),
    );
  }

  private async getGenesisTimestampRaw(): Promise<number> {
    try {
      const round = await this.multiversXApiService.get('rounds/0/1');
      console.log('ROUND', round);
      return round.timestamp;
    } catch (error) {
      this.logger.error(error);
      return 0;
    }
  }
}
