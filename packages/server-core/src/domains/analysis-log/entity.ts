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
    AnalysisLog,
} from '@privateaim/core';
import type { Realm } from '@authup/core';
import { AnalysisEntity } from '../analysis';

@Entity({ name: 'analysis_logs' })
export class AnalysisLogEntity implements AnalysisLog {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        component: string | null;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        command: string | null;

    @Column({ type: 'varchar', length: 64, nullable: true })
        event: string | null;

    @Index()
    @Column({ type: 'varchar', length: 64, nullable: true })
        step: string | null;

    @Column({ type: 'boolean', default: false })
        error: boolean;

    @Column({ type: 'varchar', length: 64, nullable: true })
        error_code: string | null;

    @Index()
    @Column({
        type: 'varchar', length: 64, nullable: true, default: null,
    })
        status: string | null;

    @Column({ type: 'text', nullable: true })
        status_message: string | null;

    @Column({ type: 'text', nullable: true })
        meta: string | null;

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
        realm_id: Realm['id'];
}
