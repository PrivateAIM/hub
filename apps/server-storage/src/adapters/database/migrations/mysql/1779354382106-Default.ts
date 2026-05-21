import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1779354382106 implements MigrationInterface {
    name = 'Default1779354382106';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bucket_files\` MODIFY COLUMN \`size\` bigint UNSIGNED NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const [row] = await queryRunner.query(`
            SELECT COUNT(*) AS overflow_count
            FROM \`bucket_files\`
            WHERE \`size\` IS NOT NULL
              AND (\`size\` > 4294967295 OR \`size\` < 0)
        `);

        const overflow = Number(row.overflow_count);

        if (overflow > 0) {
            throw new Error(
                `Rollback aborted: bucket_files.size values exceed the unsigned int range (${overflow} rows).`,
            );
        }

        await queryRunner.query(`
            ALTER TABLE \`bucket_files\` MODIFY COLUMN \`size\` int UNSIGNED NULL
        `);
    }
}
