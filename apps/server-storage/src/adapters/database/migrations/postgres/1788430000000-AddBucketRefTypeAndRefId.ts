import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Add `ref_type` and `ref_id` columns to `buckets`, mirroring
 * server-telemetry's `events.ref_type` / `events.ref_id` (issue #1566).
 * Lets a bucket be traced back to the resource that owns it — an analysis's
 * code/result bucket, in the one producer that exists today
 * (`AnalysisStorageManager` in server-core, which now passes
 * `refType: DomainType.ANALYSIS, refId: analysis.id` on bucket creation) —
 * without requiring one: unlike an event, a bucket the HTTP `POST /buckets`
 * route creates directly has no natural owning resource, so both columns are
 * nullable and only mounted on the CREATE validator group, matching
 * `region`/`realmId` (a bucket's ref isn't reassignable through the update
 * route).
 *
 * Two indexes, both typeorm-derived (never hand-named):
 * - `IDX_b6c30722f117d362bbf1b1a554` — composite `(ref_type, ref_id)`,
 *   backing `filters.allowed` containing `refType` (issue #1842's
 *   leading-key invariant: `refType` leads the composite).
 * - `IDX_e705f8186e1ddc094e9372f9d5` — single `ref_id`, so `refId` is
 *   independently filterable without requiring `refType` too (the composite
 *   alone cannot serve a `refId`-only filter, since it doesn't lead).
 */
export class AddBucketRefTypeAndRefId1788430000000 implements MigrationInterface {
    name = 'AddBucketRefTypeAndRefId1788430000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "buckets"
            ADD "ref_type" character varying(64)
        `);
        await queryRunner.query(`
            ALTER TABLE "buckets"
            ADD "ref_id" character varying(64)
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e705f8186e1ddc094e9372f9d5" ON "buckets" ("ref_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b6c30722f117d362bbf1b1a554" ON "buckets" ("ref_type", "ref_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b6c30722f117d362bbf1b1a554"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e705f8186e1ddc094e9372f9d5"
        `);
        await queryRunner.query(`
            ALTER TABLE "buckets" DROP COLUMN "ref_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "buckets" DROP COLUMN "ref_type"
        `);
    }
}
