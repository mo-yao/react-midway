import { Body, Controller, Inject, Post } from '@midwayjs/core';
import { UserDTO } from '../dto/user';
import { ILogger } from '@midwayjs/logger';

@Controller('/')
export class HomeController {
  @Inject()
  logger: ILogger;

  @Post('/')
  async home(@Body() user: UserDTO): Promise<void> {
    this.logger.info('hello');
    console.log(user);
  }
}
