import type { MigrationInterface, QueryRunner } from 'typeorm';
import { generateAnalysisName, slugify } from '../../../../core/entities/analysis/generate-name.ts';

export class AnalysisDisplayName1780300000000 implements MigrationInterface {
    name = 'AnalysisDisplayName1780300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\`
            ADD \`display_name\` varchar(256) NULL
        `);

        // Preserve the existing free-form name as the human-readable display_name.
        await queryRunner.query(`
            UPDATE \`analysis_entity\`
            SET \`display_name\` = \`name\`
            WHERE \`name\` IS NOT NULL
        `);

        // Turn every existing name into a URL-friendly slug, generating one for
        // rows that have no name yet.
        const rows: { id: string; name: string | null }[] = await queryRunner.query(`
            SELECT \`id\`, \`name\` FROM \`analysis_entity\`
        `);

        for (const row of rows) {
            let next = row.name ? slugify(row.name) : '';
            if (next.length < 3) {
                next = generateAnalysisName();
            }

            await queryRunner.query(
                'UPDATE `analysis_entity` SET `name` = ? WHERE `id` = ?',
                [next, row.id],
            );
        }

        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\`
            MODIFY \`name\` varchar(128) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\`
            MODIFY \`name\` varchar(128) NULL
        `);

        // Restore the original free-form name that was moved into display_name
        // (truncated to the name column length). Rows that had no original name
        // keep their generated slug.
        await queryRunner.query(`
            UPDATE \`analysis_entity\`
            SET \`name\` = LEFT(\`display_name\`, 128)
            WHERE \`display_name\` IS NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\`
            DROP COLUMN \`display_name\`
        `);
    }
}
