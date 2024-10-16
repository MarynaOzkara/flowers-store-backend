import { ConflictException, HttpException, HttpStatus, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { LoginDto, RegisterDto } from './dto';
import { UserService } from '@user/user.service';
import { Tokens } from './interfaces';

import { Provider, User } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@prisma/prisma.service';
import { v4 } from 'uuid';
import { add } from 'date-fns';
import { compareSync } from 'bcrypt';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name)
  constructor(
     private readonly userService: UserService,
     private readonly jwtService: JwtService,
     private readonly prismaService: PrismaService
    ){}

    async refreshTokens(refreshToken: string, agent: string): Promise<Tokens>{
       const token = await this.prismaService.token.findUnique({where: {token: refreshToken}})
       if(!token){
        throw new UnauthorizedException()
       }
       await this.prismaService.token.delete({where: {token: refreshToken}})

       if(new Date(token.exp) < new Date()){
        throw new UnauthorizedException()
       }
       
       const user = await this.userService.findOne(token.userId)
      return this.generateTokens(user, agent)
    }

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

    async login(dto: LoginDto, agent: string): Promise<Tokens>{
        const user: User = await this.userService.findOne(dto.email, true).catch(err => {
           this.logger.error(err)
            return null
        })
        if(!user || !compareSync(dto.password, user.password)){
            throw new UnauthorizedException('Not correct login or password')
        }
        return this.generateTokens(user, agent)
    }

  private async generateTokens(user: User, agent: string): Promise<Tokens>{
    const accessToken = 'Bearer ' + this.jwtService.sign({
        id: user.id,
        email: user.email,
        roles: user.roles
    })
    const refreshToken = await this.getRefreshToken(user.id, agent)

    return {accessToken, refreshToken}
  }

  private async getRefreshToken(userId: string, agent: string){
    const _token = await this.prismaService.token.findFirst({
        where: {
            userId,
            userAgent: agent
        }
    })
    const token = _token?.token ?? ''
    return this.prismaService.token.upsert({
        where: {token},
        update: {
            token: v4(),
            exp: add(new Date(), {months: 1}),
        },
        create: {
            token: v4(),
            exp: add(new Date(), {months: 1}),
            userId,
            userAgent: agent
        }
    })
  }

  deleteRefreshToken(token: string){
    return this.prismaService.token.delete({where: {token}})
  }

  async googleAuth(email: string, agent: string){
    const userExist = await this.userService.findOne(email)
    if(userExist){
        return this.generateTokens(userExist, agent)
    }
    const user = await this.userService.create({email, provider: Provider.GOOGLE}).catch(err => {
        this.logger.error(err)
        return null
    })
    if(!user){
        throw new HttpException(`Can not create user with emai: ${email} in Google Auth`, HttpStatus.BAD_REQUEST)
    }
    return this.generateTokens(user, agent)
  }
}
