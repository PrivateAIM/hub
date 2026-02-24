import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1771579910800 implements MigrationInterface {
    name = 'Default1771579910800';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`master_images\` (
                \`id\` varchar(36) NOT NULL,
                \`build_status\` varchar(64) NULL,
                \`build_progress\` int UNSIGNED NULL,
                \`build_hash\` varchar(135) NULL,
                \`build_size\` int UNSIGNED NULL,
                \`path\` varchar(512) NULL,
                \`virtual_path\` varchar(512) NOT NULL,
                \`group_virtual_path\` varchar(512) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`command\` text NULL,
                \`command_arguments\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_784468a7fc9bc0a5e54efddab7\` (\`build_status\`),
                INDEX \`IDX_7c779b370b32ebaed6b9cc7576\` (\`virtual_path\`),
                INDEX \`IDX_f5d09cafff06c3a976ebff5f2a\` (\`group_virtual_path\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`projects\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(256) NOT NULL,
                \`description\` text NULL,
                \`analyses\` int UNSIGNED NOT NULL DEFAULT '0',
                \`nodes\` int UNSIGNED NOT NULL DEFAULT '0',
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`realm_id\` varchar(255) NOT NULL,
                \`client_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                \`robot_id\` varchar(255) NULL,
                \`master_image_id\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_2187088ab5ef2a918473cb9900\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`registries\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`host\` varchar(512) NOT NULL,
                \`account_name\` varchar(256) NULL,
                \`account_secret\` varchar(256) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_8266cb05dea93215bac1bd4bd2\` (\`host\`),
                UNIQUE INDEX \`IDX_8e7844c1613e3fc1df53d965cd\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`analysis_entity\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NULL,
                \`description\` text NULL,
                \`nodes\` int UNSIGNED NOT NULL DEFAULT '0',
                \`nodes_approved\` int UNSIGNED NOT NULL DEFAULT '0',
                \`configuration_locked\` tinyint NOT NULL DEFAULT 0,
                \`configuration_entrypoint_valid\` tinyint NOT NULL DEFAULT 0,
                \`configuration_image_valid\` tinyint NOT NULL DEFAULT 0,
                \`configuration_node_aggregator_valid\` tinyint NOT NULL DEFAULT 0,
                \`configuration_node_default_valid\` tinyint NOT NULL DEFAULT 0,
                \`configuration_nodes_valid\` tinyint NOT NULL DEFAULT 0,
                \`distribution_status\` varchar(64) NULL,
                \`distribution_progress\` int UNSIGNED NULL,
                \`build_nodes_valid\` tinyint NOT NULL DEFAULT 0,
                \`build_status\` varchar(64) NULL,
                \`build_progress\` int UNSIGNED NULL,
                \`build_hash\` varchar(135) NULL,
                \`build_os\` varchar(10) NULL,
                \`build_size\` int UNSIGNED NULL,
                \`execution_status\` varchar(64) NULL,
                \`execution_progress\` int UNSIGNED NULL,
                \`image_command_arguments\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`registry_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`user_id\` varchar(255) NULL,
                \`project_id\` varchar(255) NOT NULL,
                \`master_image_id\` varchar(255) NULL,
                INDEX \`IDX_58c16da85a656098fb826879e8\` (\`name\`),
                INDEX \`IDX_4b581389a4832bbcf2d6a6c4be\` (\`distribution_status\`),
                INDEX \`IDX_4f1ae42446fd55df797dae5c8b\` (\`build_status\`),
                INDEX \`IDX_99e40345e56f04b8cd2dd3d9be\` (\`execution_status\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`analysis_buckets\` (
                \`id\` varchar(36) NOT NULL,
                \`type\` varchar(64) NOT NULL,
                \`bucket_id\` varchar(255) NOT NULL,
                \`analysis_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_7006ff80fb3c0fc317f8c4cd02\` (\`bucket_id\`, \`analysis_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`analysis_bucket_files\` (
                \`id\` varchar(36) NOT NULL,
                \`path\` varchar(256) NOT NULL,
                \`root\` tinyint NOT NULL DEFAULT 0,
                \`bucket_id\` varchar(255) NOT NULL,
                \`bucket_file_id\` varchar(255) NOT NULL,
                \`client_id\` varchar(255) NULL,
                \`robot_id\` varchar(255) NULL,
                \`user_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`analysis_id\` varchar(255) NOT NULL,
                \`analysis_bucket_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_e972af20263125021b5370c54d\` (\`analysis_id\`, \`path\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`registry_projects\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`type\` varchar(64) NULL DEFAULT 'default',
                \`public\` tinyint NOT NULL DEFAULT 1,
                \`external_name\` varchar(64) NOT NULL,
                \`external_id\` varchar(64) NULL,
                \`account_id\` varchar(64) NULL,
                \`account_name\` varchar(256) NULL,
                \`account_secret\` varchar(256) NULL,
                \`webhook_name\` varchar(128) NULL,
                \`webhook_exists\` tinyint NOT NULL DEFAULT 0,
                \`registry_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_d64dd084b79703879cc66b3e9c\` (\`external_id\`, \`registry_id\`),
                UNIQUE INDEX \`IDX_1fa5e8b7ffc0786daf0adb941b\` (\`external_name\`, \`registry_id\`),
                UNIQUE INDEX \`IDX_bd7100277fb5331625c2b474ea\` (\`name\`, \`registry_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`nodes\` (
                \`id\` varchar(36) NOT NULL,
                \`external_name\` varchar(64) NULL,
                \`public_key\` varchar(4096) NULL,
                \`name\` varchar(128) NOT NULL,
                \`hidden\` tinyint NOT NULL DEFAULT 0,
                \`type\` varchar(64) NOT NULL DEFAULT 'default',
                \`online\` tinyint NOT NULL DEFAULT 0,
                \`registry_id\` varchar(255) NULL,
                \`registry_project_id\` varchar(255) NULL,
                \`client_id\` varchar(255) NULL,
                \`robot_id\` varchar(255) NULL,
                \`realm_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_4f662468f083f7247b8f88c914\` (\`name\`, \`realm_id\`),
                UNIQUE INDEX \`IDX_2bff328a4564195ef8f9c7f832\` (\`external_name\`, \`registry_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`analysis_nodes\` (
                \`id\` varchar(36) NOT NULL,
                \`approval_status\` varchar(32) NULL,
                \`execution_status\` varchar(32) NULL,
                \`execution_progress\` int UNSIGNED NULL,
                \`comment\` text NULL,
                \`artifact_tag\` varchar(32) NULL,
                \`artifact_digest\` varchar(512) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`analysis_id\` varchar(255) NOT NULL,
                \`analysis_realm_id\` varchar(255) NOT NULL,
                \`node_id\` varchar(255) NOT NULL,
                \`node_realm_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_cf2a407e9780e93f339e26c416\` (\`node_id\`, \`analysis_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`analysis_node_events\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`event_id\` varchar(255) NULL,
                \`analysis_id\` varchar(255) NOT NULL,
                \`analysis_realm_id\` varchar(255) NOT NULL,
                \`node_id\` varchar(255) NOT NULL,
                \`node_realm_id\` varchar(255) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`analysis_permissions\` (
                \`id\` varchar(36) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`analysis_id\` varchar(255) NOT NULL,
                \`analysis_realm_id\` varchar(255) NULL,
                \`permission_id\` varchar(255) NOT NULL,
                \`policy_id\` varchar(255) NULL,
                \`permission_realm_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`master_image_groups\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(128) NOT NULL,
                \`path\` varchar(512) NOT NULL,
                \`virtual_path\` varchar(512) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_fcd0ee59b74408554a14729dcf\` (\`virtual_path\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`project_nodes\` (
                \`id\` varchar(36) NOT NULL,
                \`approval_status\` varchar(32) NULL,
                \`comment\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`project_id\` varchar(255) NOT NULL,
                \`project_realm_id\` varchar(255) NOT NULL,
                \`node_id\` varchar(255) NOT NULL,
                \`node_realm_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_6a6402af69df8de6a200b2e773\` (\`project_id\`, \`node_id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`projects\`
            ADD CONSTRAINT \`FK_9334a5beb56029a11fc212664dd\` FOREIGN KEY (\`master_image_id\`) REFERENCES \`master_images\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\`
            ADD CONSTRAINT \`FK_deee2261a37e46654165218a889\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\`
            ADD CONSTRAINT \`FK_d469a78183831f52c8372f6739d\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\`
            ADD CONSTRAINT \`FK_37a6c8ecb809264b56dce20f906\` FOREIGN KEY (\`master_image_id\`) REFERENCES \`master_images\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_buckets\`
            ADD CONSTRAINT \`FK_37cb940b0cbe2c82d63d3df43e4\` FOREIGN KEY (\`analysis_id\`) REFERENCES \`analysis_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_bucket_files\`
            ADD CONSTRAINT \`FK_a34da414a2241bbbb948d03fa40\` FOREIGN KEY (\`analysis_id\`) REFERENCES \`analysis_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_bucket_files\`
            ADD CONSTRAINT \`FK_932ad2e9d710a1604a203543a69\` FOREIGN KEY (\`analysis_bucket_id\`) REFERENCES \`analysis_buckets\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\`
            ADD CONSTRAINT \`FK_6a9fc1b5ea9c842309b11308fd6\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\`
            ADD CONSTRAINT \`FK_053b94f56b541609149d98c47c7\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\`
            ADD CONSTRAINT \`FK_bcd8dfa9976ce5606c7ce4cf54e\` FOREIGN KEY (\`registry_project_id\`) REFERENCES \`registry_projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_nodes\`
            ADD CONSTRAINT \`FK_938790a6d433935d1cb3173f07d\` FOREIGN KEY (\`analysis_id\`) REFERENCES \`analysis_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_nodes\`
            ADD CONSTRAINT \`FK_b5e6a39a7894a512203a957ca4a\` FOREIGN KEY (\`node_id\`) REFERENCES \`nodes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_node_events\`
            ADD CONSTRAINT \`FK_cfcb9cfaf829db2cdff5f6c0303\` FOREIGN KEY (\`analysis_id\`) REFERENCES \`analysis_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_node_events\`
            ADD CONSTRAINT \`FK_df239b990efca7eedf3e2a9bb57\` FOREIGN KEY (\`node_id\`) REFERENCES \`nodes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_permissions\`
            ADD CONSTRAINT \`FK_551045d9191f380929e74575540\` FOREIGN KEY (\`analysis_id\`) REFERENCES \`analysis_entity\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`project_nodes\`
            ADD CONSTRAINT \`FK_3b9053cceb1a63e9c12de363bd7\` FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`project_nodes\`
            ADD CONSTRAINT \`FK_9bb9c239c3d15ee13b24c52c0ff\` FOREIGN KEY (\`node_id\`) REFERENCES \`nodes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`project_nodes\` DROP FOREIGN KEY \`FK_9bb9c239c3d15ee13b24c52c0ff\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`project_nodes\` DROP FOREIGN KEY \`FK_3b9053cceb1a63e9c12de363bd7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_permissions\` DROP FOREIGN KEY \`FK_551045d9191f380929e74575540\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_node_events\` DROP FOREIGN KEY \`FK_df239b990efca7eedf3e2a9bb57\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_node_events\` DROP FOREIGN KEY \`FK_cfcb9cfaf829db2cdff5f6c0303\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_nodes\` DROP FOREIGN KEY \`FK_b5e6a39a7894a512203a957ca4a\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_nodes\` DROP FOREIGN KEY \`FK_938790a6d433935d1cb3173f07d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\` DROP FOREIGN KEY \`FK_bcd8dfa9976ce5606c7ce4cf54e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\` DROP FOREIGN KEY \`FK_053b94f56b541609149d98c47c7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`registry_projects\` DROP FOREIGN KEY \`FK_6a9fc1b5ea9c842309b11308fd6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_bucket_files\` DROP FOREIGN KEY \`FK_932ad2e9d710a1604a203543a69\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_bucket_files\` DROP FOREIGN KEY \`FK_a34da414a2241bbbb948d03fa40\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_buckets\` DROP FOREIGN KEY \`FK_37cb940b0cbe2c82d63d3df43e4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\` DROP FOREIGN KEY \`FK_37a6c8ecb809264b56dce20f906\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\` DROP FOREIGN KEY \`FK_d469a78183831f52c8372f6739d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analysis_entity\` DROP FOREIGN KEY \`FK_deee2261a37e46654165218a889\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`projects\` DROP FOREIGN KEY \`FK_9334a5beb56029a11fc212664dd\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6a6402af69df8de6a200b2e773\` ON \`project_nodes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`project_nodes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_fcd0ee59b74408554a14729dcf\` ON \`master_image_groups\`
        `);
        await queryRunner.query(`
            DROP TABLE \`master_image_groups\`
        `);
        await queryRunner.query(`
            DROP TABLE \`analysis_permissions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`analysis_node_events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_cf2a407e9780e93f339e26c416\` ON \`analysis_nodes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`analysis_nodes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2bff328a4564195ef8f9c7f832\` ON \`nodes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_4f662468f083f7247b8f88c914\` ON \`nodes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`nodes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_bd7100277fb5331625c2b474ea\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_1fa5e8b7ffc0786daf0adb941b\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d64dd084b79703879cc66b3e9c\` ON \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP TABLE \`registry_projects\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_e972af20263125021b5370c54d\` ON \`analysis_bucket_files\`
        `);
        await queryRunner.query(`
            DROP TABLE \`analysis_bucket_files\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7006ff80fb3c0fc317f8c4cd02\` ON \`analysis_buckets\`
        `);
        await queryRunner.query(`
            DROP TABLE \`analysis_buckets\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_99e40345e56f04b8cd2dd3d9be\` ON \`analysis_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_4f1ae42446fd55df797dae5c8b\` ON \`analysis_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_4b581389a4832bbcf2d6a6c4be\` ON \`analysis_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_58c16da85a656098fb826879e8\` ON \`analysis_entity\`
        `);
        await queryRunner.query(`
            DROP TABLE \`analysis_entity\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8e7844c1613e3fc1df53d965cd\` ON \`registries\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8266cb05dea93215bac1bd4bd2\` ON \`registries\`
        `);
        await queryRunner.query(`
            DROP TABLE \`registries\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2187088ab5ef2a918473cb9900\` ON \`projects\`
        `);
        await queryRunner.query(`
            DROP TABLE \`projects\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_f5d09cafff06c3a976ebff5f2a\` ON \`master_images\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7c779b370b32ebaed6b9cc7576\` ON \`master_images\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_784468a7fc9bc0a5e54efddab7\` ON \`master_images\`
        `);
        await queryRunner.query(`
            DROP TABLE \`master_images\`
        `);
    }
}
