import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

export interface SeedData {
  adminUsers?: Array<{
    email: string;
    password: string;
  }>;
  weddingInfo?: {
    coupleNames: string;
    weddingDate: Date;
    presentationMessage?: string;
    weddingAddress?: string;
    locationDirections?: any[];
    heroMessage?: string;
    heroAddress?: string;
  };
}

export class SeedService {
  /**
   * Seed static data (admin users and wedding info)
   * This should be called during application startup
   */
  static async seedStaticData(): Promise<void> {
    try {
      console.log('🌱 Starting database seeding...');

      // Seed admin users
      await this.seedAdminUsers();

      // Seed wedding info
      await this.seedWeddingInfo();

      // Seed app config
      await this.seedAppConfig();

      console.log('✅ Database seeding completed successfully!');
    } catch (error) {
      console.error('❌ Database seeding failed:', error);
      throw error;
    }
  }

  /**
   * Seed admin users based on environment variables
   */
  private static async seedAdminUsers(): Promise<void> {
    const isProduction = process.env.NODE_ENV === 'production';

    // Default admin user (only in non-production)
    const defaultAdminUser = isProduction
      ? []
      : [
          {
            email: process.env.DEFAULT_ADMIN_EMAIL || 'admin@wedding.com',
            password: process.env.DEFAULT_ADMIN_PASSWORD || 'admin123',
          },
        ];

    // Additional users from environment variable
    const envUsers =
      process.env.USERS?.split(',').map((user) => {
        const [email, password] = user.split(':');
        return { email, password };
      }) || [];

    const users = [...defaultAdminUser, ...envUsers];

    for (const user of users) {
      await this.createAdmin(user.email, user.password);
    }

    console.log(`👤 Seeded ${users.length} admin user(s)`);
  }

  /**
   * Create an admin user if it doesn't exist
   */
  private static async createAdmin(
    email: string,
    password: string,
  ): Promise<void> {
    const existingAdmin = await prisma.admin.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingAdmin) {
      console.log(`👤 Admin user already exists: ${email}`);
      return;
    }

    const passwordHash = await hashPassword(password);

    await prisma.admin.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    console.log(`👤 Created admin user: ${email}`);
  }

  /**
   * Seed wedding info if it doesn't exist
   */
  private static async seedWeddingInfo(): Promise<void> {
    const existingWeddingInfo = await prisma.weddingInfo.findFirst();

    if (existingWeddingInfo) {
      console.log('💒 Wedding info already exists');
      return;
    }

    const defaultWeddingInfo = {
      id: 'default-wedding-info',
      coupleNames: process.env.DEFAULT_COUPLE_NAMES || 'Ariane & Timothe',
      presentationMessage:
        process.env.DEFAULT_PRESENTATION_MESSAGE ||
        'Welcome to our wedding website! We are excited to celebrate this special day with you.',
      weddingAddress:
        process.env.DEFAULT_WEDDING_ADDRESS ||
        'Château de Malmaison, Avenue du Château, 92500 Rueil-Malmaison, France',
      weddingDate: new Date(
        process.env.DEFAULT_WEDDING_DATE || '2024-06-15T15:00:00Z',
      ),
      locationDirections: [
        {
          type: 'car',
          information: 'By car from Paris, take the A13 motorway.',
          location: {
            address: 'Château de Malmaison',
            link: 'https://maps.google.com',
          },
        },
      ],
      heroMessage:
        process.env.DEFAULT_HERO_MESSAGE || 'Join us for our special day',
      heroAddress: process.env.DEFAULT_HERO_ADDRESS || 'Château de Malmaison',
    };

    await prisma.weddingInfo.create({
      data: defaultWeddingInfo,
    });

    console.log('💒 Created default wedding info');
  }

  /**
   * Seed app configuration
   */
  private static async seedAppConfig(): Promise<void> {
    const existingColorConfig = await prisma.appConfig.findUnique({
      where: {
        key: 'primary_color',
      },
    });

    if (existingColorConfig) {
      console.log('🎨 App config already exists');
      return;
    }

    await prisma.appConfig.create({
      data: {
        key: 'primary_color',
        value: '#95E1D3',
      },
    });

    console.log('🎨 Created default app config');
  }

  /**
   * Manual seeding with custom data
   */
  static async seedCustomData(data: SeedData): Promise<void> {
    try {
      console.log('🌱 Starting custom data seeding...');

      if (data.adminUsers) {
        for (const user of data.adminUsers) {
          await this.createAdmin(user.email, user.password);
        }
        console.log(`👤 Seeded ${data.adminUsers.length} custom admin user(s)`);
      }

      if (data.weddingInfo) {
        const existingWeddingInfo = await prisma.weddingInfo.findFirst();

        if (!existingWeddingInfo) {
          await prisma.weddingInfo.create({
            data: {
              id: 'default-wedding-info',
              ...data.weddingInfo,
            },
          });
          console.log('💒 Created custom wedding info');
        } else {
          console.log('💒 Wedding info already exists, skipping custom data');
        }
      }

      console.log('✅ Custom data seeding completed successfully!');
    } catch (error) {
      console.error('❌ Custom data seeding failed:', error);
      throw error;
    }
  }

  /**
   * Reset all data (use with caution!)
   */
  static async resetDatabase(): Promise<void> {
    try {
      console.log('🗑️ Resetting database...');

      // Delete in reverse order of dependencies
      await prisma.rSVPConfirmation.deleteMany();
      await prisma.guest.deleteMany();
      await prisma.programEvent.deleteMany();
      await prisma.accommodation.deleteMany();
      await prisma.uploadedImage.deleteMany();
      await prisma.cSVUpload.deleteMany();
      await prisma.weddingInfo.deleteMany();
      await prisma.admin.deleteMany();

      console.log('✅ Database reset completed');
    } catch (error) {
      console.error('❌ Database reset failed:', error);
      throw error;
    }
  }
}

// Default export function for Prisma seed
export default async function seed() {
  await SeedService.seedStaticData();
}

// Allow running the seed script directly
if (require.main === module) {
  seed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
