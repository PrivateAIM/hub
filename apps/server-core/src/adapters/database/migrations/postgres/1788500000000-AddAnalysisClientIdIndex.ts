import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
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
 */
export class AddAnalysisClientIdIndex1788500000000 implements MigrationInterface {
    name = 'AddAnalysisClientIdIndex1788500000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_a1746738896e31d23df2792506" ON "analyses" ("client_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a1746738896e31d23df2792506"
        `);
    }
}
