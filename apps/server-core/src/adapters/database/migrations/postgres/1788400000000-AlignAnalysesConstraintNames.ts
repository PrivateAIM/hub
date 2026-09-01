import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Rename the seven stale constraint names on the `analyses` table to the names
 * typeorm's DefaultNamingStrategy derives today (issue #1823).
 *
 * The table was created as `analysis_entity` (Default1771579910800), renamed to
 * `analysis` (AddDisplayName1780300000000) and finally to `analyses`
 * (RegistryFkSetNullAndRenameAnalysis1784000000000). A RENAME TABLE carries
 * every index and foreign key over with its name intact, but typeorm hashes
 * constraint names from table + column names — so the live schema still holds
 * `analysis_entity`-derived hashes while the entity metadata now derives
 * `analyses`-based ones. Every `migration generate` therefore opens with seven
 * spurious drop/recreate statements before any real change, and the drift gate
 * (`scripts/assert-schema-drift.mjs`) would report the same noise. Aligning the
 * names unblocks clean generate output and a quiet gate.
 *
 * Renames only — no table is rewritten and no row is read or written:
 *
 * - IDX_58c16da85a656098fb826879e8 (name)                → IDX_e88e9ad94114fc10e281e86f87
 * - IDX_4b581389a4832bbcf2d6a6c4be (distribution_status) → IDX_9a94f99b9efa17f2e4cc1966c4
 * - IDX_4f1ae42446fd55df797dae5c8b (build_status)        → IDX_5766ce7ee24a73131df7909bcd
 * - IDX_99e40345e56f04b8cd2dd3d9be (execution_status)    → IDX_f279e7807bcb83e92a1f18f10d
 * - FK_deee2261a37e46654165218a889 (registry_id → registries.id, SET NULL)
 *                                                        → FK_361d962e907f7131f784a218b99
 * - FK_d469a78183831f52c8372f6739d (project_id → projects.id, CASCADE)
 *                                                        → FK_e0554a6544a95c16e3fe1214489
 * - FK_37a6c8ecb809264b56dce20f906 (master_image_id → master_images.id, SET NULL)
 *                                                        → FK_344d29541553fb6bce75ce4cd32
 */
export class AlignAnalysesConstraintNames1788400000000 implements MigrationInterface {
    name = 'AlignAnalysesConstraintNames1788400000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER INDEX "IDX_58c16da85a656098fb826879e8" RENAME TO "IDX_e88e9ad94114fc10e281e86f87"');
        await queryRunner.query('ALTER INDEX "IDX_4b581389a4832bbcf2d6a6c4be" RENAME TO "IDX_9a94f99b9efa17f2e4cc1966c4"');
        await queryRunner.query('ALTER INDEX "IDX_4f1ae42446fd55df797dae5c8b" RENAME TO "IDX_5766ce7ee24a73131df7909bcd"');
        await queryRunner.query('ALTER INDEX "IDX_99e40345e56f04b8cd2dd3d9be" RENAME TO "IDX_f279e7807bcb83e92a1f18f10d"');
        await queryRunner.query('ALTER TABLE "analyses" RENAME CONSTRAINT "FK_deee2261a37e46654165218a889" TO "FK_361d962e907f7131f784a218b99"');
        await queryRunner.query('ALTER TABLE "analyses" RENAME CONSTRAINT "FK_d469a78183831f52c8372f6739d" TO "FK_e0554a6544a95c16e3fe1214489"');
        await queryRunner.query('ALTER TABLE "analyses" RENAME CONSTRAINT "FK_37a6c8ecb809264b56dce20f906" TO "FK_344d29541553fb6bce75ce4cd32"');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "analyses" RENAME CONSTRAINT "FK_344d29541553fb6bce75ce4cd32" TO "FK_37a6c8ecb809264b56dce20f906"');
        await queryRunner.query('ALTER TABLE "analyses" RENAME CONSTRAINT "FK_e0554a6544a95c16e3fe1214489" TO "FK_d469a78183831f52c8372f6739d"');
        await queryRunner.query('ALTER TABLE "analyses" RENAME CONSTRAINT "FK_361d962e907f7131f784a218b99" TO "FK_deee2261a37e46654165218a889"');
        await queryRunner.query('ALTER INDEX "IDX_f279e7807bcb83e92a1f18f10d" RENAME TO "IDX_99e40345e56f04b8cd2dd3d9be"');
        await queryRunner.query('ALTER INDEX "IDX_5766ce7ee24a73131df7909bcd" RENAME TO "IDX_4f1ae42446fd55df797dae5c8b"');
        await queryRunner.query('ALTER INDEX "IDX_9a94f99b9efa17f2e4cc1966c4" RENAME TO "IDX_4b581389a4832bbcf2d6a6c4be"');
        await queryRunner.query('ALTER INDEX "IDX_e88e9ad94114fc10e281e86f87" RENAME TO "IDX_58c16da85a656098fb826879e8"');
    }
}
