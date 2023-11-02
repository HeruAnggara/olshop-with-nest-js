import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddCartDto } from './dto/addCart.dto';

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
}
