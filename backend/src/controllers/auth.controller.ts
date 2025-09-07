import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  AuthService,
  LoginRequest,
  LoginResponse,
} from '../services/auth.service';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin login' })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    //  type: LoginResponse,
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  async login(@Body() loginRequest: LoginRequest): Promise<LoginResponse> {
    try {
      return await this.authService.login(loginRequest);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Login failed');
    }
  }
}
