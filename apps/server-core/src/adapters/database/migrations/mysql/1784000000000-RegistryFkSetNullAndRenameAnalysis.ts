import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Two schema changes:
 *
 * **1. Rename `analysis` to `analyses`.** Every other table is plural (`nodes`,
 * `projects`, `registries`, `analysis_nodes`, `analysis_buckets`, …); the analysis
 * table was the sole singular outlier. It was already renamed once —
 * `analysis_entity` → `analysis` by `AddDisplayName1780300000000` — so this
 * completes that move. Foreign keys pointing at the table (from
 * `analysis_buckets`, `analysis_bucket_files`, `analysis_nodes`,
 * `analysis_node_events`) are carried over by the rename, constraint names intact.
 *
 * **2. Detach from deleted registry-side rows instead of cascading.**
 * `nodes.registry_id`, `nodes.registry_project_id` and `analyses.registry_id` were
 * all created with `ON DELETE CASCADE`, which made two ordinary admin actions
 * destructive far beyond their apparent scope:
 *
 * - removing a registry project deleted the node referencing it, losing that
 *   node's realm, crypto keys and client credentials;
 * - removing a registry deleted every node bound to it *and* every analysis using
 *   it — and, through the analysis' own cascades, that analysis' buckets, bucket
 *   files, nodes and node events.
 *
 * All three columns are nullable, and null is a state the domain already handles
 * (an unassigned node; an analysis awaiting `AnalysisDistributor.assignRegistry()`),
 * so the reference is nulled and the owning row survives.
 *
 * `registry_projects.registry_id` deliberately keeps its cascade — a registry
 * project cannot exist without its registry.
 */
export class RegistryFkSetNullAndRenameAnalysis1784000000000 implements MigrationInterface {
    name = 'RegistryFkSetNullAndRenameAnalysis1784000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('RENAME TABLE `analysis` TO `analyses`');
        await queryRunner.query(`
            ALTER TABLE \`nodes\` DROP FOREIGN KEY \`FK_053b94f56b541609149d98c47c7\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\` DROP FOREIGN KEY \`FK_bcd8dfa9976ce5606c7ce4cf54e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`analyses\` DROP FOREIGN KEY \`FK_deee2261a37e46654165218a889\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\`
            ADD CONSTRAINT \`FK_053b94f56b541609149d98c47c7\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\`
            ADD CONSTRAINT \`FK_bcd8dfa9976ce5606c7ce4cf54e\` FOREIGN KEY (\`registry_project_id\`) REFERENCES \`registry_projects\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`analyses\`
            ADD CONSTRAINT \`FK_deee2261a37e46654165218a889\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`analyses\` DROP FOREIGN KEY \`FK_deee2261a37e46654165218a889\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\` DROP FOREIGN KEY \`FK_bcd8dfa9976ce5606c7ce4cf54e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`nodes\` DROP FOREIGN KEY \`FK_053b94f56b541609149d98c47c7\`
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
            ALTER TABLE \`analyses\`
            ADD CONSTRAINT \`FK_deee2261a37e46654165218a889\` FOREIGN KEY (\`registry_id\`) REFERENCES \`registries\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query('RENAME TABLE `analyses` TO `analysis`');
    }
}
