import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds indexes for lookups that run outside the rapiq allow-lists, and makes
 * the foreign key indexes on `master_image_id` explicit. Every change it makes:
 *
 * - `analysis_bucket_files (bucket_file_id)`: the storage aggregators resolve
 *   the hub row by the storage file it mirrors — `findOneBy({ bucketFileId })`
 *   on every storage file deletion, and `bucket_id = ? AND bucket_file_id IN (…)`
 *   on every TEMP bucket clear (#1860). Neither column was indexed, so both
 *   scanned the fastest-growing table.
 * - `analysis_nodes (node_realm_id, analysis_id)` REPLACES the single-column
 *   `node_realm_id` index. It still leads with `node_realm_id`, so the
 *   allow-listed `nodeRealmId` filter keeps its anchor, and the trailing
 *   `analysis_id` answers the participation lookup
 *   (`SELECT analysis_id … WHERE node_realm_id = ?`, plan 021) from the index
 *   alone. Created before the old index is dropped, so the filter is never
 *   unindexed.
 * - `project_nodes (node_realm_id, project_id)` REPLACES the single-column
 *   `node_realm_id` index, for the same reason on the project side: plan 022
 *   scopes project reads like plan 021 scopes analyses
 *   (`SELECT project_id … WHERE node_realm_id = ?`), and the leading
 *   `node_realm_id` keeps anchoring the allow-listed `nodeRealmId` filter.
 * - `analyses (master_image_id)` and `projects (master_image_id)`: declared on
 *   the entities for postgres, which keeps no implicit index on a foreign key
 *   column. On MySQL the explicit index displaces the implicit one InnoDB kept
 *   for the constraint (named after it: FK_344d29541553fb6bce75ce4cd32,
 *   FK_9334a5beb56029a11fc212664dd), so it changes the index name, not the
 *   query plan.
 *
 * Because of that displacement, down() does NOT drop the two master-image
 * indexes — a DROP INDEX would fail with "needed in a foreign key constraint"
 * (and MySQL DDL is non-transactional). It renames each back to its
 * constraint's name instead, restoring the exact pre-migration state; the
 * same pattern as 1788400000000-AlignAnalysesConstraintNamesAndAddQueryIndexes.
 *
 * Index names are typeorm's DefaultNamingStrategy output (taken from
 * `migration generate`), so the entity metadata and the migrated schema agree
 * and the drift gate stays quiet.
 */
export class AddLookupAndForeignKeyIndexes1788600000000 implements MigrationInterface {
    name = 'AddLookupAndForeignKeyIndexes1788600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX \`IDX_0f9188fff4b6692bb0a727d91c\` ON \`analysis_bucket_files\` (\`bucket_file_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_70c555594ee7926d9df7e895a5\` ON \`analysis_nodes\` (\`node_realm_id\`, \`analysis_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_b443086bf7d7e32edead69e77c\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_e17be232c93d5ca298780527c2\` ON \`project_nodes\` (\`node_realm_id\`, \`project_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7f8520e90b18fe847c0aea2287\` ON \`project_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_344d29541553fb6bce75ce4cd3\` ON \`analyses\` (\`master_image_id\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_9334a5beb56029a11fc212664d\` ON \`projects\` (\`master_image_id\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`projects\` RENAME INDEX \`IDX_9334a5beb56029a11fc212664d\` TO \`FK_9334a5beb56029a11fc212664dd\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analyses\` RENAME INDEX \`IDX_344d29541553fb6bce75ce4cd3\` TO \`FK_344d29541553fb6bce75ce4cd32\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_7f8520e90b18fe847c0aea2287\` ON \`project_nodes\` (\`node_realm_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e17be232c93d5ca298780527c2\` ON \`project_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_b443086bf7d7e32edead69e77c\` ON \`analysis_nodes\` (\`node_realm_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_70c555594ee7926d9df7e895a5\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0f9188fff4b6692bb0a727d91c\` ON \`analysis_bucket_files\`
        `);
    }
}
