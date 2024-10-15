import { ForbiddenException, Injectable} from '@nestjs/common';
import { PrismaService } from '@prisma/prisma.service';
import { Role, User } from '@prisma/client';
import { genSaltSync, hashSync } from 'bcrypt';
import { JwtPayload } from '@auth/interfaces';



@Injectable()
export class UserService {
    constructor(private readonly prismaServise: PrismaService){}

    create(user: Partial<User>){
        const hashedPassword = this.hashPassword(user.password)
        return this.prismaServise.user.create({
            data: {
                email: user.email,
                password: hashedPassword,
                roles: ["USER"]
            }
        })
    }

    findOne(idOrEmail: string){
        return this.prismaServise.user.findFirst({
            where: {
                OR: [
                    {id: idOrEmail},
                    {email: idOrEmail}
                ]
            }
        })
    }

  delete(id: string, user: JwtPayload){
    if(user.id !== id && !user.roles.includes(Role.ADMIN)){
        throw new ForbiddenException('You have no rights to delete this User')
    }
    return this.prismaServise.user.delete({where: {id}, select: {id: true}})
  }

    private hashPassword(password: string){
        return hashSync(password, genSaltSync(10))
    }
}
