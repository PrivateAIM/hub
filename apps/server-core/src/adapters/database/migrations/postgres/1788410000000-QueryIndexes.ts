import type { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Indexes for the query surface (issue #1842).
 *
 * Backs the rapiq schema `indexes` declarations (rapiq 2.x indexed
 * filters/sorts): every key in a schema's filter/sort allow-list must LEAD a
 * real database index, so the parse-time index policy (anchor mode) never
 * rejects a query the allow-lists permit. Composites stay additive to the
 * singles; keys already leading a PK or UNIQUE (analysis_bucket_files/
 * analysis_nodes/project_nodes junction leaders, nodes.name, projects.name,
 * registries.name, registry_projects.name/external_name) receive no new index.
 *
 * One index per statement, 58 in total — every one a single column, named by
 * typeorm's DefaultNamingStrategy (never hand-written):
 *
 * - analyses: display_name, project_id, realm_id, configuration_locked,
 *   created_at, updated_at
 * - analysis_buckets: analysis_id, type, created_at, updated_at
 * - analysis_bucket_files: path, root, analysis_bucket_id, created_at,
 *   updated_at
 * - analysis_nodes: analysis_id, approval_status, execution_status,
 *   analysis_realm_id, node_realm_id, created_at, updated_at
 * - analysis_node_events: analysis_id, node_id, created_at, updated_at
 * - master_images: name, path, created_at, updated_at
 * - master_image_groups: name, path, created_at, updated_at
 * - nodes: online, hidden, client_id, realm_id, robot_id, created_at,
 *   updated_at
 * - projects: display_name, realm_id, user_id, created_at, updated_at
 * - project_nodes: node_id, approval_status, project_realm_id, node_realm_id,
 *   created_at, updated_at
 * - registries: created_at, updated_at
 * - registry_projects: registry_id, type, created_at, updated_at
 *
 * The `analyses` names assume AlignAnalysesConstraintNames1788400000000 has
 * run, i.e. every constraint on that table already carries its
 * `analyses`-derived hash.
 *
 * Postgres keeps no implicit foreign-key indexes, so unlike the MySQL twin
 * this file needs no constraint handling: down() is a plain DROP INDEX per
 * created index, in reverse order.
 *
 * The 58 CREATE INDEX statements run non-concurrently inside this migration's
 * OWN transaction (hub's postgres migrations run under
 * migrationsTransactionMode 'each', so no sibling migration's lock spans this
 * build). CREATE INDEX takes a SHARE lock per table — reads unaffected, writes
 * stalled — instant on an empty schema, a deliberate brief write-stall on a
 * populated deployment (CREATE INDEX CONCURRENTLY cannot run inside a
 * transaction).
 */
export class QueryIndexes1788410000000 implements MigrationInterface {
    name = 'QueryIndexes1788410000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE INDEX "IDX_4da49b453b5a7c48225be54419" ON "analyses" ("display_name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e0554a6544a95c16e3fe121448" ON "analyses" ("project_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c42e3f7302d1e0241b983729af" ON "analyses" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_d33ecab2c8cb27412fc2eaa06c" ON "analyses" ("configuration_locked")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ba7cad86515332142320631947" ON "analyses" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_576ca2ef5f0ba4d993ef4b0629" ON "analyses" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_37cb940b0cbe2c82d63d3df43e" ON "analysis_buckets" ("analysis_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_89c90dbbe64adca9aeff6a4e03" ON "analysis_buckets" ("type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_2225a63822d2dd480685bd80df" ON "analysis_buckets" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_156c49faea5b76f99806c2763d" ON "analysis_buckets" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_81524510a5bb52fb12ac5ffac7" ON "analysis_bucket_files" ("path")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_197684a68c2456a92ddf811420" ON "analysis_bucket_files" ("root")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_932ad2e9d710a1604a203543a6" ON "analysis_bucket_files" ("analysis_bucket_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_48628752bdece1879046121ed9" ON "analysis_bucket_files" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e988561e8278601d48039f4df8" ON "analysis_bucket_files" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_938790a6d433935d1cb3173f07" ON "analysis_nodes" ("analysis_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6faad13a9e21ce7425e7b38afd" ON "analysis_nodes" ("approval_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7ea595522dcf3392a778437f33" ON "analysis_nodes" ("execution_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c737daa6e83397f006d359bf9b" ON "analysis_nodes" ("analysis_realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b443086bf7d7e32edead69e77c" ON "analysis_nodes" ("node_realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_19a89927479d6f9a891b8bcd90" ON "analysis_nodes" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6c2c980956e6f1fccdecbb947e" ON "analysis_nodes" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cfcb9cfaf829db2cdff5f6c030" ON "analysis_node_events" ("analysis_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_df239b990efca7eedf3e2a9bb5" ON "analysis_node_events" ("node_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3a171e8f9f45a4eb7fbf552f06" ON "analysis_node_events" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e4f41d4112b851de6e97ba8f08" ON "analysis_node_events" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c7a6bb67087af9c6bce898bf6d" ON "master_images" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_e95a7a5518d70dd0116ead71cc" ON "master_images" ("path")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a361cfd7126de31c4490d3278b" ON "master_images" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_3dfb13b606d398daa76a21fd4a" ON "master_images" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_49232bc3cbcd37e6e1849a9d98" ON "master_image_groups" ("name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_095064f51409e6dcd0402f146a" ON "master_image_groups" ("path")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7d2e732efef7ab77b448bab4a4" ON "master_image_groups" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ea2f14287fcd4e306bf29ab3dc" ON "master_image_groups" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b71be7e619d176c09a96099634" ON "nodes" ("online")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_c19a8434115b724287e1f54292" ON "nodes" ("hidden")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_a8a84cb1c7c5d6d25e9079184e" ON "nodes" ("client_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b2c5d177b097c89545675d2c70" ON "nodes" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_4820366c3910f10167a2372217" ON "nodes" ("robot_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_fb58c2dd830a150cd3d4fe96a1" ON "nodes" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_8e38b97ca2fa8d4992e7dadb5e" ON "nodes" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b76fc854ddbdd135de765d23d9" ON "projects" ("display_name")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ade20a7b25bf70b3ff44fc0c78" ON "projects" ("realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bd55b203eb9f92b0c839038001" ON "projects" ("user_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_301eb04c3ee67cb2ab9cb2ab7b" ON "projects" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_b9317874583ab06dcdd7a34c5b" ON "projects" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9bb9c239c3d15ee13b24c52c0f" ON "project_nodes" ("node_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_578ed64bdd3475f4ce55bb5454" ON "project_nodes" ("approval_status")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_ce5d557b1ea535cfc8b2853447" ON "project_nodes" ("project_realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_7f8520e90b18fe847c0aea2287" ON "project_nodes" ("node_realm_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_80364736e7d15cc1dfa23f5eda" ON "project_nodes" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_47fef5519f129e32bb091c490d" ON "project_nodes" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_bc7a5672fddbe3ae5b8e06e0bd" ON "registries" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_9e717ded364fcf114cf111fc06" ON "registries" ("updated_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_6a9fc1b5ea9c842309b11308fd" ON "registry_projects" ("registry_id")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_95f90a61f19ceeb69c84efa479" ON "registry_projects" ("type")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_cf36db56da89cc142452229dc7" ON "registry_projects" ("created_at")
        `);
        await queryRunner.query(`
            CREATE INDEX "IDX_dce69e9c9a16d9b26c6c368bda" ON "registry_projects" ("updated_at")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."IDX_dce69e9c9a16d9b26c6c368bda"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cf36db56da89cc142452229dc7"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_95f90a61f19ceeb69c84efa479"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6a9fc1b5ea9c842309b11308fd"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9e717ded364fcf114cf111fc06"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bc7a5672fddbe3ae5b8e06e0bd"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_47fef5519f129e32bb091c490d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_80364736e7d15cc1dfa23f5eda"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7f8520e90b18fe847c0aea2287"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ce5d557b1ea535cfc8b2853447"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_578ed64bdd3475f4ce55bb5454"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_9bb9c239c3d15ee13b24c52c0f"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b9317874583ab06dcdd7a34c5b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_301eb04c3ee67cb2ab9cb2ab7b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_bd55b203eb9f92b0c839038001"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ade20a7b25bf70b3ff44fc0c78"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b76fc854ddbdd135de765d23d9"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_8e38b97ca2fa8d4992e7dadb5e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_fb58c2dd830a150cd3d4fe96a1"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4820366c3910f10167a2372217"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b2c5d177b097c89545675d2c70"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a8a84cb1c7c5d6d25e9079184e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c19a8434115b724287e1f54292"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b71be7e619d176c09a96099634"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ea2f14287fcd4e306bf29ab3dc"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7d2e732efef7ab77b448bab4a4"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_095064f51409e6dcd0402f146a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_49232bc3cbcd37e6e1849a9d98"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3dfb13b606d398daa76a21fd4a"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_a361cfd7126de31c4490d3278b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e95a7a5518d70dd0116ead71cc"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c7a6bb67087af9c6bce898bf6d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e4f41d4112b851de6e97ba8f08"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_3a171e8f9f45a4eb7fbf552f06"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_df239b990efca7eedf3e2a9bb5"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_cfcb9cfaf829db2cdff5f6c030"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6c2c980956e6f1fccdecbb947e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_19a89927479d6f9a891b8bcd90"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_b443086bf7d7e32edead69e77c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c737daa6e83397f006d359bf9b"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_7ea595522dcf3392a778437f33"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_6faad13a9e21ce7425e7b38afd"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_938790a6d433935d1cb3173f07"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e988561e8278601d48039f4df8"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_48628752bdece1879046121ed9"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_932ad2e9d710a1604a203543a6"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_197684a68c2456a92ddf811420"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_81524510a5bb52fb12ac5ffac7"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_156c49faea5b76f99806c2763d"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_2225a63822d2dd480685bd80df"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_89c90dbbe64adca9aeff6a4e03"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_37cb940b0cbe2c82d63d3df43e"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_576ca2ef5f0ba4d993ef4b0629"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_ba7cad86515332142320631947"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_d33ecab2c8cb27412fc2eaa06c"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_c42e3f7302d1e0241b983729af"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_e0554a6544a95c16e3fe121448"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."IDX_4da49b453b5a7c48225be54419"
        `);
    }
}
