import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import { UrlDto } from './url.dto';
import { isURL } from 'class-validator';

const baseURL = 'http://localhost:3000';
@Injectable()
export class UrlService {
  private readonly redisClient: RedisClientType;
  constructor() {
    const host = 'localhost' || '127.0.0.1';
    const port = 6379;
    this.redisClient = createClient({
      url: `redis://${host}:${port}`,
    });

    this.redisClient.connect();
  }

  async shortenUrl(longUrl: UrlDto) {
    const { url } = longUrl;

    //checks if longurl is a valid URL
    if (!isURL(url)) {
      throw new BadRequestException('String Must be a Valid URL');
    }

    const urlCode = Math.random().toString(36).slice(7);

    try {
      //if it doesn't exist, shorten it
      const shortUrl = `${baseURL}/${urlCode}`;

      await this.redisClient.set(`urlCode:${urlCode}`, urlCode);
      await this.redisClient.set(`longUrl:${url}`, url);
      await this.redisClient.set(`shortUrl:${shortUrl}`, shortUrl);

      return shortUrl;
    } catch (error) {
      throw new HttpException('Server Error', 409);
    }
  }

  async redirect(urlCode: string) {
    try {
      const url = await this.redisClient.get(`shortUrl:${baseURL}/${urlCode}`);
      console.log(url);
      if (url) return url;
    } catch (error) {
      throw new NotFoundException('Resource Not Found');
    }
  }
}
