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
import type { Event } from '@privateaim/telemetry-kit';
import { AnalysisEntity } from './analysis.ts';
import { NodeEntity } from './node.ts';

@Entity({ name: 'analysis_node_events' })
export class AnalysisNodeEventEntity implements AnalysisNodeEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ------------------------------------------------------------------

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------

    @Column({
        name: 'event_id', 
        type: 'uuid', 
        nullable: true, 
    })
    eventId: Event['id'];

    // ------------------------------------------------------------------

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
    analysis: AnalysisEntity;

    @Column({ name: 'analysis_id' })
    analysisId: Analysis['id'];

    @Column({ name: 'analysis_realm_id', type: 'uuid' })
    analysisRealmId: Realm['id'];

    // ------------------------------------------------------------------

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
    node: NodeEntity;

    @Column({ name: 'node_id' })
    nodeId: Node['id'];

    @Column({ name: 'node_realm_id', type: 'uuid' })
    nodeRealmId: Realm['id'];
}
