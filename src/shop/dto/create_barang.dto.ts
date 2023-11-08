import { IsNotEmpty, IsString } from "class-validator";

export class CreateBarangDto {
    
    @IsNotEmpty()
    @IsString()
    nama_produk: string

    @IsNotEmpty()
    harga: string

    harga_diskon: string

    gambar: string

    @IsNotEmpty()
    berat: number
}