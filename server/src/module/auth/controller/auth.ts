// src/module/auth/controller/auth.ts
import {
  Body,
  Controller,
  Inject,
  Post,
  Provide,
  ALL,
  Get,
} from '@midwayjs/decorator';
import { AuthService } from '../service/auth';
import { ApiResponse } from '@midwayjs/swagger';
import { TokenVO } from '../vo/token';
import { LoginDTO } from '../dto/login';
import { CaptchaService } from '../service/captcha';
import { R } from '../../../common/base.error.util';
import { RSAService } from '../../../common/rsa.service';

@Provide()
@Controller('/auth')
export class AuthController {
  @Inject()
  authService: AuthService;
  @Inject()
  captchaService: CaptchaService;
  @Inject()
  rsaService: RSAService;

  @Post('/login', { description: '登录' })
  @ApiResponse({ type: TokenVO })
  async login(@Body(ALL) loginDTO: LoginDTO) {
    const { captcha, captchaId } = loginDTO;

    const result = await this.captchaService.check(captchaId, captcha);

    if (!result) {
      throw R.error('验证码错误');
    }

    return await this.authService.login(loginDTO);
  }

  @Get('/publicKey')
  async getPublicKey() {
    return await this.rsaService.getPublicKey();
  }

  @Get('/captcha')
  async getImageCaptcha() {
    const { id, imageBase64 } = await this.captchaService.formula({
      height: 40,
      width: 120,
      noise: 1,
      color: true,
    });
    return {
      id,
      imageBase64,
    };
  }
}
