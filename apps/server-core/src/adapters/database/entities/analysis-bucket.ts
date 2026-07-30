/*
 * Copyright (c) 2021-2024.
 * Author Peter Placzek (tada5hi)
 * For the full copyright and license information,
 * view the LICENSE file that was distributed with this source code.
 */

import { dateToISOStringTransformer } from '@privateaim/server-db-kit';
import type {
    Analysis, 
    AnalysisBucket, 
    AnalysisBucketType,
} from '@privateaim/core-kit';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn, 
    Unique,
    UpdateDateColumn,
} from 'typeorm';
import type { Realm } from '@authup/core-kit';
import { AnalysisEntity } from './analysis.ts';

@Unique(['bucketId', 'analysisId'])
@Entity({ name: 'analysis_buckets' })
export class AnalysisBucketEntity implements AnalysisBucket {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 64 })
    type: `${AnalysisBucketType}`;

    @Column({ name: 'bucket_id', type: 'uuid' })
    bucketId: string;

    // ------------------------------------------------------------------

    @Column({ name: 'analysis_id' })
    analysisId: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
    analysis: AnalysisEntity;

    // ------------------------------------------------------------------

    @Column({ name: 'realm_id', type: 'uuid' })
    realmId: Realm['id'];

    // ------------------------------------------------------------------

    @CreateDateColumn({ name: 'created_at', transformer: dateToISOStringTransformer })
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', transformer: dateToISOStringTransformer })
    updatedAt: string;
}
