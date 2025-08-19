import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiResponseDto } from './dto/auth-response.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const result = await this.authService.register(registerDto);
    return new ApiResponseDto({
      success: true,
      data: result,
      message: 'User registered successfully',
      timestamp: new Date().toISOString(),
    });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return new ApiResponseDto({
      success: true,
      data: result,
      message: 'Login successful',
      timestamp: new Date().toISOString(),
    });
  }

  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleAuth(@Body() googleAuthDto: GoogleAuthDto) {
    const result = await this.authService.loginWithGoogle(googleAuthDto);
    return new ApiResponseDto({
      success: true,
      data: result,
      message: 'Google authentication successful',
      timestamp: new Date().toISOString(),
    });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() req) {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    const result = await this.authService.refreshToken(refreshToken);
    return new ApiResponseDto({
      success: true,
      data: result,
      message: 'Tokens refreshed successfully',
      timestamp: new Date().toISOString(),
    });
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Request() req) {
    await this.authService.logout(req.user.userId);
    return new ApiResponseDto({
      success: true,
      message: 'Logout successful',
      timestamp: new Date().toISOString(),
    });
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verify(@Request() req) {
    const user = await this.authService.getCurrentUser(req.user.userId);
    return new ApiResponseDto({
      success: true,
      data: user,
      message: 'Valid token',
      timestamp: new Date().toISOString(),
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req) {
    const user = await this.authService.getCurrentUser(req.user.userId);
    return new ApiResponseDto({
      success: true,
      data: user,
      message: 'User data retrieved',
      timestamp: new Date().toISOString(),
    });
  }
}
