import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const client = new Redis({
          host: configService.get<string>('app.redis.host', 'localhost'),
          port: configService.get<number>('app.redis.port', 6379),
          password: configService.get<string>('app.redis.password') || undefined,
          db: configService.get<number>('app.redis.db', 0),
          retryStrategy: (times) => {
            if (times > 3) {
              console.warn('Redis connection failed after 3 retries. Continuing without cache.');
              return null;
            }
            return Math.min(times * 200, 2000);
          },
        });

        client.on('connect', () => console.log('✅ Redis connected'));
        client.on('error', (err) => console.warn('⚠️  Redis error:', err.message));

        return client;
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
