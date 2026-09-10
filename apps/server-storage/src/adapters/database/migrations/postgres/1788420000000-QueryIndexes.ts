import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Indexes for the query surface (issue #1842).
 *
 * Backs the rapiq schema `indexes` declarations on `bucketSchema` and
 * `bucketFileSchema`: every key in a schema's filter/sort allow-list must
 * LEAD a real database index, so the parse-time index policy
 * (`filters`/`sorts` `indexed: true`) can never reject or drop a query the
 * allow-lists advertise.
 *
 * Creates thirteen single-column indexes, matching the new `@Index()`
 * decorators one to one:
 *
 * - `buckets`: name (IDX_8f92b106edc67c4f4af8d24079),
 *   realm_id (IDX_94f488c8b9119ebd89bc9dbe00),
 *   actor_type (IDX_3cc1cd582c8444c0d4d9caf40c),
 *   actor_id (IDX_aed1c810e2d1aae7192b5740a5),
 *   created_at (IDX_30817af7d3f608fb51158af61e),
 *   updated_at (IDX_ebe54b30f9b97d366c3327f2c0)
 * - `bucket_files`: name (IDX_9e15eddac66f32f67dbe98c67b),
 *   directory (IDX_eb3ac3c9d7df2f3c1d92276ce6),
 *   realm_id (IDX_7d3f701641e00392e8ecd39748),
 *   actor_type (IDX_e9eef3713bf36ac92dac48111b),
 *   actor_id (IDX_993b3d4e3dd196627a4d28bfd4),
 *   created_at (IDX_15f90b243807e95b6845685b08),
 *   updated_at (IDX_f0fd36b54e7af4033d35dfc561)
 *
 * created_at/updated_at back sorting only — they stay out of the filter
 * allow-lists (`dateToISOStringTransformer` applies on read, not to WHERE
 * binds, so filtering them would silently mismatch; authup#3429).
 *
 * `bucket_files.bucket_id` deliberately gets NO index: the Default
 * migration's UNIQUE (bucket_id, path) leads with bucket_id and serves both
 * the query surface and cascade deletes through
 * FK_8f5dde5868976a4d18f077ba323.
 *
 * Derived IDX_<hash> names (typeorm DefaultNamingStrategy); nothing is
 * hand-named.
 */
export class QueryIndexes1788420000000 implements MigrationInterface {
    name = 'QueryIndexes1788420000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_8f92b106edc67c4f4af8d24079" ON "buckets" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_94f488c8b9119ebd89bc9dbe00" ON "buckets" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3cc1cd582c8444c0d4d9caf40c" ON "buckets" ("actor_type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_aed1c810e2d1aae7192b5740a5" ON "buckets" ("actor_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_30817af7d3f608fb51158af61e" ON "buckets" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ebe54b30f9b97d366c3327f2c0" ON "buckets" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9e15eddac66f32f67dbe98c67b" ON "bucket_files" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_eb3ac3c9d7df2f3c1d92276ce6" ON "bucket_files" ("directory")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7d3f701641e00392e8ecd39748" ON "bucket_files" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e9eef3713bf36ac92dac48111b" ON "bucket_files" ("actor_type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_993b3d4e3dd196627a4d28bfd4" ON "bucket_files" ("actor_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_15f90b243807e95b6845685b08" ON "bucket_files" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f0fd36b54e7af4033d35dfc561" ON "bucket_files" ("updated_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f0fd36b54e7af4033d35dfc561"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_15f90b243807e95b6845685b08"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_993b3d4e3dd196627a4d28bfd4"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e9eef3713bf36ac92dac48111b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7d3f701641e00392e8ecd39748"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_eb3ac3c9d7df2f3c1d92276ce6"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9e15eddac66f32f67dbe98c67b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ebe54b30f9b97d366c3327f2c0"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_30817af7d3f608fb51158af61e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_aed1c810e2d1aae7192b5740a5"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3cc1cd582c8444c0d4d9caf40c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_94f488c8b9119ebd89bc9dbe00"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8f92b106edc67c4f4af8d24079"
        `);
    }
}
