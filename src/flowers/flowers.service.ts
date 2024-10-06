import { Injectable} from '@nestjs/common';
import { FlowersCreateDto } from './flowers.dto';
import { PrismaService } from '@prisma/prisma.service';



@Injectable()
export class FlowersService {
    constructor(private readonly prisma: PrismaService){}
    findAll() {
        return this.prisma.flower.findMany()
    }
    create(dto: FlowersCreateDto){
        return this.prisma.flower.create({
            data: dto
        })
    }
}
