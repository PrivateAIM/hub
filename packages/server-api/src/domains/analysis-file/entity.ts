/*
 * Copyright (c) 2021-2022.
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
import type { Analysis, AnalysisFile } from '@personalhealthtrain/core';
import type { Realm, User } from '@authup/core';
// eslint-disable-next-line import/no-cycle
import { AnalysisEntity } from '../analysis';

@Entity({ name: 'analysis_files' })
export class AnalysisFileEntity implements AnalysisFile {
    @PrimaryGeneratedColumn('uuid')
        id: string;

    @Column({ type: 'varchar', length: 256 })
        name: string;

    @Column({ type: 'varchar', length: 4096 })
        hash: string;

    @Column({ nullable: true })
        directory: string;

    @Column({ type: 'int', unsigned: true, nullable: true })
        size: number | null;

    // ------------------------------------------------------------------

    @CreateDateColumn()
        created_at: Date;

    @UpdateDateColumn()
        updated_at: Date;

    // ------------------------------------------------------------------

    @Column({ type: 'uuid' })
        user_id: User['id'];

    @Column({ type: 'uuid' })
        realm_id: Realm['id'];

    // ------------------------------------------------------------------

    @Column()
        analysis_id: Analysis['id'];

    @ManyToOne(() => AnalysisEntity, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'analysis_id' })
        analysis: AnalysisEntity;
}
