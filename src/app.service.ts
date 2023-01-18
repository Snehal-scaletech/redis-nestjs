import { Injectable } from '@nestjs/common';
import { createClient } from 'redis';
@Injectable()
export class AppService {
  async getHello() {
    const client = createClient();
    console.log(client);

    client.on('error', (err) => console.log('Redis Client Error', err));

    await client.connect();

    await client.set('redis-nestjs', 'success');
    const value = await client.get('key');
    console.log(value);
    await client.disconnect();

    return 'Hello World';
  }

  // client.on('error', (err) => console.log('Redis Client Error', err));

  // await client.connect();

  // await client.set('key', 'value');
  // const value = await client.get('key');
  // await client.disconnect();
}
