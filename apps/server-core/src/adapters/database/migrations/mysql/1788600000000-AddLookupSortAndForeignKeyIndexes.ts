import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds indexes for lookups that run outside the rapiq allow-lists, composite
 * lookup and sort indexes on the node junctions, and makes
 * the foreign key indexes on `master_image_id` explicit. Every change it makes:
 *
 * - `analysis_bucket_files (bucket_file_id)`: the storage aggregators resolve
 *   the hub row by the storage file it mirrors — `findOneBy({ bucketFileId })`
 *   on every storage file deletion, and `bucket_id = ? AND bucket_file_id IN (…)`
 *   on every TEMP bucket clear (#1860). Neither column was indexed, so both
 *   scanned the fastest-growing table.
 * - The node junctions `analysis_nodes` and `project_nodes` (`P` = analysis
 *   or project) get one composite per realm column, each paired with the
 *   opposite side's id: `(node_realm_id, P_id)` answers the participation
 *   lookups of plans 021/022 (`SELECT P_id … WHERE node_realm_id = ?`) from
 *   the index alone, and `(P_realm_id, node_id)` an owner realm listing its
 *   participating nodes. Each REPLACES the single-column index on its realm
 *   column, which it still leads for the allow-listed realm filters. A filter
 *   combination needs no index per column order (the planner matches
 *   equality conditions in any order), so no mirrored pairs are added; the
 *   id columns stay served by the existing `(node_id, P_id)` unique plus the
 *   single on the id it does not lead.
 * - `(approval_status, created_at)` on both junctions and
 *   `(execution_status, created_at)` on analysis_nodes REPLACE the
 *   single-column status indexes, backing the status-then-age sort of an
 *   approval or execution inbox (`sort=approvalStatus,-createdAt`), which the
 *   rapiq schemas now allow.
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
 * Each composite is created BEFORE the index it replaces is dropped (and
 * down() recreates the single before dropping the composite), so no
 * allow-listed filter is ever left unindexed.
 *
 * Index names are typeorm's DefaultNamingStrategy output (taken from
 * `migration generate`), so the entity metadata and the migrated schema agree
 * and the drift gate stays quiet.
 */
export class AddLookupSortAndForeignKeyIndexes1788600000000 implements MigrationInterface {
    name = 'AddLookupSortAndForeignKeyIndexes1788600000000';

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
        await queryRunner.query(`
            CREATE INDEX \`IDX_8fb765a50dfd726f628e79e26f\` ON \`analysis_nodes\` (\`analysis_realm_id\`, \`node_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c737daa6e83397f006d359bf9b\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_a909e9c5a28f9e78fd349f2ca6\` ON \`analysis_nodes\` (\`approval_status\`, \`created_at\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6faad13a9e21ce7425e7b38afd\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_2098c8b57742c3b91c5d0d46f0\` ON \`analysis_nodes\` (\`execution_status\`, \`created_at\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7ea595522dcf3392a778437f33\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_37393d69b715144909ba48469a\` ON \`project_nodes\` (\`project_realm_id\`, \`node_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ce5d557b1ea535cfc8b2853447\` ON \`project_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_9251d718e7f99b03218ea3335e\` ON \`project_nodes\` (\`approval_status\`, \`created_at\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_578ed64bdd3475f4ce55bb5454\` ON \`project_nodes\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX \`IDX_578ed64bdd3475f4ce55bb5454\` ON \`project_nodes\` (\`approval_status\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_9251d718e7f99b03218ea3335e\` ON \`project_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_ce5d557b1ea535cfc8b2853447\` ON \`project_nodes\` (\`project_realm_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_37393d69b715144909ba48469a\` ON \`project_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_7ea595522dcf3392a778437f33\` ON \`analysis_nodes\` (\`execution_status\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2098c8b57742c3b91c5d0d46f0\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_6faad13a9e21ce7425e7b38afd\` ON \`analysis_nodes\` (\`approval_status\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a909e9c5a28f9e78fd349f2ca6\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_c737daa6e83397f006d359bf9b\` ON \`analysis_nodes\` (\`analysis_realm_id\`)
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8fb765a50dfd726f628e79e26f\` ON \`analysis_nodes\`
        `);
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
