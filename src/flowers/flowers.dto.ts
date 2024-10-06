import { IsNumber, IsString } from "class-validator"

export class FlowersCreateDto {
    @IsString()
    name: string

    @IsString()
    color: string

    @IsNumber()
    price: number
}

export type TFlowersUpdateDto = Partial<FlowersCreateDto>