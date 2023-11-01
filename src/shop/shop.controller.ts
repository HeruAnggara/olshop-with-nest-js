import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { ShopService } from './shop.service';

@Controller('shop')
export class ShopController {
    constructor(private shop: ShopService) {}

    @Get('list/barang')
    @UseGuards(AuthGuard)
    async listBarang(@Req() req, @Query('keyword') keyword: any, @Query('page') page: number, @Query('limit') limit: number,) {
        const {id} = req.akun;
        return await this.shop.listBarang(id, keyword, page, limit);
    }
}
