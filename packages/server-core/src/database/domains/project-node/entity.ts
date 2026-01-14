/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from 'typeorm';
import type {
    Node, Project, ProjectNode, ProjectNodeApprovalStatus,
} from '@privateaim/core-kit';
import type { Realm } from '@authup/core-kit';
import { ProjectEntity } from '../project/entity.ts';
import { NodeEntity } from '../node/entity.ts';

@Unique(['project_id', 'node_id'])
@Entity({ name: 'project_nodes' })
export class ProjectNodeEntity implements ProjectNode {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ default: null })
        approval_status: ProjectNodeApprovalStatus | null;

    @Column({ type: 'text', nullable: true })
        comment: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column()
        project_id: Project['id'];

    @ManyToOne(() => ProjectEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'project_id' })
        project: ProjectEntity;

    @Column({ type: 'uuid' })
        project_realm_id: Realm['id'];

    @Column()
        node_id: Node['id'];

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
        node: NodeEntity;

    @Column({ type: 'uuid' })
        node_realm_id: string;
}
