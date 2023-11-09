import { IsNotEmpty, IsString } from "class-validator"

export class GetOngkirDto {

    @IsNotEmpty()
    @IsString()
    origin: string

    @IsNotEmpty()
    @IsString()
    destination: string

    // @IsNotEmpty()
    // @IsString()
    // courier: string
}