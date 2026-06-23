import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1782138800821 implements MigrationInterface {
    name = 'Default1782138800821';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "messages" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "sender_type" character varying(64) NOT NULL,
                "sender_id" uuid NOT NULL,
                "recipient_type" character varying(64) NOT NULL,
                "recipient_id" uuid NOT NULL,
                "data" text,
                "metadata" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "expires_at" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_18325f38ae6de43878487eff986" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3a83b1bc057fd8dd8ffcc926ca" ON "messages" ("expires_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f4070ef2c27d60b10b2083ffcc" ON "messages" ("recipient_id", "created_at", "id")
        `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f4070ef2c27d60b10b2083ffcc"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3a83b1bc057fd8dd8ffcc926ca"
        `);
        await queryRunner.query(`
            DROP TABLE "messages"
        `);
    }
}
