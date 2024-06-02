// src/dto/user.ts
import { ApiProperty } from '@midwayjs/swagger';
import { Rule, RuleType } from '@midwayjs/validate';

export class UserDTO {
  @ApiProperty({
    description: 'id',
  })
  @Rule(RuleType.allow(null))
  id?: number;
  @ApiProperty({
    description: '姓名',
  })
  @Rule(RuleType.string().required().error(new Error('姓名不能为空'))) // 这个错误消息正常需要做多语言的，这里demo偷懒不做了
  name: string;
  @ApiProperty({
    description: '年龄',
  })
  @Rule(RuleType.number().required().error(new Error('年龄不能为空')))
  age: number;
}

