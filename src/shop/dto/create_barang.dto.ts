import { IsNotEmpty, IsString } from "class-validator";

export class CreateBarangDto {
    
    @IsNotEmpty()
    @IsString()
    nama_produk: string

    @IsNotEmpty()
    harga: number

    @IsNotEmpty()
    gambar: string
}