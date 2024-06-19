/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity,
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
    AnalysisNodeRunStatus,
    Node,
} from '@privateaim/core-kit';
import type { Realm } from '@authup/core-kit';
import { AnalysisEntity } from '../analysis';
import { NodeEntity } from '../node';

@Unique(['index', 'analysis_id'])
@Unique(['node_id', 'analysis_id'])
@Entity({ name: 'analysis_nodes' })
export class AnalysisNodeEntity implements AnalysisNode {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    // ------------------------------------------------------------------

    @Column({ default: null })
        approval_status: AnalysisNodeApprovalStatus | null;

    @Column({ type: 'varchar', nullable: true, default: null })
        run_status: AnalysisNodeRunStatus | null;

    // ------------------------------------------------------------------

    @Column({ type: 'text', nullable: true })
        comment: string;

    @Column({ type: 'int', unsigned: true, nullable: true })
        index: number;

    @Column({ type: 'varchar', length: 32, nullable: true })
        artifact_tag: string | null;

    @Column({ type: 'varchar', length: 512, nullable: true })
        artifact_digest: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        analysis_id: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
        analysis: AnalysisEntity;

    @Column({ type: 'uuid' })
        analysis_realm_id: Realm['id'];

    @Column()
        node_id: Node['id'];

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
        node: NodeEntity;

    @Column({ type: 'uuid' })
        node_realm_id: Realm['id'];
}
