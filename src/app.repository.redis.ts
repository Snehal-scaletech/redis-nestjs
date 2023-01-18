import { AppRepository } from './app.repository';
import { Observable, from, mergeMap } from 'rxjs';
import { createClient, RedisClientType } from 'redis';

export class AppRepositoryRedis implements AppRepository {
  private readonly redisClient: RedisClientType;

  constructor() {
    const host = 'localhost' || '127.0.0.1';
    const port = 6379;
    this.redisClient = createClient({
      url: `redis://${host}:${port}`,
    });

    from(this.redisClient.connect()).subscribe({ error: console.error });
    this.redisClient.on('connect', () => console.log('Redis connected'));
    this.redisClient.on('error', console.error);
  }

  get(hash: string): Observable<string> {
    console.log(this.redisClient.get(hash));
    return from(this.redisClient.get(hash));
  }

  put(hash: string, url: string): Observable<string> {
    return from(this.redisClient.set(hash, url)).pipe(
      mergeMap(() => from(this.redisClient.get(hash))),
    );
  }
}
