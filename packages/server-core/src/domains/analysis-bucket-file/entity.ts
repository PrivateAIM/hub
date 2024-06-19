/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import type {
    Analysis, AnalysisBucket, AnalysisBucketFile,
} from '@privateaim/core-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import type { Realm, User } from '@authup/core-kit';
// eslint-disable-next-line import/no-cycle
import { AnalysisEntity } from '../analysis';
import { AnalysisBucketEntity } from '../analysis-bucket';

@Entity({ name: 'analysis_bucket_files' })
export class AnalysisBucketFileEntity implements AnalysisBucketFile {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        name: string;

    @Column({ type: 'boolean', default: false })
        root: boolean;

    @Column({ type: 'uuid' })
        external_id: string;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid', nullable: true })
        robot_id: string | null;

    @Column({ type: 'uuid', nullable: true })
        user_id: User['id'] | null;

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @Column()
        bucket_id: AnalysisBucket['id'];

    @ManyToOne(() => AnalysisBucketEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'bucket_id' })
        bucket: AnalysisBucketEntity;

    // ------------------------------------------------------------------

    @Column()
        analysis_id: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
        analysis: AnalysisEntity;

    // ------------------------------------------------------------------
}
