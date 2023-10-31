import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { compare, hash } from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { jwt_config } from 'src/config/jwt_config';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private jwtService: JwtService) {}

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
    
    /**
     * Register User
     * @param data 
     * @returns 
     */
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

    async login(data: LoginDto) {
        try {
            const akuns = await this.prisma.akun.findUnique({
                where: {
                    email: data.email,
                }
            });
    
            if (!akuns) {
                throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);
            }
    
            
            let userData;
            const admin = await this.prisma.admin.findFirst({
                where: {
                    akun_id: akuns.id
                }
            });
            const user = await this.prisma.users.findFirst({
                where: {
                    akun_id: akuns.id
                }
            });

            if (admin) {
                userData = admin;
            } else if (user) {
                userData = user;
            }

            if (!userData) {
                throw new HttpException('Pengguna tidak ditemukan', HttpStatus.NOT_FOUND);
            }

            const userPassword = await compare(data.password, akuns.password);
            if (userPassword) {
                const accessToken = this.generateJWT({
                    sub: akuns.id,
                    name: userData.nama,
                    email: akuns.email,
                });

                return {
                    statusCode: HttpStatus.OK,
                    token: accessToken,
                    message: `Login ${admin ? 'admin' : 'user'} berhasil`,
                };
            } else {
                return {
                    statusCode: 200,
                    message: 'Email atau password tidak cocok',
                };
            }
        } catch (error) {
            console.log(error);
            throw new HttpException('Email atau password tidak cocok', HttpStatus.BAD_REQUEST);            
        }
    }

    generateJWT(payload: any) {
        return this.jwtService.sign(payload, {
          secret: jwt_config.secret,
          expiresIn: jwt_config.expired,
        });
    }
}
