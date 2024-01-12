/*
 * Copyright (c) 2021-2022.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import {
    Column,
    CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique, UpdateDateColumn,
} from 'typeorm';
import type {
    Project, ProjectNode, ProjectNodeApprovalStatus, Node,
} from '@personalhealthtrain/core';
import type { Realm } from '@authup/core';
import { ProposalEntity } from '../proposal/entity';
import { StationEntity } from '../station/entity';

@Unique(['proposal_id', 'station_id'])
@Entity({ name: 'proposal_stations' })
export class ProposalStationEntity implements ProjectNode {
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

    @ManyToOne(() => ProposalEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'proposal_id' })
        project: ProposalEntity;

    @Column({ type: 'uuid' })
        project_realm_id: Realm['id'];

    @Column()
        node_id: Node['id'];

    @ManyToOne(() => StationEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'station_id' })
        node: StationEntity;

    @Column({ type: 'uuid' })
        node_realm_id: string;
}
