import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHeroFieldsToWeddingInfo1757408981157
  implements MigrationInterface
{
  name = 'AddHeroFieldsToWeddingInfo1757408981157';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wedding_info" ADD "hero_message" text NOT NULL DEFAULT 'Nous avons le plaisir de vous inviter à notre mariage le 13 Juillet 2026'`,
    );
    await queryRunner.query(
      `ALTER TABLE "wedding_info" ADD "hero_address" character varying(200) NOT NULL DEFAULT 'Lauziers, Condillac'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "wedding_info" DROP COLUMN "hero_address"`,
    );
    await queryRunner.query(
      `ALTER TABLE "wedding_info" DROP COLUMN "hero_message"`,
    );
  }
}
