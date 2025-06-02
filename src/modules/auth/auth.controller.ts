import { Controller, Request, Post, UseGuards, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @UseGuards(AuthGuard('local'))
  async login(@Request() req, @Body() loginAuthDto: LoginAuthDto) {
    // loginAuthDto is included for validation purposes if a global ValidationPipe is used.
    // The actual authentication is handled by AuthGuard('local') which invokes LocalStrategy.
    // req.user is populated by LocalStrategy upon successful authentication.
    return this.authService.login(req.user);
  }
}
