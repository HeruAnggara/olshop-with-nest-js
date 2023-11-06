import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { compare, hash } from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { jwt_config } from 'src/config/jwt_config';
import { EditDto } from './dto/edit.dto';
import { Prisma } from '@prisma/client';

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
                    nama: data.nama,
                    alamat: data.alamat,
                    no_wa: data.no_wa
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

    /**
     * Login User
     * @param data 
     * @returns 
     */
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

    /**
     * List Pengguna
     * @param akunId 
     * @returns 
     */
    async listPengguna(akunId: string) {
        try {
            const admin = await this.prisma.admin.findFirst({
                where: { akun_id: akunId },
            });
    
            if(!admin) {
                throw new HttpException('Bad Request', HttpStatus.NOT_FOUND);
            }

            // const skip = (page - 1) * limit;

            // const where: Prisma.adminWhereInput = keyword
            // ? {
            //     OR: [
            //         {
            //             nama: {
            //                 contains: keyword
            //             },
            //         },
            //     ],
            // }
            // : {};
    
            const list = await this.prisma.akun.findMany({
                select: {
                    email: true,
                    admin: {
                        select: {
                            nama: true,
                            avatar: true
                        }
                    },
                    users: {
                        select: {
                            nama: true,
                            avatar: true
                        }
                    }
                },
                // where,
                // skip,
                // take: limit,
            })

            // const totalItems = await this.prisma.akun.count({ where });
    
            return {
                statusCode: HttpStatus.OK,
                message: 'List Data Pengguna',
                data: list
            }
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal mendapat list admin'
            }
            
        }
    }

    /**
     * Upload avatar
     * @param id 
     * @param avatar 
     * @returns 
     */
    async uploadAvatar(id: string, avatar: any) {
        try {
            const akun = await this.prisma.akun.findFirst({
                where: {
                  id: id,
                },
                include: {
                    admin: true,
                    users: true
                }
            });

            if(!akun) {
                throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
            }

            const admin = await this.prisma.admin.findFirst({
                where: {
                    akun_id: id
                }
            });

            const user = await this.prisma.users.findFirst({
                where: {
                    akun_id: id
                }
            });
            
            if(admin) {
                const uploadAvatar = await this.prisma.admin.update({
                    data: {
                        avatar: avatar
                    }, 
                    where: {
                        id: admin.id
                    }
                })

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Upload avatar berhasil',
                };
            } else if(user) {
                const uploadAvatar = await this.prisma.users.update({
                    data: {
                        avatar: avatar
                    }, 
                    where: {
                        id: user.id
                    }
                })

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Upload avatar berhasil',
                };
            }  
        } catch (error) {
            console.log(error.message);
            return{
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal Upload Foto'
            }
        }
    }

    /**
     * Update avatar
     * @param id 
     * @param gambar 
     * @returns 
     */
    async updateAvatar(id: string, gambar){
        try {
            const akun = await this.prisma.akun.findFirst({
                where: {
                  id: id,
                },
                include: {
                    admin: true,
                    users: true
                }
            });

            if(!akun) {
                throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
            }

            const admin = await this.prisma.admin.findFirst({
                where: {
                    akun_id: id
                }
            });

            const user = await this.prisma.users.findFirst({
                where: {
                    akun_id: id
                }
            });
            
            if(admin) {
                const filePath = `public/uploads/image/${admin.avatar}`;
                await fs.promises.unlink(filePath); 
                await this.prisma.admin.update({
                    data: {
                        avatar: gambar
                    }, 
                    where: {
                        id: admin.id
                    }
                })

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Update avatar berhasil',
                };
            } else if(user) {
                const filePath = `public/uploads/image/${user.avatar}`;
                await fs.promises.unlink(filePath); 
                await this.prisma.users.update({
                    data: {
                        avatar: gambar
                    }, 
                    where: {
                        id: user.id
                    }
                })

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Update avatar berhasil',
                };
            }  
        } catch (error) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Gagal update file: ${error.message}`
            }    
        }
    } 

    /**
     * Delete avatar
     * @param id 
     * @returns 
     */
    async deleteAvatar(id: string) {
        try {
            const akun = await this.prisma.akun.findFirst({
                where: {
                  id: id,
                },
                include: {
                    admin: true,
                    users: true
                }
            });

            if(!akun) {
                throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
            }

            const admin = await this.prisma.admin.findFirst({
                where: {
                    akun_id: id
                }
            });

            const user = await this.prisma.users.findFirst({
                where: {
                    akun_id: id
                }
            });
            
            if(admin) {
                const filePath = `public/uploads/image/${admin.avatar}`;
                await fs.promises.unlink(filePath); 
                await this.prisma.admin.update({
                    data: {
                        avatar: '-'
                    }, 
                    where: {
                        id: admin.id
                    }
                })

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Update avatar berhasil',
                };
            } else if(user) {
                const filePath = `public/uploads/image/${user.avatar}`;
                await fs.promises.unlink(filePath); 
                await this.prisma.users.update({
                    data: {
                        avatar: '-'
                    }, 
                    where: {
                        id: user.id
                    }
                })

                return {
                    statusCode: HttpStatus.CREATED,
                    message: 'Update avatar berhasil',
                };
            }  
        } catch (error) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: `Gagal menghapus file: ${error.message}`
            }    
        }
    }

    /**
     * Edit data akun
     * @param id 
     * @param data 
     * @returns 
     */
    async editDataAkun(id: string, data: EditDto) {
        try {
            const akun = await this.prisma.akun.findFirst({
                where: {
                  id: id,
                },
                include: {
                    admin: true,
                    users: true
                }
            });

            if(!akun) {
                throw new HttpException('Bad request', HttpStatus.BAD_REQUEST);
            }

            const admin = await this.prisma.admin.findFirst({
                where: {
                    akun_id: id
                }
            });

            const user = await this.prisma.users.findFirst({
                where: {
                    akun_id: id
                }
            });
            
            data.newPassword = await hash(data.newPassword, 12);
            if(admin) {
                const checkPassword = await compare(
                    data.oldPassword,
                    akun.password,
                );

                if (checkPassword) {
                    await this.prisma.akun.update({
                        where: {
                            id: id
                        }, 
                        data: {
                            email: data.email,
                            password: data.newPassword
                        }
                    })
                    await this.prisma.admin.update({
                        data: {
                            nama: data.nama
                        }, 
                        where: {
                            id: admin.id
                        }
                    })
                    return {
                        statusCode: HttpStatus.CREATED,
                        message: 'Update data admin berhasil',
                    };
                }
                
            } else if(user) {
                const checkPassword = await compare(
                    data.oldPassword,
                    akun.password,
                );

                if (checkPassword) {
                    await this.prisma.akun.update({
                        where: {
                            id: id
                        }, 
                        data: {
                            email: data.email,
                            password: data.newPassword
                        }
                    })
                    await this.prisma.users.update({
                        data: {
                            nama: data.nama
                        }, 
                        where: {
                            id: user.id
                        }
                    })
                    return {
                        statusCode: HttpStatus.CREATED,
                        message: 'Update data user berhasil',
                    };
                }
            }  
        } catch (error) {
            console.log(error.message);
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'Gagal edit data'
            }
        }
    }

    generateJWT(payload: any) {
        return this.jwtService.sign(payload, {
          secret: jwt_config.secret,
          expiresIn: jwt_config.expired,
        });
    }
}
