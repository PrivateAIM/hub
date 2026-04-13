import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Default1771579303467 implements MigrationInterface {
    name = 'Default1771579303467';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`buckets\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(256) NOT NULL,
                \`region\` varchar(256) NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`actor_id\` varchar(255) NULL,
                \`actor_type\` varchar(64) NULL,
                \`realm_id\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`bucket_files\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(256) NOT NULL,
                \`path\` varchar(512) NOT NULL,
                \`hash\` varchar(4096) NOT NULL,
                \`directory\` varchar(255) NULL,
                \`size\` int UNSIGNED NULL,
                \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`actor_type\` varchar(64) NOT NULL,
                \`actor_id\` varchar(255) NOT NULL,
                \`realm_id\` varchar(255) NULL,
                \`bucket_id\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_a5b5c57f7e994241421c2bf37d\` (\`bucket_id\`, \`path\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`bucket_files\`
            ADD CONSTRAINT \`FK_8f5dde5868976a4d18f077ba323\` FOREIGN KEY (\`bucket_id\`) REFERENCES \`buckets\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bucket_files\` DROP FOREIGN KEY \`FK_8f5dde5868976a4d18f077ba323\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a5b5c57f7e994241421c2bf37d\` ON \`bucket_files\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bucket_files\`
        `);
        await queryRunner.query(`
            DROP TABLE \`buckets\`
        `);
    }
}
