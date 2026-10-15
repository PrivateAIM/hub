import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Deduplicate `analysis_buckets` per `(analysis_id, type)` and add a unique
 * constraint on that pair (plan 018, F12).
 *
 * Consumers resolve an analysis bucket by `(analysisId, type)`, but the table
 * was only unique on `(bucket_id, analysis_id)` (kept: it still stops one
 * storage bucket being linked twice to an analysis under two types), so a
 * concurrent or repeated create could link a second bucket of the same type.
 *
 * Dedupe first: per `(analysis_id, type)` the oldest row (`created_at`, tie →
 * `id`) is kept and every newer link row is deleted. Its
 * `analysis_bucket_files` mirror rows go with it (FK cascade); the storage
 * bucket it pointed to — and the files in it — stay in server-storage as a
 * detached orphan. The dedupe is not reverted by `down()`.
 *
 * `IDX_d9102da16be9abafac81d7fd5e` is typeorm-derived (never hand-named).
 */
export class DedupeAnalysisBucketsAndAddUniqueAnalysisType1788600000000 implements MigrationInterface {
    name = 'DedupeAnalysisBucketsAndAddUniqueAnalysisType1788600000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DELETE \`ab\` FROM \`analysis_buckets\` \`ab\`
            INNER JOIN \`analysis_buckets\` \`older\`
                ON \`older\`.\`analysis_id\` = \`ab\`.\`analysis_id\`
                AND \`older\`.\`type\` = \`ab\`.\`type\`
                AND (
                    \`older\`.\`created_at\` < \`ab\`.\`created_at\`
                    OR (\`older\`.\`created_at\` = \`ab\`.\`created_at\` AND \`older\`.\`id\` < \`ab\`.\`id\`)
                )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_d9102da16be9abafac81d7fd5e\` ON \`analysis_buckets\` (\`analysis_id\`, \`type\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_d9102da16be9abafac81d7fd5e\` ON \`analysis_buckets\`
        `);
    }
}
