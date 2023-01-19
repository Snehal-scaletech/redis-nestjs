import {
  Controller,
  Get,
  Post,
  Body,
  Redirect,
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
  @Redirect()
  retrieveAndRedirect(@Param('hash') hash): Observable<{ url: string }> {
    return this.appService.retrieve(hash).pipe(map((url) => ({ url })));
  }
}
