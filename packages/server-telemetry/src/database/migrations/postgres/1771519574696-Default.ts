import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1771519574696 implements MigrationInterface {
    name = 'Default1771519574696';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "scope" character varying(64) NOT NULL,
                "name" character varying(64) NOT NULL,
                "ref_type" character varying(64) NOT NULL,
                "ref_id" character varying(64),
                "data" text,
                "expiring" boolean NOT NULL DEFAULT false,
                "request_path" character varying(256),
                "request_method" character varying(10),
                "request_ip_address" character varying(15),
                "request_user_agent" character varying(512),
                "actor_type" character varying(64),
                "actor_id" uuid,
                "actor_name" character varying(64),
                "realm_id" uuid,
                "expires_at" character varying(28),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c0fdc38a6c8fb51d5557fb48e5" ON "events" ("scope")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_dfa3d03bef3f90f650fd138fb3" ON "events" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_73da2faef487086e700845b7b8" ON "events" ("ref_type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_24250896047ddb5c221ce1e42d" ON "events" ("ref_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d18c751252944d7287e01f2bba" ON "events" ("expiring")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_27a4b4d027f84645cff6a2046b" ON "events" ("request_path")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_98091bf7c210a05180c50b239d" ON "events" ("request_method")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_96aea52eeb823dd8a3708802c0" ON "events" ("request_ip_address")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8209335b1c8632c756ce649d44" ON "events" ("request_user_agent")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ca050bac0a654d1e096beb5d46" ON "events" ("actor_type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d1bde4e07e02555eadc160c0de" ON "events" ("actor_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8c05c0a6344a9ba945d9e7c9d2" ON "events" ("actor_name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2cef4b1024dd9c933acffa55e9" ON "events" ("ref_type", "ref_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a5329794da6de9616b92d2dbcb" ON "events" ("name", "scope")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a5329794da6de9616b92d2dbcb"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2cef4b1024dd9c933acffa55e9"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8c05c0a6344a9ba945d9e7c9d2"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d1bde4e07e02555eadc160c0de"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ca050bac0a654d1e096beb5d46"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8209335b1c8632c756ce649d44"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_96aea52eeb823dd8a3708802c0"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_98091bf7c210a05180c50b239d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_27a4b4d027f84645cff6a2046b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d18c751252944d7287e01f2bba"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_24250896047ddb5c221ce1e42d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_73da2faef487086e700845b7b8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_dfa3d03bef3f90f650fd138fb3"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c0fdc38a6c8fb51d5557fb48e5"
        `);
        await queryRunner.query(`
            DROP TABLE "events"
        `);
    }
}
