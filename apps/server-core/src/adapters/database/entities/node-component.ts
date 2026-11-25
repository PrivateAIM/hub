/*
 * Copyright (c) 2026.
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
import type { Node, NodeComponent } from '@privateaim/core-kit';
import { NodeEntity } from './node.ts';

@Entity({ name: 'node_components' })
@Unique(['nodeId', 'name'])
@Index(['name', 'version'])
export class NodeComponentEntity implements NodeComponent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    // ------------------------------------------------------------------

    @Column({ type: 'varchar', length: 64 })
    name: string;

    @Index()
    @Column({
        type: 'varchar',
        length: 64,
        nullable: true,
    })
    version: string | null;

    @Index()
    @Column({ type: 'varchar', length: 16 })
    status: NodeComponent['status'];

    @Column({
        type: 'varchar',
        length: 1024,
        nullable: true,
    })
    message: string | null;

    @Column({ type: 'float', nullable: true })
    latency: number | null;

    @Column({ type: 'int', nullable: true })
    uptime: number | null;

    @Column({
        name: 'checks_total',
        type: 'int',
        nullable: true,
    })
    checksTotal: number | null;

    @Column({
        name: 'checks_successful',
        type: 'int',
        nullable: true,
    })
    checksSuccessful: number | null;

    // Not filterable: a transformer-backed column (see query-surface).
    @Column({
        name: 'reported_at',
        type: Date,
        precision: 6,
        transformer: dateToISOStringTransformer,
    })
    reportedAt: string;

    // ------------------------------------------------------------------

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
    node: NodeEntity;

    @Column({ name: 'node_id', type: 'uuid' })
    nodeId: Node['id'];

    // ------------------------------------------------------------------

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
