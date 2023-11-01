import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Patch, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() data: RegisterDto) {
        return await this.authService.register(data);
    }
    
    @Post('register/user')
    async registerUser(@Body() data: RegisterDto) {
        return await this.authService.registerUser(data);
    }

    @Post('login')
    async login(@Body() data: LoginDto) {
        return await this.authService.login(data);
    }

    @Get('list/pengguna')
    @UseGuards(AuthGuard)
    async listPengguna(@Req() req) {
        const {id} = req.akun ;
        return await this.authService.listPengguna(id);
    }

    @Patch('upload/avatar')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('avatar', {
          storage: diskStorage({
            destination: 'public/uploads/image',
            filename: (req, file, cb) => {
              const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
              cb(null, uniqueSuffix + extname(file.originalname));
            },
          }),
          fileFilter: (req, file, cb) => {
            const allowedExtensions = ['.jpeg', '.png', '.jpg'];
            const maxSize = 2 * 1024 * 1024; // 2MB

            const fileExtension = extname(file.originalname).toLowerCase();
            if (!allowedExtensions.includes(fileExtension)) {
              return cb(new Error('Only JPEG, PNG, or JPG files are allowed'), false);
            }

            if (file.size > maxSize) {
              return cb(new Error('File size cannot exceed 2 MB'), false);
            }

            cb(null, true);
          }
        }),
      )
    async uploadAvatar(@UploadedFile(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|jpg)/ }),
        ],
      })) file: Express.Multer.File,
      @Req() req
    ) {
        const {id} = req.akun;
        return await this.authService.uploadAvatar(id, file.filename)
    }  

}
