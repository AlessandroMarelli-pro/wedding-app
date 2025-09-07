import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class AddProgramEvents1700000002000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'program_events',
        columns: [
          {
            name: 'id',
            type: 'varchar',
            length: '36',
            isPrimary: true,
            generationStrategy: 'uuid',
          },
          {
            name: 'title',
            type: 'varchar',
            length: '100',
            isNullable: false,
          },
          {
            name: 'description',
            type: 'text',
            length: '500',
            isNullable: false,
          },
          {
            name: 'start_time',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'end_time',
            type: 'datetime',
            isNullable: false,
          },
          {
            name: 'location',
            type: 'varchar',
            length: '200',
            isNullable: false,
          },
          {
            name: 'display_order',
            type: 'int',
            isNullable: false,
            isUnique: true,
          },
          {
            name: 'include_in_calendar',
            type: 'boolean',
            default: 1,
            isNullable: false,
          },
          {
            name: 'created_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updated_at',
            type: 'datetime',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
        ],
      }),
      true,
    );

    // Insert sample program events
    await queryRunner.query(`
      INSERT INTO program_events (id, title, description, start_time, end_time, location, display_order, include_in_calendar)
      VALUES 
        (
          '550e8400-e29b-41d4-a716-446655440001',
          'Wedding Ceremony',
          'Join us for the exchange of vows in a beautiful ceremony surrounded by family and friends.',
          '2024-06-15 15:00:00',
          '2024-06-15 16:00:00',
          'Garden Chapel, Vineyard Estate',
          1,
          1
        ),
        (
          '550e8400-e29b-41d4-a716-446655440002',
          'Cocktail Hour',
          'Celebrate with cocktails and hors d''oeuvres while we take photos.',
          '2024-06-15 16:00:00',
          '2024-06-15 17:30:00',
          'Terrace Lounge, Vineyard Estate',
          2,
          1
        ),
        (
          '550e8400-e29b-41d4-a716-446655440003',
          'Wedding Reception',
          'Dinner, dancing, and celebration! Join us for an evening of joy and merriment.',
          '2024-06-15 17:30:00',
          '2024-06-15 23:00:00',
          'Grand Ballroom, Vineyard Estate',
          3,
          1
        ),
        (
          '550e8400-e29b-41d4-a716-446655440004',
          'Late Night Snacks',
          'Grab some late-night bites before heading home or to your hotel.',
          '2024-06-15 23:00:00',
          '2024-06-15 23:30:00',
          'Lobby Bar, Vineyard Estate',
          4,
          0
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('program_events');
  }
}
