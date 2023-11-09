import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddCartDto } from './dto/addCart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import axios from 'axios';
import { GetOngkirDto } from './dto/getOngkir.dto';

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

    /**
     * Detail Cart
     * @param id 
     * @returns 
     */
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

    /**
     * Checkout
     * @param id 
     * @param barangId 
     * @returns 
     */
    async checkout(id: string, data: CheckoutDto) {
        try {
            const user = await this.prisma.users.findFirst({
                where: { akun_id: id }
            })

            if(!user) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            const keranjang = await this.prisma.keranjang.findMany({
                where: {
                    users_id: user.id
                }
            })

            const barang = await this.prisma.barang.findFirst({
                where: {
                    id: data.barang_id
                }
            })
            
            for(let x in keranjang) {  
                const totalBerat = barang.berat * keranjang[x].jumlah;   
                const ongkir = await this.cekOngkir(data.origin, data.destination, totalBerat);           
                const total = (barang.harga_diskon) ? keranjang[x].jumlah * barang.harga_diskon : keranjang[x].jumlah * barang.harga;
                await this.prisma.checkout.create({
                    data: {
                        id: uuidv4(),
                        users_id: user.id,
                        barang_id: data.barang_id,
                        total: total,
                        ongkir: ongkir
                    }
                })

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Barang telah dicheckout'
                }
            }  
        } catch (error) {
            console.log(error);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal melakukan checkout'
            }
        }
    }

    /**
     * Checkout Detail
     * @param id 
     * @param checkoutId 
     * @returns 
     */
    async checkoutDetail(id: string, checkoutId: string) {
        try {
            const user = await this.prisma.users.findFirst({
                where: { akun_id: id }
            })

            if(!user) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            const data = await this.prisma.checkout.findMany({
                where: {
                    id: checkoutId,
                    users_id: user.id
                },
                select: {
                    id: true,
                    total: true,
                    barang: {
                        select: {
                            nama_produk: true,
                            harga: true,
                            gambar: true
                        },
                    },
                    users: {
                        select: {
                            nama: true,
                            id: true
                        }
                    }
                }
            })

            return {
                statusCode: HttpStatus.OK,
                message: 'List barang checkout',
                data: data
            }
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal mendapatkan data checkkout'
            }
        }
    }

    /**
     * 
     * @param id 
     * @param checkoutId 
     * @param bukti 
     * @returns 
     */
    async konfirmasi(id: string, checkoutId: string, bukti: any) {
        try {
            const user = await this.prisma.users.findFirst({
                where: { akun_id: id }
            })

            if(!user) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            await this.prisma.konfirmasi.create({
                data: {
                    id: uuidv4(),
                    users_id: user.id,
                    checkout_id: checkoutId,
                    bukti: bukti,
                    status: 1,
                    total_transaksi: 30000
                }
            })

            return {
                statusCode: HttpStatus.CREATED,
                message: 'Berhasil membuat transaksi'
            }
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal melakukan transaksi'
            }
            
        }
    }

    /**
     * cek ongkir
     * @param origin 
     * @param destination 
     * @param weight 
     * @returns 
     */
    async cekOngkir(origin: string, destination: string, weight: number) {
        try {
          const response = await axios.post(
            'https://api.rajaongkir.com/starter/cost',
            {
              origin,
              destination,
              weight,
              courier: 'jne',
            },
            {
              headers: {
                key: process.env.API_KEY,
              },
            }
          );
    
          const rajaongkir = response.data.rajaongkir
          const detail = rajaongkir.results
          let x;
          for(x in detail){
            const costs = detail[x].costs;
            const regService = costs.filter(item => item.service === "REG");
            const costForRegService = regService.length > 0 ? regService[0].cost[0].value : [];

            return costForRegService;
          }
          
        } catch (error) {
          throw error;
        }
    }
}
