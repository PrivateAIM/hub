/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type {
    Analysis,
    AnalysisNodeEvent,
    Node,
} from '@privateaim/core-kit';
import type { Realm } from '@authup/core-kit';
import { AnalysisEntity } from '../analysis';
import { NodeEntity } from '../node';

@Entity({ name: 'analysis_node_events' })
export class AnalysisNodeEventEntity implements AnalysisNodeEvent {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({ type: 'varchar', length: 64 })
        name: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
        analysis: AnalysisEntity;

    @Column()
        analysis_id: Analysis['id'];

    @Column({ type: 'uuid' })
        analysis_realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
        node: NodeEntity;

    @Column()
        node_id: Node['id'];

    @Column({ type: 'uuid' })
        node_realm_id: Realm['id'];
}
