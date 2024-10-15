import { ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseUUIDPipe, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './responses';
import { CurrentUser, Roles } from '@common/decorators';
import { JwtPayload } from '@auth/interfaces';
import { RolesGuard } from '@auth/guards/role.guard';
import { Role } from '@prisma/client';


@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService){}

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    async findOneUser(@Param('idOrEmail') idOrEmail: string){
        const user = await this.userService.findOne(idOrEmail)
        return new UserResponse(user)
    }

    
    @Delete(':id')
    async deleteUser(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: JwtPayload){
        return this.userService.delete(id, user)
    }

    @UseGuards(RolesGuard)
    @Roles(Role.ADMIN)
    @Get()
   async getAllUsers(){
    return this.userService.findAll()
   }
 
}
