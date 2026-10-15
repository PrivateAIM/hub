/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer } from '@privateaim/server-db-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import type {
    Analysis,
    AnalysisNode,
    AnalysisNodeApprovalStatus,
    Node,
} from '@privateaim/core-kit';
import type { Realm } from '@authup/core-kit';
import type { ProcessStatus } from '@privateaim/kit';
import { AnalysisEntity } from './analysis.ts';
import { NodeEntity } from './node.ts';

// Each side of the junction (node, analysis) is indexed by its id and by its
// realm, each paired with the opposite side's realm or id, so a lookup or
// filter combination from either side is served by one index, and the
// participation lookups (SELECT analysis_id ... WHERE node_realm_id = ?)
// answer from the index alone. Every leading column is also an allow-listed
// filter key, so no single-column index is needed for these four columns.
// typeorm hashes an index name from the SORTED column list, so each mirrored
// pair would collide: the index whose columns are not in alphabetical order
// carries an explicit name, hashed the same way from its columns in order.
@Unique(['nodeId', 'analysisId'])
@Index('IDX_c0a83a2c9e8f5b096e0587230a', ['nodeId', 'analysisRealmId'])
@Index(['analysisId', 'nodeRealmId'])
@Index(['analysisRealmId', 'nodeId'])
@Index('IDX_5816ce1cf851f5fc1421faa346', ['nodeRealmId', 'analysisId'])
// Status first, newest first: an approval or execution inbox
// (sort=approvalStatus,-createdAt).
@Index(['approvalStatus', 'createdAt'])
@Index(['executionStatus', 'createdAt'])
@Entity({ name: 'analysis_nodes' })
export class AnalysisNodeEntity implements AnalysisNode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ------------------------------------------------------------------

    @Column({
        name: 'approval_status',
        type: 'varchar',
        length: 32,
        default: null,
    })
    approvalStatus: AnalysisNodeApprovalStatus | null;

    @Column({
        name: 'execution_status',
        type: 'varchar',
        length: 32,
        nullable: true,
        default: null,
    })
    executionStatus: ProcessStatus | null;

    @Column({
        name: 'execution_progress',
        type: 'int', 
        unsigned: true, 
        nullable: true, 
        default: null,
    })
    executionProgress: number | null;

    // ------------------------------------------------------------------

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({
        name: 'artifact_tag',
        type: 'varchar', 
        length: 32, 
        nullable: true, 
    })
    artifactTag: string | null;

    @Column({
        name: 'artifact_digest',
        type: 'varchar', 
        length: 512, 
        nullable: true, 
    })
    artifactDigest: string | null;

    // ------------------------------------------------------------------

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @Index()
    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------

    @Column({ name: 'analysis_id' })
    analysisId: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
    analysis: AnalysisEntity;

    @Column({ name: 'analysis_realm_id', type: 'uuid' })
    analysisRealmId: Realm['id'];

    @Column({ name: 'node_id' })
    nodeId: Node['id'];

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
    node: NodeEntity;

    @Column({ name: 'node_realm_id', type: 'uuid' })
    nodeRealmId: Realm['id'];
}
