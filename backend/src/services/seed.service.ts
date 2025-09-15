import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { WeddingService } from './wedding.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly authService: AuthService,
    private readonly weddingService: WeddingService,
  ) {}

  async onApplicationBootstrap() {
    try {
      // This will throw if DB isn't connected
      await this.seedStaticData();
    } catch (error) {
      // Handle connection or seeding errors
      console.error('Seeding failed:', error);
      // Optionally: process.exit(1) to prevent startup
    }
  }

  async seedStaticData() {
    const users = process.env.USERS?.split(',').map((user) => {
      const [email, password] = user.split(':');
      return { email, password };
    }) || [
      {
        email: 'admin@wedding.com',
        password: 'admin123',
      },
    ];
    for (const user of users) {
      await this.authService.createAdmin(user.email, user.password);
    }
    await this.weddingService.initializeWeddingInfo({
      coupleNames: 'John Doe',
      weddingDate: new Date('2026-07-13T00:00:00Z'),
    });
  }
}
