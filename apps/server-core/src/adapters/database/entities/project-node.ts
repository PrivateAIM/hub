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
    Node, 
    Project, 
    ProjectNode, 
    ProjectNodeApprovalStatus,
} from '@privateaim/core-kit';
import type { Realm } from '@authup/core-kit';
import { ProjectEntity } from './project.ts';
import { NodeEntity } from './node.ts';

@Unique(['projectId', 'nodeId'])
@Entity({ name: 'project_nodes' })
export class ProjectNodeEntity implements ProjectNode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({
        name: 'approval_status',
        type: 'varchar',
        length: 32,
        default: null,
    })
    approvalStatus: ProjectNodeApprovalStatus | null;

    @Column({ type: 'text', nullable: true })
    comment: string;

    // ------------------------------------------------------------------

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @Index()
    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------

    @Column({ name: 'project_id' })
    projectId: Project['id'];

    @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
    project: ProjectEntity;

    @Index()
    @Column({ name: 'project_realm_id', type: 'uuid' })
    projectRealmId: Realm['id'];

    @Index()
    @Column({ name: 'node_id' })
    nodeId: Node['id'];

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
    node: NodeEntity;

    @Index()
    @Column({ name: 'node_realm_id', type: 'uuid' })
    nodeRealmId: string;
}
