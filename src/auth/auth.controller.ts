import { RegisterDto } from './dto/register.dto';
import { Controller, Post, Body, Get, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { Public } from '../common/decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  //  @Post('register')
  // async register(@Body() dto: RegisterDto) {
  //   return this.authService.register(dto);
  // }
  
  // @UseGuards(AuthGuard('jwt'))
  // @Public()
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
