import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1779354382106 implements MigrationInterface {
    name = 'Default1779354382106';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bucket_files" ALTER COLUMN "size" TYPE bigint
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const [{ overflow_count: overflow }] = await queryRunner.query(`
            SELECT COUNT(*) AS overflow_count
            FROM "bucket_files"
            WHERE "size" IS NOT NULL
              AND ("size" > 2147483647 OR "size" < -2147483648)
        `);

        if (Number(overflow) > 0) {
            throw new Error(
                `Rollback aborted: bucket_files.size values exceed the integer range (${overflow} rows).`,
            );
        }

        await queryRunner.query(`
            ALTER TABLE "bucket_files" ALTER COLUMN "size" TYPE integer
        `);
    }
}
