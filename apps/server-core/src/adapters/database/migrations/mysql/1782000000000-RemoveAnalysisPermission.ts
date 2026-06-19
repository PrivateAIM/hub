import type { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAnalysisPermission1782000000000 implements MigrationInterface {
    name = 'RemoveAnalysisPermission1782000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Dropping the table also drops its own outgoing FK constraint, so there is
        // no need to drop the foreign key by name first — doing so would couple this
        // migration to the exact (and, for synchronize-built schemas, possibly
        // divergent) constraint name. IF EXISTS keeps it idempotent.
        await queryRunner.query(`
            DROP TABLE IF EXISTS \`analysis_permissions\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Recreate the table exactly as the baseline migration defined it. The FK
        // now targets `analysis` (renamed from `analysis_entity` by AddDisplayName,
        // which has not been reverted yet when this down() runs).
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
            ALTER TABLE \`analysis_permissions\`
            ADD CONSTRAINT \`FK_551045d9191f380929e74575540\` FOREIGN KEY (\`analysis_id\`) REFERENCES \`analysis\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }
}
