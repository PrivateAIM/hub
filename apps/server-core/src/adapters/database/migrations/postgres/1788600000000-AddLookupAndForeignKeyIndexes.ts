import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds indexes for lookups that run outside the rapiq allow-lists, and for
 * foreign keys postgres would otherwise cascade through by full table scan.
 * Every change it makes:
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
 * - `analyses (master_image_id)` and `projects (master_image_id)`: both
 *   foreign keys are `ON DELETE SET NULL`, and postgres keeps no implicit index
 *   on a foreign key column, so every master image a catalog sync removes
 *   scanned both tables.
 *
 * Index names are typeorm's DefaultNamingStrategy output (taken from
 * `migration generate`), so the entity metadata and the migrated schema agree
 * and the drift gate stays quiet.
 */
export class AddLookupAndForeignKeyIndexes1788600000000 implements MigrationInterface {
    name = 'AddLookupAndForeignKeyIndexes1788600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_0f9188fff4b6692bb0a727d91c" ON "analysis_bucket_files" ("bucket_file_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_70c555594ee7926d9df7e895a5" ON "analysis_nodes" ("node_realm_id", "analysis_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b443086bf7d7e32edead69e77c"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_344d29541553fb6bce75ce4cd3" ON "analyses" ("master_image_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9334a5beb56029a11fc212664d" ON "projects" ("master_image_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9334a5beb56029a11fc212664d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_344d29541553fb6bce75ce4cd3"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b443086bf7d7e32edead69e77c" ON "analysis_nodes" ("node_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_70c555594ee7926d9df7e895a5"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0f9188fff4b6692bb0a727d91c"
        `);
    }
}
