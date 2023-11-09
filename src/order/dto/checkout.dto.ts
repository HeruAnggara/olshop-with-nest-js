import { IsNotEmpty, IsString } from "class-validator";

export class CheckoutDto {

    @IsNotEmpty()
    @IsString()
    barang_id: string

    @IsNotEmpty()
    @IsString()
    origin: string

    @IsNotEmpty()
    @IsString()
    destination: string
}