import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService) {}

    async listBarang(id: string, keyword: any, page: number = 1, limit: number = 10) {
        try {
            const akun = await this.prisma.akun.findFirst({
                where: {
                  id: id,
                }
            });

            if(!akun) {
                throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
            }

            const skip = (page - 1) * limit;

            const where: Prisma.barangWhereInput = keyword
            ? {
                OR: [
                {
                    nama_produk: {
                        contains: keyword
                    }
                },
                ],
            }
            : {};

            const barang = await this.prisma.barang.findMany({
                where,
                skip,
                take: limit,
            })

            const totalItems = await this.prisma.barang.count({ where });

            return {
                statusCode: HttpStatus.OK,
                message: 'List data barang',
                data: {
                  barang,
                  totalItems,
                  totalPages: Math.ceil(totalItems / limit),
                  currentPage: page,
                }
              }
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal mengambil data barang'
            }
        }
    }
}
