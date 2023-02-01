import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
} from '@nestjs/common';
import { AppService } from './app.service';
import { map, Observable, of } from 'rxjs';
import { Request } from 'express';
interface ShortenResponse {
  hash: string;
}

interface ErrorResponse {
  error: string;
  code: number;
}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('csrf')
  async generateCSRFToken(@Req() req: any) {
    console.log("csruf: "+req.csrfToken());
    const token = await req.csrfToken();
    return {token:token};
  }

  @Post()
  async shorten(
    @Req() req: Request,
    @Body('url') url: string,
  ): Promise<Observable<ShortenResponse | ErrorResponse>> {
    if (!url) {
      return of({
        error: `No url provided. Please provide in the body. E.g. {'url':'https://google.com'}`,
        code: 400,
      });
    }
    return (await this.appService.shorten(url, req)).pipe(
      map((hash) => ({ hash })),
    );
  }

  @Get(':hash')
  async retrieveAndRedirect(@Param('hash') hash) {
    const res = await this.appService.retrieve(hash);
    console.log(res.hash);
    return res;
  }

  @Get('getUrlData/:hash')
  async getUrlData(@Param('hash') hash) {
    return await this.appService.getUrlData(hash);
  }
}
