import { IsInt, IsNotEmpty, IsString } from "class-validator"

export class AddCartDto {
    id: string

    users_id: string

    @IsNotEmpty()
    @IsString()
    barang_id: string

    @IsNotEmpty()
    @IsInt()
    jumlah: number
}