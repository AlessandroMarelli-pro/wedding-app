import * as bcrypt from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

export class SeedData1700000001000 implements MigrationInterface {
  name = 'SeedData1700000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create default admin user
    const adminId = uuidv4();
    const passwordHash = await bcrypt.hash('admin123', 12);

    await queryRunner.query(
      `
      INSERT INTO "admins" ("id", "email", "password_hash", "created_at", "updated_at")
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `,
      [adminId, 'admin@wedding.com', passwordHash],
    );

    // Create default wedding information
    const weddingInfoId = uuidv4();
    const weddingDate = new Date('2024-06-15T15:00:00Z').toISOString();

    await queryRunner.query(
      `
      INSERT INTO "wedding_info" (
        "id", "couple_names", "presentation_message", "wedding_address", 
        "wedding_date", "location_directions", "created_at", "updated_at"
      )
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `,
      [
        weddingInfoId,
        'Ariane & Timothe',
        'We are thrilled to celebrate our special day with you! Join us for an unforgettable celebration filled with love, laughter, and joy. Your presence means the world to us as we begin this beautiful journey together.',
        'Château de Malmaison, Avenue du Château, 92500 Rueil-Malmaison, France',
        weddingDate,
        'The venue is easily accessible by car with complimentary parking available. If traveling by public transport, take RER A to Rueil-Malmaison station, then bus 244 to Château stop. The ceremony will begin promptly at 3:00 PM in the gardens, followed by cocktails and dinner reception.',
      ],
    );

    // Create default accommodations
    const accommodations = [
      {
        id: uuidv4(),
        name: 'Hotel Renaissance Paris La Defense',
        description:
          'Elegant 4-star hotel with modern amenities, located just 15 minutes from the venue. Features spacious rooms, fitness center, and excellent restaurant.',
        address: '60 Jardin de Valmy, 92800 Puteaux, France',
        contactInfo: '+33 1 41 97 50 50 | renaissance-paris-ladefense.com',
        priceRange: '€180-250/night',
        isRecommended: true,
        displayOrder: 1,
      },
      {
        id: uuidv4(),
        name: 'Novotel Suites Paris Rueil Malmaison',
        description:
          'Contemporary all-suite hotel perfect for families, offering apartment-style accommodations with kitchenette facilities.',
        address: '22 Avenue Edouard Belin, 92500 Rueil-Malmaison, France',
        contactInfo: '+33 1 47 16 60 60 | novotel.com',
        priceRange: '€120-180/night',
        isRecommended: true,
        displayOrder: 2,
      },
      {
        id: uuidv4(),
        name: 'Best Western Villa Henri IV',
        description:
          'Charming boutique hotel with classic French décor, located in the heart of Saint-Germain-en-Laye with easy access to the venue.',
        address: '19-21 Rue Thiers, 78100 Saint-Germain-en-Laye, France',
        contactInfo: '+33 1 39 10 15 15 | villa-henri4.com',
        priceRange: '€90-140/night',
        isRecommended: false,
        displayOrder: 3,
      },
    ];

    for (const accommodation of accommodations) {
      await queryRunner.query(
        `
        INSERT INTO "accommodations" (
          "id", "name", "description", "address", "contact_info", 
          "price_range", "is_recommended", "display_order", "created_at", "updated_at"
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `,
        [
          accommodation.id,
          accommodation.name,
          accommodation.description,
          accommodation.address,
          accommodation.contactInfo,
          accommodation.priceRange,
          accommodation.isRecommended ? 1 : 0,
          accommodation.displayOrder,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove seeded data
    await queryRunner.query(`DELETE FROM "accommodations"`);
    await queryRunner.query(`DELETE FROM "wedding_info"`);
    await queryRunner.query(`DELETE FROM "admins"`);
  }
}
