import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { AddCartDto } from './dto/addCart.dto';
import { CheckoutDto } from './dto/checkout.dto';

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
}
