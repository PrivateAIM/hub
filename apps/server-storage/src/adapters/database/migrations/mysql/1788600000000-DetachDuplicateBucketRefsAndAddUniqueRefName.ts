import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Detach duplicate `buckets` per `(ref_type, ref_id, name)` and add a unique
 * constraint on that triple (plan 018, F12).
 *
 * `name` was never unique, so a repeated or concurrent bus create for one
 * owning resource (server-core's analysis buckets) could store a second bucket
 * under the same ref + name.
 *
 * Detach first, non-destructively: per `(ref_type, ref_id, name)` the oldest
 * row (`created_at`, tie → `id`) keeps its ref, every newer one gets
 * `ref_type`/`ref_id` set to NULL. No bucket, file or object is deleted; a
 * detached bucket is ref-less, like one created over HTTP without a ref. The
 * detach is not reverted by `down()`.
 *
 * NULL refs stay unconstrained (postgres and mysql both allow repeated NULLs
 * in a unique), so ref-less buckets may still share a name.
 *
 * `IDX_763402e2cefdcd43b1c24c8dd3` is typeorm-derived (never hand-named).
 */
export class DetachDuplicateBucketRefsAndAddUniqueRefName1788600000000 implements MigrationInterface {
    name = 'DetachDuplicateBucketRefsAndAddUniqueRefName1788600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE \`buckets\` \`b\`
            INNER JOIN \`buckets\` \`older\`
                ON \`older\`.\`ref_type\` = \`b\`.\`ref_type\`
                AND \`older\`.\`ref_id\` = \`b\`.\`ref_id\`
                AND \`older\`.\`name\` = \`b\`.\`name\`
                AND (
                    \`older\`.\`created_at\` < \`b\`.\`created_at\`
                    OR (\`older\`.\`created_at\` = \`b\`.\`created_at\` AND \`older\`.\`id\` < \`b\`.\`id\`)
                )
            SET \`b\`.\`ref_type\` = NULL, \`b\`.\`ref_id\` = NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_763402e2cefdcd43b1c24c8dd3\` ON \`buckets\` (\`ref_type\`, \`ref_id\`, \`name\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_763402e2cefdcd43b1c24c8dd3\` ON \`buckets\`
        `);
    }
}
