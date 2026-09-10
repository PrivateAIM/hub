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

@Unique(['nodeId', 'analysisId'])
@Entity({ name: 'analysis_nodes' })
export class AnalysisNodeEntity implements AnalysisNode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ------------------------------------------------------------------

    @Index()
    @Column({
        name: 'approval_status',
        type: 'varchar',
        length: 32,
        default: null,
    })
    approvalStatus: AnalysisNodeApprovalStatus | null;

    @Index()
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

    @Index()
    @Column({ name: 'analysis_id' })
    analysisId: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
    analysis: AnalysisEntity;

    @Index()
    @Column({ name: 'analysis_realm_id', type: 'uuid' })
    analysisRealmId: Realm['id'];

    @Column({ name: 'node_id' })
    nodeId: Node['id'];

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
    node: NodeEntity;

    @Index()
    @Column({ name: 'node_realm_id', type: 'uuid' })
    nodeRealmId: Realm['id'];
}
