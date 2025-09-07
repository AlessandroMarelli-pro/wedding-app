import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database';

// Import entities
import {
  Accommodation,
  Admin,
  CSVUpload,
  Guest,
  ProgramEvent,
  RSVPConfirmation,
  UploadedImage,
  WeddingInfo,
} from './entities';

// Import services
import {
  AccommodationService,
  AuthService,
  GuestService,
  ProgramService,
  RSVPService,
  WeddingService,
} from './services';

// Import controllers
import {
  AccommodationController,
  AdminAccommodationController,
  AdminController,
  AdminProgramController,
  AdminRSVPController,
  AdminWeddingController,
  AuthController,
  ProgramController,
  RSVPController,
  WeddingController,
} from './controllers';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig,
    }),
    TypeOrmModule.forFeature([
      Admin,
      WeddingInfo,
      Accommodation,
      Guest,
      ProgramEvent,
      RSVPConfirmation,
      CSVUpload,
      UploadedImage,
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET || 'wedding-jwt-secret',
      signOptions: { expiresIn: '1d' },
    }),
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [
    AuthController,
    WeddingController,
    AdminWeddingController,
    AccommodationController,
    AdminAccommodationController,
    ProgramController,
    AdminProgramController,
    RSVPController,
    AdminRSVPController,
    AdminController,
  ],
  providers: [
    AuthService,
    WeddingService,
    AccommodationService,
    GuestService,
    ProgramService,
    RSVPService,
  ],
})
export class AppModule {}
