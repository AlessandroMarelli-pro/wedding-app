require('dotenv').config({ path: './.env' });
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function setupPostgreSQLFresh() {
  try {
    console.log('🚀 Setting up fresh PostgreSQL database...\n');

    // Create default admin if it doesn't exist
    const defaultAdminEmail =
      process.env.DEFAULT_ADMIN_EMAIL || 'admin@wedding.com';
    const defaultAdminPassword =
      process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await prisma.admin.findUnique({
      where: { email: defaultAdminEmail },
    });

    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      await prisma.admin.create({
        data: {
          email: defaultAdminEmail,
          passwordHash: hashedPassword,
        },
      });
      console.log('✅ Default admin created:', defaultAdminEmail);
    } else {
      console.log('ℹ️  Default admin already exists.');
    }

    // Create default wedding info if it doesn't exist
    const existingWeddingInfo = await prisma.weddingInfo.findFirst();

    if (!existingWeddingInfo) {
      await prisma.weddingInfo.create({
        data: {
          id: 'default-wedding-info', // Use a fixed ID for upsert logic
          coupleNames: process.env.DEFAULT_COUPLE_NAMES || 'Ariane & Timothe',
          presentationMessage:
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
          heroMessage: 'Join us for our special day',
          heroAddress: 'Château de Malmaison',
        },
      });
      console.log('✅ Default wedding info created');
    } else {
      console.log('ℹ️  Default wedding info already exists.');
    }

    // Create sample program events
    const existingEvents = await prisma.programEvent.count();
    if (existingEvents === 0) {
      await prisma.programEvent.createMany({
        data: [
          {
            title: 'Cérémonie',
            description: 'Cérémonie de mariage dans les jardins du château',
            startTime: new Date('2024-06-15T15:00:00Z'),
            endTime: new Date('2024-06-15T16:00:00Z'),
            location: 'Jardins du Château de Malmaison',
            displayOrder: 1,
            includeInCalendar: true,
            icon: '💒',
          },
          {
            title: 'Cocktail',
            description: 'Cocktail de bienvenue avec apéritifs',
            startTime: new Date('2024-06-15T16:30:00Z'),
            endTime: new Date('2024-06-15T18:30:00Z'),
            location: 'Terrasse du Château',
            displayOrder: 2,
            includeInCalendar: true,
            icon: '🥂',
          },
          {
            title: 'Dîner',
            description: 'Dîner de gala dans la salle de réception',
            startTime: new Date('2024-06-15T19:00:00Z'),
            endTime: new Date('2024-06-15T22:00:00Z'),
            location: 'Salle de réception du Château',
            displayOrder: 3,
            includeInCalendar: true,
            icon: '🍽️',
          },
          {
            title: 'Soirée dansante',
            description: 'Soirée dansante avec DJ et orchestre',
            startTime: new Date('2024-06-15T22:00:00Z'),
            endTime: new Date('2024-06-16T02:00:00Z'),
            location: 'Salle de bal du Château',
            displayOrder: 4,
            includeInCalendar: true,
            icon: '💃',
          },
        ],
      });
      console.log('✅ Sample program events created');
    } else {
      console.log('ℹ️  Program events already exist.');
    }

    // Create sample accommodations
    const existingAccommodations = await prisma.accommodation.count();
    if (existingAccommodations === 0) {
      await prisma.accommodation.createMany({
        data: [
          {
            name: 'Hôtel de la Paix',
            description: 'Hôtel 4 étoiles situé à 5 minutes du château',
            address: '15 Avenue de la Paix, 92500 Rueil-Malmaison',
            contactInfo: '+33 1 47 49 00 00',
            priceRange: '€€€',
            isRecommended: true,
            displayOrder: 1,
            sourceUrl: 'https://example.com/hotel-paix',
          },
          {
            name: 'Château de Malmaison',
            description: 'Hébergement directement dans le château',
            address: 'Avenue du Château, 92500 Rueil-Malmaison',
            contactInfo: '+33 1 41 29 05 55',
            priceRange: '€€€€',
            isRecommended: true,
            displayOrder: 2,
            sourceUrl: 'https://example.com/chateau-malmaison',
          },
        ],
      });
      console.log('✅ Sample accommodations created');
    } else {
      console.log('ℹ️  Accommodations already exist.');
    }

    console.log('\n🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup error:', error);

    if (error.code === 'P1001') {
      console.log('\n❌ Cannot reach database server.');
      console.log(
        'Please ensure PostgreSQL is running and the connection string is correct.',
      );
      console.log('\nTo start PostgreSQL:');
      console.log('  - macOS: brew services start postgresql');
      console.log('  - Linux: sudo systemctl start postgresql');
      console.log('  - Windows: Start PostgreSQL service');
    } else if (error.code === 'P1008') {
      console.log('\n❌ Operation timed out.');
      console.log('Please check your database connection and try again.');
    } else if (error.code === 'P1017') {
      console.log('\n❌ Database connection closed.');
      console.log('Please check your database server status.');
    }

    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

setupPostgreSQLFresh();
