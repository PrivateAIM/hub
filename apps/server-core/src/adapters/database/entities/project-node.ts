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

// Each side of the junction (node, project) is indexed by its id and by its
// realm, each paired with the opposite side's realm or id, so a lookup or
// filter combination from either side is served by one index, and the
// participation lookups (SELECT project_id ... WHERE node_realm_id = ?)
// answer from the index alone. Every leading column is also an allow-listed
// filter key, so no single-column index is needed for these four columns.
// typeorm hashes an index name from the SORTED column list, so each mirrored
// pair would collide: the index whose columns are not in alphabetical order
// carries an explicit name, hashed the same way from its columns in order.
@Unique(['projectId', 'nodeId'])
@Index('IDX_33c0a5c703084f4e180cdf1e3e', ['projectId', 'nodeRealmId'])
@Index(['nodeId', 'projectRealmId'])
@Index('IDX_50158b286a9565a3596a9323b9', ['projectRealmId', 'nodeId'])
@Index(['nodeRealmId', 'projectId'])
// Status first, newest first: an approval inbox
// (sort=approvalStatus,-createdAt).
@Index(['approvalStatus', 'createdAt'])
@Entity({ name: 'project_nodes' })
export class ProjectNodeEntity implements ProjectNode {
    @PrimaryGeneratedColumn('uuid')
    id: string;

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

    @Column({ name: 'project_realm_id', type: 'uuid' })
    projectRealmId: Realm['id'];

    @Column({ name: 'node_id' })
    nodeId: Node['id'];

    @ManyToOne(() => NodeEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'node_id' })
    node: NodeEntity;

    @Column({ name: 'node_realm_id', type: 'uuid' })
    nodeRealmId: string;
}
