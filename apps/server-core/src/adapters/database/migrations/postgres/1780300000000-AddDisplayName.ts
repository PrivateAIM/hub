import type { MigrationInterface, QueryRunner } from 'typeorm';
import { generateName, slugify } from '@privateaim/kit';

export class AddDisplayName1780300000000 implements MigrationInterface {
    name = 'AddDisplayName1780300000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ----- analysis_entity -----
        await queryRunner.query(`
            ALTER TABLE "analysis_entity"
            ADD "display_name" character varying(256)
        `);

        // Preserve the existing free-form name as the human-readable display_name.
        await queryRunner.query(`
            UPDATE "analysis_entity"
            SET "display_name" = "name"
            WHERE "name" IS NOT NULL
        `);

        // Turn every existing name into a URL-friendly slug, generating one for
        // rows that have no name yet.
        const analysisRows: { id: string; name: string | null }[] = await queryRunner.query(`
            SELECT "id", "name" FROM "analysis_entity"
        `);

        for (const row of analysisRows) {
            let next = row.name ? slugify(row.name) : '';
            if (next.length < 3) {
                next = generateName();
            }

            await queryRunner.query(
                'UPDATE "analysis_entity" SET "name" = $1 WHERE "id" = $2',
                [next, row.id],
            );
        }

        await queryRunner.query(`
            ALTER TABLE "analysis_entity"
            ALTER COLUMN "name" SET NOT NULL
        `);

        // ----- projects -----
        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD "display_name" character varying(256)
        `);

        // Preserve the existing (unique) name as the human-readable display_name.
        await queryRunner.query(`
            UPDATE "projects"
            SET "display_name" = "name"
        `);

        // Replace each name with a fresh, unique slug. The name column is UNIQUE,
        // so dedupe generated values; generated slugs never match a still-original
        // name, so there is no transient collision with unprocessed rows either.
        const projectRows: { id: string; name: string }[] = await queryRunner.query(`
            SELECT "id", "name" FROM "projects"
        `);

        const usedProjectNames = new Set<string>(projectRows.map((row) => row.name));
        for (const row of projectRows) {
            let next = generateName();
            while (usedProjectNames.has(next)) {
                next = generateName();
            }
            usedProjectNames.add(next);

            await queryRunner.query(
                'UPDATE "projects" SET "name" = $1 WHERE "id" = $2',
                [next, row.id],
            );
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // ----- projects -----
        // Restore the original (unique) name that was moved into display_name.
        await queryRunner.query(`
            UPDATE "projects"
            SET "name" = LEFT("display_name", 256)
            WHERE "display_name" IS NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "projects"
            DROP COLUMN "display_name"
        `);

        // ----- analysis_entity -----
        await queryRunner.query(`
            ALTER TABLE "analysis_entity"
            ALTER COLUMN "name" DROP NOT NULL
        `);

        // Restore the original free-form name that was moved into display_name
        // (truncated to the name column length). Rows that had no original name
        // keep their generated slug.
        await queryRunner.query(`
            UPDATE "analysis_entity"
            SET "name" = LEFT("display_name", 128)
            WHERE "display_name" IS NOT NULL
        `);

        await queryRunner.query(`
            ALTER TABLE "analysis_entity"
            DROP COLUMN "display_name"
        `);
    }
}
