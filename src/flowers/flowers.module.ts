import { Module } from '@nestjs/common';
import { FlowersService } from './flowers.service';
import { FlowersController } from './flowers.controller';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@prisma/prisma.service';

@Module({
  controllers: [FlowersController],
  providers: [FlowersService, PrismaService, ConfigService],
})
export class FlowersModule {}
