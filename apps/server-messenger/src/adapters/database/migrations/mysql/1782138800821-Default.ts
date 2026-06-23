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
                \`expires_at\` datetime NOT NULL,
                INDEX \`IDX_3a83b1bc057fd8dd8ffcc926ca\` (\`expires_at\`),
                INDEX \`IDX_f4070ef2c27d60b10b2083ffcc\` (\`recipient_id\`, \`created_at\`, \`id\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }
    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_f4070ef2c27d60b10b2083ffcc\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_3a83b1bc057fd8dd8ffcc926ca\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP TABLE \`messages\`
        `);
    }
}
