import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1775822138823 implements MigrationInterface {
    name = 'Default1775822138823';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "master_images" ALTER COLUMN "build_size" TYPE bigint
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity" ALTER COLUMN "build_size" TYPE bigint
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "analysis_entity" ALTER COLUMN "build_size" TYPE integer
        `);
        await queryRunner.query(`
            ALTER TABLE "master_images" ALTER COLUMN "build_size" TYPE integer
        `);
    }
}
