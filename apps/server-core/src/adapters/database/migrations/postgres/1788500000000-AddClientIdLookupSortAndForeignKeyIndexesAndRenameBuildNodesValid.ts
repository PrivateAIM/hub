import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Release-window consolidation of three unreleased migrations (see
 * conventions.md#database-migrations), squashed under the earliest timestamp.
 * Every change it makes:
 *
 * 1. adds the `analyses (client_id)` index backing the `clientId` filter;
 * 2. adds the `analysis_bucket_files (bucket_file_id)` lookup index, the
 *    realm/id composites and status/created_at sort composites on
 *    `analysis_nodes` and `project_nodes` (replacing the single-column realm
 *    and status indexes), and explicit `master_image_id` indexes on
 *    `analyses` and `projects`;
 * 3. renames `analyses.build_nodes_valid` to `distribution_nodes_valid`.
 *
 * The parts are independent; up() runs them in order 1-2-3 and down() in
 * reverse, exactly as the three original migrations did.
 *
 * ## Part 1 — index `analyses.client_id` (was AddAnalysisClientIdIndex1788500000000)
 *
 * Adds the single-column index on `analyses.client_id` that backs the new
 * `clientId` entry in the analysis rapiq schema (`indexes` + `filters.allowed`).
 *
 * Analysis containers authenticate to the node services (storage service,
 * pod orchestration) with client-credentials tokens issued by the global
 * Authup. Those tokens carry the Hub-managed Authup client's UUID
 * (`client_id` / `sub`), not the analysis id, so a node service holding such
 * a token needs to resolve "which analysis does this client belong to". The
 * Hub already stores that id on the analysis, but until now the schema did
 * not allow filtering on it, forcing node services to page through
 * `/analysis-nodes` and match client-side. With `filter[clientId]` on
 * `/analyses` (and `filter[analysis.clientId]` on `/analysis-nodes` through
 * `schemaMapping`) that lookup becomes a single indexed query.
 *
 * The schema is `strict` with `filters.indexed: true` (anchor mode): every
 * allow-listed filter key must LEAD a real database index, otherwise the
 * parse-time index policy rejects a query the allow-list itself advertises
 * (see 1788400000000-AlignAnalysesConstraintNamesAndAddQueryIndexes). The
 * index is named by typeorm's DefaultNamingStrategy for table `analyses` and
 * column `client_id` (never hand-written), so the entity's `@Index()` and the
 * migrated schema agree and the drift gate stays quiet.
 *
 * Postgres keeps no implicit index on this column (it carries no foreign
 * key), so down() is a plain DROP INDEX.
 *
 * ## Part 2 — lookup, sort and foreign key indexes (was AddLookupSortAndForeignKeyIndexes1788600000000)
 *
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
 * - `analyses (master_image_id)` and `projects (master_image_id)`: both
 *   foreign keys are `ON DELETE SET NULL`, and postgres keeps no implicit index
 *   on a foreign key column, so every master image a catalog sync removes
 *   scanned both tables.
 *
 * Each composite is created BEFORE the index it replaces is dropped (and
 * down() recreates the single before dropping the composite), so no
 * allow-listed filter is ever left unindexed.
 *
 * Index names are typeorm's DefaultNamingStrategy output (taken from
 * `migration generate`), so the entity metadata and the migrated schema agree
 * and the drift gate stays quiet.
 *
 * ## Part 3 — rename `analyses.build_nodes_valid` (was RenameBuildNodesValidToDistributionNodesValid1788700000000)
 *
 * Renames `analyses.build_nodes_valid` to `distribution_nodes_valid`.
 *
 * Node approval used to gate the build, so a node approved the code. It now
 * gates the distribution instead: a node approves the built image (hash,
 * size, OS), every build start resets the approvals, and an approval is only
 * accepted once the build has finished. The aggregate keeps its meaning —
 * every node approved — and only moves to the step it gates, so the column is
 * renamed in place and every stored value stays valid.
 *
 * The column carries no index or constraint, so the rename touches nothing else.
 */
export class AddClientIdLookupSortAndForeignKeyIndexesAndRenameBuildNodesValid1788500000000 implements MigrationInterface {
    name = 'AddClientIdLookupSortAndForeignKeyIndexesAndRenameBuildNodesValid1788500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Part 1
        await queryRunner.query(`
            CREATE INDEX "IDX_a1746738896e31d23df2792506" ON "analyses" ("client_id")
        `);

        // Part 2
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
            CREATE INDEX "IDX_8fb765a50dfd726f628e79e26f" ON "analysis_nodes" ("analysis_realm_id", "node_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c737daa6e83397f006d359bf9b"
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
            CREATE INDEX "IDX_37393d69b715144909ba48469a" ON "project_nodes" ("project_realm_id", "node_id")
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

        // Part 3
        await queryRunner.query(`
            ALTER TABLE "analyses" RENAME COLUMN "build_nodes_valid" TO "distribution_nodes_valid"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Part 3
        await queryRunner.query(`
            ALTER TABLE "analyses" RENAME COLUMN "distribution_nodes_valid" TO "build_nodes_valid"
        `);

        // Part 2
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
            DROP INDEX "public"."IDX_37393d69b715144909ba48469a"
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
            CREATE INDEX "IDX_c737daa6e83397f006d359bf9b" ON "analysis_nodes" ("analysis_realm_id")
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8fb765a50dfd726f628e79e26f"
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
            DROP INDEX "public"."IDX_70c555594ee7926d9df7e895a5"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_0f9188fff4b6692bb0a727d91c"
        `);

        // Part 1
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a1746738896e31d23df2792506"
        `);
    }
}
