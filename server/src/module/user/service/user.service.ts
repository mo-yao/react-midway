// src/service/user.service.ts
import { Provide } from '@midwayjs/core';
import { FindOptionsWhere, Repository } from 'typeorm';
import { UserEntity } from '../entity/user';
import { BaseService } from '../../../common/base.service';
import { InjectEntityModel } from '@midwayjs/typeorm';


@Provide()
export class UserService extends BaseService<UserEntity>{

  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;


  getModel(): Repository<UserEntity> {
    return this.userModel;
  }
  // 新增
  async create(user: UserEntity) {
    await this.userModel.save(user);
    return user;
  }

  // 删除
  async remove(user: UserEntity) {
    await await this.userModel.remove(user);
  }

  // 修改
  async edit(user: UserEntity): Promise<UserEntity> {
    return await this.userModel.save(user);
  }

  // 分页查询
  async page(page: number, pageSize: number, where?: FindOptionsWhere<UserEntity>) {
    // 按照创建日期倒序返回
    const order: any = { create_date: 'desc' };

    const [data, total] = await this.userModel.findAndCount({
      order,
      skip: page * pageSize,
      take: pageSize,
      where,
    });

    return { data, total };
  }

  // 根据查询条件返回全部
  async list(where?: FindOptionsWhere<UserEntity>) {
    const order: any = { create_time: 'desc' };
    const data = await this.userModel.find({
      where,
      order,
    });

    return data;
  }
}
