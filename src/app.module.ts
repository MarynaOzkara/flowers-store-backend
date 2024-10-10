import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FlowersModule } from './flowers/flowers.module';
import { loggerMidddleware } from './conception/middleware';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';

@Module({
  imports: [ConfigModule.forRoot({
   isGlobal: true
  }),FlowersModule, UserModule, PrismaModule, AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard
    }
  ]
  
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(loggerMidddleware).forRoutes('flowers')
  }
}
