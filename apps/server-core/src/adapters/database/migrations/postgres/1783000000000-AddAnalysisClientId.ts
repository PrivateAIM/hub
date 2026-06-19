import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAnalysisClientId1783000000000 implements MigrationInterface {
    name = 'AddAnalysisClientId1783000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "analysis" ADD "client_id" uuid
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "analysis" DROP COLUMN "client_id"
        `);
    }
}
