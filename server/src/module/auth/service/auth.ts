// src/module/auth/service/auth.ts
import { Config, Inject, Provide } from '@midwayjs/decorator';
import { InjectDataSource, InjectEntityModel } from '@midwayjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { UserEntity } from '../../user/entity/user';
import { R } from '../../../common/base.error.util';
import { LoginDTO } from '../dto/login';
import { TokenVO } from '../vo/token';
import { TokenConfig } from '../../../interface/token.config';
import { RedisService } from '@midwayjs/redis';
import { uuid } from '../../../utils/uuid';
import { RefreshTokenDTO } from '../dto/refresh.token';
import { ResetPasswordDTO } from '../dto/reset.password';
import { RSAService } from '../../../common/rsa.service';
// import { SocketService } from '../../../socket/service';
// import { SocketMessageType } from '../../../socket/message';
@Provide()
export class AuthService {
  @InjectEntityModel(UserEntity)
  userModel: Repository<UserEntity>;
  @Config('token')
  tokenConfig: TokenConfig;
  @Inject()
  redisService: RedisService;
  @Inject()
  rsaService: RSAService;
  @InjectDataSource()
  defaultDataSource: DataSource;
  // @Inject()
  // socketService: SocketService;

  async login(loginDTO: LoginDTO): Promise<TokenVO> {
    const { accountNumber } = loginDTO;
    const user = await this.userModel
      .createQueryBuilder('user')
      .where('user.phoneNumber = :accountNumber', {
        accountNumber,
      })
      .orWhere('user.username = :accountNumber', { accountNumber })
      .orWhere('user.email = :accountNumber', { accountNumber })
      .select(['user.password', 'user.id'])
      .getOne();

    if (!user) {
      throw R.error('账号或密码错误！');
    }

    if (!bcrypt.compareSync(loginDTO.password, user.password)) {
      throw R.error('用户名或密码错误！');
    }

    const { expire, refreshExpire } = this.tokenConfig;

    const token = uuid();
    const refreshToken = uuid();

    // multi可以实现redis指令并发执行
    await this.redisService
      .multi()
      .set(`token:${token}`, user.id)
      .expire(`token:${token}`, expire)
      .set(`refreshToken:${refreshToken}`, user.id)
      .expire(`refreshToken:${refreshToken}`, refreshExpire)
      .exec();

    return {
      expire,
      token,
      refreshExpire,
      refreshToken,
    } as TokenVO;
  }


  async refreshToken(refreshToken: RefreshTokenDTO): Promise<TokenVO> {
    const userId = await this.redisService.get(
      `refreshToken:${refreshToken.refreshToken}`
    );

    if (!userId) {
      throw R.error('用户凭证已过期，请重新登录！');
    }

    const { expire } = this.tokenConfig;

    const token = uuid();

    await this.redisService
      .multi()
      .set(`token:${token}`, JSON.stringify({ userId, refreshToken }))
      .expire(`token:${token}`, expire)
      .exec();

    const refreshExpire = await this.redisService.ttl(
      `refreshToken:${refreshToken.refreshToken}`
    );

    return {
      expire,
      token,
      refreshExpire,
      refreshToken: refreshToken.refreshToken,
    } as TokenVO;
  }

  async resetPassword(resetPasswordDTO: ResetPasswordDTO) {
    const captcha = await this.redisService.get(
      `resetPasswordEmailCaptcha:${resetPasswordDTO.email}`
    );

    if (captcha !== resetPasswordDTO.emailCaptcha) {
      throw R.error('邮箱验证码错误或已失效');
    }

    const user = await this.userModel.findOneBy({
      email: resetPasswordDTO.email,
    });

    if (!user) {
      throw R.error('邮箱不存在');
    }

    const password = await this.rsaService.decrypt(
      resetPasswordDTO.publicKey,
      resetPasswordDTO.password
    );

    // 获取当前用户颁发的token和refreshToken，然后再下面给移除掉。
    const tokens = await this.redisService.smembers(`userToken_${user.id}`);
    const refreshTokens = await this.redisService.smembers(
      `userRefreshToken_${user.id}`
    );

    await this.defaultDataSource.transaction(async manager => {
      const hashPassword = bcrypt.hashSync(password, 10);
      user.password = hashPassword;
      await manager.save(UserEntity, user);

      await Promise.all([
        ...tokens.map(token => this.redisService.del(`token:${token}`)),
        ...refreshTokens.map(refreshToken =>
          this.redisService.del(`refreshToken:${refreshToken}`)
        ),
        this.redisService.del(
          `resetPasswordEmailCaptcha:${resetPasswordDTO.email}`
        ),
      ]);

      // this.socketService.sendMessage(user.id, {
      //   type: SocketMessageType.PasswordChange,
      // });
    });
  }
}
