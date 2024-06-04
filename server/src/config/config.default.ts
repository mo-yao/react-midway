import { MidwayConfig } from '@midwayjs/core';
import { TokenConfig } from '../interface/token.config';
import * as redisStore from 'cache-manager-ioredis';
import { env } from 'process';
import { MailConfig } from '../interface';
export default {
  // use for cookie sign key, should change to your own and keep security
  keys: '1716986839274_1098',
  redis: {
    client: {
      port: 6379, // Redis port
      host: 'localhost', // Redis host
      password: '123456',
      db: 0,
    },
  },
  koa: {
    port: 7001,
  },
  typeorm: {
    dataSource: {
      default: {
        /**
         * 单数据库实例
         */
        type: 'mysql',
        host: 'localhost', // 数据库ip地址，本地就写localhost
        port: 3306,
        username: 'root',
        password: '123456',
        database: 'midway-test', // 数据库名称
        synchronize: true, // 如果第一次使用，不存在表，有同步的需求可以写 true，注意会丢数据
        logging: true,
        // 扫描entity文件夹
        entities: ['**/entity/*{.ts,.js}'],
      },
    },
  },
  i18n: {
    // 把你的翻译文本放到这里
    localeTable: {
      en_US: require('../locales/en_US'),
      zh_CN: require('../locales/zh_CN'),
    },
  },
  token: {
    expire: 60 * 60 * 2, // 2小时
    refreshExpire: 60 * 60 * 24 * 7, // 7天
  } as TokenConfig,
  cache: {
    store: redisStore,
    options: {
      host: env.REDIS_HOST || 'localhost', // default value
      port: 6379, // default value
      password: env.REDIS_PASSWORD || '',
      db: 0,
      keyPrefix: 'cache:',
      ttl: 100,
    },
  },
  captcha: {
    default: {
      size: 4,
      noise: 1,
      width: 120,
      height: 40,
    },
    image: {
      type: 'mixed',
    },
    formula: {},
    text: {},
    expirationTime: 3600,
    idPrefix: 'captcha',
  },
  mail: {
    host: env.MAIL_HOST || 'smtp.qq.com',
    port: env.MAIL_PORT ? Number(env.MAIL_PORT) : 465,
    secure: true,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
  } as MailConfig,
} as MidwayConfig;
