import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Two changes to `events`, both from the telemetry hardening back-port
 * (PrivateAIM/hub#1745).
 *
 * 1. Widen `request_ip_address` from varchar(15) to varchar(45).
 *    15 fits only a dotted-quad IPv4 literal. The value originates from
 *    `getRequestIP(event, { trustProxy: true })`, which hands back the leftmost
 *    `X-Forwarded-For` entry verbatim, so behind the documented nginx reverse
 *    proxy an IPv6 client produced a value this column could not hold. Together
 *    with the `zod.ipv4()` validator (widened to v4+v6 in the same change) that
 *    discarded the ENTIRE audit record for such a request, not just the address.
 *    45 is the canonical maximum textual IPv6 length (INET6_ADDRSTRLEN - 1):
 *    `0000:0000:0000:0000:0000:ffff:255.255.255.255`.
 *
 * 2. Rebuild the index set: drop ten single-column indexes, add two composites.
 *    `events` is write-mostly and carried fourteen indexes. Ten of them
 *    (`name`, `ref_type`, `expiring`, every `request_*`, every `actor_*`) back
 *    keys that no client can address — `eventSchema` allows filtering only on
 *    scope/name/refType/refId/realmId/createdAt/updatedAt and sorting only on
 *    expiresAt/createdAt/updatedAt — so they were pure write cost. Meanwhile
 *    the two queries that actually run had no index at all: the admin list
 *    (`realm_id` in [realm, null] ordered by `created_at`) and the retention
 *    sweep (`expiring` + `expires_at <`). `name` and `ref_type` survive as the
 *    leftmost columns of the retained `(name, scope)` and `(ref_type, ref_id)`
 *    composites; `scope` and `ref_id` keep their singles, being filterable and
 *    a leftmost prefix of neither.
 *    Net: 14 indexes -> 6.
 *
 * Widening varchar(n) -> varchar(m > n) is a metadata-only change on
 * PostgreSQL 12+, so the table is not rewritten. `down()` narrows back to 15,
 * which DOES rewrite and fails if an IPv6 value has been stored by then.
 * Best-effort, and safe on the CI round-trip, which reverts against an empty
 * table.
 */
export class EventWidenIpAddressAndRebuildIndexes1788220800000 implements MigrationInterface {
    name = 'EventWidenIpAddressAndRebuildIndexes1788220800000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX "public"."IDX_dfa3d03bef3f90f650fd138fb3"');
        await queryRunner.query('DROP INDEX "public"."IDX_73da2faef487086e700845b7b8"');
        await queryRunner.query('DROP INDEX "public"."IDX_d18c751252944d7287e01f2bba"');
        await queryRunner.query('DROP INDEX "public"."IDX_27a4b4d027f84645cff6a2046b"');
        await queryRunner.query('DROP INDEX "public"."IDX_98091bf7c210a05180c50b239d"');
        await queryRunner.query('DROP INDEX "public"."IDX_96aea52eeb823dd8a3708802c0"');
        await queryRunner.query('DROP INDEX "public"."IDX_8209335b1c8632c756ce649d44"');
        await queryRunner.query('DROP INDEX "public"."IDX_ca050bac0a654d1e096beb5d46"');
        await queryRunner.query('DROP INDEX "public"."IDX_d1bde4e07e02555eadc160c0de"');
        await queryRunner.query('DROP INDEX "public"."IDX_8c05c0a6344a9ba945d9e7c9d2"');

        await queryRunner.query('ALTER TABLE "events" ALTER COLUMN "request_ip_address" TYPE character varying(45)');

        await queryRunner.query('CREATE INDEX "IDX_d081c16020e8daee7dea5d3ca7" ON "events" ("realm_id", "created_at")');
        await queryRunner.query('CREATE INDEX "IDX_ae92f92677aad1f01f61bc7347" ON "events" ("expiring", "expires_at")');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('DROP INDEX "public"."IDX_ae92f92677aad1f01f61bc7347"');
        await queryRunner.query('DROP INDEX "public"."IDX_d081c16020e8daee7dea5d3ca7"');

        await queryRunner.query('ALTER TABLE "events" ALTER COLUMN "request_ip_address" TYPE character varying(15)');

        await queryRunner.query('CREATE INDEX "IDX_8c05c0a6344a9ba945d9e7c9d2" ON "events" ("actor_name")');
        await queryRunner.query('CREATE INDEX "IDX_d1bde4e07e02555eadc160c0de" ON "events" ("actor_id")');
        await queryRunner.query('CREATE INDEX "IDX_ca050bac0a654d1e096beb5d46" ON "events" ("actor_type")');
        await queryRunner.query('CREATE INDEX "IDX_8209335b1c8632c756ce649d44" ON "events" ("request_user_agent")');
        await queryRunner.query('CREATE INDEX "IDX_96aea52eeb823dd8a3708802c0" ON "events" ("request_ip_address")');
        await queryRunner.query('CREATE INDEX "IDX_98091bf7c210a05180c50b239d" ON "events" ("request_method")');
        await queryRunner.query('CREATE INDEX "IDX_27a4b4d027f84645cff6a2046b" ON "events" ("request_path")');
        await queryRunner.query('CREATE INDEX "IDX_d18c751252944d7287e01f2bba" ON "events" ("expiring")');
        await queryRunner.query('CREATE INDEX "IDX_73da2faef487086e700845b7b8" ON "events" ("ref_type")');
        await queryRunner.query('CREATE INDEX "IDX_dfa3d03bef3f90f650fd138fb3" ON "events" ("name")');
    }
}
