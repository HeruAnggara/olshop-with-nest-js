import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartDto } from './dto/addCart.dto';

@Injectable()
export class OrderService {
    constructor(private prisma: PrismaService) {}

    /**
     * Add to cart
     * @param id 
     * @param data 
     * @returns 
     */
    async addToCart(id: string, data: AddCartDto){
        try {
            const user = await this.prisma.users.findFirst({
                where:{ akun_id: id }
            })

            if(!user) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            await this.prisma.keranjang.create({
                data: {
                    id: uuidv4(),
                    users_id: user.id,
                    barang_id: data.barang_id,
                    jumlah: data.jumlah
                }
            })

            return {
                statusCode: HttpStatus.CREATED,
                message: 'Ditambahkan ke keranjang'
            }
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal menambhkan ke keranjang'
            }
        }
    }

    async detailCart(id: string) {
        try {
            const user = await this.prisma.users.findFirst({
                where: { akun_id: id }
            })

            if(!user) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            const data = await this.prisma.keranjang.findMany({
                where: {
                    users_id: user.id
                },
                select: {
                    id: true,
                    jumlah: true,
                    users: {
                        select: {
                            nama: true
                        }
                    },
                    barang: {
                        select: {
                            nama_produk: true,
                            harga: true,
                            gambar: true
                        }
                    }
                }
            })

            return {
                statusCode: HttpStatus.OK,
                message: 'Barang di keranjang',
                data: data
            }
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal mendapatkan data keranjang'
            }
        }
    }
}
