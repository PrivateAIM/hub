import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Renames `analyses.build_nodes_valid` to `distribution_nodes_valid`.
 *
 * Node approval used to gate the build, so a node approved the code. It now
 * gates the distribution instead: a node approves the built image (hash,
 * size, OS), every build start resets the approvals, and an approval is only
 * accepted once the build has finished. The aggregate keeps its meaning —
 * every node approved — and only moves to the step it gates, so the column is
 * renamed in place and every stored value stays valid.
 *
 * The column carries no index or constraint, so the rename touches nothing else.
 */
export class RenameBuildNodesValidToDistributionNodesValid1788700000000 implements MigrationInterface {
    name = 'RenameBuildNodesValidToDistributionNodesValid1788700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`analyses\` RENAME COLUMN \`build_nodes_valid\` TO \`distribution_nodes_valid\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`analyses\` RENAME COLUMN \`distribution_nodes_valid\` TO \`build_nodes_valid\`
        `);
    }
}
