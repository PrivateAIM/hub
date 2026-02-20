import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1771579303467 implements MigrationInterface {
    name = 'Default1771579303467';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "buckets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(256) NOT NULL,
                "region" character varying(256),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "actor_id" uuid,
                "actor_type" character varying(64),
                "realm_id" uuid,
                CONSTRAINT "PK_6274370d823fcc89d22efd86580" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "bucket_files" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(256) NOT NULL,
                "path" character varying(512) NOT NULL,
                "hash" character varying(4096) NOT NULL,
                "directory" character varying,
                "size" integer,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "actor_type" character varying(64) NOT NULL,
                "actor_id" uuid NOT NULL,
                "realm_id" uuid,
                "bucket_id" uuid NOT NULL,
                CONSTRAINT "UQ_a5b5c57f7e994241421c2bf37d5" UNIQUE ("bucket_id", "path"),
                CONSTRAINT "PK_b958dc9ba7aabdd76d251d3de18" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "bucket_files"
            ADD CONSTRAINT "FK_8f5dde5868976a4d18f077ba323" FOREIGN KEY ("bucket_id") REFERENCES "buckets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "bucket_files" DROP CONSTRAINT "FK_8f5dde5868976a4d18f077ba323"
        `);
        await queryRunner.query(`
            DROP TABLE "bucket_files"
        `);
        await queryRunner.query(`
            DROP TABLE "buckets"
        `);
    }
}
