/*
 * Copyright (c) 2026.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Makes `nodes.client_id` unique (plan 021, step 3e).
 *
 * A node's client is its identity: the node acts through it, and the
 * node-client sync rewrites that client's permissions. The column used to be
 * writable by node managers and not unique, so one node could claim another
 * realm's node client, or `system`. It is server-assigned now; this enforces
 * that no two nodes share one.
 *
 * Rows that already share a client keep it on the earliest-created node only;
 * the others are detached (`NULL`) and get a fresh client on their next save.
 * NULLs stay allowed (a node without a client yet).
 */
export class MakeNodeClientIdUnique1788800000000 implements MigrationInterface {
    name = 'MakeNodeClientIdUnique1788800000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            UPDATE "nodes" SET "client_id" = NULL
            WHERE "id" IN (
                SELECT "id" FROM (
                    SELECT "id", ROW_NUMBER() OVER (PARTITION BY "client_id" ORDER BY "created_at", "id") AS "position"
                    FROM "nodes" WHERE "client_id" IS NOT NULL
                ) AS "ranked"
                WHERE "position" > 1
            )
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a8a84cb1c7c5d6d25e9079184e"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "IDX_a8a84cb1c7c5d6d25e9079184e" ON "nodes" ("client_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a8a84cb1c7c5d6d25e9079184e"
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a8a84cb1c7c5d6d25e9079184e" ON "nodes" ("client_id")
        `);
    }
}
