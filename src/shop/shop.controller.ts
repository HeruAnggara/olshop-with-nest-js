import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Query, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ShopService } from './shop.service';
import { CreateBarangDto } from './dto/create_barang.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('shop')
export class ShopController {
    constructor(private shop: ShopService) {}

    @Get('list/barang')
    @UseGuards(AuthGuard)
    async listBarang(@Query('keyword') keyword: any, @Query('page') page: number, @Query('limit') limit: number) {
        return await this.shop.listBarang(keyword, page, limit);
    }

    @Post('barang')
    @UseGuards(AuthGuard)
    @UseInterceptors(
        FileInterceptor('gambar', {
          storage: diskStorage({
            destination: 'public/uploads/barang',
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
    async tambahBarang(@Req() req, @Body() data: CreateBarangDto, @UploadedFile(new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 2000000 }),
          new FileTypeValidator({ fileType: /image\/(jpeg|png|jpg)/ }),
        ],
      })) file: Express.Multer.File) {
        const {id} = req.user; 
        data.gambar = file.filename;
        return await this.shop.tambahBarang(id, data);
      }    
}
