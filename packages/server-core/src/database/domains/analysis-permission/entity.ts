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
    UpdateDateColumn,
} from 'typeorm';
import type {
    Analysis,
    AnalysisPermission,
} from '@privateaim/core-kit';
import type { Permission, Policy, Realm } from '@authup/core-kit';
import { AnalysisEntity } from '../analysis/index.ts';

@Entity({ name: 'analysis_permissions' })
export class AnalysisPermissionEntity implements AnalysisPermission {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: string;

    @UpdateDateColumn()
        updated_at: string;

    // ------------------------------------------------------------------

    @Column()
        analysis_id: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
        analysis: AnalysisEntity;

    // ------------------------------------------------------------------

    analysis_realm: Realm | null;

    @Column({ type: 'uuid', nullable: true })
        analysis_realm_id: Realm['id'] | null;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        permission_id: Permission['id'];

    permission: Permission;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        policy_id: Policy['id'] | null;

    policy: Policy | null;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        permission_realm_id: Realm['id'] | null;

    permission_realm: Realm | null;
}
