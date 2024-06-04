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
import { uuid } from '../../../utils/uuid';
import { UserService } from '../../user/service/user';
import { RedisService } from '@midwayjs/redis';
import { MailService } from '../../../common/mail.service';
// import { NotLogin } from '../../../decorator/not.login';
import { RefreshTokenDTO } from '../dto/refresh.token';
import { ResetPasswordDTO } from '../dto/reset.password';
@Provide()
@Controller('/auth')
export class AuthController {
  @Inject()
  authService: AuthService;
  @Inject()
  captchaService: CaptchaService;
  @Inject()
  rsaService: RSAService;
  @Inject()
  userService: UserService;
  @Inject()
  redisService: RedisService;
  @Inject()
  mailService: MailService;


  @Post('/login', { description: '登录' })
  @ApiResponse({ type: TokenVO })
  // @NotLogin()
  async login(@Body(ALL) loginDTO: LoginDTO) {
    const { captcha, captchaId } = loginDTO;

    const result = await this.captchaService.check(captchaId, captcha);

    if (!result) {
      throw R.error('验证码错误');
    }

    return await this.authService.login(loginDTO);
  }

  @Post('/refresh/token', { description: '刷新token' })
  // @NotLogin()
  async refreshToken(@Body(ALL) data: RefreshTokenDTO) {
    if (!data.refreshToken) {
      throw R.error('用户凭证已过期，请重新登录！');
    }
    return this.authService.refreshToken(data);
  }


  @Get('/captcha', { description: '获取验证码' })
  // @NotLogin()
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

  @Get('/publicKey')
  // @NotLogin()
  async getPublicKey() {
    return await this.rsaService.getPublicKey();
  }






  @Post('/send/reset/password/email')
  // @NotLogin()
  async sendResetPasswordEmail(@Body() emailInfo: { email: string }) {
    if (!emailInfo.email) {
      throw R.error('邮箱不能为空');
    }

    if (!(await this.userService.getByEmail(emailInfo.email))) {
      throw R.error('系统中不存在当前邮箱');
    }

    const emailCaptcha = uuid();

    await this.redisService.set(
      `resetPasswordEmailCaptcha:${emailInfo.email}`,
      emailCaptcha,
      'EX',
      60 * 30
    );

    const resetPasswordUrl = `https://fluxyadmin.cn/user/reset-password?email=${emailInfo.email}&emailCaptcha=${emailCaptcha}`;

    this.mailService.sendMail({
      to: emailInfo.email,
      html: `<div style="padding: 28px 0; color: #888;">
      <h1 style="color: #888;">
        <span style="color:#5867dd; margin:0 1px;"><a>${emailInfo.email}</a></span>， 你好！
      </h1>
      <p>请先确认本邮件是否是你需要的。</p>
      <p>请点击下面的地址，根据提示进行密码重置：</p>
      <a href="${resetPasswordUrl}" target="_blank" style="text-decoration: none;
      display: inline-block;
      padding: 8px 25px;
      background: #5867dd;
      cursor: pointer;
      color: #fff;
      border-radius: 5px;" rel="noopener">点击跳转到密码重置页面</a>
      <p>如果单击上面按钮没有反应，请复制下面链接到浏览器窗口中，或直接输入链接。</p>
      <p>
        ${resetPasswordUrl}
      </p>
      <p>如您未提交该申请，请不要理会此邮件，对此为您带来的不便深表歉意。</p>
      <p>本次链接30分钟后失效。</p>
      <div style="text-align: right;margin-top: 50px;">
        <span>fluxy-admin</span>
      </div>
    </div>`,
      subject: 'fluxy-admin平台密码重置提醒',
    });
  }

  // @NotLogin()
  @Post('/reset/password')
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDTO) {
    await this.authService.resetPassword(resetPasswordDTO);
  }
}
