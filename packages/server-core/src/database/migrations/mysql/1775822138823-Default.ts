import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1775822138823 implements MigrationInterface {
    name = 'Default1775822138823';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`master_images\` MODIFY COLUMN \`build_size\` bigint UNSIGNED NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\` MODIFY COLUMN \`build_size\` bigint UNSIGNED NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\` MODIFY COLUMN \`build_size\` int UNSIGNED NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`master_images\` MODIFY COLUMN \`build_size\` int UNSIGNED NULL
        `);
    }
}
