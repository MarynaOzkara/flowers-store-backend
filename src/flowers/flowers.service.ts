import { Injectable} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { FlowersCreateDto } from './flowers.dto';



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
