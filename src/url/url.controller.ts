import { Body, Controller, Get, Param, Post, Res } from '@nestjs/common';
import { UrlService } from './url.service';
import { UrlDto } from './url.dto';

@Controller('url')
export class UrlController {
  constructor(private service: UrlService) {}

  @Post('shorten')
  shortenUrl(
    @Body()
    url: UrlDto,
  ) {
    return this.service.shortenUrl(url);
  }

  @Get(':code')
  async redirect(
    @Res() res,
    @Param('code')
    code: string,
  ) {
    const url = await this.service.redirect(code);

    return res.redirect(url);
  }
}
