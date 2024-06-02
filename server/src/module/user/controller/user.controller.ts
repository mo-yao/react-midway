// src/controller/user.controller.ts
import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Provide,
  Query,
  ALL,
  Put,
  Param,
  Del,
} from '@midwayjs/decorator';
import { Validate } from '@midwayjs/validate';
import { UserDTO } from '../dto/user';
import { UserService } from '../service/user.service';
import { UserEntity } from '../entity/user';

@Provide()
@Controller('/user')
export class UserController {
  @Inject()
  userService: UserService;

  @Post('/')
  @Validate()
  async create(@Body(ALL) data: UserDTO) {
    const user = new UserEntity();
    // user.name = data.name;
    // user.age = data.age;

    return await this.userService.create(user);
  }

  @Put('/')
  @Validate()
  async edit(@Body(ALL) data: UserDTO) {
    // const user = await this.userService.getById(data.id);
    // // update
    // user.name = data.name;
    // user.age = data.age;
    // return await this.userService.edit(user);
  }

  @Del('/:id')
  async remove(@Param('id') id: string) {
    const user = await this.userService.getById(id);
    await this.userService.remove(user);
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    return await this.userService.getById(id);
  }

  @Get('/page')
  async page(@Query('page') page: number, @Query('size') size: number) {
    return await this.userService.page(page, size);
  }

  @Get('/list')
  async list() {
    return await this.userService.list();
  }
}
