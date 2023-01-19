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
    // this.redisClient.on('connect', () => console.log('Redis connected'));
    // this.redisClient.on('error', console.error);
  }

  async shorten(url: string, req: any): Promise<Observable<string>> {
    const hash = Math.random().toString(36).slice(7);
    const baseURL = 'http://localhost:3000';
    const shortUrl = `${baseURL}/${hash}`;
    await this.redisClient.set(`hash:${hash}`, shortUrl);
    await this.redisClient.set(`host:${hash}`, req.headers['host']);
    await this.redisClient.set(`user-agent:${hash}`, req.headers['user-agent']);
    await this.redisClient.set(`accept:${hash}`, req.headers['accept']);
    await this.redisClient.set(
      `accept-encoding:${hash}`,
      req.headers['accept-encoding'],
    );
    await this.redisClient.set(`connection:${hash}`, req.headers['connection']);
    await this.redisClient.set(
      `content-type:${hash}`,
      req.headers['content-type'],
    );
    await this.redisClient.set(
      `content-length:${hash}`,
      req.headers['content-length'],
    );
    await this.redisClient.set(`ip:${hash}`, req.ip);
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
