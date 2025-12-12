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
    PrimaryGeneratedColumn, Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Realm, User } from '@authup/core-kit';
import { AnalysisEntity } from '../analysis/entity';
import { AnalysisBucketEntity } from '../analysis-bucket/entity';

@Unique(['analysis_id', 'bucket_file_id'])
@Entity({ name: 'analysis_bucket_files' })
export class AnalysisBucketFileEntity implements AnalysisBucketFile {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        name: string;

    @Column({ type: 'boolean', default: false })
        root: boolean;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        bucket_id: string;

    @Column({ type: 'uuid' })
        bucket_file_id: string;

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

    @Column()
        analysis_bucket_id: AnalysisBucket['id'];

    @ManyToOne(() => AnalysisBucketEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_bucket_id' })
        analysis_bucket: AnalysisBucketEntity;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------
}
