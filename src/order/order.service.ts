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

            await this.prisma.keranjang.createMany({
                data: [{
                    id: uuidv4(),
                    users_id: user.id,
                    barang_id: data.barang_id,
                    jumlah: data.jumlah
                }]
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
                where: { akun_id: id },
                include: {
                    keranjang: true
                }
            })

            if(!user) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            const keranjang = user.keranjang;
            const barang = await this.prisma.barang.findFirst({
                where: {
                    id: data.barang_id
                }
            })

            const destination = user.kota_id;
            const ongkirPromises = keranjang.map(async (item) => {
                const totalBerat = barang.berat * item.jumlah;
                const total = (barang.harga_diskon) ? item.jumlah * barang.harga_diskon : item.jumlah * barang.harga;
                const ongkir = await this.cekOngkir("153", destination.toString(), totalBerat);
                return { ongkir, total };
            });
            try {
                const ongkirResults = await Promise.all(ongkirPromises);

                await this.prisma.checkout.createMany({
                    data: [{
                        id: uuidv4(),
                        users_id: user.id,
                        barang_id: data.barang_id,
                        total: ongkirResults[0].total, 
                        ongkir: ongkirResults[0].ongkir,
                        status: 1
                    }]
                });

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Barang telah dicheckout'
                }
            } catch (error) {
                console.error("Pemanggilan cekOngkir gagal:", error.message);
                throw new HttpException('Pemanggilan cekOngkir gagal', HttpStatus.INTERNAL_SERVER_ERROR);
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
    async transaksi(id: string, checkoutId: string, bukti: any) {
        try {
            const user = await this.prisma.users.findFirst({
                where: { akun_id: id },
                include: {
                    checkout: {
                        where: {
                            status: 1
                        }
                    }
                }                
            })

            if(!user) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            const checkkout = user.checkout;
            const totalPromises = checkkout.map(async (item) => {
                const total = item.total + item.ongkir
                return total;
            });

            const total = await Promise.all(totalPromises);
            await this.prisma.konfirmasi.create({
                data: {
                    id: uuidv4(),
                    users_id: user.id,
                    checkout_id: checkoutId,
                    bukti: bukti,
                    total_transaksi: total[0]
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

    async listService(id: string, data: GetOngkirDto) {
        try {
            const keranjang = await this.prisma.keranjang.findFirst({
                where:{
                    id: id
                }, 
                select: {
                    barang: {
                        select: {
                            berat: true
                        }
                    },
                    jumlah: true
                } 
            })

            if (!keranjang) {
                throw new HttpException('Keranjang tidak ditemukan', HttpStatus.NOT_FOUND);
              }
          
              const weight = keranjang.barang.berat; 
          
              const totalBerat = keranjang.jumlah * weight;
          
              const origin = data.origin;
              const destination = data.destination;
          
              const response = await axios.post(
                'https://api.rajaongkir.com/starter/cost',
                {
                  origin,
                  destination,
                  weight: totalBerat,
                  courier: 'jne',
                },
                {
                  headers: {
                    key: process.env.API_KEY,
                  },
                }
              );
  
            const rajaongkir = response.data.rajaongkir;
            const detail = rajaongkir.results[0].costs;
            const service = detail.map(async(item) => {
                const servis = item.service;
                const cost = item.cost;

                return {servis, cost}
            })

            const detailService = await Promise.all(service);

            for (let x = 0; x < detailService.length; x++) {
                const element = detailService[x];
            }

            return detailService[0].cost[0].value;

            // const serviceCost = detail.map(async(item) => {
            //     return
            // })
            return service;
            // let x;
            // for(x in detail){
            //   const costs = detail[x].costs;
            //   const regService = costs.filter(item => item.service === "REG");
            //   const costForRegService = regService.length > 0 ? regService[0].cost[0].value : [];
  
            //   return costForRegService;
            // }
            
          } catch (error) {
            throw error;
          }
    }
}
