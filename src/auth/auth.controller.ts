import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
}
