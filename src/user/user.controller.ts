import { Body, ClassSerializerInterceptor, Controller, Delete, Get, Param, ParseUUIDPipe, Post, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserResponse } from './responses';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService){}

    @UseInterceptors(ClassSerializerInterceptor)
    @Post()
    async createUser(@Body() dto: CreateUserDto){
        const user = await this.userService.create(dto)
        return new UserResponse(user)
    }

    @UseInterceptors(ClassSerializerInterceptor)
    @Get(':idOrEmail')
    async findOneUser(@Param('idOrEmail') idOrEmail: string){
        const user = await this.userService.findOne(idOrEmail)
        return new UserResponse(user)
    }

    
    @Delete(':id')
    async deleteUser(@Param('id', ParseUUIDPipe) id: string){
        return this.userService.delete(id)
    }
 
}
