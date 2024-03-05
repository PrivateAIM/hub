/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type { Analysis, AnalysisFile, AnalysisFileType } from '@privateaim/core';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { Realm, User } from '@authup/core';
// eslint-disable-next-line import/no-cycle
import { AnalysisEntity } from '../analysis';

@Entity({ name: 'analysis_files' })
export class AnalysisFileEntity implements AnalysisFile {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        name: string;

    @Column({ type: 'varchar', length: 64 })
        type: `${AnalysisFileType}`;

    @Column({ type: 'boolean', default: false })
        root: boolean;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        bucket_file_id: string;

    @Column({ type: 'uuid' })
        target_realm_id: string;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        robot_id: string | null;

    @Column({ type: 'uuid', nullable: true })
        user_id: User['id'] | null;

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @Column()
        analysis_id: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
        analysis: AnalysisEntity;

    // ------------------------------------------------------------------
}
