import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1771579910800 implements MigrationInterface {
    name = 'Default1771579910800';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "master_images" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "build_status" character varying(64),
                "build_progress" integer,
                "build_hash" character varying(135),
                "build_size" integer,
                "path" character varying(512),
                "virtual_path" character varying(512) NOT NULL,
                "group_virtual_path" character varying(512) NOT NULL,
                "name" character varying NOT NULL,
                "command" text,
                "command_arguments" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_1dab763055a9a2015bfdc496cc1" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_784468a7fc9bc0a5e54efddab7" ON "master_images" ("build_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7c779b370b32ebaed6b9cc7576" ON "master_images" ("virtual_path")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_f5d09cafff06c3a976ebff5f2a" ON "master_images" ("group_virtual_path")
        `);
        await queryRunner.query(`
            CREATE TABLE "projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(256) NOT NULL,
                "description" text,
                "analyses" integer NOT NULL DEFAULT '0',
                "nodes" integer NOT NULL DEFAULT '0',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "realm_id" uuid NOT NULL,
                "client_id" uuid,
                "user_id" uuid,
                "robot_id" uuid,
                "master_image_id" uuid,
                CONSTRAINT "UQ_2187088ab5ef2a918473cb99007" UNIQUE ("name"),
                CONSTRAINT "PK_6271df0a7aed1d6c0691ce6ac50" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "registries" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "host" character varying(512) NOT NULL,
                "account_name" character varying(256),
                "account_secret" character varying(256),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_8266cb05dea93215bac1bd4bd22" UNIQUE ("host"),
                CONSTRAINT "UQ_8e7844c1613e3fc1df53d965cde" UNIQUE ("name"),
                CONSTRAINT "PK_414eba74fdd10096bfda34f495f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "analysis_entity" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128),
                "description" text,
                "nodes" integer NOT NULL DEFAULT '0',
                "nodes_approved" integer NOT NULL DEFAULT '0',
                "configuration_locked" boolean NOT NULL DEFAULT false,
                "configuration_entrypoint_valid" boolean NOT NULL DEFAULT false,
                "configuration_image_valid" boolean NOT NULL DEFAULT false,
                "configuration_node_aggregator_valid" boolean NOT NULL DEFAULT false,
                "configuration_node_default_valid" boolean NOT NULL DEFAULT false,
                "configuration_nodes_valid" boolean NOT NULL DEFAULT false,
                "distribution_status" character varying(64),
                "distribution_progress" integer,
                "build_nodes_valid" boolean NOT NULL DEFAULT false,
                "build_status" character varying(64),
                "build_progress" integer,
                "build_hash" character varying(135),
                "build_os" character varying(10),
                "build_size" integer,
                "execution_status" character varying(64),
                "execution_progress" integer,
                "image_command_arguments" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "registry_id" uuid,
                "realm_id" uuid NOT NULL,
                "user_id" uuid,
                "project_id" uuid NOT NULL,
                "master_image_id" uuid,
                CONSTRAINT "PK_82544bec5dc754cba8ef540919d" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_58c16da85a656098fb826879e8" ON "analysis_entity" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4b581389a4832bbcf2d6a6c4be" ON "analysis_entity" ("distribution_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4f1ae42446fd55df797dae5c8b" ON "analysis_entity" ("build_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_99e40345e56f04b8cd2dd3d9be" ON "analysis_entity" ("execution_status")
        `);
        await queryRunner.query(`
            CREATE TABLE "analysis_buckets" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying(64) NOT NULL,
                "bucket_id" uuid NOT NULL,
                "analysis_id" uuid NOT NULL,
                "realm_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_7006ff80fb3c0fc317f8c4cd020" UNIQUE ("bucket_id", "analysis_id"),
                CONSTRAINT "PK_245df96c417605d7396e201699c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "analysis_bucket_files" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "path" character varying(256) NOT NULL,
                "root" boolean NOT NULL DEFAULT false,
                "bucket_id" uuid NOT NULL,
                "bucket_file_id" uuid NOT NULL,
                "client_id" uuid,
                "robot_id" uuid,
                "user_id" uuid,
                "realm_id" uuid NOT NULL,
                "analysis_id" uuid NOT NULL,
                "analysis_bucket_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_e972af20263125021b5370c54dd" UNIQUE ("analysis_id", "path"),
                CONSTRAINT "PK_7060d5f329f6474f21a9fa029e3" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "registry_projects" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "type" character varying(64) DEFAULT 'default',
                "public" boolean NOT NULL DEFAULT true,
                "external_name" character varying(64) NOT NULL,
                "external_id" character varying(64),
                "account_id" character varying(64),
                "account_name" character varying(256),
                "account_secret" character varying(256),
                "webhook_name" character varying(128),
                "webhook_exists" boolean NOT NULL DEFAULT false,
                "registry_id" uuid NOT NULL,
                "realm_id" uuid,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_d64dd084b79703879cc66b3e9c2" UNIQUE ("external_id", "registry_id"),
                CONSTRAINT "UQ_1fa5e8b7ffc0786daf0adb941bd" UNIQUE ("external_name", "registry_id"),
                CONSTRAINT "UQ_bd7100277fb5331625c2b474ead" UNIQUE ("name", "registry_id"),
                CONSTRAINT "PK_810dbb77e7a7d56fb70934d7c0a" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "nodes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "external_name" character varying(64),
                "public_key" character varying(4096),
                "name" character varying(128) NOT NULL,
                "hidden" boolean NOT NULL DEFAULT false,
                "type" character varying(64) NOT NULL DEFAULT 'default',
                "online" boolean NOT NULL DEFAULT false,
                "registry_id" uuid,
                "registry_project_id" uuid,
                "client_id" uuid,
                "robot_id" uuid,
                "realm_id" uuid NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "UQ_4f662468f083f7247b8f88c9143" UNIQUE ("name", "realm_id"),
                CONSTRAINT "UQ_2bff328a4564195ef8f9c7f832e" UNIQUE ("external_name", "registry_id"),
                CONSTRAINT "PK_682d6427523a0fa43d062ea03ee" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "analysis_nodes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "approval_status" character varying(32),
                "execution_status" character varying(32),
                "execution_progress" integer,
                "comment" text,
                "artifact_tag" character varying(32),
                "artifact_digest" character varying(512),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "analysis_id" uuid NOT NULL,
                "analysis_realm_id" uuid NOT NULL,
                "node_id" uuid NOT NULL,
                "node_realm_id" uuid NOT NULL,
                CONSTRAINT "UQ_cf2a407e9780e93f339e26c416a" UNIQUE ("node_id", "analysis_id"),
                CONSTRAINT "PK_2e22cac6c91ff774bdfc8cdff25" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "analysis_node_events" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "event_id" uuid,
                "analysis_id" uuid NOT NULL,
                "analysis_realm_id" uuid NOT NULL,
                "node_id" uuid NOT NULL,
                "node_realm_id" uuid NOT NULL,
                CONSTRAINT "PK_526eac9c3957c65840d9af79c10" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "analysis_permissions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "analysis_id" uuid NOT NULL,
                "analysis_realm_id" uuid,
                "permission_id" uuid NOT NULL,
                "policy_id" uuid,
                "permission_realm_id" uuid,
                CONSTRAINT "PK_7dc89a85f7d745c83156b803d60" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "master_image_groups" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying(128) NOT NULL,
                "path" character varying(512) NOT NULL,
                "virtual_path" character varying(512) NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_33be9aae7c26b7cf7bad5f01fdd" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fcd0ee59b74408554a14729dcf" ON "master_image_groups" ("virtual_path")
        `);
        await queryRunner.query(`
            CREATE TABLE "project_nodes" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "approval_status" character varying(32),
                "comment" text,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                "project_id" uuid NOT NULL,
                "project_realm_id" uuid NOT NULL,
                "node_id" uuid NOT NULL,
                "node_realm_id" uuid NOT NULL,
                CONSTRAINT "UQ_6a6402af69df8de6a200b2e7735" UNIQUE ("project_id", "node_id"),
                CONSTRAINT "PK_5c9a45dec08bb44ddb195af33f8" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "projects"
            ADD CONSTRAINT "FK_9334a5beb56029a11fc212664dd" FOREIGN KEY ("master_image_id") REFERENCES "master_images"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity"
            ADD CONSTRAINT "FK_deee2261a37e46654165218a889" FOREIGN KEY ("registry_id") REFERENCES "registries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity"
            ADD CONSTRAINT "FK_d469a78183831f52c8372f6739d" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity"
            ADD CONSTRAINT "FK_37a6c8ecb809264b56dce20f906" FOREIGN KEY ("master_image_id") REFERENCES "master_images"("id") ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_buckets"
            ADD CONSTRAINT "FK_37cb940b0cbe2c82d63d3df43e4" FOREIGN KEY ("analysis_id") REFERENCES "analysis_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_bucket_files"
            ADD CONSTRAINT "FK_a34da414a2241bbbb948d03fa40" FOREIGN KEY ("analysis_id") REFERENCES "analysis_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_bucket_files"
            ADD CONSTRAINT "FK_932ad2e9d710a1604a203543a69" FOREIGN KEY ("analysis_bucket_id") REFERENCES "analysis_buckets"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects"
            ADD CONSTRAINT "FK_6a9fc1b5ea9c842309b11308fd6" FOREIGN KEY ("registry_id") REFERENCES "registries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "nodes"
            ADD CONSTRAINT "FK_053b94f56b541609149d98c47c7" FOREIGN KEY ("registry_id") REFERENCES "registries"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "nodes"
            ADD CONSTRAINT "FK_bcd8dfa9976ce5606c7ce4cf54e" FOREIGN KEY ("registry_project_id") REFERENCES "registry_projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_nodes"
            ADD CONSTRAINT "FK_938790a6d433935d1cb3173f07d" FOREIGN KEY ("analysis_id") REFERENCES "analysis_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_nodes"
            ADD CONSTRAINT "FK_b5e6a39a7894a512203a957ca4a" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_node_events"
            ADD CONSTRAINT "FK_cfcb9cfaf829db2cdff5f6c0303" FOREIGN KEY ("analysis_id") REFERENCES "analysis_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_node_events"
            ADD CONSTRAINT "FK_df239b990efca7eedf3e2a9bb57" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_permissions"
            ADD CONSTRAINT "FK_551045d9191f380929e74575540" FOREIGN KEY ("analysis_id") REFERENCES "analysis_entity"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "project_nodes"
            ADD CONSTRAINT "FK_3b9053cceb1a63e9c12de363bd7" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "project_nodes"
            ADD CONSTRAINT "FK_9bb9c239c3d15ee13b24c52c0ff" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "project_nodes" DROP CONSTRAINT "FK_9bb9c239c3d15ee13b24c52c0ff"
        `);
        await queryRunner.query(`
            ALTER TABLE "project_nodes" DROP CONSTRAINT "FK_3b9053cceb1a63e9c12de363bd7"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_permissions" DROP CONSTRAINT "FK_551045d9191f380929e74575540"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_node_events" DROP CONSTRAINT "FK_df239b990efca7eedf3e2a9bb57"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_node_events" DROP CONSTRAINT "FK_cfcb9cfaf829db2cdff5f6c0303"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_nodes" DROP CONSTRAINT "FK_b5e6a39a7894a512203a957ca4a"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_nodes" DROP CONSTRAINT "FK_938790a6d433935d1cb3173f07d"
        `);
        await queryRunner.query(`
            ALTER TABLE "nodes" DROP CONSTRAINT "FK_bcd8dfa9976ce5606c7ce4cf54e"
        `);
        await queryRunner.query(`
            ALTER TABLE "nodes" DROP CONSTRAINT "FK_053b94f56b541609149d98c47c7"
        `);
        await queryRunner.query(`
            ALTER TABLE "registry_projects" DROP CONSTRAINT "FK_6a9fc1b5ea9c842309b11308fd6"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_bucket_files" DROP CONSTRAINT "FK_932ad2e9d710a1604a203543a69"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_bucket_files" DROP CONSTRAINT "FK_a34da414a2241bbbb948d03fa40"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_buckets" DROP CONSTRAINT "FK_37cb940b0cbe2c82d63d3df43e4"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity" DROP CONSTRAINT "FK_37a6c8ecb809264b56dce20f906"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity" DROP CONSTRAINT "FK_d469a78183831f52c8372f6739d"
        `);
        await queryRunner.query(`
            ALTER TABLE "analysis_entity" DROP CONSTRAINT "FK_deee2261a37e46654165218a889"
        `);
        await queryRunner.query(`
            ALTER TABLE "projects" DROP CONSTRAINT "FK_9334a5beb56029a11fc212664dd"
        `);
        await queryRunner.query(`
            DROP TABLE "project_nodes"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fcd0ee59b74408554a14729dcf"
        `);
        await queryRunner.query(`
            DROP TABLE "master_image_groups"
        `);
        await queryRunner.query(`
            DROP TABLE "analysis_permissions"
        `);
        await queryRunner.query(`
            DROP TABLE "analysis_node_events"
        `);
        await queryRunner.query(`
            DROP TABLE "analysis_nodes"
        `);
        await queryRunner.query(`
            DROP TABLE "nodes"
        `);
        await queryRunner.query(`
            DROP TABLE "registry_projects"
        `);
        await queryRunner.query(`
            DROP TABLE "analysis_bucket_files"
        `);
        await queryRunner.query(`
            DROP TABLE "analysis_buckets"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_99e40345e56f04b8cd2dd3d9be"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4f1ae42446fd55df797dae5c8b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4b581389a4832bbcf2d6a6c4be"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_58c16da85a656098fb826879e8"
        `);
        await queryRunner.query(`
            DROP TABLE "analysis_entity"
        `);
        await queryRunner.query(`
            DROP TABLE "registries"
        `);
        await queryRunner.query(`
            DROP TABLE "projects"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_f5d09cafff06c3a976ebff5f2a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7c779b370b32ebaed6b9cc7576"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_784468a7fc9bc0a5e54efddab7"
        `);
        await queryRunner.query(`
            DROP TABLE "master_images"
        `);
    }
}
