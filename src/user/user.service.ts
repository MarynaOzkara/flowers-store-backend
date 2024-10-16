import { ForbiddenException, Inject, Injectable} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { JwtPayload } from '@auth/interfaces';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { convertToSecondsUtil } from '@common/utils';



@Injectable()
export class UserService {
    constructor(
        private readonly prismaServise: PrismaService, 
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
        private readonly configService: ConfigService
    ){}

    create(user: Partial<User>){
        const hashedPassword = user?.password ? this.hashPassword(user.password) : null
        return this.prismaServise.user.create({
            data: {
                email: user.email,
                password: hashedPassword,
                roles: ["USER"]
            }
        })
    }

    async findOne(idOrEmail: string, isReset = false){
        if(isReset){
           await this.cacheManager.del(idOrEmail)
        }
        const user = await this.cacheManager.get<User>(idOrEmail)
        if(!user){
            console.log('findOne')
            const user = await this.prismaServise.user.findFirst({
                where: {
                    OR: [
                        {id: idOrEmail},
                        {email: idOrEmail}
                    ]
                }
            })
            if(!user){
                return null
            }
        
            await this.cacheManager.set(idOrEmail, user, convertToSecondsUtil(this.configService.get('JWT_EXP')))
            return user
        }
        return user
    }

    async findAll(){
        return this.prismaServise.user.findMany({})
    }

    async delete(id: string, user: JwtPayload){
    if(user.id !== id && !user.roles.includes(Role.ADMIN)){
        throw new ForbiddenException('You have no rights to delete this User')
    }
    await Promise.all([
        this.cacheManager.del(id),
        this.cacheManager.del(user.email)
    ])
    
    return this.prismaServise.user.delete({where: {id}, select: {id: true}})
  }

    private hashPassword(password: string){
        return hashSync(password, genSaltSync(10))
    }
}
