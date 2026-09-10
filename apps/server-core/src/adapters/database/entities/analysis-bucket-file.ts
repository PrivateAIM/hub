/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer } from '@privateaim/server-db-kit';
import type { 
    Client, 
    Realm, 
    User,  
} from '@authup/core-kit';
import type {
    Analysis, 
    AnalysisBucket, 
    AnalysisBucketFile,
} from '@privateaim/core-kit';
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
import { AnalysisEntity } from './analysis.ts';
import { AnalysisBucketEntity } from './analysis-bucket.ts';

@Unique(['analysisId', 'path'])
@Entity({ name: 'analysis_bucket_files' })
export class AnalysisBucketFileEntity implements AnalysisBucketFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'varchar', length: 256 })
    path: string;

    @Index()
    @Column({ type: 'boolean', default: false })
    root: boolean;

    // ------------------------------------------------------------------

    @Column({ name: 'bucket_id', type: 'uuid' })
    bucketId: string;

    @Column({ name: 'bucket_file_id', type: 'uuid' })
    bucketFileId: string;

    // ------------------------------------------------------------------

    @Column({
        name: 'client_id', 
        type: 'uuid', 
        nullable: true, 
    })
    clientId: Client['id'] | null;

    @Column({
        name: 'robot_id', 
        type: 'uuid', 
        nullable: true, 
    })
    robotId: Client['id'] | null;

    @Column({
        name: 'user_id', 
        type: 'uuid', 
        nullable: true, 
    })
    userId: User['id'] | null;

    @Column({ name: 'realm_id', type: 'uuid' })
    realmId: Realm['id'];

    // ------------------------------------------------------------------

    @Column({ name: 'analysis_id' })
    analysisId: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
    analysis: AnalysisEntity;

    // ------------------------------------------------------------------

    @Index()
    @Column({ name: 'analysis_bucket_id' })
    analysisBucketId: AnalysisBucket['id'];

    @ManyToOne(() => AnalysisBucketEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_bucket_id' })
    analysisBucket: AnalysisBucketEntity;

    // ------------------------------------------------------------------

    @Index()
    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @Index()
    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;

    // ------------------------------------------------------------------
}
