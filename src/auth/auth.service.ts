import { ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { UserService } from '@user/user.service';
import { Tokens } from './interfaces';
import { compareSync } from 'bcrypt';
import { User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
  constructor(
     private readonly userService: UserService,
     private readonly jwtService: JwtService,
     private readonly prismaService: PrismaService
    ){}

    async register(dto: RegisterDto){
        const user: User = await this.userService.findOne(dto.email).catch(err => {
            this.logger.error(err)
             return null
         })
         if(user){
             throw new ConflictException(`User with email: ${JSON.stringify(dto.email)} already exist`)
         }
        return this.userService.create(dto).catch(err => {
            this.logger.error(err)
            return null
        })
    }

    async login(dto: LoginDto): Promise<Tokens>{
        const user: User = await this.userService.findOne(dto.email).catch(err => {
           this.logger.error(err)
            return null
        })
        if(!user){
            throw new UnauthorizedException('Not correct login or password')
        }
        const accessToken = this.jwtService.sign({
            id: user.id,
            email: user.email,
            roles: user.roles
        })
        const refreshToken = await this.getRefreshToken(user.id)

        return {accessToken, refreshToken}
    }

  private  async getRefreshToken(userId: string){
    return this.prismaService.token.create({
        data: {
            token: v4(),
            exp: add(new Date(), {months: 1}),
            userId
        }
    })
  }
}
