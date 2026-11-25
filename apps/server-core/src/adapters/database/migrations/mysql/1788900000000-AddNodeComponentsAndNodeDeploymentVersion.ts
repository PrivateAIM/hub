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
            CREATE TABLE \`node_components\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(64) NOT NULL,
                \`version\` varchar(64) NULL,
                \`status\` varchar(16) NOT NULL,
                \`message\` varchar(1024) NULL,
                \`latency\` float NULL,
                \`uptime\` int NULL,
                \`checks_total\` int NULL,
                \`checks_successful\` int NULL,
                \`reported_at\` datetime(6) NOT NULL,
                \`node_id\` varchar(255) NOT NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_287daee5dda12fdbcad375a8d0\` (\`version\`),
                INDEX \`IDX_ad578c225fcbee078620b90069\` (\`status\`),
                INDEX \`IDX_768287383be45669b7ef2f1a35\` (\`name\`, \`version\`),
                INDEX \`IDX_7a28d3c8878368baf6ef015ab1\` (\`created_at\`),
                INDEX \`IDX_fae433536ef216a40efd7ab20b\` (\`updated_at\`),
                UNIQUE INDEX \`IDX_86f12b561dcc7aa33e02e0e852\` (\`node_id\`, \`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\`
            ADD \`deployment_version\` varchar(64) NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_58b8d88c325a2b4d8db1ca6f38\` ON \`nodes\` (\`deployment_version\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`node_components\`
            ADD CONSTRAINT \`FK_d814896ecace58245c611572869\` FOREIGN KEY (\`node_id\`) REFERENCES \`nodes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`node_components\` DROP FOREIGN KEY \`FK_d814896ecace58245c611572869\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_58b8d88c325a2b4d8db1ca6f38\` ON \`nodes\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\` DROP COLUMN \`deployment_version\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_86f12b561dcc7aa33e02e0e852\` ON \`node_components\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_fae433536ef216a40efd7ab20b\` ON \`node_components\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7a28d3c8878368baf6ef015ab1\` ON \`node_components\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_768287383be45669b7ef2f1a35\` ON \`node_components\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ad578c225fcbee078620b90069\` ON \`node_components\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_287daee5dda12fdbcad375a8d0\` ON \`node_components\`
        `);
        await queryRunner.query(`
            DROP TABLE \`node_components\`
        `);
    }
}
