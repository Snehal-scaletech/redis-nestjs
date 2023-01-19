import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppModule } from './app.module';

describe('App module unit test cases', () => {
  let controller: AppController;
  let service: AppService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();
    controller = moduleRef.get<AppController>(AppController);
    service = moduleRef.get<AppService>(AppService);
  });

  it('should be defined controller and serive', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
    expect(AppModule).toBeDefined();
  });

  it('should be [shorten] -- Success', async () => {
    const url = 'www.google.com';
    const mockRequest = () => {
      return {
        headers: {
          host: 'localhost:3000',
          'user-agent': 'PostmanRuntime/7.29.2',
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br',
          connection: 'keep-alive',
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': '62',
        },
        ip: '127.0.0.1',
      };
    };
    const req = mockRequest();
    const res = await controller.shorten(req as any, url);
    expect(res).toBeDefined();
  });

  it('should be [shorten] -- Failed', async () => {
    const url = '';
    const mockRequest = () => {
      return {
        headers: {
          host: 'localhost:3000',
          'user-agent': 'PostmanRuntime/7.29.2',
          accept: '*/*',
          'accept-encoding': 'gzip, deflate, br',
          connection: 'keep-alive',
          'content-type': 'application/x-www-form-urlencoded',
          'content-length': '62',
        },
        ip: '127.0.0.1',
      };
    };
    const req = mockRequest();
    const res = await controller.shorten(req as any, url);
    expect(res).toBeDefined();
  });

  it('should be [retrieveAndRedirect] -- Success', async () => {
    const hash = 'zqu61v';
    const res = await controller.retrieveAndRedirect(hash);
    expect(res).toBeDefined();
  });
});
