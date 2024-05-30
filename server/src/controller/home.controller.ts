// ./src/controller/home.controller.ts
import { Controller, Get, Inject } from '@midwayjs/core';
// import { InjectEntityModel } from '@midwayjs/typeorm';
import { RedisService } from '@midwayjs/redis';
// import { User } from '../entity/user';
// import { Repository } from 'typeorm';

@Controller('/')
export class HomeController {
  // 自动注入模型
  @Inject()
  redisService: RedisService;

  @Get('/')
  async home(): Promise<string> {
    // 查询user表数据
    // return await this.userModel.find();
    // 设置值
    await this.redisService.set('foo', 'bar');
    // 获取值
    return await this.redisService.get('foo');
  }
}
