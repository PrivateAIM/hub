import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1779354335393 implements MigrationInterface {
    name = 'Default1779354335393';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`master_images\` MODIFY COLUMN \`build_size\` bigint NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\` MODIFY COLUMN \`build_size\` bigint NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const [analysisRow] = await queryRunner.query(`
            SELECT COUNT(*) AS overflow_count
            FROM \`analysis_entity\`
            WHERE \`build_size\` IS NOT NULL
              AND (\`build_size\` > 4294967295 OR \`build_size\` < 0)
        `);
        const [masterRow] = await queryRunner.query(`
            SELECT COUNT(*) AS overflow_count
            FROM \`master_images\`
            WHERE \`build_size\` IS NOT NULL
              AND (\`build_size\` > 4294967295 OR \`build_size\` < 0)
        `);

        const analysisOverflow = Number(analysisRow.overflow_count);
        const masterOverflow = Number(masterRow.overflow_count);

        if (analysisOverflow > 0 || masterOverflow > 0) {
            throw new Error(
                'Rollback aborted: build_size values exceed the unsigned int range ' +
                `(analysis_entity: ${analysisOverflow}, master_images: ${masterOverflow}).`,
            );
        }

        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\` MODIFY COLUMN \`build_size\` int UNSIGNED NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`master_images\` MODIFY COLUMN \`build_size\` int UNSIGNED NULL
        `);
    }
}
