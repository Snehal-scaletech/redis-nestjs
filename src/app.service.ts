import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisClientType, createClient } from 'redis';
import { Observable, of, map, from } from 'rxjs';
import * as request from 'request';
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
  async getLocationDetails() {
    const options = {
      method: 'GET',
      url: 'http://ip-api.com/json/?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,offset,currency,isp,org,as,asname,reverse,mobile,proxy,hosting,query',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    return new Promise(function (resolve, reject) {
      request(options, function (error, response) {
        // console.log(error);
        if (error) {
          reject(error);
        } else {
          resolve(response.body);
        }
      });
    });
  }

  async shorten(url: string, req: any): Promise<Observable<string>> {
    try {
      const timestamp = new Date().toISOString();
      const timestamp_inunix = Math.floor(new Date().getTime() / 1000);
      const hash = Math.random().toString(36).slice(7);
      const baseURL = 'http://localhost:8000';
      const shortUrl = `${baseURL}/${hash}`;

      await this.redisClient.hSet(hash, 'hash', hash);
      await this.redisClient.hSet(hash, 'orignalUrl', url);
      await this.redisClient.hSet(hash, 'shortUrl', shortUrl);
      //check host
      if (req.headers['host'] !== undefined && req.headers['host'] !== '') {
        await this.redisClient.hSet(hash, 'host', req.headers['host']);
      }

      //check user-agent
      if (
        req.headers['user-agent'] !== undefined &&
        req.headers['user-agent'] !== ''
      ) {
        await this.redisClient.hSet(
          hash,
          'user-agent',
          req.headers['user-agent'],
        );
      }

      //check accept
      if (req.headers['accept'] !== undefined && req.headers['accept'] !== '') {
        await this.redisClient.hSet(hash, 'accept', req.headers['accept']);
      }

      //check accept-encoding
      if (
        req.headers['accept-encoding'] !== undefined &&
        req.headers['accept-encoding'] !== ''
      ) {
        await this.redisClient.hSet(
          hash,
          'accept-encoding',
          req.headers['accept-encoding'],
        );
      }

      //check connection
      if (
        req.headers['connection'] !== undefined &&
        req.headers['connection'] !== ''
      ) {
        await this.redisClient.hSet(
          hash,
          'connection',
          req.headers['connection'],
        );
      }

      //check content-type
      if (
        req.headers['content-type'] !== undefined &&
        req.headers['content-type'] !== ''
      ) {
        await this.redisClient.hSet(
          hash,
          'content-type',
          req.headers['content-type'],
        );
      }

      //check content-length
      if (
        req.headers['content-length'] !== undefined &&
        req.headers['content-length'] !== ''
      ) {
        await this.redisClient.hSet(
          hash,
          'content-length',
          req.headers['content-length'],
        );
      }

      //check cache-control
      if (
        req.headers['cache-control'] !== undefined &&
        req.headers['cache-control'] !== ''
      ) {
        await this.redisClient.hSet(
          hash,
          'cache-control',
          req.headers['cache-control'],
        );
      }

      //check ip
      if (req.ip !== undefined && req.ip !== '') {
        await this.redisClient.hSet(hash, 'ip', req.ip);
      }

      //check timestamp
      if (timestamp !== undefined && timestamp !== '') {
        await this.redisClient.hSet(hash, 'timestamp', timestamp);
      }

      //check timestamp in unix
      if (timestamp_inunix !== undefined) {
        await this.redisClient.hSet(hash, 'timestamp_inunix', timestamp_inunix);
      }

      await this.redisClient.hSet(`users:${hash}`, 'userCount', 0);
      const location = await this.getLocationDetails();
      const address = JSON.parse(location as any);
      if (address.status === 'success') {
        await this.redisClient.hSet(hash, 'country', address.country);
        await this.redisClient.hSet(hash, 'region', address.region);
        await this.redisClient.hSet(hash, 'countryCode', address.countryCode);
        await this.redisClient.hSet(hash, 'regionName', address.regionName);
        await this.redisClient.hSet(hash, 'city', address.city);
        await this.redisClient.hSet(hash, 'district', address.district);
        await this.redisClient.hSet(hash, 'zip', address.zip);
        await this.redisClient.hSet(hash, 'latitude', address.lat);
        await this.redisClient.hSet(hash, 'longitude', address.lon);
        await this.redisClient.hSet(
          hash,
          'internet_service_provider',
          address.isp,
        );
        await this.redisClient.hSet(hash, 'organization', address.org);
        await this.redisClient.hSet(hash, 'as', address.as);
        await this.redisClient.hSet(hash, 'query', address.query);
        await this.redisClient.hSet(hash, 'timezone', address.timezone);
        await this.redisClient.hSet(hash, 'continent', address.continent);
        await this.redisClient.hSet(
          hash,
          'continentCode',
          address.continentCode,
        );
        await this.redisClient.hSet(hash, 'offset', address.offset);
        await this.redisClient.hSet(hash, 'currency', address.currency);
        await this.redisClient.hSet(hash, 'asname', address.asname);
      }

      return this.setUrl(hash, url).pipe(map(() => hash));
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        e.message,
        'Please check header parameters',
      );
    }
  }

  setUrl(hash: string, url: string): Observable<string> {
    return of(this.hashMap.set(hash, url).get(hash));
  }

  async retrieve(urlCode: string) {
    try {
      const timestamp_inunix = Math.floor(new Date().getTime() / 1000);
      const timestamp = new Date().toISOString();
      await this.redisClient.hSet(
        `users:${urlCode}:${timestamp_inunix}`,
        'timestamp_inunix',
        timestamp_inunix,
      );
      await this.redisClient.hSet(
        `users:${urlCode}:${timestamp_inunix}`,
        'timestamp',
        timestamp,
      );
      await this.redisClient.hIncrBy(
        `users:${urlCode}:${timestamp_inunix}`,
        'userCount',
        1,
      );
      const url = await this.redisClient.hGetAll(`${urlCode}`);
      if (url) return url;
    } catch (error) {
      throw new NotFoundException('Resource Not Found');
    }
  }

  async getUrlData(hash: string) {
    const allData = await this.redisClient.keys('*');
    // console.log(allData);
    const fetchData = await allData.map(async (res) => {
      if (!res.includes('users') && res.includes('users') !== undefined) {
        const data = await this.redisClient.hGetAll(`${res}`);
        return data;
      }
    });
    // console.log(fetchData);
    const element_details = await this.redisClient.keys(`users:${hash}:*`);
    const userUrlDetails = await this.redisClient.hGetAll(`${hash}`);
    const result = await element_details.map(async (item) => {
      const myArray = item.split(':');
      const timestamp = Number(myArray[2]);
      const userCounts = await this.redisClient.hGetAll(
        `users:${hash}:${timestamp}`,
      );
      return {
        datetime: userCounts.timestamp,
        user_count: userCounts.userCount,
      };
    });

    const response = await Promise.all(result);
    const mainArray = [
      {
        // userUrlDetails: userUrlDetails,
        datetimeData: [
          {
            datetime: '2023-02-01T10:12:59.949Z',
            user_count: '2',
          },
          {
            datetime: '2023-00-31T10:12:42.506Z',
            user_count: '1',
          },
          {
            datetime: '2023-01-01T10:12:58.905Z',
            user_count: '2',
          },
          {
            datetime: '2023-02-01T10:13:00.669Z',
            user_count: '2',
          },
        ],
      },
      {
        allUsers: await Promise.all(fetchData)
          .then(function (values) {
            return values.filter(function (value) {
              return typeof value !== 'undefined';
            });
          })
          .then(function (values) {
            return values;
          }),
      },
    ];
    return mainArray;
  }
}
