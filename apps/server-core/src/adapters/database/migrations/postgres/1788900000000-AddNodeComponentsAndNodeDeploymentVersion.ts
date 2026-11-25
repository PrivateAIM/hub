/*
 * Plan 028 (node status reporting): nodes report per-component status.
 * Adds the `node_components` table (one row per node and component name,
 * cascading with the node) and `nodes.deployment_version` with its index.
 */

import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddNodeComponentsAndNodeDeploymentVersion1788900000000 implements MigrationInterface {
    name = 'AddNodeComponentsAndNodeDeploymentVersion1788900000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "node_components" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(64) NOT NULL,
                "version" character varying(64),
                "status" character varying(16) NOT NULL,
                "message" character varying(1024),
                "latency" double precision,
                "uptime" integer,
                "checks_total" integer,
                "checks_successful" integer,
                "reported_at" TIMESTAMP(6) NOT NULL,
                "node_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_86f12b561dcc7aa33e02e0e8527" UNIQUE ("node_id", "name"),
                CONSTRAINT "PK_ad66e5e9997a8e9c78a80b3cc26" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_287daee5dda12fdbcad375a8d0" ON "node_components" ("version")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ad578c225fcbee078620b90069" ON "node_components" ("status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_768287383be45669b7ef2f1a35" ON "node_components" ("name", "version")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7a28d3c8878368baf6ef015ab1" ON "node_components" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fae433536ef216a40efd7ab20b" ON "node_components" ("updated_at")
        `);
        await queryRunner.query(`
            ALTER TABLE "nodes"
            ADD "deployment_version" character varying(64)
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_58b8d88c325a2b4d8db1ca6f38" ON "nodes" ("deployment_version")
        `);
        await queryRunner.query(`
            ALTER TABLE "node_components"
            ADD CONSTRAINT "FK_d814896ecace58245c611572869" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "node_components" DROP CONSTRAINT "FK_d814896ecace58245c611572869"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_58b8d88c325a2b4d8db1ca6f38"
        `);
        await queryRunner.query(`
            ALTER TABLE "nodes" DROP COLUMN "deployment_version"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fae433536ef216a40efd7ab20b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7a28d3c8878368baf6ef015ab1"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_768287383be45669b7ef2f1a35"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ad578c225fcbee078620b90069"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_287daee5dda12fdbcad375a8d0"
        `);
        await queryRunner.query(`
            DROP TABLE "node_components"
        `);
    }
}
