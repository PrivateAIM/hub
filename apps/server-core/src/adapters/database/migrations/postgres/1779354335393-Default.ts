import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1779354335393 implements MigrationInterface {
    name = 'Default1779354335393';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "master_images" ALTER COLUMN "build_size" TYPE bigint
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity" ALTER COLUMN "build_size" TYPE bigint
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const [{ overflow_count: analysisOverflow }] = await queryRunner.query(`
            SELECT COUNT(*)::int AS overflow_count
            FROM "analysis_entity"
            WHERE "build_size" IS NOT NULL
              AND ("build_size" > 2147483647 OR "build_size" < -2147483648)
        `);
        const [{ overflow_count: masterOverflow }] = await queryRunner.query(`
            SELECT COUNT(*)::int AS overflow_count
            FROM "master_images"
            WHERE "build_size" IS NOT NULL
              AND ("build_size" > 2147483647 OR "build_size" < -2147483648)
        `);

        if (Number(analysisOverflow) > 0 || Number(masterOverflow) > 0) {
            throw new Error(
                'Rollback aborted: build_size values exceed the integer range ' +
                `(analysis_entity: ${analysisOverflow}, master_images: ${masterOverflow}).`,
            );
        }

        await queryRunner.query(`
            ALTER TABLE "analysis_entity" ALTER COLUMN "build_size" TYPE integer
        `);
        await queryRunner.query(`
            ALTER TABLE "master_images" ALTER COLUMN "build_size" TYPE integer
        `);
    }
}
