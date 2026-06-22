import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1782138800821 implements MigrationInterface {
    name = 'Default1782138800821';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`messages\` (
                \`id\` varchar(36) NOT NULL,
                \`sender_type\` varchar(64) NOT NULL,
                \`sender_id\` varchar(255) NOT NULL,
                \`recipient_type\` varchar(64) NOT NULL,
                \`recipient_id\` varchar(255) NOT NULL,
                \`data\` text NULL,
                \`metadata\` text NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`expires_at\` bigint NOT NULL,
                INDEX \`IDX_3a83b1bc057fd8dd8ffcc926ca\` (\`expires_at\`),
                INDEX \`IDX_6f3011974e71494d267c3b9df5\` (\`recipient_id\`, \`created_at\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_6f3011974e71494d267c3b9df5\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_3a83b1bc057fd8dd8ffcc926ca\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP TABLE \`messages\`
        `);
    }
}
