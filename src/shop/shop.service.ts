import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBarangDto } from './dto/create_barang.dto';

@Injectable()
export class ShopService {
    constructor(private prisma: PrismaService) {}

    /**
     * List barang
     * @param id 
     * @param keyword 
     * @param page 
     * @param limit 
     * @returns 
     */
    async listBarang(keyword: any, page: number = 1, limit: number = 10) {
        try {
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

    /**
     * tambah barang
     * @param id 
     * @param data 
     * @returns 
     */
    async tambahBarang(id: string, data: CreateBarangDto){
        try {
            const admin = await this.prisma.admin.findFirst({
                where: {akun_id: id}
            })

            if(!admin) throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);

            const price = parseInt(data.harga)
            const barang = await this.prisma.barang.create({
                data: {
                    id: uuidv4(),
                    nama_produk: data.nama_produk,
                    harga: price,
                    gambar: data.gambar
                }
            })

            return {
                statusCode: HttpStatus.OK,
                message: 'Data barang berhasil ditambahkan'
            }
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal Menambahkan barang'
            }
        }
    }
}
