/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis, AnalysisBucket, AnalysisBucketType,
} from '@privateaim/core-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Realm } from '@authup/core-kit';
import { AnalysisEntity } from '../analysis/entity';

@Unique(['type', 'analysis_id'])
@Entity({ name: 'analysis_buckets' })
export class AnalysisBucketEntity implements AnalysisBucket {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 64 })
        type: `${AnalysisBucketType}`;

    @Column({
        type: 'varchar',
        length: 64,
        nullable: true,
    })
        external_id: string | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @Column()
        analysis_id: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
        analysis: AnalysisEntity;
}
