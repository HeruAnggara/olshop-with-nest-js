import { IsNotEmpty, IsString } from "class-validator";

export class CheckoutDto {

    @IsNotEmpty()
    @IsString()
    barang_id: string

}