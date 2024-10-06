import { Body, Controller, Get, Post, Query, UseGuards, UseInterceptors, UsePipes, ValidationPipe } from '@nestjs/common';
import { FlowersService } from './flowers.service';
import { ParseIntPipe } from 'src/conception/parse-int.pipe';
import { AuthGuard } from 'src/conception/guard';
import { LoggingInterceptor } from 'src/conception/interceptor';
import { FlowersCreateDto } from './flowers.dto';

@Controller('flowers')
@UseInterceptors(LoggingInterceptor)
export class FlowersController {
  constructor(private readonly flowersService: FlowersService) {}

  @Get()
  @UseGuards(AuthGuard)
   findAll(@Query('pageNumber', ParseIntPipe) pageNumber: number){
    console.log(pageNumber)
    return this.flowersService.findAll()
   }

  @Post()
  @UsePipes(new ValidationPipe())
  @UseGuards(AuthGuard)
   create(@Body() dto: FlowersCreateDto){
    return this.flowersService.create(dto)
   }
}
