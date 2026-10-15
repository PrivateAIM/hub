import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds indexes for lookups that run outside the rapiq allow-lists, composite
 * lookup and sort indexes on the node junctions, and indexes for foreign
 * keys postgres would otherwise cascade through by full table scan.
 * Every change it makes:
 *
 * - `analysis_bucket_files (bucket_file_id)`: the storage aggregators resolve
 *   the hub row by the storage file it mirrors — `findOneBy({ bucketFileId })`
 *   on every storage file deletion, and `bucket_id = ? AND bucket_file_id IN (…)`
 *   on every TEMP bucket clear (#1860). Neither column was indexed, so both
 *   scanned the fastest-growing table.
 * - The node junctions `analysis_nodes` and `project_nodes` (`P` = analysis
 *   or project) get one composite per side and key, each paired with the
 *   opposite side, so a lookup or filter combination from either side —
 *   a node listing its participations, an owner realm listing participating
 *   nodes, an approval check `p_id = ? AND node_realm_id = ?` — is served by
 *   one index, and the participation lookups of plans 021/022
 *   (`SELECT p_id … WHERE node_realm_id = ?`) answer from the index alone:
 *   `(node_id, p_id)` (the existing unique), `(p_id, node_realm_id)`,
 *   `(node_id, p_realm_id)`, `(p_realm_id, node_id)` and
 *   `(node_realm_id, p_id)`. Every leading column is an allow-listed filter
 *   key, so each composite REPLACES the single-column index on its leading
 *   column where one existed (`analysis_id`, `analysis_realm_id`,
 *   `node_realm_id` on analysis_nodes; `node_id`, `project_realm_id`,
 *   `node_realm_id` on project_nodes). typeorm hashes index names from the
 *   sorted column list, so each mirrored pair would collide; the index of
 *   each pair whose columns are not in alphabetical order carries an
 *   explicit name, hashed the same way from its columns in index order.
 * - `(approval_status, created_at)` on both junctions and
 *   `(execution_status, created_at)` on analysis_nodes REPLACE the
 *   single-column status indexes, backing the status-then-age sort of an
 *   approval or execution inbox (`sort=approvalStatus,-createdAt`), which the
 *   rapiq schemas now allow.
 *
 * Each composite is created BEFORE the index it replaces is dropped (and
 * down() recreates the single before dropping the composite): on MySQL the
 * `analysis_id` and `node_id` singles back foreign keys and can only be
 * dropped while another index leads the same column, and the filter is never
 * left unindexed.
 * - `analyses (master_image_id)` and `projects (master_image_id)`: both
 *   foreign keys are `ON DELETE SET NULL`, and postgres keeps no implicit index
 *   on a foreign key column, so every master image a catalog sync removes
 *   scanned both tables.
 *
 * Index names are typeorm's DefaultNamingStrategy output (taken from
 * `migration generate`), so the entity metadata and the migrated schema agree
 * and the drift gate stays quiet.
 */
export class AddLookupSortAndForeignKeyIndexes1788600000000 implements MigrationInterface {
    name = 'AddLookupSortAndForeignKeyIndexes1788600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_0f9188fff4b6692bb0a727d91c" ON "analysis_bucket_files" ("bucket_file_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_5816ce1cf851f5fc1421faa346" ON "analysis_nodes" ("node_realm_id", "analysis_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b443086bf7d7e32edead69e77c"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e17be232c93d5ca298780527c2" ON "project_nodes" ("node_realm_id", "project_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7f8520e90b18fe847c0aea2287"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_344d29541553fb6bce75ce4cd3" ON "analyses" ("master_image_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9334a5beb56029a11fc212664d" ON "projects" ("master_image_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_70c555594ee7926d9df7e895a5" ON "analysis_nodes" ("analysis_id", "node_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_938790a6d433935d1cb3173f07"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8fb765a50dfd726f628e79e26f" ON "analysis_nodes" ("analysis_realm_id", "node_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c737daa6e83397f006d359bf9b"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c0a83a2c9e8f5b096e0587230a" ON "analysis_nodes" ("node_id", "analysis_realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a909e9c5a28f9e78fd349f2ca6" ON "analysis_nodes" ("approval_status", "created_at")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6faad13a9e21ce7425e7b38afd"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2098c8b57742c3b91c5d0d46f0" ON "analysis_nodes" ("execution_status", "created_at")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7ea595522dcf3392a778437f33"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_33c0a5c703084f4e180cdf1e3e" ON "project_nodes" ("project_id", "node_realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_37393d69b715144909ba48469a" ON "project_nodes" ("node_id", "project_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9bb9c239c3d15ee13b24c52c0f"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_50158b286a9565a3596a9323b9" ON "project_nodes" ("project_realm_id", "node_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ce5d557b1ea535cfc8b2853447"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9251d718e7f99b03218ea3335e" ON "project_nodes" ("approval_status", "created_at")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_578ed64bdd3475f4ce55bb5454"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_578ed64bdd3475f4ce55bb5454" ON "project_nodes" ("approval_status")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9251d718e7f99b03218ea3335e"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ce5d557b1ea535cfc8b2853447" ON "project_nodes" ("project_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_50158b286a9565a3596a9323b9"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9bb9c239c3d15ee13b24c52c0f" ON "project_nodes" ("node_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_37393d69b715144909ba48469a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_33c0a5c703084f4e180cdf1e3e"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7ea595522dcf3392a778437f33" ON "analysis_nodes" ("execution_status")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2098c8b57742c3b91c5d0d46f0"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6faad13a9e21ce7425e7b38afd" ON "analysis_nodes" ("approval_status")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a909e9c5a28f9e78fd349f2ca6"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c0a83a2c9e8f5b096e0587230a"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c737daa6e83397f006d359bf9b" ON "analysis_nodes" ("analysis_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8fb765a50dfd726f628e79e26f"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_938790a6d433935d1cb3173f07" ON "analysis_nodes" ("analysis_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_70c555594ee7926d9df7e895a5"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9334a5beb56029a11fc212664d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_344d29541553fb6bce75ce4cd3"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7f8520e90b18fe847c0aea2287" ON "project_nodes" ("node_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e17be232c93d5ca298780527c2"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b443086bf7d7e32edead69e77c" ON "analysis_nodes" ("node_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_5816ce1cf851f5fc1421faa346"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0f9188fff4b6692bb0a727d91c"
        `);
    }
}
