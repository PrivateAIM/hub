import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Backfill `ref_type` / `ref_id` on analysis buckets that carry none.
 *
 * Buckets created before `ref_type` / `ref_id` existed
 * (`1788430000000-AddBucketRefTypeAndRefId`, no backfill) are ref-less,
 * and since #1962 the upload gate exempts only ref'd buckets. So node clients
 * and analysis owners got 403 when uploading into an older analysis' bucket:
 * the bucket has no actor (bus-created) and they hold no `bucket_update`.
 *
 * server-core names every analysis bucket `analysis-<type>-files.<analysisId>`
 * (core-kit `buildAnalysisBucketName`), so the ref is recovered from the name:
 * `ref_type = 'analysis'`, `ref_id = <analysisId>`. The prefixes are inlined
 * on purpose — a migration must not change with a later kit.
 *
 * A name that already has a ref'd twin is left alone (the unique
 * `(ref_type, ref_id, name)` would refuse it; such a row is a duplicate the
 * `1788600000000` detach left behind, which server-core does not link). Of
 * several ref-less buckets with one name only the oldest (`created_at`, tie →
 * `id`) is backfilled, matching that detach.
 *
 * Data only, no DDL. Not reverted by `down()`: a backfilled ref cannot be told
 * apart from one server-core set.
 */
export class BackfillAnalysisBucketRefs1788900000000 implements MigrationInterface {
    name = 'BackfillAnalysisBucketRefs1788900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        const prefixes = [
            'analysis-code-files.',
            'analysis-temp-files.',
            'analysis-result-files.',
        ];

        const rows: {
            id: string, 
            name: string, 
            ref_type: string | null 
        }[] = await queryRunner.query(`
            SELECT \`id\`, \`name\`, \`ref_type\`
            FROM \`buckets\`
            WHERE \`name\` LIKE 'analysis-%'
            ORDER BY \`created_at\` ASC, \`id\` ASC
        `);

        const taken = new Set<string>();
        for (const row of rows) {
            if (row.ref_type !== null) {
                taken.add(row.name);
            }
        }

        for (const row of rows) {
            if (row.ref_type !== null || taken.has(row.name)) {
                continue;
            }

            const prefix = prefixes.find((p) => row.name.length > p.length && row.name.startsWith(p));
            if (!prefix) {
                continue;
            }

            const refId = row.name.slice(prefix.length);
            if (refId.length > 64) {
                continue;
            }

            taken.add(row.name);

            await queryRunner.query(
                'UPDATE `buckets` SET `ref_type` = ?, `ref_id` = ? WHERE `id` = ? AND `ref_type` IS NULL AND `ref_id` IS NULL',
                ['analysis', refId, row.id],
            );
        }
    }

    public async down(): Promise<void> {
        // data backfill only, see the class comment
    }
}
