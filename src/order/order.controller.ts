import { Body, Controller, FileTypeValidator, Get, HttpException, HttpStatus, MaxFileSizeValidator, Param, ParseFilePipe, ParseIntPipe, Post, Req, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddCartDto } from './dto/addCart.dto';
import { CheckoutDto } from './dto/checkout.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('order')
export class OrderController {
    constructor(private order: OrderService) {}

    @Post('cart')
    @UseGuards(AuthGuard)
    async addToCart(@Req() req, @Body() data: AddCartDto) {
        const {id} = req.user;
        return await this.order.addToCart(id, data);
    }

    @Get('cart')
    @UseGuards(AuthGuard)
    async detailCart(@Req() req) {
        const {id} = req.user
        return await this.order.detailCart(id);
    }

    @Post('checkout')
    @UseGuards(AuthGuard)
    async checkout(@Req() req, @Body() data: CheckoutDto) {
        const {id} = req.user
        return await this.order.checkout(id, data);
    }

    @Get('checkout/:checkoutId')
    @UseGuards(AuthGuard)
    async checkoutList(@Req() req, @Param('checkoutId') checkoutId: string) {
        const {id} = req.user;
        return await this.order.checkoutDetail(id, checkoutId);
    }

    @Post('transaksi/:checkoutId')
    @UseGuards(AuthGuard)
    @UseInterceptors(
    FileInterceptor('bukti', {
        storage: diskStorage({
            destination: 'public/uploads/bukti',
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + extname(file.originalname));
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedExtensions = ['.jpeg', '.png', '.jpg'];
            const maxSize = 2 * 1024 * 1024;
      
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
    async transaksi(@Req() req, @Param('checkoutId') checkoutId: string, @UploadedFile() file: Express.Multer.File) {
    const { id } = req.user;

    let fileName = null;
    
    if (file) {
        const allowedExtensions = ['.jpeg', '.png', '.jpg'];
        const maxSize = 2 * 1024 * 1024;
        const fileExtension = extname(file.originalname).toLowerCase();

        if (!allowedExtensions.includes(fileExtension)) {
        return new HttpException('Only JPEG, PNG, or JPG files are allowed', HttpStatus.BAD_REQUEST);
        }

        if (file.size > maxSize) {
        return new HttpException('File size cannot exceed 2 MB', HttpStatus.BAD_REQUEST);
        }

        fileName = file.filename;
    }

    return await this.order.konfirmasi(id, checkoutId, fileName);
    }

    @Get("cek/ongkir/:origin/:destination/:weight")
    async cekOngkir(
        @Param('origin') origin: string,
        @Param('destination') destination: string,
        @Param('weight', ParseIntPipe) weight: number
    ) {
        return await this.order.cekOngkir(origin,
            destination,
            weight
            )
    }
}
