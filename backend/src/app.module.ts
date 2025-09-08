import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseConfig } from './config/database';
import { documentUploadConfig } from './config/upload';

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
  CalendarService,
  GuestService,
  ImageService,
  ProgramService,
  RSVPService,
  UploadMaintenanceService,
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
    ScheduleModule.forRoot(),
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
    MulterModule.registerAsync({
      useFactory: () => documentUploadConfig,
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
    CalendarService,
    GuestService,
    ImageService,
    ProgramService,
    RSVPService,
    UploadMaintenanceService,
  ],
})
export class AppModule {}
