import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { hash } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) {}

    /**
     * Reigster akun
     * 
     * @param data 
     * @returns 
     */
    async register(data: RegisterDto) {
        try {
            const checkUser = await this.prisma.akun.findFirst({
                where: {
                  email: data.email,
                },
            });

            if (checkUser) {
                throw new HttpException('User already registered', HttpStatus.FOUND);
            }

            data.id = uuidv4();
            data.password = await hash(data.password, 12);
            const createAkun = await this.prisma.akun.create({
                data: {
                    id: data.id, 
                    email: data.email,
                    password: data.password
                }
            });

            data.akun_id = createAkun.id
            const createAdmin = await this.prisma.admin.create({
                data: {
                    id: uuidv4(),
                    akun_id: data.akun_id,
                    nama: data.nama
                }
            })

            if((createAkun) && (createAdmin))
                return {
                    statusCode: 200,
                    message: 'Register Berhasil',
                };

        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Registrasi Gagal'
            }
        }
    }
    
    async registerUser(data: RegisterDto) {
        try {
            const checkUser = await this.prisma.akun.findFirst({
                where: {
                  email: data.email,
                },
            });

            if (checkUser) {
                throw new HttpException('User already registered', HttpStatus.FOUND);
            }

            data.id = uuidv4();
            data.password = await hash(data.password, 12);
            const createAkun = await this.prisma.akun.create({
                data: {
                    id: data.id, 
                    email: data.email,
                    password: data.password
                }
            });
            
            data.akun_id = createAkun.id
            const createUser = await this.prisma.users.create({
                data: {
                    id: uuidv4(),
                    akun_id: data.akun_id,
                    nama: data.nama
                }
            })

            if((createAkun) && (createUser))
                return {
                    statusCode: 200,
                    message: 'Register Berhasil',
                };

        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Registrasi Gagal'
            }
        }
    }
}
