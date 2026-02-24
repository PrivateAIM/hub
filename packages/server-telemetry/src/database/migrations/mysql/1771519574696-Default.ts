import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1771519574696 implements MigrationInterface {
    name = 'Default1771519574696';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`events\` (
                \`id\` varchar(36) NOT NULL,
                \`scope\` varchar(64) NOT NULL,
                \`name\` varchar(64) NOT NULL,
                \`ref_type\` varchar(64) NOT NULL,
                \`ref_id\` varchar(64) NULL,
                \`data\` text NULL,
                \`expiring\` tinyint NOT NULL DEFAULT 0,
                \`request_path\` varchar(256) NULL,
                \`request_method\` varchar(10) NULL,
                \`request_ip_address\` varchar(15) NULL,
                \`request_user_agent\` varchar(512) NULL,
                \`actor_type\` varchar(64) NULL,
                \`actor_id\` varchar(255) NULL,
                \`actor_name\` varchar(64) NULL,
                \`realm_id\` varchar(255) NULL,
                \`expires_at\` varchar(28) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_c0fdc38a6c8fb51d5557fb48e5\` (\`scope\`),
                INDEX \`IDX_dfa3d03bef3f90f650fd138fb3\` (\`name\`),
                INDEX \`IDX_73da2faef487086e700845b7b8\` (\`ref_type\`),
                INDEX \`IDX_24250896047ddb5c221ce1e42d\` (\`ref_id\`),
                INDEX \`IDX_d18c751252944d7287e01f2bba\` (\`expiring\`),
                INDEX \`IDX_27a4b4d027f84645cff6a2046b\` (\`request_path\`),
                INDEX \`IDX_98091bf7c210a05180c50b239d\` (\`request_method\`),
                INDEX \`IDX_96aea52eeb823dd8a3708802c0\` (\`request_ip_address\`),
                INDEX \`IDX_8209335b1c8632c756ce649d44\` (\`request_user_agent\`),
                INDEX \`IDX_ca050bac0a654d1e096beb5d46\` (\`actor_type\`),
                INDEX \`IDX_d1bde4e07e02555eadc160c0de\` (\`actor_id\`),
                INDEX \`IDX_8c05c0a6344a9ba945d9e7c9d2\` (\`actor_name\`),
                INDEX \`IDX_2cef4b1024dd9c933acffa55e9\` (\`ref_type\`, \`ref_id\`),
                INDEX \`IDX_a5329794da6de9616b92d2dbcb\` (\`name\`, \`scope\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_a5329794da6de9616b92d2dbcb\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2cef4b1024dd9c933acffa55e9\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8c05c0a6344a9ba945d9e7c9d2\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d1bde4e07e02555eadc160c0de\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ca050bac0a654d1e096beb5d46\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8209335b1c8632c756ce649d44\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_96aea52eeb823dd8a3708802c0\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_98091bf7c210a05180c50b239d\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_27a4b4d027f84645cff6a2046b\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d18c751252944d7287e01f2bba\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_24250896047ddb5c221ce1e42d\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_73da2faef487086e700845b7b8\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_dfa3d03bef3f90f650fd138fb3\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c0fdc38a6c8fb51d5557fb48e5\` ON \`events\`
        `);
        await queryRunner.query(`
            DROP TABLE \`events\`
        `);
    }
}
