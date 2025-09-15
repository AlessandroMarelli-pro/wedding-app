import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Admin } from '../entities/admin.entity';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class AuthService {
  private readonly SALT_ROUNDS = 12;
  private readonly TOKEN_EXPIRY = 24 * 60 * 60; // 24 hours in seconds

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { email, password } = loginRequest;

    // Find admin by email
    const admin = await this.adminRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (!admin) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate JWT token
    const payload: JwtPayload = {
      sub: admin.id,
      email: admin.email,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.TOKEN_EXPIRY,
    });

    return {
      accessToken,
      expiresIn: this.TOKEN_EXPIRY,
    };
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  async validateToken(token: string): Promise<JwtPayload> {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async findAdminById(id: string): Promise<Admin | null> {
    return this.adminRepository.findOne({ where: { id } });
  }

  async createAdmin(email: string, password: string): Promise<Admin> {
    const existingAdmin = await this.adminRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      return existingAdmin;
    }

    const passwordHash = await this.hashPassword(password);

    const admin = this.adminRepository.create({
      email: email.toLowerCase(),
      passwordHash,
    });

    return this.adminRepository.save(admin);
  }
}
