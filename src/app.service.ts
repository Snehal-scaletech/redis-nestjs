import { Injectable } from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import { Observable, of, map, from } from 'rxjs';

@Injectable()
export class AppService {
  private readonly hashMap: Map<string, string>;
  private readonly redisClient: RedisClientType;

  constructor() {
    this.hashMap = new Map<string, string>();

    const host = 'localhost' || '127.0.0.1';
    const port = 6379;
    this.redisClient = createClient({
      url: `redis://${host}:${port}`,
    });

    from(this.redisClient.connect()).subscribe({ error: console.error });
    this.redisClient.on('connect', () => console.log('Redis connected'));
    this.redisClient.on('error', console.error);
  }

  async shorten(url: string): Promise<Observable<string>> {
    const hash = Math.random().toString(36).slice(7);
    const baseURL = 'http://localhost:3000';
    const shortUrl = `${baseURL}/${hash}`;
    await this.redisClient.set(hash, shortUrl);
    return this.setUrl(hash, url).pipe(map(() => hash));
  }

  setUrl(hash: string, url: string): Observable<string> {
    return of(this.hashMap.set(hash, url).get(hash));
  }

  retrieve(hash: string): Observable<string> {
    return this.getUrl(hash);
  }

  getUrl(hash: string): Observable<string> {
    return of(this.hashMap.get(hash));
  }
}
